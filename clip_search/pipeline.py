"""
Video analysis pipeline: extract segments most relevant to a Korean text query.
"""

import argparse
import os
import re
import warnings
from typing import List, Tuple

import clip
import cv2
import numpy as np
import openai
import torch
from PIL import Image
from scipy.ndimage import uniform_filter1d

warnings.filterwarnings("ignore")

# ---------------------------------------------------------------------------
# Global model initialisation (loaded once)
# ---------------------------------------------------------------------------

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

print(f"[init] device: {DEVICE}")

_OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "")
if not _OPENAI_API_KEY:
    raise EnvironmentError("OPENAI_API_KEY environment variable is not set.")
_openai_client = openai.OpenAI(api_key=_OPENAI_API_KEY)

print("[init] loading CLIP model (ViT-L/14) …")
_clip_model, _clip_preprocess = clip.load("ViT-L/14", device=DEVICE)
_clip_model.eval()

print("[init] models ready.\n")


# ---------------------------------------------------------------------------
# Step 1 – Query expansion
# ---------------------------------------------------------------------------

def expand_query_for_clip(korean_query: str, api_key: str) -> str:
    """Convert a Korean scene description into a CLIP-friendly English visual scene.

    Uses GPT-4o-mini to produce a visually descriptive English phrase
    (≤ 15 words) that CLIP can match against video frames.

    Args:
        korean_query: Korean description of the scene to find.
        api_key: OpenAI API key.

    Returns:
        English visual description optimised for CLIP similarity search.
    """
    client = openai.OpenAI(api_key=api_key)
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": (
                    """
                    You are a CLIP query generator for Korean videos.
                    Convert a Korean scene description into a short, literal English visual description (15 words or less).
                    Rules: no subjects (no 'a person', 'a hand'), no metaphors, no invented context. Objects and actions only.

                    Examples:
                        - '고기를 볶는 장면' → 'sliced meat stir-frying in a pan'
                        - '양파를 써는 장면' → 'white onion being sliced into thin rings'
                        - '계란을 푸는 장면' → 'yellow egg beaten in a bowl'

                    Return ONLY the description. No explanation.
                    """
                ),
            },
            {"role": "user", "content": f"Scene: {korean_query}\nDescribe ONLY this. Add nothing else."},
        ],
    )
    result = response.choices[0].message.content.strip()
    print(f"[expand] '{korean_query}'  →  '{result}'")
    return result


# ---------------------------------------------------------------------------
# Step 2 – CLIP text embedding
# ---------------------------------------------------------------------------

def encode_query(korean_text: str) -> Tuple[torch.Tensor, str]:
    """Translate Korean text and return its normalised CLIP text embedding.

    Args:
        korean_text: Korean query string.

    Returns:
        Tuple of:
        - 1-D float32 tensor of shape (embed_dim,) on *DEVICE*, L2-normalised.
        - The expanded English description used for embedding.
    """
    english_text = expand_query_for_clip(korean_text, _OPENAI_API_KEY)

    tokens = clip.tokenize([english_text]).to(DEVICE)
    with torch.no_grad():
        embedding = _clip_model.encode_text(tokens)  # (1, D)
    embedding = embedding / embedding.norm(dim=-1, keepdim=True)
    return embedding.squeeze(0), english_text  # (D,), str


# ---------------------------------------------------------------------------
# Step 3 – Frame sampling
# ---------------------------------------------------------------------------

def extract_frames(
    video_path: str,
    fps: float = 1.0,
) -> Tuple[List[np.ndarray], List[float]]:
    """Sample frames from a video at the given rate.

    Args:
        video_path: Path to the video file.
        fps: Number of frames to extract per second (default 1.0).

    Returns:
        A tuple ``(frames, timestamps)`` where *frames* is a list of BGR
        uint8 arrays and *timestamps* is a list of the corresponding
        positions in seconds.
    """
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise FileNotFoundError(f"Cannot open video: {video_path}")

    native_fps: float = cap.get(cv2.CAP_PROP_FPS)
    frame_interval = int(round(native_fps / fps))
    if frame_interval < 1:
        frame_interval = 1

    frames: List[np.ndarray] = []
    timestamps: List[float] = []

    frame_idx = 0
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        if frame_idx % frame_interval == 0:
            frames.append(frame)
            timestamps.append(frame_idx / native_fps)
        frame_idx += 1

    cap.release()
    print(f"[frames] extracted {len(frames)} frames at {fps} fps from '{video_path}'")
    return frames, timestamps


# ---------------------------------------------------------------------------
# Step 4 – Per-frame similarity
# ---------------------------------------------------------------------------

def compute_similarity_curve(
    frames: List[np.ndarray],
    text_query_korean: str,
    batch_size: int = 32,
) -> Tuple[np.ndarray, str]:
    """Compute cosine similarity between each frame and the text query.

    Args:
        frames: List of BGR uint8 arrays (from :func:`extract_frames`).
        text_query_korean: Korean query string.
        batch_size: Number of frames to encode per CLIP forward pass (default 32).

    Returns:
        Tuple of:
        - Float32 numpy array of shape ``(len(frames),)`` with cosine similarities in [−1, 1].
        - The expanded English description used for embedding.
    """
    text_embedding, english_text = encode_query(text_query_korean)  # (D,), str

    all_sims: List[np.ndarray] = []
    for start in range(0, len(frames), batch_size):
        batch_bgr = frames[start : start + batch_size]
        tensors = torch.stack([
            _clip_preprocess(Image.fromarray(cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)))
            for bgr in batch_bgr
        ]).to(DEVICE)  # (B, C, H, W)
        with torch.no_grad():
            img_emb = _clip_model.encode_image(tensors)  # (B, D)
        img_emb = img_emb / img_emb.norm(dim=-1, keepdim=True)
        sims = (img_emb @ text_embedding).cpu().numpy()  # (B,)
        all_sims.append(sims)

    return np.concatenate(all_sims).astype(np.float32), english_text


# ---------------------------------------------------------------------------
# Step 5 – Segment extraction
# ---------------------------------------------------------------------------

def extract_segments(
    similarities: np.ndarray,
    timestamps: List[float],
    smooth_window: int = 5,
    min_duration: float = 2.0,
    top_k: int = 1, # 잠깐 1로 변경
) -> List[dict]:
    """Extract time segments whose smoothed similarity exceeds an adaptive threshold.

    Algorithm:
      1. Smooth the similarity curve with a uniform filter.
      2. Threshold = mean + 0.5 × std (adaptive).
      3. Find contiguous runs above the threshold.
      4. Remove runs shorter than *min_duration*.
      5. Merge adjacent runs whose gap ≤ 2 s.
      6. Return up to *top_k* segments sorted by max_score descending.

    Args:
        similarities: Per-frame similarity scores (output of
            :func:`compute_similarity_curve`).
        timestamps: Per-frame timestamps in seconds (same length as
            *similarities*).
        smooth_window: Window size for uniform smoothing (default 5).
        min_duration: Minimum segment duration in seconds; shorter
            segments are discarded (default 2.0).
        top_k: Maximum number of segments to return, ranked by score
            (default 3).

    Returns:
        List of dicts ``{"start": float, "end": float, "max_score": float}``,
        up to *top_k* entries, sorted by start time.
    """
    if len(similarities) == 0:
        return []

    smoothed = uniform_filter1d(similarities.astype(np.float64), size=smooth_window)
    threshold = smoothed.mean() + 0.5 * smoothed.std()

    above = smoothed >= threshold
    ts = np.asarray(timestamps)

    # Collect contiguous runs
    raw_segments: List[dict] = []
    in_seg = False
    seg_start_idx = 0

    for i, flag in enumerate(above):
        if flag and not in_seg:
            in_seg = True
            seg_start_idx = i
        elif not flag and in_seg:
            in_seg = False
            raw_segments.append({
                "start": float(ts[seg_start_idx]),
                "end": float(ts[i - 1]),
                "max_score": float(smoothed[seg_start_idx:i].max()),
            })
    if in_seg:
        raw_segments.append({
            "start": float(ts[seg_start_idx]),
            "end": float(ts[-1]),
            "max_score": float(smoothed[seg_start_idx:].max()),
        })

    # Filter by minimum duration
    segs = [s for s in raw_segments if s["end"] - s["start"] >= min_duration]

    if not segs:
        return []

    # Merge segments whose gap ≤ 2 s
    merged: List[dict] = [segs[0]]
    for seg in segs[1:]:
        prev = merged[-1]
        if seg["start"] - prev["end"] <= 2.0:
            prev["end"] = seg["end"]
            prev["max_score"] = max(prev["max_score"], seg["max_score"])
        else:
            merged.append(seg)

    # Keep top-k by score, then re-sort by start time for readability
    top = sorted(merged, key=lambda s: s["max_score"], reverse=True)[:top_k]
    top = sorted(top, key=lambda s: s["start"])

    # Expand each segment by ±3 s, clamped to [0, video_end]
    video_end = float(ts[-1])
    for seg in top:
        seg["start"] = max(0.0, seg["start"] - 3.0)
        seg["end"] = min(video_end, seg["end"] + 3.0)

    return top


# ---------------------------------------------------------------------------
# Step 6 – Clip saving
# ---------------------------------------------------------------------------

def save_clips(
    video_path: str,
    segments: List[dict],
    output_dir: str = ".",
) -> List[str]:
    """Cut and save each segment as a separate video file.

    Uses OpenCV to re-encode each segment frame-by-frame with the same
    codec and frame rate as the source video.

    Args:
        video_path: Path to the source video file.
        segments: List of segment dicts (``{"start", "end", "max_score"}``).
        output_dir: Directory in which to write the output clips.

    Returns:
        List of output file paths, one per segment.
    """
    os.makedirs(output_dir, exist_ok=True)

    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise FileNotFoundError(f"Cannot open video: {video_path}")

    native_fps: float = cap.get(cv2.CAP_PROP_FPS)
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

    base = os.path.splitext(os.path.basename(video_path))[0]
    saved_paths: List[str] = []

    for idx, seg in enumerate(segments, start=1):
        start_frame = int(seg["start"] * native_fps)
        end_frame = int(seg["end"] * native_fps)

        out_path = os.path.join(output_dir, f"{base}_clip{idx:02d}.mp4")
        writer = cv2.VideoWriter(
            out_path,
            cv2.VideoWriter_fourcc(*"mp4v"),
            native_fps,
            (width, height),
        )

        cap.set(cv2.CAP_PROP_POS_FRAMES, start_frame)
        for _ in range(end_frame - start_frame + 1):
            ret, frame = cap.read()
            if not ret:
                break
            writer.write(frame)

        writer.release()
        saved_paths.append(out_path)
        print(f"[save] clip {idx} → {out_path}")

    cap.release()
    return saved_paths


# ---------------------------------------------------------------------------
# Step 7 – Main pipeline
# ---------------------------------------------------------------------------

def run_pipeline(video_path: str, query: str, output_dir: str = ".") -> List[dict]:
    """Run the full video-analysis pipeline.

    Args:
        video_path: Path to the input video file.
        query: Korean text query describing the scene to find.
        output_dir: Directory in which to save extracted clips.

    Returns:
        List of segment dicts ``{"start", "end", "max_score"}``.
    """
    frames, timestamps = extract_frames(video_path, fps=1.0)
    similarities, english_query = compute_similarity_curve(frames, query)
    segments = extract_segments(similarities, timestamps)

    print(f"[clip] max score: {similarities.max():.3f}")
    print(f"[clip] mean: {similarities.mean():.3f}, std: {similarities.std():.3f}")
    print(f"[clip] threshold: {similarities.mean() + 0.5 * similarities.std():.3f}")
    print(f"[clip] segments found: {len(segments)}")
    for i, seg in enumerate(segments):
        print(f"  [{i+1}] {seg['start']:.1f}s ~ {seg['end']:.1f}s | score: {seg['max_score']:.3f}")

    print("\n=== Results ===")
    if not segments:
        print("No matching segments found.")
    for i, seg in enumerate(segments, start=1):
        print(
            f"  [{i}] {seg['start']:6.1f}s – {seg['end']:6.1f}s  "
            f"(score: {seg['max_score']:.4f})"
        )
    print()

    if segments:
        # 영어 설명을 폴더명으로 변환: 공백→언더스코어, 파일시스템 특수문자 제거, 40자 제한
        safe_query = re.sub(r'[\\/:*?"<>|]', "", english_query).strip().replace(" ", "_")[:40]
        query_dir = os.path.join(output_dir, safe_query)
        save_clips(video_path, segments, output_dir=query_dir)

    return segments


# ---------------------------------------------------------------------------
# CLI entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Extract video segments matching a Korean text query."
    )
    parser.add_argument("--video", required=True, help="Path to input video file")
    parser.add_argument("--query", required=True, help="Korean scene description")
    parser.add_argument("--output-dir", default="./clips", help="Directory to save output clips (default: current dir)")
    args = parser.parse_args()

    run_pipeline(args.video, args.query, output_dir=args.output_dir)
