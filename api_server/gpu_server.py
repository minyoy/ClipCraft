import os
import sys
from fastapi import FastAPI
from pydantic import BaseModel

# 프로젝트 루트 및 모듈 경로 설정
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(current_dir)
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from clip_search.pipeline import run_pipeline
from videollava.vllava import VideoLLaVAVerifier

app = FastAPI()

# 서버 시작 시 모델을 미리 로드하여 속도 향상
vllava_verifier = VideoLLaVAVerifier()

class GPUProcessRequest(BaseModel):
    video_path: str
    query: str
    output_dir: str

@app.post("/process")
async def process_ai_logic(request: GPUProcessRequest):
    # 1. CLIP 기반 1단계 검색 실행[cite: 4]
    pipeline_result = run_pipeline(
        video_path=request.video_path,
        query=request.query,
        output_dir=request.output_dir
    )
    
    # 2. Video-LLaVA 기반 2단계 시간 검증 (Temporal Grounding)[cite: 2]
    # CLIP이 찾은 후보 구간을 더 정교하게 다듬습니다.
    vllava_start, vllava_end = vllava_verifier.verify_timestamp(
        video_path=request.video_path,
        scenario_text=request.query
    )
    
    return {
        "clip_segments": pipeline_result.get("segments", []) if isinstance(pipeline_result, dict) else pipeline_result,
        "vllava_refined": {"start": vllava_start, "end": vllava_end}
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)