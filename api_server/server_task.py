from __future__ import annotations
import os
import re
import sys
import requests
import subprocess
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalysisRequest(BaseModel):
    project_name: str
    video_path: str  # 이제 학교 서버 내의 영상 경로를 보내야 합니다.
    scenarios: List[str]

# 학교 서버 내부에서 모델 서버(8000번)와 통신합니다.
REMOTE_SERVER_URL = "http://127.0.0.1:8000"

def make_safe_name(name: str):
    clean_name = re.sub(r'[\\/:*?"<>|]', "", name).strip().replace(" ", "_")
    return clean_name

@app.post("/analyze")
async def analyze(request: AnalysisRequest):
    final_results = []
    
    # 학교 서버 내 저장 경로 설정
    safe_project = make_safe_name(request.project_name)
    # /home/CC_project/... 등 학교 서버의 실제 경로로 수정하세요
    clips_dir = f"./clips/{safe_project}" 
    os.makedirs(clips_dir, exist_ok=True)
    
    for i, query in enumerate(request.scenarios, start=1):
        try:
            # 학교 서버 내부의 모델 서버에 분석 요청
            remote_payload = {
                "video_path": request.video_path, 
                "query": query
            }
            
            response = requests.post(f"{REMOTE_SERVER_URL}/inference", json=remote_payload, timeout=120)
            pipeline_result = response.json()
            
            segments = pipeline_result.get("segments", [])
            
            if segments:
                best = segments[0]
                start_t = best.get("start", 0)
                end_t = best.get("end", 0)
                
                output_filename = f"sc{i}_{make_safe_name(query)[:20]}.mp4"
                output_path = os.path.join(clips_dir, output_filename)
                
                # 학교 서버의 ffmpeg를 사용하여 컷팅
                ffmpeg_cmd = [
                    "ffmpeg", "-y",
                    "-ss", str(start_t),
                    "-to", str(end_t),
                    "-i", request.video_path,
                    "-c", "copy",
                    output_path
                ]
                subprocess.run(ffmpeg_cmd, check=True)
                
                final_results.append({
                    "id": i,
                    "scenario": query,
                    "start": round(start_t, 1),
                    "end": round(end_t, 1),
                    "clip_path": output_path
                })
        except Exception as e:
            print(f"Error: {e}")
            continue
            
    return {"status": "success", "results": final_results}
