---
paths:
  - "**/*.tsx"
---
# React - 컴포넌트 작성 규칙 (React 19.3, 컴파일러 전제)

- 파생 값은 렌더 중 계산한다. `useState`에 복사하거나 `useEffect`로 동기화하지 않는다 - 동기화 effect 가 상태 불일치의 근원이다.
- `memo`, `useCallback`, `useMemo`를 습관적으로 넣지 않는다. 이유를 주석으로 적을 수 있을 때만 넣는다 - 메모이제이션은 컴파일러 몫이다. 이미 있는 것은 걷어내지 않는다 - 컴파일 결과가 바뀐다.
- JSX 속성에 함수를 인라인으로 넘기지 않는다. 이름을 붙여 선언하고 넘긴다 - 속성 자리에 로직이 들어가면 무엇을 그리는지가 안 보인다. `map` 콜백처럼 목록을 그리는 함수는 예외.
- 핸들러 이름을 맞춘다. 구현은 `handleChange`, props 로 넘기는 것은 `onChange`.
- 조건부 렌더링에 `&&`를 쓰지 않는다. early return 이나 삼항을 쓴다 - 왼쪽이 0 이면 화면에 0 이 그려진다.
- 폼 상태는 한 훅에 모은다. 필드 컴포넌트는 값과 핸들러를 props 로 받고 자체 상태를 갖지 않는다 - 상태가 두 곳이면 변경 판정과 이탈 안내가 어긋난다.
- 저장 버튼을 비활성화하지 않는다. 저장을 시도하면 무엇이 왜 막혔는지 보이고 첫 에러 필드로 포커스가 간다 - 눌리지 않는 버튼은 이유를 알려주지 않는다.
- 입력 중에 에러를 띄우지 않는다. 필드를 벗어날 때와 저장할 때 검증하고, 틀린 필드는 고치는 즉시 풀어준다 - 첫 글자에 "필수"가 뜨면 안 된다.
- 목록의 페이지, 검색어, 필터는 URL 에 둔다 - 편집하고 돌아왔을 때 초기화되면 반복 작업이 끊긴다.
- 데이터를 가져오는 로직(fetch)은 서비스 함수에 둔다. 컴포넌트는 그 함수나 쿼리 훅을 부르고 결과만 받는다 - 화면 없이 테스트할 수 있어야 한다.
- 클릭할 수 있는 것은 native 요소(`button`, `a`)를 쓴다. 입력에는 `label`을 잇고 에러는 `aria-describedby`로 그 입력에 잇는다 - `div`에 `onClick`을 붙이면 키보드로 닿지 않는다.
- `alert()`, `confirm()`을 쓰지 않는다. 다이얼로그는 Esc 로 닫히고 포커스가 열었던 자리로 돌아와야 한다 - 브라우저 기본은 문구와 포커스를 통제할 수 없다.
- 에러 문구는 사용자 문장으로 쓴다. 필드 key 나 규칙 이름을 노출하지 않는다 - 사용자는 `title`이 아니라 화면의 라벨을 본다.

## 틀리기 쉬운 것 (2026-10 기준)

- `forwardRef` → `ref`를 일반 prop 으로 받는다. 19 에서 불필요하고 폐기 예정이다.
- `useFormState` → `useActionState`. RHF 같은 폼 라이브러리를 쓰지 않는 폼은 `<form action={fn}>`과 `useOptimistic`으로 구성한다.
- `eslint-plugin-react-compiler`를 따로 넣지 않는다 → `eslint-plugin-react-hooks@latest`의 `recommended`에 컴파일러 규칙(`purity`, `refs`, `set-state-in-effect`, `immutability`)이 들어 있다.
- `<ViewTransition>`은 experimental 이라 쓰지 않고, Server Component 에서 Context 를 쓰려면 클라이언트 래퍼를 만든다 → 19.3 에서 `<ViewTransition>`이 안정 API 이고, Fragment 에 ref 를 달 수 있고, Server Component 가 `'use client'` 모듈의 Context 를 래퍼 없이 직접 렌더한다.

출처: react.dev/blog/2026/09/09/react-19-3, react.dev/learn/react-compiler/introduction, react.dev/reference/react/forwardRef
