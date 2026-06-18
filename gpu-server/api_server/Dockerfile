FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        ffmpeg \
        git \
        libglib2.0-0 \
        libgl1 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

COPY api_server /app/api_server
COPY audio /app/audio
COPY clip_search /app/clip_search

EXPOSE 8000

CMD ["uvicorn", "api_server.server:app", "--host", "0.0.0.0", "--port", "8000"]
