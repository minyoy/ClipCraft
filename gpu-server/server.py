import os
import re
import shutil

import sys
sys.path.insert(0, "/volfordoc/shareHost/jiyes/packages")
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
 
import threading
import time
import uuid
import json
import tempfile
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
import shutil
from pydantic import BaseModel
from typing import List, Optional
from fastapi.middleware.cors import CORSMiddleware

# GPU 서비스 루트 경로를 시스템 경로에 추가합니다.
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = current_dir
clip_search_dir = os.path.join(project_root, "clip_search")
if project_root not in sys.path:
    sys.path.insert(0, project_root)
if clip_search_dir not in sys.path:
    sys.path.insert(0, clip_search_dir)

app = FastAPI()
verifier = None
verifier_lock = threading.Lock()

def get_verifier():
    global verifier
    if verifier is None:
        with verifier_lock:
            if verifier is None:
                from vllava.vllava import VideoLLaVAVerifier
                verifier = VideoLLaVAVerifier()
    return verifier

def get_ffmpeg_paths():
    ffmpeg = shutil.which("ffmpeg")
    ffprobe = shutil.which("ffprobe")

    if ffmpeg and ffprobe:
        return ffmpeg, ffprobe

    try:
        import imageio_ffmpeg
        ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
        ffprobe = ffmpeg.replace("ffmpeg", "ffprobe")
        return ffmpeg, ffprobe
    except ModuleNotFoundError as error:
        raise RuntimeError("ffmpeg is not available. Install ffmpeg or imageio-ffmpeg.") from error

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalysisRequest(BaseModel):
    project_name: str
    video_path: str
    scenarios: List[str]

class ExportSegment(BaseModel):
    start: float
    end: float
    speed: float = 1.0
    muted: bool = False

class ExportRequest(BaseModel):
    video_path: str
    segments: List[ExportSegment]

class AnalysisJobStartResponse(BaseModel):
    status: str
    job_id: str

class AnalysisJobStatus(BaseModel):
    status: str
    progress: int
    step_id: int
    step_label: str
    message: str
    logs: List[str]
    project: str
    results: List[dict]
    error: Optional[str] = None
    video_path: Optional[str] = None

ANALYSIS_STEPS = [
    "영상 파일 수신 중",
    "프레임 디코딩",
    "씬 경계 감지",
    "오디오 파형 분석",
    "시나리오 매핑",
    "하이라이트 구간 확정",
]

analysis_jobs: dict[str, dict] = {}
analysis_jobs_lock = threading.Lock()

def get_local_clip_search_config():
    return {
        "fps": float(os.environ.get("CLIP_SEARCH_FPS", "0.5")),
        "batch_size": int(os.environ.get("CLIP_SEARCH_BATCH_SIZE", "32")),
        "clip_model": os.environ.get("CLIP_SEARCH_MODEL", "ViT-L/14"),
        "output_root": os.environ.get(
            "CLIP_SEARCH_OUTPUT_ROOT",
            os.path.join(project_root, "clip_search", "clips"),
        ),
    }

def run_local_clip_search(
    video_path: str,
    query: str,
    project_name: str,
    scenario_folder_name: str,
) -> dict:
    config = get_local_clip_search_config()
    safe_project = make_safe_name(project_name)
    output_dir = os.path.join(
        config["output_root"],
        safe_project,
        scenario_folder_name,
    )
    from pipeline import run_pipeline as run_clip_search_pipeline
    return run_clip_search_pipeline(
        video_path=video_path,
        query=query,
        output_dir=output_dir,
        fps=config["fps"],
        batch_size=config["batch_size"],
        clip_model=config["clip_model"],
    )

def make_safe_name(name: str):
    clean_name = re.sub(r'[\\/:*?"<>|]', "", name).strip().replace(" ", "_")
    return clean_name

def update_job(job_id: str, **updates):
    with analysis_jobs_lock:
        job = analysis_jobs.get(job_id)
        if not job:
            return
        job.update(updates)
        job["updated_at"] = time.time()

def add_job_log(job_id: str, message: str):
    with analysis_jobs_lock:
        job = analysis_jobs.get(job_id)
        if not job:
            return
        job["logs"] = [*job.get("logs", []), message]
        job["updated_at"] = time.time()

def run_analysis(request: AnalysisRequest, job_id: str | None = None):
    print(f"video_path: {request.video_path}")
    final_results = []

    if job_id:
        update_job(job_id, status="running", progress=5, step_id=0, step_label=ANALYSIS_STEPS[0], message="분석 요청을 수신했습니다.")
        add_job_log(job_id, f"✓  {ANALYSIS_STEPS[0]}")

    safe_project = make_safe_name(request.project_name)

    total_scenarios = max(1, len(request.scenarios))

    for i, query in enumerate(request.scenarios, start=1):
        safe_query_text = make_safe_name(query)[:30]
        scenario_folder_name = f"sc{i}_{safe_query_text}"

        scenario_base_progress = 10 + round(((i - 1) / total_scenarios) * 58)
        if job_id:
            update_job(
                job_id,
                progress=scenario_base_progress,
                step_id=1,
                step_label=ANALYSIS_STEPS[1],
                message=f"{i}/{total_scenarios} 시나리오 프레임을 분석 중입니다.",
            )

        pipeline_result = run_local_clip_search(
            video_path=request.video_path,
            query=query,
            project_name=safe_project,
            scenario_folder_name=scenario_folder_name,
        )
        print(f"pipeline_result keys: {pipeline_result.keys() if isinstance(pipeline_result, dict) else 'list'}")
        print(f"pipeline_result: {pipeline_result}")

        if job_id:
            update_job(
                job_id,
                progress=min(72, scenario_base_progress + 18),
                step_id=2,
                step_label=ANALYSIS_STEPS[2],
                message=f"{i}/{total_scenarios} 시나리오의 후보 구간을 찾았습니다.",
            )

        segments = pipeline_result.get("segments", []) if isinstance(pipeline_result, dict) else pipeline_result


        if segments: # 수정
            best = segments[0] #
            try:
                vllava_result = get_verifier().verify_timestamp(
                    video_path=request.video_path,
                    scenario_text=query,
                    candidates=segments,
                )
                if isinstance(vllava_result, dict):
                    best = segments[vllava_result.get("best_idx", 0)]
            except Exception as error:
                print(f"⚠️ [VLLaVA] verifier unavailable, using first CLIP segment: {error}")
                if job_id:
                    add_job_log(job_id, "⚠️ VLLaVA 검증을 건너뛰고 첫 번째 후보 구간을 사용했습니다.")

            if job_id:
                update_job(
                    job_id,
                    progress=min(84, scenario_base_progress + 26),
                    step_id=3,
                    step_label=ANALYSIS_STEPS[3],
                    message="오디오 파형을 추출 중입니다.",
                )

            from audio.audio_waveform import extract_audio_waveform
            audio_data = extract_audio_waveform(request.video_path, bar_count=88)

            final_results.append({
                "project_name": request.project_name,
                "id": i,
                "scenario": query,
                "start": round(best.get("start", 0), 1),
                "end": round(best.get("end", 0), 1),
                "audio": {
                    "duration": audio_data["duration"],
                    "barCount": audio_data["barCount"],
                    "amplitudes": audio_data["amplitudes"]
                }
            })

        if job_id:
            update_job(
                job_id,
                progress=min(92, 10 + round((i / total_scenarios) * 76)),
                step_id=4,
                step_label=ANALYSIS_STEPS[4],
                message=f"{i}/{total_scenarios} 시나리오 결과를 매핑했습니다.",
                results=final_results,
            )
            add_job_log(job_id, f"✓  {query}")

    if job_id:
        update_job(
            job_id,
            status="success",
            progress=100,
            step_id=5,
            step_label=ANALYSIS_STEPS[5],
            message="하이라이트 구간 확정 완료",
            results=final_results,
        )
        add_job_log(job_id, f"✓  {ANALYSIS_STEPS[5]}")

    return final_results

def run_analysis_job(job_id: str, request: AnalysisRequest):
    try:
        run_analysis(request, job_id=job_id)
    except Exception as error:
        print(f"❌ 에러 발생: {error}")
        import traceback
        traceback.print_exc()
        update_job(
            job_id,
            status="error",
            error=str(error),
            message="분석 요청에 실패했습니다.",
        )

@app.post("/analyze/jobs", response_model=AnalysisJobStartResponse)
async def start_analyze_job(
    video: UploadFile = File(...),
    project_name: str = Form(...),
    scenarios: str = Form(...),
):
    scenarios_list: List[str] = json.loads(scenarios)

    suffix = os.path.splitext(video.filename or ".mp4")[1] or ".mp4"
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
    try:
        content = await video.read()
        tmp.write(content)
        tmp.flush()
    finally:
        tmp.close()

    request = AnalysisRequest(
        project_name=project_name,
        video_path=tmp.name,
        scenarios=scenarios_list,
    )

    job_id = uuid.uuid4().hex
    with analysis_jobs_lock:
        analysis_jobs[job_id] = {
            "status": "queued",
            "progress": 0,
            "step_id": 0,
            "step_label": ANALYSIS_STEPS[0],
            "message": "분석 대기 중입니다.",
            "logs": [],
            "project": request.project_name,
            "results": [],
            "error": None,
            "video_path": tmp.name,
            "created_at": time.time(),
            "updated_at": time.time(),
        }

    thread = threading.Thread(target=run_analysis_job, args=(job_id, request), daemon=True)
    thread.start()

    return {"status": "queued", "job_id": job_id}

@app.get("/analyze/jobs/{job_id}", response_model=AnalysisJobStatus)
async def get_analyze_job(job_id: str):
    with analysis_jobs_lock:
        job = analysis_jobs.get(job_id)
        if not job:
            raise HTTPException(status_code=404, detail="Analysis job not found")
        return {
            "status": job["status"],
            "progress": job["progress"],
            "step_id": job["step_id"],
            "step_label": job["step_label"],
            "message": job["message"],
            "logs": job["logs"],
            "project": job["project"],
            "results": job["results"],
            "error": job.get("error"),
            "video_path": job.get("video_path"),
        }

@app.post("/analyze")
async def analyze(request: AnalysisRequest):
    final_results = run_analysis(request)

    return {
        "status": "success",
        "project": request.project_name,
        "results": final_results
    }

@app.post("/export")
async def export_video(request: ExportRequest):
    import subprocess
    from fastapi.responses import FileResponse
    
    ffmpeg, ffprobe = get_ffmpeg_paths()
    temp_files = []
    export_id = uuid.uuid4().hex

    def get_safe_speed(value: float) -> float:
        if not isinstance(value, (int, float)) or value <= 0:
            return 1.0
        return min(float(value), 8.0)

    def build_atempo_filter(speed: float) -> str:
        parts = []
        remaining = speed

        while remaining > 2.0:
            parts.append("atempo=2.0")
            remaining /= 2.0

        while remaining < 0.5:
            parts.append("atempo=0.5")
            remaining /= 0.5

        parts.append(f"atempo={remaining:.6f}")
        return ",".join(parts)

    def has_audio_stream(video_path: str) -> bool:
        try:
            result = subprocess.run(
                [
                    ffprobe,
                    "-v",
                    "error",
                    "-select_streams",
                    "a:0",
                    "-show_entries",
                    "stream=index",
                    "-of",
                    "csv=p=0",
                    video_path,
                ],
                check=False,
                capture_output=True,
                text=True,
            )
            return result.returncode == 0 and bool(result.stdout.strip())
        except OSError:
            return True
    
    try:
        if not request.segments:
            raise HTTPException(status_code=400, detail="No segments to export")

        source_has_audio = has_audio_stream(request.video_path)

        for i, seg in enumerate(request.segments):
            temp_path = f"/tmp/clipcraft_{export_id}_clip_{i}.mp4"
            start = max(0.0, seg.start)
            end = max(start + 0.05, seg.end)
            speed = get_safe_speed(seg.speed)
            duration = end - start
            output_duration = duration / speed
            video_filter = f"[0:v]setpts=PTS/{speed:.6f}[v]"

            if seg.muted or not source_has_audio:
                filter_complex = f"{video_filter};[1:a]atrim=0:{output_duration:.6f},asetpts=PTS-STARTPTS[a]"
                command = [
                    ffmpeg,
                    "-y",
                    "-ss",
                    str(start),
                    "-to",
                    str(end),
                    "-i",
                    request.video_path,
                    "-f",
                    "lavfi",
                    "-t",
                    f"{output_duration:.6f}",
                    "-i",
                    "anullsrc=channel_layout=stereo:sample_rate=48000",
                    "-filter_complex",
                    filter_complex,
                    "-map",
                    "[v]",
                    "-map",
                    "[a]",
                    "-c:v",
                    "libx264",
                    "-preset",
                    "veryfast",
                    "-crf",
                    "23",
                    "-c:a",
                    "aac",
                    "-shortest",
                    temp_path,
                ]
            else:
                audio_filter = f"{build_atempo_filter(speed)},aformat=sample_rates=48000:channel_layouts=stereo"
                filter_complex = f"{video_filter};[0:a]{audio_filter}[a]"
                command = [
                    ffmpeg,
                    "-y",
                    "-ss",
                    str(start),
                    "-to",
                    str(end),
                    "-i",
                    request.video_path,
                    "-filter_complex",
                    filter_complex,
                    "-map",
                    "[v]",
                    "-map",
                    "[a]",
                    "-c:v",
                    "libx264",
                    "-preset",
                    "veryfast",
                    "-crf",
                    "23",
                    "-c:a",
                    "aac",
                    "-shortest",
                    temp_path,
                ]

            subprocess.run(command, check=True, capture_output=True)
            temp_files.append(temp_path)
        
        list_file = f"/tmp/clipcraft_{export_id}_clips_list.txt"
        with open(list_file, "w") as f:
            for p in temp_files:
                f.write(f"file '{p}'\n")
        
        output_path = f"/tmp/clipcraft_{export_id}_output_final.mp4"
        subprocess.run([
            ffmpeg, "-y", "-f", "concat", "-safe", "0",
            "-i", list_file, "-c", "copy", output_path
        ], check=True)
        
        return FileResponse(output_path, media_type="video/mp4", filename="clipcraft_export.mp4")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
