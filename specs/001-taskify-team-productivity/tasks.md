---

description: "Taskify 팀 생산성 플랫폼 구현을 위한 작업 목록"
---

# 작업 목록: Taskify 팀 생산성 플랫폼

**입력**: `/specs/001-taskify-team-productivity/`의 설계 문서

**전제 조건**: plan.md(필수), spec.md(필수), research.md, data-model.md, contracts/, quickstart.md

**테스트**: 헌법 원칙 II(테스트 커버리지 80% 하한, 협상 불가)에 따라
이 프로젝트는 테스트 작업을 포함한다. 각 사용자 스토리마다 계약/통합
테스트를 구현 전에 작성한다.

**구성**: 작업은 사용자 스토리별로 그룹화되어 각 스토리를 독립적으로
구현하고 테스트할 수 있다.

> **변경 이력**: `/speckit-analyze` 결과(G1, U1)에 따라 T012(사용자
> 목록 조회 라우트)와 T038(태스크 재할당 UI)을 추가하고, 이후 작업
> ID를 재번호했다.

## 형식: `[ID] [P?] [Story] 설명`

- **[P]**: 병렬 실행 가능(서로 다른 파일, 의존성 없음)
- **[Story]**: 이 작업이 속한 사용자 스토리(US1, US2, US3)
- 설명에 정확한 파일 경로 포함

## 경로 규칙

- **웹 애플리케이션**: `backend/src/`, `backend/tests/`, `frontend/src/`, `frontend/tests/` (plan.md의 구조 결정 기준)

---

## Phase 1: Setup (공통 인프라)

**목적**: 프로젝트 초기화 및 기본 구조 준비

- [X] T001 plan.md의 구조에 따라 저장소 루트에 `backend/`, `frontend/` 디렉터리와 각 워크스페이스의 `package.json`, `tsconfig.json`(strict 모드) 생성
- [X] T002 [P] `backend/`에 Express, TypeScript, Prisma, Socket.IO 의존성 설치 및 기본 스크립트(`dev`, `build`, `test`) 구성
- [X] T003 [P] `frontend/`에 React, TypeScript, Tailwind CSS, @dnd-kit 의존성 설치 및 `tailwind.config.js` 기본 디자인 토큰 구성
- [X] T004 [P] `frontend/`에 ESLint + `eslint-plugin-jsx-a11y` 설정 파일 구성 (헌법 원칙 III)
- [X] T005 [P] `backend/vitest.config.ts`에 Vitest + v8 커버리지(80% 임계값) 구성 (헌법 원칙 II)
- [X] T006 [P] `frontend/vitest.config.ts`에 Vitest + React Testing Library + v8 커버리지(80% 임계값) 구성 (헌법 원칙 II)

---

## Phase 2: Foundational (차단 전제 조건)

**목적**: 모든 사용자 스토리 구현 전에 반드시 끝나야 하는 핵심 인프라

**⚠️ 중요**: 이 단계가 끝나기 전에는 어떤 사용자 스토리 작업도 시작할 수 없다

- [X] T007 data-model.md에 따라 User/Project/Task/Comment 스키마를 `backend/prisma/schema.prisma`에 정의
- [X] T008 `backend/prisma/schema.prisma` 기준 초기 마이그레이션 실행(SQLite 파일 DB 생성)
- [X] T009 사전 정의된 5명의 사용자(PM 1, Engineer 4)를 등록하는 시드 스크립트를 `backend/prisma/seed.ts`에 작성 (FR-001)
- [X] T010 [P] 공통 에러 응답 헬퍼(`{ code, message, details? }`)를 `backend/src/api/errors.ts`에 구현 (헌법 원칙 V)
- [X] T011 [P] Express 앱 부트스트랩과 `X-User-Id` 헤더 파싱 미들웨어를 `backend/src/api/app.ts`에 구현
- [X] T012 [P] 사용자 목록 조회 라우트(`GET /api/users`)를 `backend/src/api/routes/users.ts`에 구현 (FR-001, contracts/api.md)
- [X] T013 [P] Socket.IO 서버 초기화와 `project:{projectId}` room 입장 처리를 `backend/src/realtime/socket.ts`에 구현
- [X] T014 [P] 공통 에러 형식을 처리하는 REST API 클라이언트 래퍼를 `frontend/src/services/apiClient.ts`에 구현
- [X] T015 [P] Socket.IO 클라이언트 래퍼(room join, 이벤트 구독)를 `frontend/src/services/socketClient.ts`에 구현
- [X] T016 [P] `GET /api/users`를 호출해 로그인 없이 5명 중 활성 사용자를 선택하는 `UserPicker` 컴포넌트와 `ActiveUserContext`를 `frontend/src/components/UserPicker.tsx`, `frontend/src/context/ActiveUserContext.tsx`에 구현 (FR-001, T012·T014에 의존)
- [X] T017 [P] 공통 에러 바운더리와 토스트 컴포넌트를 `frontend/src/components/ErrorBoundary.tsx`, `frontend/src/components/Toast.tsx`에 구현 (헌법 원칙 V)

**체크포인트**: 기반 인프라 완료 — 이제 사용자 스토리 구현을 시작할 수 있다

---

## Phase 3: 사용자 스토리 1 - 프로젝트와 팀 구성 (우선순위: P1) 🎯 MVP

**목표**: PM이 프로젝트를 생성하고 팀원을 추가해 공유 작업 공간을 만든다

**독립적 테스트**: PM으로 프로젝트를 생성하고 엔지니어를 추가한 뒤, 해당 엔지니어 계정으로 전환했을 때 프로젝트가 보이는지 확인 (quickstart.md 시나리오 1)

### 사용자 스토리 1 테스트 ⚠️

> **참고: 테스트를 먼저 작성하고, 구현 전에 실패하는 것을 확인한다**

- [X] T018 [P] [US1] `GET/POST /api/projects` 계약 테스트를 `backend/tests/contract/test_projects.spec.ts`에 작성
- [X] T019 [P] [US1] `POST/DELETE /api/projects/{id}/members` 계약 테스트를 `backend/tests/contract/test_project_members.spec.ts`에 작성
- [X] T020 [P] [US1] PM이 프로젝트를 만들고 엔지니어를 추가하면 그 엔지니어에게 보이는지 검증하는 통합 테스트를 `backend/tests/integration/test_project_setup.spec.ts`에 작성

### 사용자 스토리 1 구현

- [X] T021 [P] [US1] Project 생성/조회/목록 서비스를 `backend/src/services/projectService.ts`에 구현 (FR-002)
- [X] T022 [US1] 프로젝트 팀원 추가/제거 로직(5명 사용자 중에서만 허용하는 검증 포함)을 `backend/src/services/projectService.ts`에 추가 (FR-003, T021에 의존)
- [X] T023 [US1] 프로젝트/멤버 REST 라우트를 `backend/src/api/routes/projects.ts`에 구현 (T021, T022에 의존)
- [X] T024 [P] [US1] 프로젝트 목록 조회 및 생성 화면을 `frontend/src/pages/ProjectListPage.tsx`에 구현
- [X] T025 [P] [US1] 팀원 추가/제거 UI를 `frontend/src/components/ProjectMembersPanel.tsx`에 구현
- [X] T026 [US1] `ProjectListPage`와 `ProjectMembersPanel`을 REST API 클라이언트와 연결하고 빈 보드 상태(팀원 없음)를 처리 (T024, T025, T014에 의존)
- [X] T027 [US1] `ProjectMembersPanel`, `ProjectListPage`에 대한 단위 테스트를 `frontend/tests/unit/ProjectMembersPanel.test.tsx`, `frontend/tests/unit/ProjectListPage.test.tsx`에 작성

**체크포인트**: 이 시점에서 사용자 스토리 1은 완전히 동작하며 독립적으로 테스트 가능해야 한다

---

## Phase 4: 사용자 스토리 2 - 칸반 보드에서 태스크 관리 (우선순위: P1)

**목표**: 팀원이 태스크를 생성·할당하고 드래그 앤 드롭으로 상태를 옮긴다

**독립적 테스트**: 태스크를 생성해 담당자를 지정하고, 다른 상태 컬럼으로 드래그한 뒤 새로고침해도 상태가 유지되는지 확인 (quickstart.md 시나리오 2)

### 사용자 스토리 2 테스트 ⚠️

- [X] T028 [P] [US2] `POST /api/projects/{id}/tasks`, `GET` 태스크 목록 계약 테스트를 `backend/tests/contract/test_tasks.spec.ts`에 작성
- [X] T029 [P] [US2] `PATCH /api/tasks/{id}`(상태/담당자 변경) 계약 테스트를 `backend/tests/contract/test_task_update.spec.ts`에 작성
- [X] T030 [P] [US2] 태스크 생성→할당→드래그 이동→다른 클라이언트로의 브로드캐스트를 검증하는 통합 테스트를 `backend/tests/integration/test_kanban_flow.spec.ts`에 작성

### 사용자 스토리 2 구현

- [X] T031 [P] [US2] Task 생성/프로젝트별 목록 조회/상태·담당자 갱신(팀원 검증 포함) 서비스를 `backend/src/services/taskService.ts`에 구현 (FR-004, FR-005, FR-007)
- [X] T032 [US2] 태스크 REST 라우트를 `backend/src/api/routes/tasks.ts`에 구현 (T031에 의존)
- [X] T033 [US2] 태스크 갱신 성공 시 `task:updated` Socket.IO 이벤트를 프로젝트 room에 브로드캐스트하도록 `backend/src/api/routes/tasks.ts`에 추가 (T032, T013에 의존)
- [X] T034 [P] [US2] 칸반 컬럼과 태스크 카드 목록을 표시하는 `KanbanBoard` 컴포넌트를 `frontend/src/components/KanbanBoard.tsx`에 구현
- [X] T035 [P] [US2] 담당자/상태를 표시하는 `TaskCard` 컴포넌트를 `frontend/src/components/TaskCard.tsx`에 구현 (FR-012)
- [X] T036 [US2] `@dnd-kit`으로 드래그 앤 드롭과 키보드로도 조작 가능한 대체 이동 컨트롤을 `frontend/src/components/KanbanBoard.tsx`에 구현 (헌법 원칙 III, T034·T035에 의존)
- [X] T037 [US2] `KanbanBoard`를 REST API 및 Socket.IO 클라이언트와 연결해 실시간 상태 동기화와 저장 실패 시 롤백을 `frontend/src/pages/ProjectBoardPage.tsx`에 구현 (FR-007, T036·T014·T015·T017에 의존)
- [X] T038 [US2] 이미 생성된 태스크의 담당자를 변경할 수 있는 재할당 드롭다운을 `frontend/src/components/TaskCard.tsx`(또는 `TaskDetailPanel.tsx`)에 구현하고 `PATCH /api/tasks/{id}`와 연결 (FR-005, T035·T014에 의존)
- [X] T039 [P] [US2] 태스크 생성 폼과 담당자 선택 드롭다운을 `frontend/src/components/TaskCreateForm.tsx`에 구현
- [X] T040 [US2] `KanbanBoard`의 드래그 로직, `TaskCard`(담당자 재할당 동작 포함)에 대한 단위 테스트를 `frontend/tests/unit/KanbanBoard.test.tsx`, `frontend/tests/unit/TaskCard.test.tsx`에 작성

**체크포인트**: 이 시점에서 사용자 스토리 1과 2가 모두 독립적으로 동작해야 한다

---

## Phase 5: 사용자 스토리 3 - 댓글을 통한 태스크 논의 (우선순위: P2)

**목표**: 팀원이 태스크에 댓글을 달고 실시간으로 서로의 댓글을 확인한다

**독립적 테스트**: 한 사용자가 댓글을 작성하면 같은 태스크를 보고 있는 다른 사용자에게 새로고침 없이 나타나는지 확인 (quickstart.md 시나리오 3)

### 사용자 스토리 3 테스트 ⚠️

- [X] T041 [P] [US3] `GET/POST /api/tasks/{id}/comments`(빈 텍스트 거부 포함) 계약 테스트를 `backend/tests/contract/test_comments.spec.ts`에 작성
- [X] T042 [P] [US3] 두 클라이언트 간 댓글 브로드캐스트를 검증하는 통합 테스트를 `backend/tests/integration/test_comment_realtime.spec.ts`에 작성

### 사용자 스토리 3 구현

- [X] T043 [P] [US3] 댓글 생성(공백만인 텍스트 거부 포함)/태스크별 목록 조회 서비스를 `backend/src/services/commentService.ts`에 구현 (FR-008, FR-011)
- [X] T044 [US3] 댓글 REST 라우트를 `backend/src/api/routes/comments.ts`에 구현 (T043에 의존)
- [X] T045 [US3] 댓글 등록 성공 시 `comment:created` Socket.IO 이벤트를 프로젝트 room에 브로드캐스트하도록 `backend/src/api/routes/comments.ts`에 추가 (T044, T013에 의존)
- [X] T046 [P] [US3] 댓글 목록과 등록 폼(빈 텍스트 클라이언트 측 검증 포함)을 `frontend/src/components/CommentList.tsx`, `frontend/src/components/CommentForm.tsx`에 구현
- [X] T047 [US3] 태스크 상세 패널을 댓글 REST API 및 Socket.IO 실시간 갱신과 연결해 `frontend/src/components/TaskDetailPanel.tsx`에 구현 (T046·T014·T015에 의존)
- [X] T048 [US3] `CommentForm` 검증 로직과 `CommentList` 렌더링에 대한 단위 테스트를 `frontend/tests/unit/CommentForm.test.tsx`, `frontend/tests/unit/CommentList.test.tsx`에 작성

**체크포인트**: 이제 모든 사용자 스토리가 독립적으로 동작해야 한다

---

## Phase N: 마무리 및 교차 관심사

**목적**: 여러 사용자 스토리에 걸친 개선 작업

- [X] T049 [P] quickstart.md의 시나리오 1~3을 수동으로 엔드투엔드 실행하고 결과를 기록
- [X] T050 [P] axe 기반 자동 접근성 감사를 주요 화면에 대해 실행하고 결과를 `frontend/tests/a11y/`에 기록 (헌법 원칙 III)
- [X] T051 [P] backend/frontend 커버리지 리포트가 80% 게이트를 충족하는지 확인하고, 미달 시 누락된 테스트를 보강 (헌법 원칙 II)
- [X] T052 루트 `README.md`에 실행 방법을 정리하고 `quickstart.md`를 링크
- [X] T053 구현 중 남은 TODO 정리 및 코드 정리

---

## 의존성 및 실행 순서

### 단계 의존성

- **Setup (Phase 1)**: 의존성 없음 — 즉시 시작 가능
- **Foundational (Phase 2)**: Setup 완료에 의존 — 모든 사용자 스토리를 차단함
- **사용자 스토리 (Phase 3+)**: 모두 Foundational 단계 완료에 의존
  - 이후 사용자 스토리는 병렬로 진행 가능(인력이 있다면)
  - 또는 우선순위 순서(P1 → P1 → P2)로 순차 진행
- **마무리 (최종 단계)**: 구현하기로 한 모든 사용자 스토리 완료에 의존

### 사용자 스토리 의존성

- **사용자 스토리 1 (P1)**: Foundational(Phase 2) 이후 시작 가능 — 다른 스토리에 의존하지 않음
- **사용자 스토리 2 (P1)**: Foundational(Phase 2) 이후 시작 가능 — US1이 만든 Project 데이터를 사용하지만, 독립적으로 테스트 가능하도록 자체 시드/픽스처를 둘 수 있음
- **사용자 스토리 3 (P2)**: Foundational(Phase 2) 이후 시작 가능 — US2가 만든 Task에 얹히지만, 독립적으로 테스트 가능해야 함

### 각 사용자 스토리 내부

- 테스트(포함된 경우)는 반드시 구현 전에 작성되고 실패해야 한다
- 모델 이전에 서비스 없음, 서비스 이전에 엔드포인트 없음(모델 → 서비스 → 엔드포인트 → 프런트엔드 연동)
- 통합 이전에 핵심 구현 완료
- 다음 우선순위로 넘어가기 전에 해당 스토리를 완료

### 병렬 실행 기회

- [P] 표시된 모든 Setup 작업은 병렬 실행 가능
- [P] 표시된 모든 Foundational 작업은 병렬 실행 가능(Phase 2 내에서)
- Foundational 단계가 끝나면, 팀 여력이 있다면 모든 사용자 스토리를 병렬로 시작 가능
- 각 스토리 내 [P] 표시된 테스트들은 병렬 실행 가능
- 각 스토리 내 [P] 표시된 모델/컴포넌트들은 병렬 실행 가능
- 서로 다른 사용자 스토리는 다른 팀원이 병렬로 작업 가능

---

## 병렬 실행 예시: 사용자 스토리 1

```bash
# 사용자 스토리 1의 테스트를 함께 실행:
Task: "GET/POST /api/projects 계약 테스트 in backend/tests/contract/test_projects.spec.ts"
Task: "POST/DELETE /api/projects/{id}/members 계약 테스트 in backend/tests/contract/test_project_members.spec.ts"
Task: "PM 프로젝트 생성 및 팀원 추가 통합 테스트 in backend/tests/integration/test_project_setup.spec.ts"

# 사용자 스토리 1의 구현을 함께 실행:
Task: "Project 서비스 in backend/src/services/projectService.ts"
Task: "ProjectListPage in frontend/src/pages/ProjectListPage.tsx"
Task: "ProjectMembersPanel in frontend/src/components/ProjectMembersPanel.tsx"
```

---

## 구현 전략

### MVP 우선 (사용자 스토리 1만)

1. Phase 1: Setup 완료
2. Phase 2: Foundational 완료 (필수 — 모든 스토리를 차단함)
3. Phase 3: 사용자 스토리 1 완료
4. **중단 후 검증**: 사용자 스토리 1을 독립적으로 테스트
5. 준비되면 배포/데모

### 점진적 제공

1. Setup + Foundational 완료 → 기반 준비 완료
2. 사용자 스토리 1 추가 → 독립적으로 테스트 → 배포/데모 (MVP!)
3. 사용자 스토리 2 추가 → 독립적으로 테스트 → 배포/데모
4. 사용자 스토리 3 추가 → 독립적으로 테스트 → 배포/데모
5. 각 스토리는 이전 스토리를 깨뜨리지 않고 가치를 더한다

### 병렬 팀 전략

여러 개발자가 있는 경우:

1. 팀 전체가 Setup + Foundational을 함께 완료
2. Foundational이 끝나면:
   - 개발자 A: 사용자 스토리 1
   - 개발자 B: 사용자 스토리 2
   - 개발자 C: 사용자 스토리 3
3. 각 스토리는 독립적으로 완료되고 통합된다

---

## 참고

- [P] 작업 = 서로 다른 파일, 의존성 없음
- [Story] 라벨은 작업을 특정 사용자 스토리로 추적할 수 있게 한다
- 각 사용자 스토리는 독립적으로 완료·테스트 가능해야 한다
- 구현 전에 테스트가 실패하는지 확인한다
- 각 작업 또는 논리적 그룹 단위로 커밋한다
- 어느 체크포인트에서든 멈춰서 스토리를 독립적으로 검증할 수 있다
- 피해야 할 것: 모호한 작업, 같은 파일에서의 충돌, 스토리 간 독립성을 깨는 교차 의존성
