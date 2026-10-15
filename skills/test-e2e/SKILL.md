---
name: test-e2e
description: "사용자 여정(목록 → 편집 → 저장) 단위의 E2E 테스트를 Playwright 로 시나리오 합의 후 작성하고 돌린다. 'e2e', 'E2E 테스트', 'playwright', '브라우저 테스트' 요청 시 사용. 순수 로직은 /test-unit, 컴포넌트 경계는 /test-integration 이 담당."
user-invocable: true
argument-hint: "[여정 이름]"
allowed-tools: Read, Grep, Glob, Write, Bash
---

# Test E2E

사용자가 실제로 밟는 여정만 테스트한다. 시나리오를 먼저 합의한다.

## Workflow

1. 환경 확인. `playwright.config.*`와 `@playwright/test` 유무를 본다. 없으면 `npm init playwright@latest` 실행 여부를 한 번 묻는다 - 임의로 설치하지 않는다. `webServer` 설정과 `baseURL`을 확인한다.
2. 여정 도출. `$ARGUMENTS`(여정 이름)에서 시작 화면 → 행동 → 기대 결과를 Given-When-Then 으로 만들어 보여주고 합의를 받는다. 여정 하나에 테스트 1~3건. 합의 전에는 코드를 쓰지 않는다.
3. 작성. `e2e/<여정>.spec.ts`(또는 프로젝트의 기존 디렉터리). 로케이터는 `getByRole`, `getByLabel`, `getByText` 우선, `data-testid`는 최후. 인증은 `storageState`를 한 번 만들어 재사용한다. 외부 API 는 `page.route`로 모킹하고 자기 앱의 요청은 그대로 둔다. 단언은 `expect(locator)` 자동 대기형만 - `waitForTimeout`을 쓰지 않는다.
4. 실행. `playwright test <파일>`. 실패하면 trace(`--trace on`)를 열어 원인을 한 줄로 요약해 보여준다. 통과시키려고 구현을 바꾸지 않는다 - 2회 반복되면 멈추고 보고한다.
5. 마무리. 덮은 여정과 안 덮은 여정을 각각 한 줄로 알린다.

## 작업 원칙

- 페이지 객체는 두 번째 재사용부터 만든다. 한 번 쓰는 여정에 추상화를 넣지 않는다.
- 여정은 사용자가 보는 결과로 끝낸다(저장 완료 문구, URL 변화). 네트워크 응답 내용을 직접 단언하지 않는다.
- 플래키 대응은 `retries`를 올리는 것이 아니라 로케이터와 대기 조건을 고치는 것이다.
- CI 설정과 병렬 샤딩은 요청이 있을 때만 다룬다.
