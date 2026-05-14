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
from videollava.vllava2 import VideoLLaVAVerifier

app = FastAPI()

# 서버 시작 시 모델을 미리 로드하여 속도 향상
vllava_verifier = None

@app.on_event("startup")
def load_model():
    """서버가 시작될 때 딱 한 번만 모델을 로드합니다."""
    global vllava_verifier
    print("🚀 Video-LLaVA 모델 로딩 시작...")
    vllava_verifier = VideoLLaVAVerifier()
    print("✅ 모델 로딩 완료!")

class GPUProcessRequest(BaseModel):
    video_path: str
    query: str
    output_dir: str

@app.post("/process")
async def process_ai_logic(request: GPUProcessRequest):
    # 모델 로드 여부 확인
    if vllava_verifier is None:
        return {"error": "Model not loaded yet"}
    
    # 1. CLIP 기반 1단계 검색 실행
    print(f"--- [1단계] CLIP 후보 구간 추출 시작: {request.query} ---")
    pipeline_result = run_pipeline(
        video_path=request.video_path,
        query=request.query,
        output_dir=request.output_dir
    )
    
    # CLIP이 찾은 후보 구간(segments) 추출
    clip_candidates = pipeline_result.get("segments", []) if isinstance(pipeline_result, dict) else pipeline_result
    actual_clip_dir = os.path.join(request.output_dir, request.query.replace(" ", "_"))
    
    # 2. Video-LLaVA 기반 2단계 시간 검증 (Temporal Grounding)
    print(f"--- [2단계] Video-LLaVA 정밀 검증 시작 (후보군: {len(clip_candidates)}개) ---")
    
    # ★ 핵심 수정: 딕셔너리 형태로 한 번에 받아서 Unpacking 에러 방지
    vllava_result = vllava_verifier.verify_timestamp(
        video_path=request.video_path,
        scenario_text=request.query,
        candidates=clip_candidates,
        clip_folder=actual_clip_dir 
    )

    # 안전하게 결과값 추출
    vllava_start = vllava_result.get("start", 0.0)
    vllava_end = vllava_result.get("end", 0.0)
    vllava_reason = vllava_result.get("reason", "No analysis provided")
    
    # 사용자 친화적인 클립 번호 생성 (0-index -> 1-index)
    best_idx = vllava_result.get("best_idx")
    vllava_selection = f"{best_idx + 1}번 클립" if best_idx is not None else "선택된 클립 없음"
    vllava_confidence = vllava_result.get("confidence", 0.0)
    
    # 최종 결과 반환[cite: 1]
    return {
        "clip_segments": clip_candidates,
        "vllava_refined": {
            "start": vllava_start, 
            "end": vllava_end,
            "reason": vllava_reason,     
            "confidence": vllava_confidence,     # 신뢰도 점수
            "final_selection": vllava_selection # 최종 선택 클립 정보 포함
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api_server.gpu_server:app", host="0.0.0.0", port=8001, reload=False)