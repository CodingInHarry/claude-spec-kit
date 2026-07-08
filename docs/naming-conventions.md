# Taskify 네이밍 컨벤션

이 문서는 `backend/`와 `frontend/`에서 실제로 관찰되는 네이밍 관례를
정리한 것이다. `.specify/memory/constitution.md`의 MUST/MUST NOT
원칙과 충돌하는 내용은 없으며, 이 문서는 그 원칙을 코드 레벨
네이밍으로 구체화한 참고 자료다.

## 공통 (백엔드 + 프런트엔드)

| 대상 | 규칙 | 예시 |
|------|------|------|
| 컴포넌트 / 타입 / 인터페이스 / 클래스 | PascalCase | `TaskCard`, `KanbanBoard`, `UpdateTaskInput`, `ApiError` |
| 함수 / 변수 | camelCase | `updateTask`, `toTaskDto`, `broadcastToProject` |
| 고정 값 집합 상수 | SCREAMING_SNAKE_CASE | `TASK_STATUS_VALUES`, `ROLE_VALUES`, `STATUS_ORDER` |
| 타입 전용 임포트 | `import type { ... }` 로 값 임포트와 분리 | `import type { NextFunction, Request, Response } from "express"` |

## 백엔드 (`backend/`)

- **파일명**: 계층을 파일명에 반영한다.
  - 서비스: `xxxService.ts` (예: `taskService.ts`, `projectService.ts`)
  - 라우트: `routes/xxx.ts` (예: `routes/tasks.ts`, `routes/projects.ts`)
  - 상수: `models/constants.ts`
- **상대 임포트에 `.js` 확장자 명시**: TypeScript 소스여도 ESM 런타임
  해석 규칙을 따라 `.js`로 끝맺는다.
  ```ts
  import { prisma } from "../models/prisma.js";
  import { broadcastToProject } from "../../realtime/socket.js";
  ```
- **서비스 함수는 `export async function` 선언식** 사용(화살표 함수
  대입 아님). `taskService.ts`, `projectService.ts` 전반에서 일관.
- **DTO 변환 헬퍼는 `toXxxDto()` 이름 규칙**을 따르고, Prisma 모델 →
  API 응답 매핑을 한곳에 모은다.
- **에러 코드는 `{ENTITY}_{REASON}` 형태의 SCREAMING_SNAKE_CASE
  문자열**로 짓는다.
  - 예: `TASK_TITLE_REQUIRED`, `ASSIGNEE_NOT_PROJECT_MEMBER`,
    `INVALID_TASK_STATUS`, `MISSING_USER_ID`
- **`notFound` 계열 에러의 엔티티명은 소문자 단수형** 문자열로 넘기고
  헬퍼가 대문자화한다: `notFound("task", taskId)` →
  `TASK_NOT_FOUND`.

## 프런트엔드 (`frontend/`)

- **컴포넌트 파일명 = 컴포넌트명(PascalCase)**: `TaskCard.tsx`,
  `KanbanBoard.tsx`.
- **페이지 컴포넌트는 `Page` 접미사**: `ProjectListPage`,
  `ProjectBoardPage` (`pages/` 디렉터리).
- **Context는 `Context` 접미사**: `ActiveUserContext`.
- **Props 타입은 `XxxProps` 이름으로 컴포넌트 파일 상단에 선언**.
- **이벤트 핸들러 prop은 `onXxx`, 내부 핸들러 함수는 `handleXxx`**:
  - prop: `onMoveStatus`, `onReassign`
  - 내부 함수: `handleMoveStatus`, `handleReassign`
- **레이블/순서 상수는 `Record<T, string>` + 배열 쌍으로 정의**:
  `STATUS_LABELS`(레이블), `STATUS_ORDER`(정렬 순서) — `types.ts`에
  위치.
- **localStorage 키는 `"taskify.<도메인>"` 네임스페이스 문자열**:
  `"taskify.activeUserId"`.

## 테스트

- 테스트 파일명은 대상 파일명 + `.spec.ts`(백엔드) 또는
  `.test.tsx`(프런트엔드) 접미사를 따른다.
  - 예: `tests/contract/test_projects.spec.ts`,
    `tests/unit/TaskCard.test.tsx`
- 백엔드 계약/통합 테스트 파일명은 `test_` 접두사 + snake_case를
  쓴다(예: `test_kanban_flow.spec.ts`, `test_comment_realtime.spec.ts`).
