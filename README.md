# ClipCraft

텍스트 설명으로 영상에서 원하는 장면을 자동으로 찾아 클립으로 추출하는 AI 영상 편집 도구.

## 동작 방식

1. 영상 업로드
2. 찾고 싶은 장면을 텍스트로 입력 (시나리오)
3. CLIP 모델이 프레임별 유사도를 분석하여 해당 구간 자동 추출
4. 웨이브폼 에디터에서 결과 확인 및 편집

## 프로젝트 구조

```
ClipCraft/
├── api_server/         # FastAPI 백엔드
├── clip_search/        # CLIP 기반 영상 검색 파이프라인
├── audio/              # 오디오 파형 추출
└── clipcraft-web/      # React 프론트엔드
```

## 설치 및 실행

### 1. 의존성 설치

```bash
pip install -r requirements.txt
```

> CLIP은 pip 패키지가 없으므로 git으로 직접 설치:
> ```bash
> pip install git+https://github.com/openai/CLIP.git
> ```

### 2. 환경 변수 설정

```bash
cp clipcraft-web/.env.example clipcraft-web/.env
# OPENAI_API_KEY 입력
```

### 3. 백엔드 실행

```bash
cd api_server
uvicorn server:app --reload --port 8000
```

### 4. 프론트엔드 실행

```bash
cd clipcraft-web
npm install
npm run dev
```

## 기술 스택

| 역할 | 기술 |
|------|------|
| 영상 분석 | OpenAI CLIP (ViT-L/14) |
| 쿼리 확장 | OpenAI GPT API |
| 오디오 분석 | ffmpeg |
| 백엔드 | FastAPI |
| 프론트엔드 | React + TypeScript |
