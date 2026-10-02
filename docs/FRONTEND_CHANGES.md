# 프론트엔드 변경사항 (feat/auth-projects-backend)

> 백엔드에 실제 인증(로그인/회원가입)과 프로젝트 CRUD API가 생기면서, 그동안 mock/더미 데이터로 동작하던 프론트엔드 로직을 실제 API 호출로 교체했다. GPU 영상 분석(`/analyze`, `/export`) 쪽은 건드리지 않았다.

## 새로 만든 파일

| 파일 | 역할 |
|---|---|
| `src/api/v1Client.ts` | `/api/v1` 전용 fetch 래퍼. 백엔드 에러 포맷(`{error:{code,message,details}}`)을 `ApiV1Error`로 변환 |
| `src/api/auth.ts` | signup/login/refresh/logout/me 호출 함수 |
| `src/api/projects.ts` | 프로젝트 CRUD(목록/생성/수정/삭제/복제/복원) 호출 함수 |
| `src/lib/authStorage.ts` | access/refresh 토큰 localStorage 저장 |
| `src/lib/authContext.tsx` | `useAuth()` 훅 제공. `{ user, accessToken, loading, login, signup, logout }` |
| `src/lib/projectMapping.ts` | 백엔드 응답(`ApiProject`) → 기존 화면 타입(`ProjectItem`) 변환 |

## 기존 파일 중 동작이 바뀐 것

- **`App.tsx`**: `AuthProvider`로 앱 전체를 감쌈
- **`LoginForm.tsx` / `SignupForm.tsx`**: `setTimeout`으로 무조건 성공하던 mock 제거 → 실제 API 호출. 실패 시 서버 에러 코드(`INVALID_CREDENTIALS`, `EMAIL_ALREADY_EXISTS` 등)를 기존 필드 에러 UI에 매핑
- **`router/AppRouter.tsx`**: `/workspace`, `/upload`, `/editor*`에 `RequireAuth` 가드 추가 → **로그인 안 하면 더 이상 접근 안 되고 `/auth`로 리다이렉트** (이전엔 URL만 알면 그냥 들어가졌음)
- **`pages/ProjectsScreen.tsx`**: `initialProjects` 더미 배열 삭제. 마운트 시 `GET /api/v1/projects` 호출, 생성/이름변경/별표/삭제/복제가 전부 실제 API 호출 + 실패 시 토스트로 에러 표시
- **`components/ProjectsScreen/ProjectsTopNav.tsx`**: 정적 "JM" 아바타 → 실제 로그인 유저 이니셜 + 로그아웃 메뉴
- **`components/ProjectsScreen/projectData.ts`**: 더미 프로젝트 배열(`initialProjects`) 삭제, 색상 팔레트(`projectPalettes`)만 유지
- **`lib/formatters.ts`**: 초 단위 재생시간(`formatDurationSeconds`), 상대시간(`formatRelativeTime`, "n시간 전") 포맷 함수 추가
- **`types/pages/ProjectsScreen.ts`**: `ProjectItem`에 `version: number` 추가
- **`components/icons.ts`**: 로그아웃 아이콘 추가
- **`vite.config.ts`**: 개발 서버 프록시에 `/api` 경로 추가 (`/api/v1/...` → 백엔드로 프록시)

## 팀원이 주의해야 할 것

- `ProjectItem` 타입에 **`version` 필드가 추가됨** — 프로젝트 수정/삭제 API가 낙관적 동시성 제어(버전 불일치 시 409)를 쓰기 때문. 이 타입을 쓰는 다른 컴포넌트 작업 시 참고
- 화면 어디서든 로그인 유저 정보가 필요하면 props로 내려받지 않고 `useAuth()`를 바로 호출하면 됨
- 로컬 개발 시 **백엔드(`backend/app`)가 떠 있어야** `/api/v1/...` 호출이 정상 동작함 (안 떠 있으면 네트워크 에러로 로그인/프로젝트 목록이 실패함)
- `projectData.ts`의 `initialProjects`가 삭제됐으니, 다른 곳에서 import해서 쓰고 있었다면 빌드가 깨짐

## 로컬 실행

```bash
# 백엔드
cd backend
CLIPCRAFT_DATA_DIR=./data JWT_SECRET=dev-insecure-secret-change-me .venv/bin/uvicorn app.main:app --reload --port 8000

# 프론트엔드 (새 터미널)
cd clipcraft-web
npm run dev
```

`http://localhost:5173`에서 확인. 가입한 계정/프로젝트는 `backend/data/clipcraft.db`에 저장되어 서버 재시작 후에도 유지된다.
