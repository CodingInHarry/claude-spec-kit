# API 계약: Taskify 팀 생산성 플랫폼

모든 엔드포인트는 REST 원칙(헌법 원칙 IV)을 따른다: 리소스 지향 URL,
표준 HTTP 메서드/상태 코드, 무상태성. 모든 요청에는 활성 사용자를
나타내는 `X-User-Id` 헤더가 필요하다(로그인 없음, 리서치 §4 참고).

## 공통 에러 형식 (헌법 원칙 V)

모든 4xx/5xx 응답은 다음 형식을 따른다:

```json
{
  "code": "TASK_NOT_FOUND",
  "message": "해당 태스크를 찾을 수 없습니다.",
  "details": { "taskId": "t-123" }
}
```

## 사용자

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/users` | 사전 정의된 5명의 사용자 목록 조회 (FR-001) |

## 프로젝트

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/projects` | 프로젝트 목록 조회 |
| POST | `/api/projects` | 새 프로젝트 생성 (FR-002). Body: `{ name, description? }` |
| GET | `/api/projects/{projectId}` | 프로젝트 상세(멤버, 태스크 요약 포함) 조회 |
| POST | `/api/projects/{projectId}/members` | 팀원 추가 (FR-003). Body: `{ userId }` |
| DELETE | `/api/projects/{projectId}/members/{userId}` | 팀원 제거 (FR-003) |

## 태스크

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/projects/{projectId}/tasks` | 프로젝트의 태스크(칸반 보드 데이터) 조회 |
| POST | `/api/projects/{projectId}/tasks` | 태스크 생성 (FR-004). Body: `{ title, description? }` |
| PATCH | `/api/tasks/{taskId}` | 태스크 수정: 상태 이동(FR-007), 담당자 재할당(FR-005) 등. Body 중 필요한 필드만: `{ status?, assigneeId?, title?, description? }` |

## 댓글

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/tasks/{taskId}/comments` | 태스크의 댓글 목록 조회 |
| POST | `/api/tasks/{taskId}/comments` | 댓글 등록 (FR-008, FR-011). Body: `{ text }` (빈 문자열이면 422) |

## 실시간 이벤트 (Socket.IO, REST 보조 채널)

클라이언트는 프로젝트 상세 화면 진입 시 `project:{projectId}` room에
join한다.

| 이벤트 | 방향 | 페이로드 | 설명 |
|--------|------|----------|------|
| `task:updated` | 서버 → 클라이언트 | 갱신된 Task 객체 | `PATCH /api/tasks/{id}` 성공 후 같은 room에 브로드캐스트 (FR-007, FR-009) |
| `comment:created` | 서버 → 클라이언트 | 새 Comment 객체 | `POST /api/tasks/{taskId}/comments` 성공 후, 해당 태스크가 속한 프로젝트 room에 브로드캐스트 (FR-009) |

이 이벤트들은 통지(notification) 목적일 뿐이며, 자원의 실제 변경은
항상 위의 REST 엔드포인트를 통해서만 이루어진다.
