# 구현 계획: Taskify 팀 생산성 플랫폼

**브랜치**: `001-taskify-team-productivity` | **날짜**: 2026-07-07 | **명세**: [spec.md](./spec.md)

**입력**: `/specs/001-taskify-team-productivity/spec.md`의 기능 명세

**참고**: 이 템플릿은 `/speckit-plan` 명령이 채운다. 실행 워크플로는
`.specify/templates/plan-template.md`를 참고.

## 요약

사전 정의된 5명(PM 1, 엔지니어 4)이 로그인 없이 사용하는 팀 생산성
플랫폼 "Taskify"의 첫 테스트 버전을 구현한다. 사용자는 프로젝트를
생성하고 팀원을 추가하며, 칸반 보드에서 태스크를 만들고 드래그 앤
드롭으로 상태를 옮기고, 태스크에 댓글을 달아 실시간으로 협업한다.
프런트엔드는 React + TypeScript(strict) + Tailwind CSS(헌법 원칙 I)로
구축하고, 백엔드는 동일 언어(TypeScript, strict)의 REST API 서버로
구축하며, 실시간 갱신(태스크 이동, 댓글)은 REST API 위에 얹힌
WebSocket 브로드캐스트 채널로 보완한다. 인증은 없으며, 클라이언트가
5명 중 하나를 "활성 사용자"로 선택해 모든 요청에 사용자 식별자를
함께 전달한다.

## 기술 컨텍스트

**언어/버전**: TypeScript 5.x (Node.js 20 LTS 런타임, strict 모드)

**주요 의존성**: React 18, Tailwind CSS, Express, Prisma ORM, Socket.IO,
dnd-kit(드래그 앤 드롭)

**저장소**: SQLite (Prisma를 통해 접근) — 첫 테스트 버전에 적합한
파일 기반 DB이며, 스키마는 그대로 두고 이후 PostgreSQL 등으로
교체 가능

**테스트**: Vitest + React Testing Library(프런트엔드),
Vitest + Supertest(백엔드 계약/통합 테스트), 커버리지는 v8 provider로
측정

**대상 플랫폼**: 데스크톱 웹 브라우저(최신 Chrome/Edge/Firefox 기준)

**프로젝트 유형**: 웹 애플리케이션 (frontend + backend)

**성능 목표**: 태스크 이동/댓글 등록 사용자 조작에 대해 다른 뷰어에게
5초 이내 반영(SC-002, SC-004); 일반 API 응답은 체감상 즉각적(< 500ms)

**제약사항**: 로그인/인증 없음; 사전 정의된 5명의 사용자만 존재하며
런타임에 사용자를 추가/삭제할 수 없음; 오프라인 지원 불필요(사내
테스트 용도)

**규모/범위**: 동시 사용자 5명, 프로젝트 수십 개 규모, 첫 테스트 버전
기준 대규모 트래픽/확장성 요구 없음

## 헌법 검토(Constitution Check)

*게이트: Phase 0 리서치 전에 통과해야 하며, Phase 1 설계 후 재검토한다.*

| 원칙 | 평가 | 비고 |
|------|------|------|
| I. 기술 스택 일관성 | PASS | 프런트엔드는 React + TypeScript(strict) + Tailwind CSS. 백엔드도 TypeScript(strict)를 사용해 언어 일관성을 유지한다. `any` 사용 시 인라인 근거 주석 필수. |
| II. 테스트 커버리지 원칙 | PASS (조건부) | Vitest 커버리지 리포트를 CI에 연결해 80% 게이트를 강제한다. 각 태스크 구현 시 테스트를 동반 작성한다. |
| III. 접근성 준수 | PASS (조건부) | 칸반 보드는 드래그 앤 드롭 외에 키보드로도 태스크 상태를 변경할 수 있는 대체 조작(예: 컨텍스트 메뉴/단축키)을 제공해야 WCAG 2.1 AA를 만족한다. `eslint-plugin-jsx-a11y` + axe 자동 검사를 CI에 포함한다. |
| IV. RESTful API 설계 | PASS | 모든 데이터 변경(CRUD)은 REST 엔드포인트로 이루어진다. WebSocket은 REST 호출의 결과를 다른 클라이언트에게 알리는 보조 브로드캐스트 채널일 뿐, 자원 변경 자체를 대체하지 않는다. |
| V. 통일된 에러 처리 | PASS | 모든 API 에러는 공통 `{ code, message, details? }` 형식으로 응답하고, 프런트엔드는 공통 에러 바운더리 + 토스트로 표시한다. |

위반 사항 없음 — Complexity Tracking 불필요.

**Phase 1 설계 후 재검토**: `research.md`, `data-model.md`,
`contracts/api.md` 작성을 마친 뒤 위 표를 다시 검토한 결과, 새로 발견된
위반 사항은 없다. 특히 실시간 채널(Socket.IO)이 REST 엔드포인트를
대체하지 않고 알림 용도로만 쓰이도록 계약을 명시해 원칙 IV를 유지했고,
접근성을 위해 드래그 앤 드롭 외 키보드 대체 조작을 요구사항으로
남겨 원칙 III을 유지했다.

## 프로젝트 구조

### 문서 (이 기능)

```text
specs/001-taskify-team-productivity/
├── plan.md              # 이 파일 (/speckit-plan 명령 출력)
├── research.md          # Phase 0 산출물 (/speckit-plan 명령)
├── data-model.md        # Phase 1 산출물 (/speckit-plan 명령)
├── quickstart.md        # Phase 1 산출물 (/speckit-plan 명령)
├── contracts/           # Phase 1 산출물 (/speckit-plan 명령)
└── tasks.md             # Phase 2 산출물 (/speckit-tasks 명령 - /speckit-plan에서는 생성하지 않음)
```

### 소스 코드 (저장소 루트)

```text
backend/
├── src/
│   ├── models/          # Prisma 스키마 기반 타입, 도메인 모델
│   ├── services/        # 프로젝트/태스크/댓글 비즈니스 로직
│   ├── api/             # Express 라우트(REST 엔드포인트)
│   └── realtime/        # Socket.IO 서버, 이벤트 브로드캐스트
└── tests/
    ├── contract/        # 엔드포인트별 계약 테스트
    ├── integration/      # 서비스-DB 통합 테스트
    └── unit/

frontend/
├── src/
│   ├── components/      # 칸반 보드, 태스크 카드, 댓글 패널 등 UI 컴포넌트
│   ├── pages/           # 프로젝트 목록, 프로젝트 상세(보드) 화면
│   └── services/        # REST API 클라이언트, Socket.IO 클라이언트
└── tests/
    ├── integration/
    └── unit/
```

**구조 결정**: "frontend" + "backend"가 모두 필요한 웹 애플리케이션이므로
Option 2(웹 애플리케이션) 구조를 채택한다. 두 앱은 이 저장소 루트의
`frontend/`, `backend/` 디렉터리로 분리하고, 배포 시에도 독립적으로
빌드/실행할 수 있게 한다.

## Complexity Tracking

> 헌법 검토에서 정당화가 필요한 위반 사항이 있을 때만 작성

해당 없음 — 위반 사항 없음.
