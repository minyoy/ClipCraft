# ClipCraft E2E QA

Playwright 기반 핵심 사용자 플로우 테스트입니다.

## 사전 준비

```bash
cd clipcraft-web
npm install
npx playwright install chromium
```

CI 환경에서는 workflow가 `npx playwright install --with-deps`를 실행합니다.

## 실행 방법

전체 E2E 테스트:

```bash
npm run test:e2e
```

브라우저를 보면서 실행:

```bash
npm run test:e2e:headed
```

Playwright UI 모드:

```bash
npm run test:e2e:ui
```

특정 테스트만 실행:

```bash
npx playwright test e2e/auth.spec.ts
npx playwright test e2e/project.spec.ts
npx playwright test e2e/analysis-flow.spec.ts
npx playwright test e2e/editor.spec.ts
```

## 테스트 구성

- `auth.spec.ts`
  - 랜딩 페이지 접속
  - 로그인 페이지 이동
  - 이메일/비밀번호 입력
  - workspace 이동 확인

- `project.spec.ts`
  - workspace에서 새 프로젝트 생성
  - 프로젝트 이름 입력
  - 기본 영상 비율 `세로 9:16` 확인
  - 업로드 화면에 프로젝트 정보 반영 확인

- `analysis-flow.spec.ts`
  - 샘플 영상 업로드
  - 시나리오 3개 입력
  - 분석 API route mocking
  - 추천 결과 카드 3개 표시 확인
  - start/end/score 정보 표시 확인

- `editor.spec.ts`
  - 세그먼트 선택
  - 세그먼트 시간 조정 핸들 확인
  - 재생 버튼 동작 확인
  - 채팅 자연어 명령 확인
    - `2배속해줘`
    - `음소거해줘`
    - `보여줘`
    - `삭제해줘`

## Mock 동작

분석 API는 실제 백엔드를 호출하지 않습니다.

`e2e/support/flows.ts`에서 Playwright `page.route()`로 아래 요청을 mock 처리합니다.

- `POST **/analyze/jobs`
- `GET **/analyze/jobs/mock-job`

mock 응답은 시나리오 입력 3개에 맞춰 추천 구간 3개를 반환합니다.

## 테스트 결과 위치

Playwright 기본 결과 위치:

- HTML 리포트: `clipcraft-web/playwright-report/`
- 실패 디버깅 파일: `clipcraft-web/test-results/`

현재 설정:

- 실패 시 video 저장: `video: 'retain-on-failure'`
- retry 시 trace 저장: `trace: 'on-first-retry'`

HTML 리포트 보기:

```bash
npx playwright show-report
```

## GitHub Actions

workflow:

```text
.github/workflows/clipcraft-web-e2e.yml
```

push 또는 PR에서 `clipcraft-web/**` 변경이 있으면 실행됩니다.

실행 순서:

1. `npm install`
2. `npm run build`
3. `npx playwright install --with-deps`
4. `npm run test:e2e`

## 참고

Playwright 설정 파일:

```text
clipcraft-web/playwright.config.ts
```

테스트용 샘플 영상:

```text
clipcraft-web/e2e/fixtures/sample.mp4
```

이 파일은 작고 고정된 fixture로, 실제 AI 분석 결과와 무관하게 안정적인 테스트를 위해 사용합니다.
