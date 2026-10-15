---
paths:
  - "**/*.styles.{ts,tsx}"
  - "**/styled.{ts,tsx}"
---
# Emotion - 스타일 작성 규칙 (Emotion 11, Next 16 App Router 와 Vite 8)

- 일회성 스타일은 `css` prop 으로, 재사용 컴포넌트는 `styled`로 만든다 - 한 번 쓰는 조정에 `styled`를 만들면 이름만 늘고 재사용은 생기지 않는다.
- 스타일은 컴포넌트 파일에서 분리해 `*.styles.ts`에 둔다. 컴포넌트 파일은 그것을 import 해서 쓴다 - 컴포넌트 파일에 구조와 동작만 남아 diff 가 읽힌다.
- 변형(variant)은 객체 맵으로 둔다. 템플릿 문자열 안에 삼항 분기를 넣지 않는다 - 조합이 늘수록 템플릿은 읽을 수 없고, 맵은 빠진 키를 타입이 잡는다.
- 색과 간격은 `theme` 토큰만 쓴다. 색상값과 간격 숫자를 직접 적지 않는다 - 하드코딩된 값은 테마 전환과 일괄 수정에서 빠진다.
- `!important`를 쓰지 않는다. 특이성이 모자라면 `&&`로 셀렉터를 겹친다 - `!important`는 다음 사람이 덮어쓸 방법이 없다.
- 전역 스타일(리셋, 폰트)은 `Global` 한 곳에 둔다. 컴포넌트 안에 `Global`을 넣지 않는다 - 마운트마다 다시 삽입되고, 두 곳이면 순서에 따라 결과가 바뀐다.
- `*.styles.ts`를 import 하는 컴포넌트와 `CacheProvider` 레지스트리는 `'use client'` 안에 둔다. Server Component 에서는 `css` prop 도 `styled`도 쓰지 않는다 - `@emotion/react`는 로드 시점에 `createContext`를 부르고 `react-server` 빌드가 없어 RSC 레이어에서 에러가 난다.

## 틀리기 쉬운 것 (2026-10 기준)

- Next 에 `.babelrc`를 두고 `@emotion/babel-plugin`(또는 `@emotion/babel-preset-css-prop`)을 넣는다 → `next.config`의 `compiler.emotion: true`. `@emotion/babel-plugin`의 SWC 포트(`sourceMap`, `autoLabel`, `labelFormat`, `importMap`)이고 Turbopack(16 기본)에도 적용된다. webpack 모드에서 `.babelrc`가 있으면 SWC 가 통째로 꺼진다.
- "Emotion SSR 은 Next 에서 설정 없이 된다"(emotion.sh 의 Pages Router 문구) → App Router 는 `'use client'` 레지스트리가 필요하다. `useState`로 `createCache({ key })`를 만들고 `cache.compat = true`, `useServerInsertedHTML`로 `cache.inserted`를 `<style>`로 흘려보내고 `CacheProvider`로 루트 layout 의 children 을 감싼다. Emotion 공식 지원은 아직 없다(#2928 open).
- tsconfig 에 `"jsxImportSource": "@emotion/react"`를 전역으로 둔다 → Next 는 tsconfig 의 `jsxImportSource`를 자동 적용하므로 App Router 에서는 Server Component 도 Emotion jsx 런타임을 import 하게 되어 "createContext only works in Client Components" 가 난다. 클라이언트 파일에 `/** @jsxImportSource @emotion/react */` 프라그마를 쓴다. Vite 는 전역 설정 그대로 둔다.
- Vite 에서 `react({ babel: { plugins: ['@emotion/babel-plugin'] } })` → `@vitejs/plugin-react` 6(Vite 8)은 Babel 과 `babel` 옵션을 뺐다. `jsxImportSource`는 tsconfig 에서 자동 추론한다. Babel 플러그인이 필요하면 `@rolldown/plugin-babel`의 `babel({ plugins: [...] })`을 `react()` 다음에 둔다(changelog 예시 순서).
- `styled` 컴포넌트를 셀렉터로 쓰는 `${Child}:hover &`는 어디서나 된다 → 컴파일 변환이 `target`을 붙여야 동작한다. Next 의 `compiler.emotion`(SWC 변환)은 붙여 주고, Vite 8 기본(Babel 없음)에서는 dev 에서 "Component selectors can only be used in conjunction with @emotion/babel-plugin..." 에러가 난다.

출처: nextjs.org/docs/app/guides/css-in-js, nextjs.org/docs/architecture/nextjs-compiler, emotion.sh/docs/css-prop, emotion.sh/docs/styled, github.com/emotion-js/emotion/issues/2928, github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/CHANGELOG.md
