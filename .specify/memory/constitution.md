<!--
Sync Impact Report
- Version change: 1.0.0 → 1.0.1
- Modified principles: none renamed/redefined — full document translated to
  Korean for readability; no principle, rule, or governance meaning changed
  - I. Technology Stack Consistency → I. 기술 스택 일관성
  - II. Test Coverage Discipline (NON-NEGOTIABLE) → II. 테스트 커버리지 원칙 (협상 불가)
  - III. Accessibility Compliance (NON-NEGOTIABLE) → III. 접근성 준수 (협상 불가)
  - IV. RESTful API Design → IV. RESTful API 설계
  - V. Unified Error Handling → V. 통일된 에러 처리
- Added sections: none
- Removed sections: none
- Templates requiring updates:
  - .specify/templates/plan-template.md ✅ 변경 불필요 (헌법 파일을 일반적으로 참조)
  - .specify/templates/spec-template.md ✅ 변경 불필요 (헌법 관련 플레이스홀더 없음)
  - .specify/templates/tasks-template.md ✅ 변경 불필요 (원칙별 작업 유형은 이미 일반화되어 있음)
  - .specify/templates/commands/*.md — 이 저장소에 존재하지 않음, 해당 없음
- Follow-up TODOs: none
-->

# claude-spec-kit 헌법

## 핵심 원칙

### I. 기술 스택 일관성
모든 애플리케이션 코드는 React와 `strict` 모드의 TypeScript로 작성하고,
Tailwind CSS 유틸리티 클래스로 스타일링해야 한다(MUST). 클래스 컴포넌트,
다른 UI 프레임워크, CSS-in-JS 라이브러리, 일반 CSS 파일은 계획 문서의
Complexity Tracking 섹션에 문서화된 예외가 없는 한 도입해서는 안 된다
(MUST NOT). TypeScript에서 `any`를 사용할 경우 불가피한 이유를 인라인
주석으로 명시해야 한다(MUST).
근거: 단일하고 일관된 기술 스택은 온보딩 비용을 줄이고, 번들 크기를
예측 가능하게 유지하며, 타입 체크·린트·Tailwind JIT 컴파일러 같은
도구가 일관성을 자동으로 강제할 수 있게 한다.

### II. 테스트 커버리지 원칙 (협상 불가)
자동화된 테스트 커버리지(문장, 분기, 함수, 라인)는 프로젝트의 테스트
러너 커버리지 리포트 기준으로 항상 80% 이상을 유지해야 한다(MUST).
이 기준 아래로 커버리지를 떨어뜨리는 풀 리퀘스트는 수정되기 전까지
병합해서는 안 된다(MUST NOT). 테스트는 해당 기능이나 수정과 동일한
변경 단위 내에서 추가되거나 갱신되어야 한다(MUST).
근거: 80%라는 하한선은 사소한 코드에 무리한 100% 커버리지를 강요하지
않으면서도 회귀를 조기에 잡아내어 코드베이스를 안전하게 리팩터링할 수
있게 한다.

### III. 접근성 준수 (협상 불가)
사용자에게 노출되는 모든 UI는 WCAG 2.1 Level AA를 준수해야 한다(MUST):
시맨틱 HTML, 완전한 키보드 탐색 가능성, 명확한 포커스 표시, 충분한
색상 대비, 올바른 ARIA 사용이 포함된다. 자동화된 접근성 검사는 CI에서
실행되어야 하며(MUST), 위반 사항은 병합을 차단해야 한다(MUST).
근거: 접근성은 선택적으로 추가하는 기능이 아니라 기본 요건이며, 나중에
보완하는 것보다 처음부터 반영하는 편이 훨씬 저렴하다.

### IV. RESTful API 설계
애플리케이션이 소비하거나 노출하는 모든 API는 REST 원칙을 따라야 한다
(MUST): 리소스 지향 URL, 올바른 HTTP 메서드(GET/POST/PUT/PATCH/DELETE)
및 상태 코드 사용, 무상태성, 버전이 관리되는 엔드포인트. 계획 문서의
Complexity Tracking 섹션에 문서화된 근거가 없는 한 임시방편의 RPC 방식
엔드포인트를 도입해서는 안 된다(MUST NOT).
근거: 일관된 REST 관례는 API를 예측 가능하고 캐시 가능하게 만들며,
어떤 클라이언트나 기여자도 쉽게 이해할 수 있게 한다.

### V. 통일된 에러 처리
API 호출, 폼 검증, 클라이언트 런타임 오류 등 모든 에러는 하나의 일관된
형태로 노출되어야 한다(MUST): API 측에서는 공통 `{ code, message,
details? }` 에러 객체, 클라이언트 측에서는 공통 에러 바운더리/토스트
패턴을 사용한다. 임시방편의 에러 형태나 조용히 무시되는 실패는
도입해서는 안 된다(MUST NOT).
근거: 단일한 에러 규약은 프런트엔드가 모든 실패 경로를 일반화된
방식으로 처리할 수 있게 하고, 앱 전반의 디버깅과 로깅을 일관되게
유지한다.

## 기술 스택 및 도구

- 프런트엔드: React(최신 안정 버전), 훅을 사용하는 함수형 컴포넌트만
  사용한다.
- 언어: 전체 코드베이스에서 `strict` 모드의 TypeScript를 사용한다.
- 스타일링: Tailwind CSS를 유일한 스타일링 수단으로 사용하며, 공유
  `tailwind.config`가 정의하는 디자인 토큰(색상, 여백, 타이포그래피)을
  모든 컴포넌트가 하드코딩 대신 재사용해야 한다(MUST).
- 테스트: 커버리지 리포팅이 가능한 테스트 러너(예: Vitest 또는 React
  Testing Library를 사용하는 Jest)를 CI에 연결하여 원칙 II를 강제한다.
- 접근성: `eslint-plugin-jsx-a11y`와 자동화된 감사 도구(예: axe-core)를
  CI에 통합하여 원칙 III을 강제한다.

## 개발 워크플로 및 품질 게이트

- 모든 풀 리퀘스트는 병합 전에 타입 체크, 린트(jsx-a11y 규칙 포함),
  자동화된 테스트 스위트, 80% 커버리지 게이트를 통과해야 한다(MUST).
- UI를 변경하는 모든 풀 리퀘스트는 설명에 간단한 접근성 점검(키보드
  탐색 및 스크린 리더 스모크 테스트)을 포함해야 한다(MUST).
- API 엔드포인트를 도입하거나 변경하는 모든 풀 리퀘스트는 PR 설명이나
  API 계약 문서에 리소스, HTTP 메서드, 에러 응답을 문서화해야 한다
  (MUST).
- 코드 리뷰는 승인 전에 모든 핵심 원칙 준수 여부를 확인해야 하며
  (MUST), 리뷰어는 후속 TODO를 조건으로 승인하는 대신 위반 사항이
  있으면 병합을 차단해야 한다(MUST).

## 거버넌스

이 헌법은 다른 모든 프로젝트 관례와 문서보다 우선한다. 이 문서와 다른
가이드(README, 코드 주석, 기존 관행) 사이에 충돌이 있으면 이 헌법을
우선하여 해결해야 한다(MUST).

개정 시 다음이 필요하다: (1) 변경에 대한 문서화된 근거, (2) 갱신된 Sync
Impact Report를 포함한 이 파일의 업데이트, (3) 종속 템플릿(plan, spec,
tasks)이 계속 정합성을 유지하는지 확인하는 전파 검토, (4) 아래 정책에
따른 명시적 버전 상향.

버저닝 정책: 이 헌법은 시맨틱 버저닝을 따른다. MAJOR는 하위 호환되지
않는 거버넌스나 원칙의 삭제/재정의를 동반한다. MINOR는 새로운 원칙
추가나 실질적으로 확장된 가이드를 동반한다. PATCH는 명확화 및 의미
변화 없는 문구 수정을 동반한다.

컴플라이언스 검토: 모든 풀 리퀘스트와 코드 리뷰는 위의 핵심 원칙 준수
여부를 확인해야 한다(MUST). 예외가 필요한 경우, 더 단순한 대안을
명시적으로 기각한 이유와 함께 해당 plan.md의 Complexity Tracking
섹션에 정당화되어야 한다(MUST).

**버전**: 1.0.1 | **제정일**: 2026-07-07 | **최종 개정일**: 2026-07-07
