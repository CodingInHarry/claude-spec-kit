# 데이터 모델: Taskify 팀 생산성 플랫폼

`spec.md`의 핵심 엔터티와 기능 요구사항으로부터 도출한 데이터 모델이다.

## User (사용자)

사전 정의된 5개 계정 중 하나. 런타임에 생성/삭제되지 않으며, 서버 시작
시 시드 데이터로 고정 등록된다(FR-001).

| 필드 | 타입 | 설명 |
|------|------|------|
| id | string | 고유 식별자 (예: `u-pm`, `u-eng-1` ~ `u-eng-4`) |
| name | string | 표시 이름 |
| role | `"PM"` \| `"Engineer"` | 고정 역할, 수정 불가 |

**검증 규칙**: 정확히 5개의 레코드(PM 1, Engineer 4)만 존재. API를 통한
생성/삭제 엔드포인트 없음.

## Project (프로젝트)

이름과 설명이 있는 작업 공간(FR-002). 여러 User를 팀원으로 가진다.

| 필드 | 타입 | 설명 |
|------|------|------|
| id | string | 고유 식별자 |
| name | string | 프로젝트 이름 (필수, 공백 불가) |
| description | string | 프로젝트 설명 (선택) |
| memberIds | string[] | 팀원으로 추가된 User.id 목록(FR-003) |
| createdAt | datetime | 생성 시각 |

**관계**: Project 1 — N Task. Project N — N User(멤버십, 중간 테이블
`ProjectMember`로 표현).

**검증 규칙**: `name` 필수. `memberIds`는 존재하는 User.id만 허용.
멤버가 없어도 프로젝트 자체는 유효(엣지 케이스: 빈 보드 표시).

## Task (태스크)

하나의 Project에 속하는 작업 단위(FR-004~FR-007, FR-012).

| 필드 | 타입 | 설명 |
|------|------|------|
| id | string | 고유 식별자 |
| projectId | string | 소속 Project.id |
| title | string | 제목 (필수) |
| description | string | 설명 (선택) |
| status | `"todo"` \| `"in_progress"` \| `"done"` | 칸반 컬럼(기본값 `"todo"`) |
| assigneeId | string \| null | 담당 User.id, 없으면 `null`("미할당") |
| createdAt | datetime | 생성 시각 |
| updatedAt | datetime | 마지막 수정 시각(상태/담당자 변경 포함) |

**관계**: Task N — 1 Project. Task N — 1 User(담당자, nullable).
Task 1 — N Comment.

**검증 규칙**: `title` 필수. `assigneeId`가 있으면 **할당 또는
재할당 시점에** 반드시 해당 Project의 `memberIds`에 포함된 User여야
함(팀원이 아닌 사람에게는 새로 할당 불가). 단, 이후 해당 담당자가
프로젝트 팀원에서 제거되더라도 기존 할당은 소급하여 무효화되거나
자동으로 해제되지 않는다(엣지 케이스 참고 — 재할당은 프로젝트
멤버가 수동으로 수행한다). `status`는 세 값 중 하나만 허용.

**상태 전이**: 스토리 2(엣지 케이스 포함)에 따라 세 컬럼 사이에
제한 없는 자유 이동을 허용한다(워크플로 상 강제되는 순서 없음).
드래그 앤 드롭 저장 실패 시 클라이언트는 이전 `status`로 롤백한다.

## Comment (댓글)

하나의 Task에 달리는 텍스트 메모(FR-008, FR-009, FR-011).

| 필드 | 타입 | 설명 |
|------|------|------|
| id | string | 고유 식별자 |
| taskId | string | 소속 Task.id |
| authorId | string | 작성자 User.id |
| text | string | 댓글 내용 (필수, 공백만으로는 불가) |
| createdAt | datetime | 작성 시각 |

**관계**: Comment N — 1 Task. Comment N — 1 User(작성자).

**검증 규칙**: `text`는 트림 후 길이 1자 이상이어야 함(FR-011: 빈
댓글 제출 방지).

## 엔터티 관계 요약

```text
User ──< ProjectMember >── Project ──< Task >── Comment
                                          │
                                          └── assignee: User (nullable)
```
