---
paths:
  - "**/*.css"
  - "**/postcss.config.*"
---
# Tailwind CSS v4 - 설정과 토큰 규칙 (v4.3, CSS 설정 전제)

- 토큰은 `@theme`, 커스텀 유틸은 `@utility`, 변형은 `@custom-variant`로 CSS 에 둔다. `tailwind.config.js`를 새로 만들지 않고, 이미 있으면 `@config`로 로드돼 있는지 확인한다 - JS 설정은 자동으로 읽히지 않아 `theme.extend`가 조용히 무시된다.
- 다른 변수를 참조하는 토큰(`--color-primary: var(--brand)`)은 `@theme inline`에 둔다 - 일반 `@theme`은 `var(--brand)`를 `:root`에서 계산해 하위 요소에서 바꾼 값이 반영되지 않는다.
- PostCSS 설정에는 `@tailwindcss/postcss` 하나만 둔다. `autoprefixer`, `postcss-import`를 넣지 않고, Vite 는 PostCSS 대신 `@tailwindcss/vite`를 쓴다 - import 와 vendor prefix 는 Tailwind 가 직접 처리한다.
- 색, 간격, 포커스 링은 `@theme` 토큰 한 곳에 둔다. 임의 값 클래스(`bg-[#2563eb]`, `p-[13px]`)를 남발하지 않는다 - 토큰에 없는 값은 검색도 일괄 교체도 안 된다.
- 포커스 표시를 지우면(`outline-hidden`) `focus-visible:`에 대체 링을 토큰 색과 명시한 폭으로 준다 - `ring` 기본이 3px 파랑에서 1px currentColor 로 바뀌어 `ring`만 쓰면 거의 보이지 않는다.
- `@tailwind base` 지시어나 `tailwindcss@3`이 보이는 v3 프로젝트는 이 룰의 대상이 아니다. v4 문법을 섞지 않고 사용자에게 알린다 - 두 문법은 호환되지 않고 업그레이드는 사용자가 정할 일이다.

## 틀리기 쉬운 것 (2026-10 기준)

- `@tailwind base; @tailwind components; @tailwind utilities;` → `@import "tailwindcss";` 한 줄. v3 지시어가 남아도 에러가 없다 - `base`/`components`는 사라지고 `utilities`는 테마 없이 돌아 `flex`는 나와도 `p-4`, `bg-red-500`은 생성되지 않는다.
- `tailwind.config.js`의 `theme.extend`가 자동으로 읽힘 → JS 설정은 자동 감지되지 않는다. 토큰은 `@theme { --color-brand: oklch(…) }`로 정의하고 CSS 에서는 `var(--color-brand)`로 읽는다. 꼭 필요한 JS 설정만 `@config "../tailwind.config.js"`로 명시 로드. `corePlugins`, `safelist`, `separator`는 미지원이고 safelist 는 `@source inline()`.
- `darkMode: 'class'`, 플러그인 `addVariant()` → `@custom-variant dark (&:where(.dark, .dark *));`를 `@import` 아래에 둔다. 선언이 없으면 `dark:`는 `prefers-color-scheme`로 동작한다.
- `@layer utilities { .btn { @apply … } }`, 플러그인 `addUtilities()` → `@utility btn { … }`. `hover:`, `lg:` 같은 variant 가 붙는 커스텀 클래스는 `@utility`로 만든 것만이고 `@layer components`의 클래스에는 붙지 않는다.
- `postcss.config.*`의 `tailwindcss: {}`에 `autoprefixer`, `postcss-import`를 함께 등록 → `"@tailwindcss/postcss": {}` 하나만. `tailwindcss`를 직접 플러그인으로 두면 "trying to use `tailwindcss` directly as a PostCSS plugin" 에러가 난다. Vite 는 `@tailwindcss/vite`, CLI 는 `npx @tailwindcss/cli`.
- `start-*`/`end-*`로 inline 방향 위치 지정 → 4.2: `inset-s-*`/`inset-e-*`(구형은 deprecated). 논리 속성 유틸 `pbs-*`/`pbe-*`, `mbs-*`/`mbe-*`, `inline-*`, `block-*`, `border-bs-*`와 `@tailwindcss/webpack` 추가.
- `@variant dark { }`처럼 변형 하나씩 감싸기 → 4.3: 스택 `@variant hover:focus { }`와 복합 `@variant hover, focus { }`. 함수형 `@utility x-*`는 `--value(…)`가 필수 - 없으면 에러 없이 아무것도 생성되지 않는다. `scrollbar-{auto,thin,none}`, `scrollbar-thumb-*`, `zoom-*`, `tab-*`, `@container-size` 추가.

출처: tailwindcss.com/docs/upgrade-guide, tailwindcss.com/docs/theme, tailwindcss.com/docs/functions-and-directives, tailwindcss.com/docs/dark-mode, github.com/tailwindlabs/tailwindcss/releases/tag/v4.2.0, github.com/tailwindlabs/tailwindcss/releases/tag/v4.3.0
