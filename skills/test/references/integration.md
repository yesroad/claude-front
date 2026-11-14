# 통합 테스트

경계 하나를 건너는 테스트만 쓴다. 경계를 건너지 않으면(순수 함수) `unit.md`로 돌아간다.

- 필요한 것: `@testing-library/react` + `@testing-library/dom`, `@testing-library/user-event`, `msw`, `jsdom` 또는 `happy-dom`, `vitest.config.*`의 `environment`.
- 파일은 `<대상>.integration.test.tsx`를 같은 폴더에.
- 시나리오는 사용자 행동 → 네트워크 응답 → 화면 결과 순. 성공 1건, 실패 1건이 기본이고 기능당 1~2건이 상한이다.
- 네트워크는 MSW 핸들러로만. Provider(QueryClient, Router, Theme)는 테스트용 `renderWith*` 한 곳에 모은다.
- Server Action 은 모킹 대상이고 직접 테스트하지 않는다. Route Handler 등 서버 코드는 범위 밖.
