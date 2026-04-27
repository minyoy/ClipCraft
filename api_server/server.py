import os
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
from fastapi.middleware.cors import CORSMiddleware

# 외부 파이프라인 모듈에서 로직 로드
from clip_search.pipeline import run_pipeline

app = FastAPI()

# 프론트엔드와 백엔드 간의 데이터 통신을 위한 CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 프로젝트 경로 설정
BASE_DIR = os.path.dirname(os.path.abspath(__file__)) # 현재 파일(api_server) 경로
PROJECT_ROOT = os.path.dirname(BASE_DIR)              # 프로젝트 최상위 경로
CLIPS_ROOT = os.path.join(PROJECT_ROOT, "clip_search", "clips")

# 요청 데이터 구조 정의
class AnalysisRequest(BaseModel):
    video_path: str      # 원본 영상의 로컬 절대 경로
    scenarios: List[str] # 분석할 시나리오 텍스트 리스트 (3개)

@app.post("/analyze")
async def analyze(request: AnalysisRequest):
    """
    UI로부터 전달받은 영상 경로와 시나리오 리스트를 바탕으로
    AI 분석을 수행하고 결과 클립 정보를 반환한다.
    """
    final_results = []
    
    # 전달받은 시나리오 리스트를 순회하며 분석 수행
    for i, query in enumerate(request.scenarios, start=1):
        # 시나리오별 결과물이 저장될 하위 디렉토리 설정
        output_subdir = os.path.join(CLIPS_ROOT, f"scenario_{i}")
        
        # AI 파이프라인 실행 (유사도 측정 및 클립 생성)
        segments = run_pipeline(request.video_path, query, output_dir=output_subdir)
        
        if segments:
            # 유사도 점수가 가장 높은 첫 번째 세그먼트 정보를 선택
            best = segments[0]
            
            # 생성된 클립 파일명 규칙 정의 (원본파일명_clip01.mp4)
            video_base_name = os.path.splitext(os.path.basename(request.video_path))[0]
            saved_clip_name = f"{video_base_name}_clip01.mp4"
            
            final_results.append({
                "id": i,
                "scenario": query,
                "start": round(best["start"], 1),
                "end": round(best["end"], 1),
                "score": round(best["max_score"], 4),
                # 생성된 결과 영상의 로컬 절대 경로 반환
                "clip_path": os.path.join(output_subdir, saved_clip_name)
            })
            
    return {
        "status": "success",
        "results": final_results
    }