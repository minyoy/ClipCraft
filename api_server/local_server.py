import os
import requests
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
from fastapi.middleware.cors import CORSMiddleware

from audio.audio_waveform import extract_audio_waveform[cite: 1]

app = FastAPI()

# CORS 설정
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

# 학교 서버의 IP 주소를 여기에 적어주세요.
GPU_SERVER_URL = "http://203.249.75.3:8000/process"

@app.post("/analyze")
async def analyze(request: AnalysisRequest):
    final_results = []
    
    for i, query in enumerate(request.scenarios, start=1):
        # 1. 학교 GPU 서버에 AI 분석 요청 전송
        gpu_payload = {
            "video_path": request.video_path,
            "query": query,
            "output_dir": f"./clips/{request.project_name}/sc{i}"
        }
        
        try:
            gpu_response = requests.post(GPU_SERVER_URL, json=gpu_payload, timeout=300)
            ai_data = gpu_response.json()
            
            # 2. 오디오 분석 (로컬 CPU 활용)[cite: 1]
            audio_data = extract_audio_waveform(request.video_path, bar_count=88)[cite: 1]
            
            # 3. 결과 데이터 취합[cite: 3]
            # V-LLaVA가 정제한 시간을 우선적으로 사용합니다.
            start = ai_data["vllava_refined"]["start"]
            end = ai_data["vllava_refined"]["end"]
            
            final_results.append({
                "project_name": request.project_name,
                "id": i,
                "scenario": query,
                "start": round(start, 1),
                "end": round(end, 1),
                "audio": audio_data
            })
        except Exception as e:
            print(f"Error connecting to GPU Server: {e}")
            
    return {
        "status": "success",
        "results": final_results
    }