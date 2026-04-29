import os
import re
import sys
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
from fastapi.middleware.cors import CORSMiddleware

# [중요] 프로젝트 루트 경로를 시스템 경로에 추가 (orchestration, services 등을 찾기 위함)
current_dir = os.path.dirname(os.path.abspath(__file__)) # api_server 폴더
project_root = os.path.dirname(current_dir)             # ClipCraft 폴더
clip_search_path = os.path.join(project_root, "clip_search")

if project_root not in sys.path:
    sys.path.insert(0, project_root)
if clip_search_path not in sys.path:
    sys.path.insert(0, clip_search_path)
    
# 이제 에러 없이 불러올 수 있습니다.
from clip_search.pipeline import run_pipeline
from audio.audio_waveform import extract_audio_waveform

app = FastAPI()

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

def make_safe_name(name: str):
    clean_name = re.sub(r'[\\/:*?"<>|]', "", name).strip().replace(" ", "_")
    return clean_name

@app.post("/analyze")
async def analyze(request: AnalysisRequest):
    final_results = []
    
    # 1. 프로젝트 폴더 생성
    safe_project = make_safe_name(request.project_name)
    clips_dir = os.path.join(project_root, "clip_search", "clips", safe_project)
    os.makedirs(clips_dir, exist_ok=True)
    
    for i, query in enumerate(request.scenarios, start=1):
        # 2. 폴더명 설정: sc1_시나리오내용
        safe_query_text = make_safe_name(query)[:30]
        scenario_folder_name = f"sc{i}_{safe_query_text}"
        output_subdir = os.path.join(clips_dir, scenario_folder_name)
        
        # 3. 신규 파이프라인 실행
        # 바뀐 run_pipeline은 이제 내부적으로 VideoSearchPipeline을 조립해서 실행합니다.
        pipeline_result = run_pipeline(
            video_path=request.video_path,
            query=query,
            output_dir=output_subdir
        )
        
        # pipeline_result가 dict 형태라면 그 안에서 실제 세그먼트 데이터를 꺼내야 합니다.
        # 보통 result["segments"] 형태이거나, 리스트 형태일 수 있습니다.
        # 바뀐 코드에 맞춰 'segments' 키가 있는지 확인합니다.
        segments = pipeline_result.get("segments", []) if isinstance(pipeline_result, dict) else pipeline_result
        
        if segments:
            best = segments[0] # 가장 점수 높은 첫 번째 구간
            
            # 4. 오디오 분석 (원본 영상 기준)
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
            
    return {
        "status": "success",
        "project": request.project_name,
        "results": final_results
    }