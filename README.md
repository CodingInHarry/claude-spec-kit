# Taskify

로그인 없이 사전 정의된 5명(PM 1명, 엔지니어 4명)이 사용하는 팀 생산성
플랫폼의 첫 테스트 버전입니다. 프로젝트 생성, 팀원 관리, 칸반 보드
드래그 앤 드롭, 실시간 댓글을 지원합니다.

기능 명세와 설계 문서는 `specs/001-taskify-team-productivity/`를
참고하세요 (`spec.md`, `plan.md`, `data-model.md`, `contracts/api.md`).

## 기술 스택

- **백엔드**: Node.js, TypeScript(strict), Express, Prisma(SQLite), Socket.IO
- **프런트엔드**: React, TypeScript(strict), Tailwind CSS, @dnd-kit, Vite
- **테스트**: Vitest (+ Supertest, React Testing Library, axe-core)

## 실행 방법

### 1. 백엔드

```bash
cd backend
npm install
npx prisma migrate dev   # 최초 1회: SQLite 스키마 생성
npm run seed              # 사전 정의된 5명의 사용자 등록
npm run dev                # http://localhost:3001
```

### 2. 프런트엔드

```bash
cd frontend
npm install
npm run dev                # http://localhost:5173 (백엔드로 /api, /socket.io 프록시)
```

브라우저에서 `http://localhost:5173`을 열고 5명의 사용자 중 하나를
선택하면 로그인 없이 바로 사용할 수 있습니다.

## 테스트

```bash
# 백엔드
cd backend
npm test                 # 전체 테스트
npm run test:coverage    # 커버리지 리포트 (80% 게이트)

# 프런트엔드
cd frontend
npm test                 # 단위 테스트
npm run test:coverage    # 커버리지 리포트 (80% 게이트)
npm run test:a11y        # axe-core 기반 자동 접근성 감사
```

더 자세한 시나리오별 검증 절차는
[`specs/001-taskify-team-productivity/quickstart.md`](specs/001-taskify-team-productivity/quickstart.md)를
참고하세요.

## 프로젝트 구조

```text
backend/    Express REST API + Socket.IO + Prisma(SQLite)
frontend/   React + TypeScript + Tailwind CSS 클라이언트
specs/      spec-kit 기능 명세, 계획, 작업 목록
.specify/   spec-kit 헌법, 템플릿, 스크립트
```

프로젝트 전반의 개발 원칙(기술 스택, 테스트 커버리지, 접근성, REST API
설계, 에러 처리)은 [`.specify/memory/constitution.md`](.specify/memory/constitution.md)에
정의되어 있습니다.

코드 레벨 네이밍 규칙(파일명, 함수/변수, 에러 코드, 컴포넌트 등)은
[`docs/naming-conventions.md`](docs/naming-conventions.md)를 참고하세요.
