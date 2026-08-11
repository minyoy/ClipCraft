# ClipCraft 프론트엔드 기준 API 명세서

> 문서 버전: 1.0.0  
> 기준일: 2026-08-11  
> 기준 코드: `clipcraft-web/src` 및 `gpu-server/api_server/server.py`

## 1. 문서 목적

이 문서는 현재 ClipCraft 프론트엔드에 화면 또는 클라이언트 로직으로 구현된 기능을 기준으로 필요한 백엔드 API를 정의한다.

- 이미 백엔드에 구현된 API는 현재 구현 상태와 실제 계약을 기록한다.
- 프론트엔드에만 구현된 기능은 백엔드 신규 구현 대상으로 명세한다.
- 일부만 연결된 기능은 현재 문제와 목표 계약을 함께 기록한다.
- 백엔드 개발자가 이 문서만 보고 API, 저장 모델, 검증 규칙과 오류 처리를 구현할 수 있도록 요청과 응답을 구체적으로 정의한다.

이 문서의 `목표 API`가 앞으로 프론트엔드와 백엔드가 맞춰야 할 최종 계약이다. 현재 구현과 목표 API가 충돌하면 목표 API를 우선한다.

## 2. 구현 상태 범례

| 상태 | 의미 |
|---|---|
| ✅ 구현됨 | 프론트엔드에서 호출하고 백엔드에도 대응 API가 구현되어 있음 |
| ⚠️ 부분 구현 | 양쪽에 코드가 있지만 데이터 누락, 영속성 부재, 라우팅 문제 등으로 계약이 완성되지 않음 |
| ❌ 미구현 | 프론트 화면/동작은 있으나 백엔드 API가 없음 |
| 🖥️ 프론트 전용 | 서버 상태가 필요 없는 UI 동작이며 API 구현 대상이 아님 |

## 3. 전체 API 현황

| 도메인 | 메서드 | 목표 경로 | 상태 | 프론트 기능 |
|---|---:|---|---|---|
| 인증 | POST | `/api/v1/auth/signup` | ❌ 미구현 | 회원가입 |
| 인증 | POST | `/api/v1/auth/login` | ❌ 미구현 | 로그인 |
| 인증 | POST | `/api/v1/auth/refresh` | ❌ 미구현 | 로그인 상태 유지 |
| 인증 | POST | `/api/v1/auth/logout` | ❌ 미구현 | 로그아웃/세션 종료 |
| 인증 | POST | `/api/v1/auth/password/forgot` | ❌ 미구현 | 비밀번호 찾기 |
| 사용자 | GET | `/api/v1/users/me` | ❌ 미구현 | 상단 사용자 프로필 |
| 프로젝트 | GET | `/api/v1/projects` | ❌ 미구현 | 목록, 검색, 정렬 |
| 프로젝트 | POST | `/api/v1/projects` | ❌ 미구현 | 새 프로젝트 생성 |
| 프로젝트 | GET | `/api/v1/projects/{project_id}` | ❌ 미구현 | 프로젝트 열기/새로고침 복구 |
| 프로젝트 | PATCH | `/api/v1/projects/{project_id}` | ❌ 미구현 | 이름 변경, 별표, 편집 상태 저장 |
| 프로젝트 | DELETE | `/api/v1/projects/{project_id}` | ❌ 미구현 | 삭제 |
| 프로젝트 | POST | `/api/v1/projects/{project_id}/duplicate` | ❌ 미구현 | 복제 |
| 미디어 | POST | `/api/v1/projects/{project_id}/source-video` | ⚠️ 부분 구현 | 영상 업로드. 현재는 분석 시작 요청에 포함됨 |
| 분석 | POST | `/api/v1/projects/{project_id}/analysis-jobs` | ✅ 구현됨(레거시 경로) | 비동기 분석 시작 |
| 분석 | GET | `/api/v1/analysis-jobs/{job_id}` | ✅ 구현됨(레거시 경로) | 분석 진행률 폴링 |
| 분석 | POST | `/api/v1/analysis-jobs/{job_id}/cancel` | ❌ 미구현 | 분석 취소 |
| 분석 | POST | `/api/v1/analysis-jobs/{job_id}/retry` | ❌ 미구현 | 실패 분석 재시도 |
| 편집 | GET | `/api/v1/projects/{project_id}/edit-state` | ❌ 미구현 | 편집 화면 복구 |
| 편집 | PUT | `/api/v1/projects/{project_id}/edit-state` | ❌ 미구현 | 구간 조절, 재정렬, 삭제, 속도, 음소거 저장 |
| 편집 | POST | `/api/v1/projects/{project_id}/commands` | ⚠️ 프론트 규칙만 구현 | 자연어 편집 명령 |
| 편집 | GET | `/api/v1/projects/{project_id}/history` | ❌ 미구현 | 작업 기록 |
| 편집 | POST | `/api/v1/projects/{project_id}/history/{revision_id}/restore` | ❌ 미구현 | 이전 작업 복원 |
| 내보내기 | POST | `/api/v1/projects/{project_id}/exports` | ✅ 구현됨(동기 레거시 API) | MP4 내보내기 |
| 내보내기 | GET | `/api/v1/exports/{export_id}` | ❌ 미구현 | 내보내기 진행 상태 |
| 내보내기 | GET | `/api/v1/exports/{export_id}/download` | ⚠️ 현재 POST 응답으로 직접 다운로드 | 결과 다운로드 |

## 4. 공통 규약

### 4.1 Base URL과 콘텐츠 타입

- 목표 Base URL: `/api/v1`
- JSON 요청: `Content-Type: application/json`
- 파일 업로드: `multipart/form-data`
- 인증이 필요한 요청: `Authorization: Bearer <access_token>`
- 날짜와 시간: ISO 8601 UTC 문자열. 예: `2026-08-11T09:30:00Z`
- 식별자: 서버가 발급하는 UUID 문자열
- 영상 시간: 초 단위 `number`, 소수 허용
- 파일 크기: 바이트 단위 정수

### 4.2 성공 응답 봉투

단일 객체:

```json
{
  "data": {},
  "meta": {
    "request_id": "req_01K2..."
  }
}
```

목록:

```json
{
  "data": [],
  "meta": {
    "request_id": "req_01K2...",
    "page": 1,
    "page_size": 20,
    "total": 57,
    "total_pages": 3
  }
}
```

### 4.3 오류 응답

모든 JSON 오류는 아래 형식을 사용한다.

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "요청 값이 올바르지 않습니다.",
    "details": [
      {
        "field": "password",
        "reason": "비밀번호는 8자 이상이어야 합니다."
      }
    ]
  },
  "meta": {
    "request_id": "req_01K2..."
  }
}
```

공통 오류 코드:

| HTTP | code | 의미 |
|---:|---|---|
| 400 | `INVALID_REQUEST` | JSON 파싱 실패, 잘못된 상태 전이 등 |
| 401 | `UNAUTHORIZED` | 토큰 없음, 만료 또는 위조 |
| 403 | `FORBIDDEN` | 다른 사용자의 리소스 접근 |
| 404 | `RESOURCE_NOT_FOUND` | 대상 리소스 없음 |
| 409 | `CONFLICT` | 이메일 중복, 버전 충돌 등 |
| 413 | `FILE_TOO_LARGE` | 업로드 제한 초과 |
| 415 | `UNSUPPORTED_MEDIA_TYPE` | 지원하지 않는 영상 형식 |
| 422 | `VALIDATION_ERROR` | 필드 검증 실패 |
| 429 | `RATE_LIMITED` | 호출 제한 초과 |
| 500 | `INTERNAL_ERROR` | 예상하지 못한 서버 오류 |
| 503 | `MODEL_UNAVAILABLE` | 분석 모델 또는 GPU 사용 불가 |

### 4.4 멱등성 및 동시 수정

- 프로젝트 생성, 분석 시작, 복제, 내보내기 시작에는 `Idempotency-Key` 헤더를 지원해야 한다.
- 같은 사용자와 같은 키로 24시간 내 재호출하면 기존 응답을 반환해야 한다.
- 프로젝트 및 편집 상태 수정에는 `version`을 포함한다.
- 요청 `version`이 서버 최신 버전과 다르면 `409 VERSION_CONFLICT`를 반환한다.

## 5. 공통 데이터 모델

### 5.1 User

```json
{
  "id": "7dc6c0bb-78ca-4f44-8272-51c35f63d53f",
  "name": "홍길동",
  "email": "user@example.com",
  "marketing_consent": false,
  "created_at": "2026-08-11T09:30:00Z"
}
```

### 5.2 ProjectSummary

```json
{
  "id": "2ae45629-0cc8-4bb8-bce1-c83d303d3fcb",
  "title": "주말 캠핑 브이로그",
  "status": "editing",
  "format": "16:9",
  "source_duration_seconds": 768.4,
  "exported_duration_seconds": null,
  "scene_count": 12,
  "source_size_bytes": 1300234240,
  "starred": false,
  "preview_url": "https://cdn.example.com/projects/.../preview.jpg",
  "analysis_progress": null,
  "created_at": "2026-08-10T04:00:00Z",
  "updated_at": "2026-08-11T07:20:00Z",
  "version": 7
}
```

`status` 값:

| 값 | 의미 |
|---|---|
| `draft` | 프로젝트만 생성되고 영상/분석이 완료되지 않음 |
| `analyzing` | 분석 진행 중 |
| `editing` | 분석 완료 후 편집 중 |
| `completed` | 한 번 이상 내보내기 완료 |
| `failed` | 최근 분석 또는 필수 처리 실패 |

`format` 값은 `9:16`, `16:9`, `1:1` 중 하나이다.

### 5.3 SourceVideo

```json
{
  "id": "3226a56c-d459-4ed9-8e80-28059d782b28",
  "file_name": "camping.mp4",
  "mime_type": "video/mp4",
  "size_bytes": 89423104,
  "duration_seconds": 742.18,
  "width": 1920,
  "height": 1080,
  "playback_url": "https://cdn.example.com/signed/source.mp4",
  "thumbnail_url": "https://cdn.example.com/signed/thumbnail.jpg",
  "created_at": "2026-08-11T09:31:00Z"
}
```

`playback_url`과 `thumbnail_url`은 만료 가능한 서명 URL이어도 된다. 이 경우 `url_expires_at`을 함께 반환한다.

### 5.4 Scenario

```json
{
  "id": "072bbb16-b6e5-4313-9146-5b74c33d0268",
  "order": 0,
  "text_ko": "냄비에 김치를 넣는 장면",
  "expanded_query": "a person adding kimchi into a cooking pot"
}
```

- `text_ko`: 앞뒤 공백 제거 후 1~500자
- `order`: 0부터 시작하며 중복 불가
- `expanded_query`: 분석 전에는 `null` 가능

### 5.5 HighlightSegment

```json
{
  "id": "25e3c6ef-7a47-4e41-bc66-bdb16aceb053",
  "source_id": "072bbb16-b6e5-4313-9146-5b74c33d0268",
  "scenario": "냄비에 김치를 넣는 장면",
  "title": "김치 넣기",
  "score": 0.8421,
  "start": 32.4,
  "end": 40.7,
  "source_clip_url": "https://cdn.example.com/signed/candidate.mp4",
  "order": 0
}
```

검증 규칙:

- `0 <= start < end <= source_video.duration_seconds`
- 최소 구간 길이는 0.2초
- `score`는 0~1. 값이 없으면 `null`
- `source_id`는 해당 구간을 만든 시나리오 ID

### 5.6 Waveform

```json
{
  "duration": 742.18,
  "bar_count": 88,
  "amplitudes": [0.08, 0.31, 0.77]
}
```

- `amplitudes.length`는 `bar_count`와 같아야 한다.
- 각 진폭은 0~1 범위로 정규화한다.

### 5.7 SegmentEdit

```json
{
  "segment_id": "25e3c6ef-7a47-4e41-bc66-bdb16aceb053",
  "order": 0,
  "start": 32.4,
  "end": 40.7,
  "speed": 2.0,
  "muted": false,
  "deleted": false
}
```

- `speed`: `0 < speed <= 8`, 기본값 1
- `muted`: 기본값 `false`
- 삭제는 데이터 유실 방지와 작업 복원을 위해 물리 삭제 대신 `deleted: true`로 저장한다.
- `order`는 삭제되지 않은 구간의 내보내기 순서를 결정한다.

## 6. 인증 API

현재 프론트에는 로그인, 회원가입, 로그인 상태 유지, 비밀번호 찾기 UI가 있다. 백엔드 인증 API는 전부 미구현이다.

### 6.1 회원가입

`POST /api/v1/auth/signup` — ❌ 미구현

요청:

```json
{
  "name": "홍길동",
  "email": "user@example.com",
  "password": "Password123",
  "terms_accepted": true,
  "marketing_consent": false
}
```

검증:

- `name`: 공백 제거 후 2~50자
- `email`: 소문자로 정규화, 최대 254자, 유효한 이메일 형식
- `password`: 8~72자. 영문과 숫자를 각각 하나 이상 포함
- `terms_accepted`: 반드시 `true`
- 비밀번호는 Argon2id 또는 bcrypt로 해시하고 평문을 로그에 기록하지 않는다.

성공 `201 Created`:

```json
{
  "data": {
    "user": {
      "id": "7dc6c0bb-78ca-4f44-8272-51c35f63d53f",
      "name": "홍길동",
      "email": "user@example.com",
      "marketing_consent": false,
      "created_at": "2026-08-11T09:30:00Z"
    },
    "access_token": "eyJ...",
    "token_type": "Bearer",
    "expires_in": 900,
    "refresh_token": "rft_..."
  },
  "meta": { "request_id": "req_01K2..." }
}
```

오류:

- `409 EMAIL_ALREADY_EXISTS`
- `422 WEAK_PASSWORD`
- `422 TERMS_NOT_ACCEPTED`

### 6.2 로그인

`POST /api/v1/auth/login` — ❌ 미구현

요청:

```json
{
  "email": "user@example.com",
  "password": "Password123",
  "remember_me": true
}
```

성공 `200 OK`:

```json
{
  "data": {
    "user": {
      "id": "7dc6c0bb-78ca-4f44-8272-51c35f63d53f",
      "name": "홍길동",
      "email": "user@example.com",
      "marketing_consent": false,
      "created_at": "2026-08-11T09:30:00Z"
    },
    "access_token": "eyJ...",
    "token_type": "Bearer",
    "expires_in": 900,
    "refresh_token": "rft_...",
    "refresh_expires_in": 2592000
  },
  "meta": { "request_id": "req_01K2..." }
}
```

`remember_me=false`이면 refresh token을 브라우저 세션 수명으로 제한할 수 있다. 보안을 위해 이메일 존재 여부와 비밀번호 오류를 구분하지 않고 `401 INVALID_CREDENTIALS`를 반환한다.

### 6.3 토큰 갱신

`POST /api/v1/auth/refresh` — ❌ 미구현

```json
{
  "refresh_token": "rft_..."
}
```

성공 응답에는 새 access token과 회전된 refresh token을 반환한다. 기존 refresh token은 즉시 폐기한다.

### 6.4 로그아웃

`POST /api/v1/auth/logout` — ❌ 미구현

```json
{
  "refresh_token": "rft_..."
}
```

성공: `204 No Content`. 서버는 해당 refresh token을 폐기한다.

### 6.5 비밀번호 재설정 요청

`POST /api/v1/auth/password/forgot` — ❌ 미구현

```json
{
  "email": "user@example.com"
}
```

성공은 계정 존재 여부와 관계없이 항상 `202 Accepted`로 동일하게 반환한다.

```json
{
  "data": {
    "accepted": true,
    "message": "계정이 존재하면 비밀번호 재설정 안내를 전송합니다."
  },
  "meta": { "request_id": "req_01K2..." }
}
```

### 6.6 현재 사용자 조회

`GET /api/v1/users/me` — ❌ 미구현

성공 응답의 `data`는 `User` 객체이다. 상단 프로필 버튼과 로그인 세션 복구에 사용한다.

## 7. 프로젝트 API

현재 프로젝트 생성, 검색, 정렬, 이름 변경, 복제, 삭제, 별표 UI는 구현되어 있으나 모두 컴포넌트 메모리에서만 동작한다.

### 7.1 프로젝트 목록

`GET /api/v1/projects` — ❌ 미구현

쿼리 파라미터:

| 이름 | 타입 | 기본값 | 설명 |
|---|---|---:|---|
| `query` | string | 빈 문자열 | 제목 부분 검색, 대소문자 무시 |
| `sort` | enum | `updated` | `updated`, `name` |
| `order` | enum | 자동 | `asc`, `desc`. updated 기본 desc, name 기본 asc |
| `status` | enum[] | 전체 | 같은 키를 반복하여 복수 상태 필터 |
| `starred` | boolean | 전체 | 별표 여부 |
| `page` | integer | 1 | 1 이상 |
| `page_size` | integer | 20 | 1~100 |

예시:

```http
GET /api/v1/projects?query=캠핑&sort=updated&order=desc&page=1&page_size=20
```

성공 `200 OK`:

```json
{
  "data": [
    {
      "id": "2ae45629-0cc8-4bb8-bce1-c83d303d3fcb",
      "title": "주말 캠핑 브이로그",
      "status": "editing",
      "format": "16:9",
      "source_duration_seconds": 768.4,
      "exported_duration_seconds": null,
      "scene_count": 12,
      "source_size_bytes": 1300234240,
      "starred": false,
      "preview_url": "https://cdn.example.com/signed/preview.jpg",
      "analysis_progress": null,
      "created_at": "2026-08-10T04:00:00Z",
      "updated_at": "2026-08-11T07:20:00Z",
      "version": 7
    }
  ],
  "meta": {
    "request_id": "req_01K2...",
    "page": 1,
    "page_size": 20,
    "total": 1,
    "total_pages": 1
  }
}
```

표시용 `12:48`, `1.24 GB`, `2시간 전`은 API가 문자열로 만들지 않고 프론트가 원시 숫자/날짜를 포맷한다.

### 7.2 프로젝트 생성

`POST /api/v1/projects` — ❌ 미구현

```json
{
  "title": "주말 캠핑 브이로그",
  "format": "9:16"
}
```

검증:

- `title`: 공백 제거 후 1~100자
- `format`: `9:16`, `16:9`, `1:1`

성공 `201 Created`: `data`에 `status=draft`, `version=1`인 `ProjectSummary`를 반환한다.

### 7.3 프로젝트 상세 및 화면 복구

`GET /api/v1/projects/{project_id}` — ❌ 미구현

성공 `200 OK`:

```json
{
  "data": {
    "project": {},
    "source_video": {},
    "latest_analysis_job": {
      "id": "9c188478-46df-4594-81ba-82718335f85a",
      "status": "success"
    },
    "analysis": {
      "segments": [],
      "waveform": {}
    },
    "edit_state": {
      "segments": [],
      "version": 7,
      "updated_at": "2026-08-11T07:20:00Z"
    },
    "latest_export": null
  },
  "meta": { "request_id": "req_01K2..." }
}
```

프로젝트 상태에 따라 아직 없는 값은 `null`로 반환한다. 이 API는 `/editor/{project_id}` 직접 접근과 새로고침 복구에 필요한 모든 핵심 데이터를 제공해야 한다.

### 7.4 프로젝트 수정

`PATCH /api/v1/projects/{project_id}` — ❌ 미구현

이름 변경:

```json
{
  "version": 7,
  "title": "제주 캠핑 하이라이트"
}
```

별표 변경:

```json
{
  "version": 7,
  "starred": true
}
```

한 요청에서 `title`, `starred`, `format` 중 하나 이상을 보낼 수 있다. 성공 응답은 수정된 전체 `ProjectSummary`이며 `version`을 1 증가시킨다.

### 7.5 프로젝트 삭제

`DELETE /api/v1/projects/{project_id}?version=7` — ❌ 미구현

성공: `204 No Content`.

실행 취소 UI 지원을 위해 권장 구현은 30일 소프트 삭제이다. 소프트 삭제를 사용하면 아래 복원 API도 구현한다.

`POST /api/v1/projects/{project_id}/restore`

```json
{
  "deleted_version": 7
}
```

### 7.6 프로젝트 복제

`POST /api/v1/projects/{project_id}/duplicate` — ❌ 미구현

```json
{
  "title": "주말 캠핑 브이로그 복사본",
  "include_source_video": true,
  "include_edit_state": true
}
```

성공 `201 Created`: 복제된 `ProjectSummary`. 원본 소유자만 호출 가능하다. 미디어 저장소가 객체 참조 복제를 지원하면 실제 바이트 복사를 피한다.

## 8. 원본 영상 업로드 API

프론트는 브라우저에서 파일 형식, 15분 제한, 썸네일을 검사한다. 서버는 클라이언트 검증을 신뢰하지 말고 동일한 검사를 다시 해야 한다.

### 8.1 목표 API

`POST /api/v1/projects/{project_id}/source-video` — ⚠️ 부분 구현

`multipart/form-data`:

| 필드 | 타입 | 필수 | 설명 |
|---|---|---:|---|
| `video` | binary | Y | 원본 영상 |

지원 기준:

- 컨테이너: MP4, MOV, WebM
- MIME: `video/mp4`, `video/quicktime`, `video/webm`
- 최대 재생 시간: 900초
- 최대 크기: 배포 환경 변수로 설정하되 기본 5 GiB
- ffprobe로 실제 스트림과 재생 시간을 검증
- 영상 스트림이 없으면 `422 INVALID_VIDEO`

성공 `201 Created`: `data`에 `SourceVideo`를 반환하고 프로젝트는 계속 `draft` 상태이다.

### 8.2 현재 구현과 차이

현재 `POST /analyze/jobs`가 영상 업로드와 분석 시작을 한 요청에서 처리한다. 업로드 파일은 `NamedTemporaryFile`에 저장되고 영속 미디어 ID가 없다. 목표 API에서는 영상을 먼저 프로젝트에 귀속시키고 분석 요청이 `source_video_id`를 참조하게 한다.

단기 호환이 필요하면 현재 multipart 분석 시작 API를 유지하되 신규 API 구현 후 deprecated 처리한다.

## 9. 분석 API

### 9.1 분석 작업 시작

목표: `POST /api/v1/projects/{project_id}/analysis-jobs`  
현재: `POST /analyze/jobs`  
상태: ✅ 핵심 구현됨, ⚠️ 영속성과 응답 데이터 보완 필요

목표 JSON 요청:

```json
{
  "source_video_id": "3226a56c-d459-4ed9-8e80-28059d782b28",
  "scenarios": [
    {
      "client_id": "scenario-1",
      "order": 0,
      "text_ko": "냄비에 김치를 넣는 장면"
    },
    {
      "client_id": "scenario-2",
      "order": 1,
      "text_ko": "국물을 붓고 끓이는 장면"
    }
  ]
}
```

검증:

- 프로젝트와 영상은 요청 사용자 소유여야 한다.
- 시나리오는 1~50개
- `text_ko`는 각각 1~500자
- 같은 프로젝트에서 `queued` 또는 `running` 작업이 있으면 기본적으로 `409 ANALYSIS_ALREADY_RUNNING`

성공 `202 Accepted`:

```json
{
  "data": {
    "id": "9c188478-46df-4594-81ba-82718335f85a",
    "project_id": "2ae45629-0cc8-4bb8-bce1-c83d303d3fcb",
    "status": "queued",
    "progress": 0,
    "step": {
      "id": 0,
      "code": "RECEIVING_VIDEO",
      "label": "영상 파일 수신 중"
    },
    "message": "분석 대기 중입니다.",
    "created_at": "2026-08-11T09:32:00Z"
  },
  "meta": { "request_id": "req_01K2..." }
}
```

현재 레거시 요청:

```http
POST /analyze/jobs
Content-Type: multipart/form-data
```

| 필드 | 타입 | 현재 필수 |
|---|---|---:|
| `video` | binary | Y |
| `project_name` | string | Y |
| `scenarios` | JSON 문자열 형태의 `string[]` | Y |

현재 응답:

```json
{
  "status": "queued",
  "job_id": "927d9bf6e96e4c78a730fd2c78795581"
}
```

### 9.2 분석 작업 조회

목표: `GET /api/v1/analysis-jobs/{job_id}`  
현재: `GET /analyze/jobs/{job_id}`  
상태: ✅ 구현됨, ⚠️ 프로세스 메모리에만 저장

성공 `200 OK`:

```json
{
  "data": {
    "id": "9c188478-46df-4594-81ba-82718335f85a",
    "project_id": "2ae45629-0cc8-4bb8-bce1-c83d303d3fcb",
    "status": "running",
    "progress": 68,
    "step": {
      "id": 4,
      "code": "MAPPING_SCENARIOS",
      "label": "시나리오 매핑"
    },
    "message": "2/3 시나리오 결과를 매핑했습니다.",
    "logs": [
      {
        "sequence": 1,
        "level": "info",
        "message": "영상 파일 수신 완료",
        "created_at": "2026-08-11T09:32:02Z"
      }
    ],
    "result": null,
    "error": null,
    "created_at": "2026-08-11T09:32:00Z",
    "updated_at": "2026-08-11T09:33:10Z"
  },
  "meta": { "request_id": "req_01K2..." }
}
```

상태 값:

- `queued`
- `running`
- `success`
- `error`
- `cancel_requested`
- `cancelled`

진행 단계 코드:

| id | code | 프론트 표시 |
|---:|---|---|
| 0 | `RECEIVING_VIDEO` | 영상 파일 수신 중 |
| 1 | `DECODING_FRAMES` | 프레임 디코딩 |
| 2 | `DETECTING_SCENES` | 씬 경계 감지 |
| 3 | `ANALYZING_AUDIO` | 오디오 파형 분석 |
| 4 | `MAPPING_SCENARIOS` | 시나리오 매핑 |
| 5 | `FINALIZING_HIGHLIGHTS` | 하이라이트 구간 확정 |

성공 시 `result`:

```json
{
  "segments": [
    {
      "id": "25e3c6ef-7a47-4e41-bc66-bdb16aceb053",
      "source_id": "072bbb16-b6e5-4313-9146-5b74c33d0268",
      "scenario": "냄비에 김치를 넣는 장면",
      "title": "김치 넣기",
      "score": 0.8421,
      "start": 32.4,
      "end": 40.7,
      "source_clip_url": "https://cdn.example.com/signed/candidate.mp4",
      "order": 0
    }
  ],
  "waveform": {
    "duration": 742.18,
    "bar_count": 88,
    "amplitudes": [0.08, 0.31, 0.77]
  },
  "scenarios": [
    {
      "id": "072bbb16-b6e5-4313-9146-5b74c33d0268",
      "order": 0,
      "text_ko": "냄비에 김치를 넣는 장면",
      "expanded_query": "a person adding kimchi into a cooking pot"
    }
  ],
  "model": {
    "clip_model": "ViT-L/14",
    "verification_model": "Video-LLaVA",
    "verification_applied": true
  }
}
```

현재 구현에서 빠져 있는 연결 데이터:

- 파이프라인 `max_score`가 프론트의 `score`로 전달되지 않음
- 저장된 `clip_path`가 URL로 변환되어 전달되지 않음
- `expandedQuery`가 응답에서 누락됨
- 후보 목록과 Video-LLaVA 선택 근거가 저장되지 않음
- 작업과 결과가 메모리에만 있어 서버 재시작 시 소실됨

작업이 `error`이면:

```json
{
  "code": "MODEL_UNAVAILABLE",
  "message": "영상 분석 모델을 사용할 수 없습니다.",
  "retryable": true,
  "failed_step": "MAPPING_SCENARIOS"
}
```

### 9.3 분석 취소

`POST /api/v1/analysis-jobs/{job_id}/cancel` — ❌ 미구현

본문 없음. `queued`, `running`에서만 가능하다. 성공 `202 Accepted`에서 변경된 작업을 반환한다. 이미 종료된 작업은 `409 JOB_ALREADY_FINISHED`.

### 9.4 분석 재시도

`POST /api/v1/analysis-jobs/{job_id}/retry` — ❌ 미구현

```json
{
  "reuse_cached_embeddings": true
}
```

`error`, `cancelled` 작업에서만 가능하다. 성공 `202 Accepted`로 새 작업 ID를 반환하고 `retried_from_job_id`를 기록한다.

### 9.5 레거시 동기 분석 API

`POST /analyze` — ⚠️ 백엔드만 구현, 프론트 미사용

```json
{
  "project_name": "프로젝트 이름",
  "video_path": "/server/local/path/video.mp4",
  "scenarios": ["김치를 넣는 장면"]
}
```

서버 로컬 경로를 클라이언트가 전달하는 구조이므로 외부 API로 노출하면 안 된다. 비동기 목표 API가 안정화되면 제거한다.

## 10. 편집 상태 API

현재 구간 시작/종료 변경, 재정렬, 삭제, 속도, 음소거는 프론트에서 구현되어 있다. 속도/음소거/삭제만 전역 localStorage에 저장되므로 프로젝트 간 데이터가 섞일 수 있으며 서버 복구가 불가능하다.

### 10.1 편집 상태 조회

`GET /api/v1/projects/{project_id}/edit-state` — ❌ 미구현

성공:

```json
{
  "data": {
    "project_id": "2ae45629-0cc8-4bb8-bce1-c83d303d3fcb",
    "segments": [
      {
        "segment_id": "25e3c6ef-7a47-4e41-bc66-bdb16aceb053",
        "order": 0,
        "start": 32.4,
        "end": 40.7,
        "speed": 2.0,
        "muted": false,
        "deleted": false
      }
    ],
    "version": 7,
    "updated_at": "2026-08-11T09:40:00Z"
  },
  "meta": { "request_id": "req_01K2..." }
}
```

### 10.2 편집 상태 전체 저장

`PUT /api/v1/projects/{project_id}/edit-state` — ❌ 미구현

```json
{
  "version": 7,
  "segments": [
    {
      "segment_id": "25e3c6ef-7a47-4e41-bc66-bdb16aceb053",
      "order": 0,
      "start": 33.0,
      "end": 41.2,
      "speed": 2.0,
      "muted": true,
      "deleted": false
    },
    {
      "segment_id": "ad020243-f6de-403c-83a0-27251002cbfd",
      "order": 1,
      "start": 80.1,
      "end": 91.4,
      "speed": 1.0,
      "muted": false,
      "deleted": true
    }
  ],
  "change_summary": "구간 순서 및 속도 변경"
}
```

검증:

- 모든 segment는 해당 프로젝트 분석 결과에 속해야 한다.
- `start/end`는 원본 영상 범위 안이어야 한다.
- 삭제되지 않은 segment의 `order`는 0부터 연속되어야 한다.
- 성공 시 프로젝트 `status`를 `editing`으로 변경한다.
- 편집 이력 revision을 하나 생성한다.

성공 응답은 저장된 편집 상태이며 `version=8`로 증가한다.

프론트는 드래그 이벤트마다 요청하지 않고 300~800ms debounce 후 전체 상태를 저장하거나, 드래그 종료 시 저장한다.

### 10.3 자연어 편집 명령

`POST /api/v1/projects/{project_id}/commands` — ⚠️ 프론트 규칙 엔진만 구현

현재 프론트가 지원하는 명령:

- 2배속/기본 속도
- 음소거
- 장면 삭제
- 장면으로 이동

목표 요청:

```json
{
  "command": "끓이는 장면 2배속하고 음소거해줘",
  "active_segment_id": "25e3c6ef-7a47-4e41-bc66-bdb16aceb053",
  "edit_state_version": 7,
  "apply": true
}
```

`apply=false`이면 해석 결과만 반환하고 상태를 변경하지 않는다.

성공:

```json
{
  "data": {
    "status": "success",
    "message": "‘끓이는 장면’을 2배속으로 변경하고 음소거했어요.",
    "operations": [
      {
        "type": "update_segment",
        "segment_id": "25e3c6ef-7a47-4e41-bc66-bdb16aceb053",
        "changes": {
          "speed": 2.0,
          "muted": true
        }
      }
    ],
    "edit_state": {
      "segments": [],
      "version": 8,
      "updated_at": "2026-08-11T09:42:00Z"
    }
  },
  "meta": { "request_id": "req_01K2..." }
}
```

해석 가능하지만 대상이 불명확할 때는 HTTP 오류가 아니라 도메인 결과를 반환한다.

```json
{
  "data": {
    "status": "needs_clarification",
    "message": "어느 장면을 변경할까요?",
    "candidates": [
      {
        "segment_id": "25e3c6ef-7a47-4e41-bc66-bdb16aceb053",
        "scenario": "냄비가 끓는 장면"
      }
    ],
    "operations": [],
    "edit_state": null
  },
  "meta": { "request_id": "req_01K2..." }
}
```

지원하지 않는 명령은 `status=unsupported`로 반환한다. 서버는 LLM이 생성한 임의 ffmpeg 필터나 셸 명령을 실행해서는 안 되며, 허용된 operation 타입으로 검증 후 적용해야 한다.

## 11. 작업 기록 API

편집기 헤더에 `작업 기록` 버튼이 있으나 클릭 동작과 백엔드가 모두 없다.

### 11.1 이력 목록

`GET /api/v1/projects/{project_id}/history?page=1&page_size=30` — ❌ 미구현

```json
{
  "data": [
    {
      "id": "68edb773-9cbc-42d2-b45c-b65f45b6200e",
      "version": 8,
      "summary": "‘끓이는 장면’을 2배속으로 변경",
      "source": "ai_command",
      "created_at": "2026-08-11T09:42:00Z",
      "created_by": {
        "id": "7dc6c0bb-78ca-4f44-8272-51c35f63d53f",
        "name": "홍길동"
      }
    }
  ],
  "meta": {
    "request_id": "req_01K2...",
    "page": 1,
    "page_size": 30,
    "total": 1,
    "total_pages": 1
  }
}
```

`source`: `manual`, `ai_command`, `restore`, `analysis`.

### 11.2 이전 revision 복원

`POST /api/v1/projects/{project_id}/history/{revision_id}/restore` — ❌ 미구현

```json
{
  "current_version": 8
}
```

과거 revision을 덮어쓰는 대신, 해당 내용을 복제한 새 revision을 생성한다. 성공 응답은 새 `edit_state`를 반환한다.

## 12. 내보내기 API

### 12.1 현재 구현

`POST /export` — ✅ 구현됨

현재 요청:

```json
{
  "video_path": "/tmp/tmp8s3d2.mp4",
  "segments": [
    {
      "start": 32.4,
      "end": 40.7,
      "speed": 2.0,
      "muted": false
    }
  ]
}
```

현재 성공 응답:

- HTTP `200`
- `Content-Type: video/mp4`
- `Content-Disposition: attachment; filename="clipcraft_export.mp4"`
- 응답 본문이 MP4 바이너리

현재 백엔드는 각 구간을 H.264/AAC로 인코딩하고 concat한 뒤 파일을 직접 반환한다. 프론트는 Blob으로 받아 다운로드한다.

현재 문제:

- 클라이언트가 서버 내부 `video_path`를 전달한다.
- 긴 영상에서 HTTP 요청이 오래 열려 타임아웃 위험이 있다.
- 내보내기 이력과 결과가 프로젝트에 저장되지 않는다.
- 생성된 `/tmp` 클립, 목록, 결과 파일에 정리 정책이 없다.
- 인증 및 프로젝트 소유권 검사가 없다.

### 12.2 목표 비동기 내보내기 시작

`POST /api/v1/projects/{project_id}/exports` — ✅ 핵심 인코딩 구현, ⚠️ 비동기 작업화 필요

```json
{
  "edit_state_version": 8,
  "format": "mp4",
  "video_codec": "h264",
  "audio_codec": "aac",
  "quality": "standard",
  "file_name": "주말_캠핑_하이라이트.mp4"
}
```

- 서버는 요청 버전의 edit state에서 구간, 순서, 속도, 음소거 값을 읽는다.
- 클라이언트가 `video_path`를 보내지 않는다.
- 삭제되지 않은 segment가 하나 이상이어야 한다.
- `quality`: 우선 `standard`만 지원해도 되며 향후 `high` 확장 가능

성공 `202 Accepted`:

```json
{
  "data": {
    "id": "93e84c59-0080-4338-9297-6941034853de",
    "project_id": "2ae45629-0cc8-4bb8-bce1-c83d303d3fcb",
    "status": "queued",
    "progress": 0,
    "file_name": "주말_캠핑_하이라이트.mp4",
    "created_at": "2026-08-11T09:50:00Z"
  },
  "meta": { "request_id": "req_01K2..." }
}
```

### 12.3 내보내기 상태

`GET /api/v1/exports/{export_id}` — ❌ 미구현

```json
{
  "data": {
    "id": "93e84c59-0080-4338-9297-6941034853de",
    "project_id": "2ae45629-0cc8-4bb8-bce1-c83d303d3fcb",
    "status": "success",
    "progress": 100,
    "output_duration_seconds": 124.6,
    "output_size_bytes": 48219302,
    "file_name": "주말_캠핑_하이라이트.mp4",
    "download_url": "/api/v1/exports/93e84c59-0080-4338-9297-6941034853de/download",
    "error": null,
    "created_at": "2026-08-11T09:50:00Z",
    "completed_at": "2026-08-11T09:51:20Z"
  },
  "meta": { "request_id": "req_01K2..." }
}
```

상태: `queued`, `running`, `success`, `error`, `cancelled`.

### 12.4 내보낸 파일 다운로드

`GET /api/v1/exports/{export_id}/download` — ⚠️ 현재 POST 응답으로만 구현

성공:

- `200 OK` 또는 객체 저장소 서명 URL로 `302 Found`
- `Content-Type: video/mp4`
- RFC 5987 방식으로 UTF-8 파일명을 포함한 `Content-Disposition`
- Range 요청을 지원하는 것을 권장

내보내기가 완료되지 않았으면 `409 EXPORT_NOT_READY`, 파일 보존 기간이 지났으면 `410 EXPORT_EXPIRED`.

## 13. API가 필요 없는 프론트 전용 기능

다음 기능은 현재 형태에서는 서버 구현 대상이 아니다.

| 기능 | 상태 | 설명 |
|---|---|---|
| 랜딩 섹션 이동 | 🖥️ 프론트 전용 | 앵커 스크롤 |
| 그리드/리스트 보기 전환 | 🖥️ 프론트 전용 | 사용자 환경 설정으로 저장하려면 별도 preference API 가능 |
| 업로드 전 썸네일 미리보기 | 🖥️ 프론트 전용 | 브라우저 object URL 사용 |
| 영상 재생/정지/탐색 | 🖥️ 프론트 전용 | HTML video 제어 |
| 전체 플레이어 음소거 | 🖥️ 프론트 전용 | 내보내기 구간 음소거와 별개 |
| 편집 구간 썸네일 임시 생성 | 🖥️ 프론트 전용 | 브라우저 canvas 캡처. 영구 썸네일은 서버/CDN 사용 가능 |
| AI 채팅 표시 및 기록 초기화 | 🖥️ 프론트 전용 | 현재 대화 UI만 초기화하며 편집 상태는 유지 |
| 테마 accent/density | 🖥️ 프론트 전용 | 계정 간 동기화가 필요할 때 preference API 추가 |

## 14. 저장소 모델 권장안

백엔드는 최소한 다음 엔터티를 영속 저장해야 한다.

| 엔터티 | 주요 필드 |
|---|---|
| `users` | id, name, email, password_hash, marketing_consent, timestamps |
| `refresh_tokens` | id, user_id, token_hash, expires_at, revoked_at |
| `projects` | id, user_id, title, format, status, starred, version, deleted_at, timestamps |
| `source_videos` | id, project_id, object_key, file_name, mime_type, size, duration, dimensions |
| `scenarios` | id, analysis_job_id, order, text_ko, expanded_query |
| `analysis_jobs` | id, project_id, source_video_id, status, progress, step, error, timestamps |
| `analysis_logs` | job_id, sequence, level, message, created_at |
| `highlight_segments` | id, job_id, scenario_id, score, start, end, clip_object_key, order |
| `waveforms` | job_id, duration, bar_count, amplitudes 또는 object_key |
| `edit_states` | project_id, version, updated_at |
| `edit_segments` | edit_state/revision_id, segment_id, order, start, end, speed, muted, deleted |
| `edit_revisions` | id, project_id, version, summary, source, user_id, snapshot, created_at |
| `export_jobs` | id, project_id, edit_version, status, progress, object_key, duration, size, error |

소유권 검사는 URL의 `project_id`만 신뢰하지 말고 모든 조회/수정에서 인증 사용자와 `projects.user_id`를 비교한다.

## 15. 백엔드 구현 완료 조건

### 15.1 인증

- 임의 이메일/비밀번호로 로그인되지 않는다.
- 토큰 만료와 갱신이 동작한다.
- 다른 사용자의 프로젝트를 조회할 수 없다.
- 비밀번호와 토큰 원문이 로그에 남지 않는다.

### 15.2 프로젝트

- 생성/수정/삭제/복제 후 새로고침해도 결과가 유지된다.
- 검색과 정렬이 서버 결과 기준으로 동작한다.
- 완료 프로젝트를 URL로 직접 열 수 있다.
- 삭제 실행 취소 정책이 일관되게 동작한다.

### 15.3 분석

- 업로드한 영상이 프로젝트와 영속적으로 연결된다.
- 서버 재시작 후에도 작업 상태 또는 최종 실패 상태를 조회할 수 있다.
- 진행률은 감소하지 않고 0~100 범위이다.
- 성공 결과에 segment ID, scenario ID, score, expanded query, waveform이 포함된다.
- 결과가 없는 시나리오도 누락하지 않고 `no_match` 상태 또는 빈 후보를 명시한다.
- 임시 파일과 파생 클립의 보존/삭제 정책이 적용된다.

### 15.4 편집

- 구간 시간, 순서, 삭제, 속도, 음소거가 프로젝트 단위로 저장된다.
- 편집 화면 새로고침 후 같은 상태가 복구된다.
- 동시 수정 시 조용히 덮어쓰지 않고 `VERSION_CONFLICT`를 반환한다.
- 자연어 명령은 허용된 operation으로만 상태를 변경한다.
- 작업 기록에서 이전 revision을 복원할 수 있다.

### 15.5 내보내기

- 서버 내부 파일 경로가 API 요청/응답에 노출되지 않는다.
- 편집 순서, start/end, speed, muted가 결과 영상에 반영된다.
- 오디오가 없는 영상과 음소거 구간도 정상 처리한다.
- 실패 원인을 구조화된 오류로 조회할 수 있다.
- 결과를 재다운로드할 수 있고 만료 정책이 명시된다.

## 16. 권장 구현 순서

1. 프로젝트/원본 영상 영속 모델 및 API
2. 기존 `/analyze/jobs`를 프로젝트 기반 비동기 API로 이전
3. 실제 job ID와 project ID로 프론트 라우팅 변경 및 새로고침 복구
4. 편집 상태 저장과 revision 이력
5. 기존 `/export`를 비동기 export job으로 이전
6. 인증 및 프로젝트 소유권 적용
7. 자연어 명령 서버화
8. 레거시 `/analyze`, `/analyze/jobs`, `/export` 제거

## 17. 현재 코드 기준 호환성 요약

현재 프론트가 즉시 호출할 수 있는 백엔드 API는 아래 두 흐름뿐이다.

1. `POST /analyze/jobs` → `GET /analyze/jobs/{job_id}` 반복 조회
2. `POST /export` → MP4 Blob 다운로드

인증, 프로젝트 목록/생성/수정/삭제/복제, 편집 상태 저장, 작업 기록은 백엔드 호출 없이 프론트 상태로만 동작한다. 따라서 실제 서비스 백엔드는 이 문서의 목표 API를 구현하고, 프론트는 메모리/localStorage 상태를 해당 API 호출로 교체해야 한다.
