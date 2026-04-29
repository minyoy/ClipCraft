# audio_waveform.py

import json
import subprocess
import numpy as np


def _probe_duration(file_path: str) -> float:
    command = [
        "ffprobe",
        "-v",
        "error",
        "-show_entries",
        "format=duration",
        "-of",
        "default=noprint_wrappers=1:nokey=1",
        file_path,
    ]

    try:
        result = subprocess.run(command, check=True, capture_output=True, text=True)
        return float(result.stdout.strip())
    except (subprocess.CalledProcessError, ValueError):
        return 0.0


def _load_audio_with_ffmpeg(file_path: str, sample_rate: int) -> tuple[np.ndarray, int]:
    command = [
        "ffmpeg",
        "-v",
        "error",
        "-i",
        file_path,
        "-vn",
        "-ac",
        "1",
        "-ar",
        str(sample_rate),
        "-f",
        "f32le",
        "pipe:1",
    ]

    try:
        result = subprocess.run(command, check=True, capture_output=True)
    except subprocess.CalledProcessError as error:
        if b"Output file does not contain any stream" in error.stderr:
            return np.array([], dtype=np.float32), sample_rate
        raise

    audio = np.frombuffer(result.stdout, dtype=np.float32)
    return audio, sample_rate


def _load_audio(file_path: str, sample_rate: int) -> tuple[np.ndarray, int]:
    return _load_audio_with_ffmpeg(file_path, sample_rate)


def extract_audio_waveform(
    file_path: str,
    bar_count: int = 88,
    sample_rate: int = 16000,
) -> dict:
    """
    영상/오디오 파일에서 UI 표시용 오디오 파형 데이터를 추출한다.

    Returns:
        {
            "duration": float,
            "barCount": int,
            "amplitudes": List[float]
        }
    """

    # mono=True: 스테레오를 단일 채널로 변환
    y, sr = _load_audio(file_path, sample_rate)

    duration = len(y) / sr if len(y) > 0 and sr > 0 else _probe_duration(file_path)

    if len(y) == 0:
        return {
            "duration": round(duration, 3),
            "barCount": bar_count,
            "amplitudes": [0.0] * bar_count,
        }

    # 전체 PCM을 bar_count개 구간으로 나눔
    chunks = np.array_split(y, bar_count)

    amplitudes = []

    for chunk in chunks:
        if len(chunk) == 0:
            amplitudes.append(0.0)
        else:
            # 해당 구간의 최대 진폭
            amp = float(np.max(np.abs(chunk)))
            amplitudes.append(amp)

    # 0~1 정규화
    max_amp = max(amplitudes)

    if max_amp > 0:
        amplitudes = [amp / max_amp for amp in amplitudes]

    return {
        "duration": round(duration, 3),
        "barCount": bar_count,
        "amplitudes": amplitudes,
    }


if __name__ == "__main__":
    result = extract_audio_waveform(
        file_path="../clip_search/example1.mov",
        bar_count=88,
    )

    print(json.dumps(result, ensure_ascii=False, indent=2))
