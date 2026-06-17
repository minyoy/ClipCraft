import os
import re

import sys 
sys.path.insert(0, "/shareHost/jiyes/packages") #
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from vllava.vllava import VideoLLaVAVerifier #
 
import threading
import time
import uuid
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from fastapi.middleware.cors import CORSMiddleware

# [중요] 프로젝트 루트 경로를 시스템 경로에 추가 (orchestration, services 등을 찾기 위함)
current_dir = os.path.dirname(os.path.abspath(__file__)) # api_server 폴더
project_root = os.path.dirname(current_dir)             # ClipCraft 폴더
clip_search_dir = os.path.join(project_root, "clip_search")
if project_root not in sys.path:
    sys.path.insert(0, project_root)
if clip_search_dir not in sys.path:
    sys.path.insert(0, clip_search_dir)

from audio.audio_waveform import extract_audio_waveform
from pipeline import run_pipeline as run_clip_search_pipeline

app = FastAPI()
verifier = VideoLLaVAVerifier() #수정

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
        "clip_model": os.environ.get("CLIP_SEARCH_MODEL", "ViT-B/32"),
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
    request.video_path = "/home/CC_project/ClipCraft/example.mov"  # 임시 고정
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
            vllava_result = verifier.verify_timestamp(
                video_path=request.video_path,
                scenario_text=query,
                candidates=segments,
            )
            if isinstance(vllava_result, dict):
                best = segments[vllava_result.get("best_idx", 0)]
            else:
                best = segments[0] #

            if job_id:
                update_job(
                    job_id,
                    progress=min(84, scenario_base_progress + 26),
                    step_id=3,
                    step_label=ANALYSIS_STEPS[3],
                    message="오디오 파형을 추출 중입니다.",
                )

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
async def start_analyze_job(request: AnalysisRequest):
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
        }

@app.post("/analyze")
async def analyze(request: AnalysisRequest):
    final_results = run_analysis(request)

    return {
        "status": "success",
        "project": request.project_name,
        "results": final_results
    }
