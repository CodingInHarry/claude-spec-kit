# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

Taskify: 로그인 없이 사용하는 팀 생산성 앱(PM 1명 + 엔지니어 4명, 5명의
고정 시드 사용자)으로, 프로젝트, 드래그 앤 드롭 칸반 보드, 실시간
댓글을 제공한다. 서로 독립된 두 개의 npm 워크스페이스로 구성되며,
각각 별도의 `package.json`/`node_modules`를 가진다(루트가 npm/yarn
workspace는 아님):

- `backend/` — Express + TypeScript(strict) + Prisma/SQLite + Socket.IO
- `frontend/` — React + TypeScript(strict) + Tailwind CSS + @dnd-kit + Vite

기능 명세, 계획, 데이터 모델, API 계약, 작업 목록의 정본은
`specs/001-taskify-team-productivity/`에 있다. 프로젝트 거버넌스(강제된
기술 스택, 80% 커버리지 하한, WCAG 2.1 AA, REST 관례, 통일된 에러
형식)는 `.specify/memory/constitution.md`에 있으며, 코드를 변경할 때
그 안의 MUST/MUST NOT 규칙을 구속력 있는 것으로 취급할 것. **이
저장소의 모든 spec-kit 아티팩트(헌법, 명세, 계획, 작업 목록,
체크리스트)는 한글로 작성되어 있다** — 재생성하거나 수정할 때도 이
관례를 따를 것.

이 저장소는 GitHub spec-kit 슬래시 명령(`/speckit.constitution`,
`/speckit.specify`, `/speckit.plan`, `/speckit.tasks`,
`/speckit.analyze`, `/speckit.implement`)으로 진행되며, 해당
아티팩트들의 템플릿은 `.specify/templates/`에 있다.

## 커맨드

각각 `backend/` 또는 `frontend/` 내부에서 실행한다 — 루트 레벨의
install/build/test 명령은 없다.

### 백엔드 (`backend/`)

```bash
npm install
npx prisma migrate dev        # 최초 1회: dev.db + 클라이언트 생성
npm run seed                  # 5명의 고정 사용자 (재)시드
npm run dev                   # tsx watch, http://localhost:3001
npm run build && npm start    # 컴파일 후 실행
npm test                      # vitest run (전체 계약 + 통합 테스트)
npx vitest run tests/contract/test_projects.spec.ts   # 단일 파일
npm run test:coverage         # v8 커버리지, 80% 게이트 (헌법)
npm run lint
```

### 프런트엔드 (`frontend/`)

```bash
npm install
npm run dev                   # vite, http://localhost:5173, /api·/socket.io를 :3001로 프록시
npm run build                 # tsc -b && vite build
npm test                      # vitest run, tests/unit/**만 대상
npx vitest run tests/unit/TaskCard.test.tsx           # 단일 파일
npm run test:coverage         # v8 커버리지, 80% 게이트 (헌법)
npm run test:a11y             # axe-core 감사, tests/a11y/** (별도 설정, `npm test`에는 포함 안 됨)
npm run lint
```

앱이 엔드투엔드로 동작하려면 두 dev 서버가 모두 실행 중이어야 한다(백엔드
먼저). 모든 화면이 `/api`를 호출하므로 프런트엔드만 단독으로 실행하는
것은 의미 있는 모드가 아니다.

## 아키텍처

### 백엔드 요청 흐름

`src/index.ts`가 HTTP 서버를 생성하고, `initSocketServer`와
`src/api/app.ts`의 Express 앱을 연결한다. 계층 구조가 엄격하게
분리되어 있다:

- `api/routes/*.ts` — 얇은 Express 핸들러만 담당(body/params 파싱,
  서비스 함수 하나 호출, 응답 형태 구성).
- `services/*.ts` — 모든 비즈니스 로직과 검증(예: `taskService.updateTask`는
  저장 전에 새 담당자가 프로젝트 팀원인지 확인한다).
- `models/prisma.ts` — 공유 `PrismaClient` 싱글턴.
- `models/constants.ts` — `ROLE_VALUES` / `TASK_STATUS_VALUES`. SQLite는
  Prisma의 네이티브 enum을 지원하지 않으므로, `User.role`과
  `Task.status`는 평범한 `String` 컬럼이며 DB 스키마가 아니라 서비스
  계층에서 이 상수들을 기준으로 검증된다.

**인증은 없다.** `api/app.ts`의 `requireActiveUser` 미들웨어는 모든
`/api/*` 호출에 `X-User-Id` 헤더가 있는지만 확인해 `req.activeUserId`에
저장할 뿐, 그 사용자가 실제로 존재하는지는 검증하지 않는다. 에러는
`api/errors.ts`의 `ApiError` / `errorHandler`로 통일되어 헌법에 따라
항상 `{ code, message, details? }` 형태로 응답한다 — 라우트에서 원시
`Error`를 던지는 대신 이 패턴을 확장해서 사용할 것.

프로젝트 범위의 태스크 엔드포인트(`GET/POST /api/projects/:id/tasks`)는
`routes/tasks.ts`가 아니라 `routes/projects.ts`에 있다(`routes/tasks.ts`에는
`GET/PATCH /api/tasks/:id`만 있음) — 엔드포인트를 추가할 때는
`contracts/api.md`를 기준으로 삼을 것. 이 저장소의 REST 리소스 중첩은
엔터티당 라우터 하나 방식을 따르지 않는다.

### 실시간 계층

`realtime/socket.ts`는 모듈 레벨의 Socket.IO 서버 인스턴스를 가진다.
클라이언트는 `project:{id}` room에 들어가기 위해
`emit("project:join", projectId)`를 호출한다. REST 변경이 성공하면
해당 라우트가 그 room에 `task:updated` / `comment:created`를
브로드캐스트한다(`broadcastToProject`). 소켓은 **알림 전용** 채널이다 —
실제 상태 변경 내용을 실어 나르지 않고, REST 호출이 이미 저장한 내용을
다른 클라이언트가 다시 가져가도록 알릴 뿐이다. 새로운 실시간 기능을
추가할 때도 변경 가능한 상태를 소켓으로 직접 보내지 말고 이 패턴을
유지할 것.

### 프런트엔드 구조

라우터 라이브러리를 쓰지 않는다 — `App.tsx`가 수동으로 상태 기반
내비게이션을 처리한다(`selectedProjectId`가 `ProjectListPage`와
`ProjectBoardPage`를 전환). `ActiveUserContext`는 "비밀번호 없이 5명 중
한 명을 선택"하는 플로우를 구현하며, 선택 값을
`localStorage["taskify.activeUserId"]`에 저장한다.

`services/apiClient.ts`는 `ActiveUserContext`가 동기화하는 모듈 레벨
변수에서 `X-User-Id`를 가져와 붙이는 얇은 `fetch` 래퍼다. **알려진
이슈**: 이 동기화가 `useEffect`에서 일어나는데, React는 부모보다 자식
이펙트를 먼저 실행하므로 사용자를 선택한 직후의 첫 요청(또는
localStorage에 남아있던 사용자로 새로고침했을 때)이 헤더 없이 먼저
나가 레이스 컨디션이 발생할 수 있고, 이는 "불러오지 못했습니다" 라는
가짜 에러 토스트로 나타난다. 사용자 식별 관련 배선을 건드릴 때는,
현재의 이펙트 기반 동기화 대신 호출 시점에 `localStorage`에서 직접
동기적으로 읽는 방식을 우선 고려할 것.

`KanbanBoard`/`TaskCard`는 드래그 앤 드롭에 `@dnd-kit`을 사용하지만,
헌법의 접근성 원칙에 따라 모든 드래그 동작에는 `TaskCard`의 키보드로
조작 가능한 `<select>` 대체 수단(상태, 담당자)이 함께 있다 — 보드를
리팩터링할 때 이 대체 수단을 제거하지 말 것.

### 테스트 관례

백엔드 테스트들은 하나의 SQLite 파일을 공유하므로,
`backend/vitest.config.ts`는 `fileParallelism: false`와
`globalSetup`(`tests/globalSetup.ts`)을 설정한다. 이 globalSetup은
`DATABASE_URL`을 별도의 `tests/test.db`로 지정하고 실행 전에
`prisma db push`를 수행한다. 각 테스트 파일은 `beforeEach`에서
`tests/helpers.ts`의 `resetDatabase()`를 호출해 테이블을 비우고 5명의
고정 사용자를 다시 삽입한다. Socket.IO가 필요한 통합 테스트
(`tests/integration/test_kanban_flow.spec.ts`,
`test_comment_realtime.spec.ts`)는 소켓을 모킹하는 대신 실제
`http.Server` + `socket.io-client`를 띄운다.

프런트엔드는 vitest 설정이 세 갈래로 나뉘어 있다: 기본 설정
(`vitest.config.ts`, `tests/unit/**` 대상, 커버리지 게이트 적용,
`npm test`가 실행하는 것), 그리고 `vitest.a11y.config.ts`
(`tests/a11y/**` 대상, `npm run test:a11y`로만 실행되며 커버리지
게이트에는 포함되지 않음). 양쪽의 커버리지 설정 모두 부트스트랩 전용
파일(`src/index.ts`, `prisma/seed.ts`, `src/main.tsx`)은 분기 로직이
없어 게이트 대상에서 제외한다.
