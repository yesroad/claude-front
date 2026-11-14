# E2E 테스트

- `playwright.config.*`가 없으면 lock 파일로 정한 매니저의 초기화 명령(`pnpm create playwright`, `npm init playwright@latest`) 실행 여부를 먼저 묻는다. `webServer`와 `baseURL`을 확인한다.
- 여정 하나(목록 → 편집 → 저장)에 테스트 1~3건. 사용자가 보는 결과(완료 문구, URL 변화)로 끝낸다.
- 파일은 `e2e/<여정>.spec.ts`(또는 프로젝트의 기존 디렉터리).
- 외부 API 는 `page.route`로 모킹하고 자기 앱의 요청은 그대로 둔다. 인증은 `storageState`를 한 번 만들어 재사용한다.
- 실패하면 `--trace on`으로 원인을 한 줄로 요약한다.
- 페이지 객체는 두 번째 재사용부터 만든다.
