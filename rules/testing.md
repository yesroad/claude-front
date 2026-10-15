---
paths:
  - "**/*.{test,spec}.{ts,tsx}"
  - "**/vitest.config.*"
  - "**/playwright.config.*"
---
# 테스트 - 파일 형식과 단언 규칙 (Vitest 5, Testing Library 16, MSW 3, Playwright 1.64)

- `it` 이름은 한국어 문장으로 쓰고 본문은 `// Given`, `// When`, `// Then` 주석으로 나눈다 - 실패 목록만 읽어도 무엇이 어떤 조건에서 깨졌는지 보여야 한다.
- 관찰 가능한 결과만 단언한다: 에러 코드, DOM, 반환값. 내부 변수, 호출 횟수, 메시지 문구는 단언하지 않는다 - 문구를 다듬을 때마다 깨지면 안 된다.
- 픽스처는 실제 타입과 스키마를 import 해서 만든다. 테스트 전용 복제 타입을 두지 않는다 - 복제는 실제와 어긋나는 순간 거짓말을 한다.
- 공유 상태(모듈 변수, 스토어, MSW 런타임 핸들러)는 각 테스트 전에 초기화한다 - `clearMocks`는 호출 기록만 지우고 구현과 모듈 상태는 남는다.
- 테스트를 통과시키려고 구현을 바꾸지 않는다. 2회 고쳐도 실패하면 멈추고 보고한다 - 실패가 가리키는 쪽이 구현인지 테스트인지는 사람이 정한다.
- 커버리지 숫자를 목표로 삼지 않는다 - 숫자를 채우려는 테스트는 아무것도 지키지 않는다.
- 네트워크는 MSW 핸들러로만 받는다. `server.listen({ onUnhandledFrame: 'error' })`로 핸들러 없는 요청은 실패시킨다 - 실제 호출이 섞이면 바깥 서버 상태가 결과를 정한다.
- Playwright 로케이터는 `getByRole`, `getByLabel`을 먼저 쓰고 `data-testid`는 최후에 쓴다. 인증은 setup 프로젝트가 `playwright/.auth/`에 저장한 `storageState`를 재사용한다 - 역할과 라벨은 사용자가 보는 것이고, 로그인을 매 테스트 반복하면 느리고 바깥 요인에 깨진다.
- `resolves`, `rejects`, `toMatchFileSnapshot` 단언은 `await` 한다 - Vitest 5 부터 `await` 없는 비동기 단언은 경고가 아니라 테스트 실패다.

## 틀리기 쉬운 것 (2026-10 기준)

- `beforeEach(() => vi.clearAllMocks())`, `describe`나 함수 안에서 부르는 `vi.mock` → Vitest 5: `clearMocks` 기본 true 라 호출 기록은 매 테스트 전에 지워진다(유지하려면 `clearMocks: false`). `vi.mock`, `vi.unmock`, `vi.hoisted`는 최상위 밖이면 경고가 아니라 에러 - 동적 모킹은 `vi.doMock`.
- `vitest.workspace.ts`, 하위 폴더에서 `vitest`를 실행하며 상위 config 를 기대, `test.sequential` → 프로젝트 분리는 `vitest.config.ts`의 `test.projects`(Vitest 4 에서 workspace 파일 제거). Vitest 5 는 상위 디렉터리 config 를 찾지 않으니 `--config`를 준다. `sequential`은 제거 - `{ concurrent: false }`. Vite >=6.4, Node >=22.12.
- 브라우저 모드에서 `@vitest/browser` + `provider: 'playwright'` 문자열, `expect.element().toHaveTextContent('부분 문자열')`이나 정규식 → 브라우저 모드 `expect.element()` 한정. 프로바이더는 `@vitest/browser-playwright`의 `playwright()` 객체(Vitest 4). `toHaveTextContent`는 완전 일치만이라 부분/정규식은 `toMatchTextContent`, `getByText`도 `locators.exact` 기본(Vitest 5). 스크린샷 비교는 `toMatchScreenshot`.
- `import { http, HttpResponse, graphql, delay } from 'msw'`, `graphql.query('GetUser', ...)` → MSW 3: 진입점이 `msw/http`, `msw/graphql`, `msw/utils/delay`로 나뉘었다. GraphQL 은 `graphql.link(url)`을 만든 뒤 `.query()`. ESM-only, Node 22+, TS 5.9+.
- `server.listen({ onUnhandledRequest: 'error' })`, `worker.stop()`을 await 없이 호출, fake timers 아래의 `delay()` → MSW 3: `onUnhandledFrame: 'error'`(HTTP 요청과 WebSocket 연결을 함께 가리킨다). `await worker.stop()`. `setTimeout` 패치가 사라져 fake timers 아래에서 `delay()`는 가짜 시간을 따른다.
- `@testing-library/react`만 설치 → 16.0 부터 `@testing-library/dom`이 peer 라 `@testing-library/dom@^10`을 함께 설치한다. 타입 검사에는 `@types/react-dom`도 필요하다.
- e2e 시나리오와 에이전트 지시문을 처음부터 손으로 쓴다 → Playwright 1.56+: `npx playwright init-agents --loop=claude`가 planner, generator, healer 정의를 만들고, Playwright 를 올릴 때마다 다시 생성한다. 1.64: `page.webmcp`로 페이지가 등록한 WebMCP 도구를 테스트한다.

출처: vitest.dev/guide/migration, vitest.dev/blog/vitest-5, vitest.dev/blog/vitest-4, mswjs.io/docs/migrations/2.x-to-3.x, github.com/testing-library/react-testing-library/releases/tag/v16.0.0, playwright.dev/docs/locators, playwright.dev/docs/auth
