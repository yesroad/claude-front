---
paths:
  - "**/forms/**"
  - "**/*.form.{ts,tsx}"
---
# React Hook Form - 폼 상태, 검증, 제출, 미저장 이탈 (RHF 7.x, resolvers 5.x, Zod 4 전제)

- 폼 상태는 `useForm` 한 곳에 둔다. 필드 컴포넌트는 `register`나 `Controller`의 `field`로 값과 핸들러만 받고 자체 `useState`를 갖지 않는다 - `useForm` 밖의 상태는 `isDirty`, `reset()`, `setFocus`가 모른다.
- `mode: 'onTouched'`, `reValidateMode: 'onChange'`를 기본으로 한다. 첫 blur 전에는 에러를 띄우지 않고, 한 번 틀린 필드는 고치는 즉시 풀어준다 - 기본값 `onSubmit`은 저장 전까지 아무 말이 없고, `onChange`는 첫 글자에 필수 에러를 띄우고, `onBlur`는 고쳐도 다음 blur 까지 에러가 남는다.
- 저장 버튼을 `isValid`나 에러 유무로 비활성화하지 않고, 저장 시 첫 에러 필드로 포커스가 간다. `shouldFocusError`를 끄지 않고, `Controller`는 `field.ref`를 실제 입력에 넘기며 커스텀 입력은 `ref`를 prop 으로 받아 전달한다. `register` 순서는 화면 순서와 맞춘다 - 포커스는 `register` 순서로 ref 를 부르므로 ref 가 입력에 닿지 않으면 `setFocus`도 자동 포커스도 동작하지 않는다.
- `isDirty`로 미저장 이탈을 두 경로 모두 막는다. 화면 안 이동은 blocker(React Router `useBlocker`, Next `Link`의 `onNavigate`), 새로고침과 탭 닫기는 `beforeunload`. `defaultValues`는 전 필드를 채운다 - `isDirty`는 `defaultValues`와의 비교라 기준값이 비면 판정이 틀어진다.
- 이 룰이 로드됐다고 RHF 가 정해진 것은 아니다. 채택은 `decisions.md`에 적힌 뒤 한다 - 네이티브 `<form action>`과 `useActionState`로 끝나는 폼인지가 판단 대상이다.
- Server Action 과 함께 쓸 때 RHF 는 클라이언트 검증과 상태, 제출은 action 이 맡는다. `const onSubmit = handleSubmit(d => startTransition(() => formAction(d)))`를 선언해 `<form onSubmit={onSubmit}>`에 넘기고 `<form action>`은 RHF 폼에 쓰지 않는다. 서버 필드 에러는 `setError`로 올리고 대기 표시는 `isSubmitting`이 아니라 `isPending`을 본다 - action 이 성공하면 React 가 비제어 필드를 리셋해 RHF 상태와 어긋나고, dispatch 를 transition 밖에서 부르면 `isPending`이 안 맞고 dev 에러가 난다.

## 틀리기 쉬운 것 (2026-10 기준)

- Zod 4 스키마는 `zodResolver`가 못 받는다, 또는 `zod/v4`로 import 해야 한다 → `@hookform/resolvers` 5.1.0 부터 Zod 3, 4, mini 를 `_zod` 유무로 자동 판별한다(peer `zod ^3.25.0 || ^4.0.0`, Zod 4.3 타입 오버로드는 5.4.2 에서 수정). Zod 4.x 에서는 `import { z } from 'zod'`로 충분하고 `zod/v4`는 3.25.x 에서 v4 를 쓸 때 필요하다.
- `useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) })` 한 줄로 끝낸다 → resolvers 5.0 부터 스키마에서 input/output 을 추론한다. `.default()`처럼 input 과 output 이 갈리는 스키마는 제네릭을 빼거나 `useForm<z.input<S>, unknown, z.output<S>>` 셋을 다 적는다. `z.infer` 하나만 주면 타입이 깨진다.
- v8 이 나왔다고 보고 `react-hook-form@8`이나 `next` 태그를 설치한다 → 2026-10 기준 stable 은 7.90.0, 8.0.0-beta.4 는 pre-release 다. 7.x 를 쓴다. React 19 는 7.x peer 범위(`^16.8.0 || ^17 || ^18 || ^19`)에 들어 있다.
- `unstable_usePrompt`나 `window.confirm`, `<BrowserRouter>` 안의 `useBlocker`, Next 의 `router.events`/`routeChangeStart` → React Router 8: `useBlocker(isDirty)`는 data/framework 모드(`createBrowserRouter`)에서만 동작하고 하드 리로드는 못 막으니 `useBeforeUnload`를 같이 건다. Next App Router: 라우터 이벤트가 없어 `Link`의 `onNavigate`에서 `e.preventDefault()`로 앱 안 링크를 막고 `beforeunload`로 새로고침과 닫기를 막는다. Next 의 `router.push`와 뒤로가기는 문서화된 차단 수단이 없다. 확인 다이얼로그는 직접 그린다.
- 다른 페이지로 가면 폼이 언마운트되어 초안이 사라진다고 본다 → Next 16 `cacheComponents`에서는 페이지가 `<Activity>`로 숨겨져(최근 3개 라우트) 폼 입력과 결과 메시지가 그대로 남는다. 저장 성공 뒤에는 `reset()`을 부른 다음 `router.push`한다. 매번 새로 시작해야 하는 폼은 `key`로 리셋한다.

출처: react-hook-form.com/docs/useform, react-hook-form.com/docs/useform/formstate, react-hook-form.com/advanced-usage, github.com/react-hook-form/resolvers/releases, react.dev/reference/react/useActionState, reactrouter.com/api/hooks/useBlocker, nextjs.org/docs/app/api-reference/components/link, nextjs.org/docs/app/guides/preserving-ui-state
