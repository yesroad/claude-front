---
name: test-integration
description: "FE 경계가 만나는 곳(컴포넌트 + 서비스/쿼리, 훅 + Provider, 폼 제출 흐름)의 통합 테스트를 Testing Library 와 MSW 로 시나리오 합의 후 작성하고 돌린다. '통합 테스트', '컴포넌트 테스트', 'MSW' 요청 시 사용. 순수 로직은 /test-unit, 브라우저 여정은 /test-e2e 가 담당. 서버 코드(Route Handler) 테스트는 범위 밖."
user-invocable: true
argument-hint: "[대상 컴포넌트 또는 흐름]"
allowed-tools: Read, Grep, Glob, Write, Bash
---

# Test Integration

경계 하나를 건너는 테스트만 쓴다 - 컴포넌트가 서비스를 부르고, 훅이 Provider 를 쓰고, 폼이 제출되는 지점. 시나리오를 먼저 합의한다.

## Workflow

1. 대상 확인. `$ARGUMENTS`를 읽는다. 없으면 `git status --porcelain`의 변경 파일에서 경계를 건너는 것을 고른다. 경계를 건너지 않으면(순수 함수) `/test-unit`으로 되돌리고 종료한다.
2. 환경 확인. `@testing-library/react`(+ `@testing-library/dom`), `@testing-library/user-event`, `msw`, `jsdom` 또는 `happy-dom` 설치 여부와 `vitest.config.*`의 `environment`를 본다. 없으면 설치할 패키지 목록을 보여주고 한 번 묻는다 - 임의로 설치하지 않는다.
3. 시나리오 도출. 사용자 행동 → 네트워크 응답 → 화면 결과 순으로 Given-When-Then 을 만들어 보여주고 합의를 받는다. 성공 1건, 실패(서버 에러 또는 검증 실패) 1건을 기본으로 한다. 합의 전에는 코드를 쓰지 않는다.
4. 작성. `<대상>.integration.test.tsx`를 같은 폴더에 쓴다. 네트워크는 MSW 핸들러로만 만든다 - 실제 호출 금지. Provider(QueryClient, Router, Theme)는 테스트용 `renderWith*` 한 곳에 모은다. 사용자 행동은 `userEvent`, 조회는 `getByRole`/`getByLabelText` 우선. 형식과 단언 규칙은 `.claude/rules/testing.md`가 자동 로드된다.
5. 실행. `vitest --run <파일>`. 실패하면 출력을 그대로 보여준다. 통과시키려고 구현을 바꾸지 않는다 - 2회 반복되면 멈추고 보고한다.
6. 마무리. 덮은 경계와 안 덮은 경계를 각각 한 줄로 알린다.

## 대상

- 컴포넌트 + 서비스/쿼리 - 로딩, 성공, 에러 상태가 화면에 드러나는가.
- 훅 + Provider - 캐시 무효화, 라우터 상태(URL 쿼리) 반영.
- 폼 제출 흐름 - 검증 실패 시 첫 에러 포커스와 요약, 성공 시 결과 표시. Server Action 은 모킹 대상이고 직접 테스트하지 않는다.

## 작업 원칙

- 한 기능당 1~2건 상한. 통합 테스트는 느리고 깨지기 쉬워 핵심 흐름만 덮는다.
- 구현 세부(상태 변수 이름, 호출 횟수)를 단언하지 않는다. 사용자가 보는 것만 단언한다.
- Route Handler, DB, 서버 전용 코드는 이 하네스의 범위 밖이다.
