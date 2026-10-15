---
paths:
  - "app/**"
  - "src/app/**"
  - "**/proxy.ts"
  - "**/next.config.*"
---
# Next.js - App Router 규칙 (Next.js 16, App Router 만)

- Next.js 작업 전에 `node_modules/next/dist/docs/`에서 해당 문서를 찾아 읽는다 - 설치된 버전과 일치하는 1차 문서라 학습 데이터와 스킬보다 정확하다.
- `page.tsx`는 얇게 쓴다. 데이터를 로드해 view 컴포넌트에 넘기는 조립만 하고 화면을 직접 그리지 않는다 - 화면은 라우트 없이 렌더하고 테스트할 수 있어야 한다.
- 서버 컴포넌트는 서비스 함수를 `await` 해서 데이터를 받는다. fetch 와 쿼리 로직은 컴포넌트 밖에 둔다 - 어디서 무엇을 가져오는지가 한 곳에 모여야 캐시 태그와 재검증을 추적할 수 있다.
- 같은 요청 안에서 반복되는 호출은 서비스 함수를 `React.cache`로 감싸 한 번만 실행한다 - layout, page, `generateMetadata`가 같은 데이터를 따로 부른다.
- `cacheComponents: true`면 캐시는 `'use cache'`와 `cacheLife`/`cacheTag`로만 명시하고, 요청 시점 데이터(`cookies()`, 캐시하지 않은 fetch)는 `<Suspense>` 경계 안에서 읽는다 - 캐시는 전부 opt-in 이고, 경계 밖의 요청 시점 데이터는 빌드 에러다.
- `params`, `searchParams`, `cookies()`, `headers()`, `draftMode()`는 `await` 한다 - 16에서 동기 접근이 제거됐고, `opengraph-image`/`icon`의 `params`와 `id`, `sitemap`의 `id`도 Promise 로 온다.
- RSC 에서 클라이언트 컴포넌트로 넘기는 props 는 최소로 한다 - 넘긴 값은 전부 직렬화되어 HTML 에 실리고 브라우저에 노출된다.
- Server Action 안에서 인증과 입력 검증을 한다. 호출자를 신뢰하지 않는다 - Server Action 은 누구나 호출할 수 있는 공개 엔드포인트다.

## 틀리기 쉬운 것 (2026-10 기준)

- `middleware.ts`의 `export function middleware` → `proxy.ts`의 `export function proxy`. 런타임은 Node 고정이라 edge 가 필요하면 `middleware.ts`를 유지한다(deprecated). `skipMiddlewareUrlNormalize`도 `skipProxyUrlNormalize`.
- `experimental.ppr`, `experimental.dynamicIO`, `experimental.useCache`, `experimental_ppr` export, `unstable_cacheLife`/`unstable_cacheTag` → `cacheComponents: true` + `partialPrefetching: true`(16.3 이상, 생략하면 경고), `cacheLife`/`cacheTag`. Node 런타임만 지원하므로 `runtime = 'edge'`를 뺀다. 16.4부터 모든 앱 권장, `create-next-app` 기본, 17에서 기본.
- `revalidateTag(tag)` 단일 인자 → `revalidateTag(tag, 'max')`. 단일 인자는 deprecated 라 TypeScript 에러가 난다. 쓰고 바로 읽어야 하면 Server Action 에서 `updateTag(tag)`, 캐시하지 않은 데이터만 다시 그리려면 `refresh()`.
- `next dev --turbopack` 플래그, `next lint`, `next build`가 lint 를 해준다는 기대 → Turbopack 이 기본이라 플래그가 없다. webpack 은 `--webpack`(커스텀 `webpack` 설정이 있으면 플래그 없는 빌드는 실패). `experimental.turbopack`은 최상위 `turbopack`. `next lint`와 `next.config`의 `eslint` 옵션은 제거, `next build`는 lint 를 안 한다. ESLint 나 Biome 을 직접 실행한다.
- 병렬 라우트 슬롯(`@modal`)에 `default.js` 생략 → 모든 슬롯에 `default.js` 필수. 없으면 빌드가 실패한다. 이전 동작은 `notFound()`를 부르거나 `null`을 반환하는 `default.js`.
- `images.domains`, `quality={90}` 같은 임의 품질, 로컬 `src`에 `?v=1` 쿼리스트링 → `images.remotePatterns`. `images.qualities` 기본은 `[75]`라 다른 `quality`는 가장 가까운 값으로 바뀌고 미등록 `q`의 `/_next/image` 요청은 400. 로컬 쿼리스트링은 `images.localPatterns`의 `search`에 등록한다. `minimumCacheTTL` 기본 4시간.
- `experimental.reactCompiler` → 최상위 `reactCompiler: true`(stable). 기본은 off 라 켤 때 `babel-plugin-react-compiler`를 설치한다. 16.3 이상은 `experimental.turbopackRustReactCompiler: true`로 Babel 없이 돈다.

출처: nextjs.org/blog/next-16, nextjs.org/blog/next-16-4, nextjs.org/blog/next-16-2-ai, nextjs.org/docs/app/guides/upgrading/version-16, nextjs.org/docs/app/api-reference/config/next-config-js/cacheComponents
