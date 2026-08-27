# ClipCraft

텍스트로 설명한 장면을 영상에서 찾아 클립으로 추출하는 AI 영상 편집 도구입니다.

## 구성

```text
브라우저 → 프론트엔드(:5174) → 일반 백엔드(:8000) → GPU 서버(:8001)
```

```text
ClipCraft/
├── backend/            # Docker로 실행하는 일반 백엔드
├── gpu-server/         # Docker 없이 실행하는 GPU 분석 서버
├── clipcraft-web/      # Docker로 실행하는 프론트엔드
├── docker-compose.yml  # 프론트엔드 + 일반 백엔드 통합 실행
└── .env.example        # 통합 환경 변수 예제
```

## 최초 설정

저장소 루트에서 통합 환경 변수 파일을 만듭니다.

```bash
cp .env.example .env
```

`.env`에서 실제 GPU 서버 주소와 필요한 값을 설정합니다.

```dotenv
GPU_SERVER_URL=http://<GPU_SERVER_IP>:8001
OPENAI_API_KEY=

BACKEND_PORT=8000
FRONTEND_PORT=5174
VITE_BACKEND_URL=http://localhost:8000

NGROK_AUTHTOKEN=
```

GPU 서버와 Docker가 같은 컴퓨터에서 실행된다면 다음 주소를 사용할 수 있습니다.

```dotenv
GPU_SERVER_URL=http://host.docker.internal:8001
```

## 1. GPU 서버 실행

GPU 서버에서는 Docker를 사용하지 않습니다.

최초 한 번 Python 환경과 패키지를 설치합니다.

```bash
cd gpu-server
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

PyTorch 설치가 실패하거나 CUDA와 맞지 않으면 서버의 CUDA 버전에 맞는 `torch`와
`torchvision`을 먼저 설치해야 합니다.

이후 GPU 서버를 실행합니다.

```bash
cd gpu-server
source .venv/bin/activate
uvicorn server:app --host 0.0.0.0 --port 8001 --env-file ../.env
```

터미널을 종료해도 계속 실행하려면 `tmux` 또는 `screen` 안에서 실행합니다.

GPU 서버 확인:

```bash
curl http://localhost:8001/docs
```

## 2. 프론트엔드와 일반 백엔드 실행

GPU 서버가 실행된 상태에서, Docker를 사용할 컴퓨터의 저장소 루트에서 실행합니다.

```bash
docker compose up -d --build
```

한 번의 명령으로 다음 두 서비스가 함께 실행됩니다.

- 프론트엔드: `http://localhost:5174`
- 일반 백엔드: `http://localhost:8000`
- 백엔드 API 문서: `http://localhost:8000/docs`
- 백엔드 상태 확인: `http://localhost:8000/health`

실행 상태 확인:

```bash
docker compose ps
```

전체 로그 확인:

```bash
docker compose logs -f
```

서비스 종료:

```bash
docker compose down
```

코드를 변경한 뒤 다시 빌드하려면 다음 명령을 다시 실행합니다.

```bash
docker compose up -d --build
```

## 연결 문제 확인

분석 요청이 실패하면 다음 순서로 확인합니다.

1. GPU 서버의 `8001` 포트가 열려 있는지 확인합니다.
2. 루트 `.env`의 `GPU_SERVER_URL`이 실제 GPU 서버 주소인지 확인합니다.
3. 일반 백엔드에서 GPU 서버에 접근 가능한지 확인합니다.
4. `docker compose logs -f backend`로 백엔드 오류를 확인합니다.
5. GPU 서버를 실행한 터미널에서 분석 오류를 확인합니다.

GPU 서버가 다른 컴퓨터라면 해당 서버의 방화벽에서 백엔드 서버가 TCP `8001` 포트에
접근할 수 있어야 합니다.

## ngrok 실행

외부 공개가 필요 없다면 평소에는 다음 명령을 사용합니다.

```bash
docker compose up -d --build
```

이 경우 `frontend`와 `backend`만 실행됩니다.

프론트엔드를 외부에 공개하려면 루트 `.env`에 `NGROK_AUTHTOKEN`을 설정한 뒤 터널
프로필로 실행합니다.

```bash
docker compose --profile tunnel up -d --build
```

이 명령을 실행하면 `frontend`, `backend`, `ngrok`이 모두 함께 실행됩니다. ngrok은
프론트엔드에 연결되어 외부에서 접속할 수 있는 임시 URL을 생성합니다.

ngrok 공개 주소는 로그에서 확인할 수 있습니다.

```bash
docker compose logs ngrok
```

또는 브라우저에서 `http://localhost:4040`으로 접속해 확인할 수 있습니다.
