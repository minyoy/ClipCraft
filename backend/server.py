import os

import httpx
from fastapi import FastAPI, File, Form, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response


app = FastAPI(title="ClipCraft Backend")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

GPU_SERVER_URL = os.environ.get("GPU_SERVER_URL", "http://host.docker.internal:8001").rstrip("/")


def raise_upstream_error(response: httpx.Response) -> None:
    if response.is_success:
        return

    try:
        payload = response.json()
        detail = payload.get("detail") or payload.get("message") or payload.get("error")
    except ValueError:
        detail = response.text

    raise HTTPException(
        status_code=response.status_code,
        detail=detail or "GPU server request failed",
    )


@app.get("/health")
async def health():
    return {"status": "ok", "gpu_server_url": GPU_SERVER_URL}


@app.post("/analyze/jobs")
async def start_analyze_job(
    video: UploadFile = File(...),
    project_name: str = Form(...),
    scenarios: str = Form(...),
):
    files = {
        "video": (
            video.filename or "video.mp4",
            await video.read(),
            video.content_type or "application/octet-stream",
        )
    }
    data = {"project_name": project_name, "scenarios": scenarios}

    async with httpx.AsyncClient(timeout=None) as client:
        response = await client.post(f"{GPU_SERVER_URL}/analyze/jobs", files=files, data=data)

    raise_upstream_error(response)
    return response.json()


@app.get("/analyze/jobs/{job_id}")
async def get_analyze_job(job_id: str):
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.get(f"{GPU_SERVER_URL}/analyze/jobs/{job_id}")

    raise_upstream_error(response)
    return response.json()


@app.post("/analyze")
async def analyze(request: Request):
    async with httpx.AsyncClient(timeout=None) as client:
        response = await client.post(
            f"{GPU_SERVER_URL}/analyze",
            content=await request.body(),
            headers={"content-type": request.headers.get("content-type", "application/json")},
        )

    raise_upstream_error(response)
    return response.json()


@app.post("/export")
async def export_video(request: Request):
    async with httpx.AsyncClient(timeout=None) as client:
        response = await client.post(
            f"{GPU_SERVER_URL}/export",
            content=await request.body(),
            headers={"content-type": request.headers.get("content-type", "application/json")},
        )

    raise_upstream_error(response)
    headers = {}
    if content_disposition := response.headers.get("content-disposition"):
        headers["content-disposition"] = content_disposition
    return Response(
        content=response.content,
        status_code=response.status_code,
        media_type=response.headers.get("content-type", "video/mp4"),
        headers=headers,
    )
