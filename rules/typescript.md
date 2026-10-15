---
paths:
  - "**/*.{ts,tsx}"
---
# TypeScript - 타입과 tsconfig 규칙 (TS 6.0 기준, 7.0 병행 주의)

- 함수와 훅의 반환 타입을 명시한다 - 추론에 맡기면 구현을 고칠 때 에러가 정의부가 아니라 호출부에서 터진다.
- 유니온으로 갈라지는 분기는 `Record<Union, ...>`나 `satisfies`로 묶어 누락이 컴파일 에러가 되게 한다 - `if`/`switch` 체인은 유니온에 멤버가 늘어도 조용히 통과한다.
- `any`, `@ts-ignore`, `@ts-expect-error`, `eslint-disable`로 우회하지 않는다. 못 고치면 사유와 함께 보고한다 - 억제한 에러는 사라지지 않고 다음 변경까지 숨는다.
- 파일 이름은 camelCase, 타입 이름은 단수 명사, 타입만 담는 파일은 `*.types.ts` - 이름이 규칙을 따르면 파일을 열지 않고 import 를 쓸 수 있다.
- 배럴(`index.ts`)은 도메인 경계에서만 둔다 - 런타임 배럴은 트리셰이킹을 막는다.
- 데이터 타입은 한 벌만 정의한다(스키마가 있으면 `z.infer`가 그 한 벌이다). 외부에서 들어오는 데이터(API 응답, JSON 파일)는 들어오는 경계에서 검증하고 안쪽에서는 타입을 믿는다 - 같은 데이터의 타입이 둘이면 한쪽만 고쳐져 어긋나고, 검증이 흩어지면 어디서 걸러졌는지 알 수 없다.
- `typescript`를 `@latest`로 올리지 않는다. typed lint 를 쓰면 6.0에 두고, 7 의 `tsc`가 필요하면 npm 별칭으로 병행한다 - 7.0 은 컴파일러 API 가 없어 typescript-eslint(peer `<6.1.0`)가 붙지 않는다.
- tsconfig 의 deprecated 옵션은 `ignoreDeprecations`로 덮지 않고 걷어낸다 - 7.0 은 침묵 옵션 없이 하드 에러다.

## 틀리기 쉬운 것 (2026-10 기준)

- `npm i -D typescript@latest`로 올린다 → typed lint 나 Vue/MDX/Astro/Svelte 가 있으면 6.0에 둔다. typescript-eslint 8.71 의 peer 는 `typescript >=4.8.4 <6.1.0`이고, 7.0에는 그것이 쓰는 컴파일러 API 가 없다.
- Go 컴파일러는 `@typescript/native-preview`(`tsgo`)로 따로 깐다 → 7.0 부터 `typescript` 패키지 그 자체다. 7.0 은 컴파일러 API 가 없다(7.1에 새 API). 6 과 병행은 npm 별칭으로 `typescript`에 `npm:@typescript/typescript6@^6.0.2`(`tsc6`, 6.0 API)를, 7 의 `tsc`는 다른 이름에 `npm:typescript@^7`을 둔다.
- `target: es5`, `moduleResolution: node`, `esModuleInterop: false`를 그대로 둔다 → 6.0 은 deprecated 에러로 막는다(`"ignoreDeprecations": "6.0"`으로만 미룰 수 있다). `moduleResolution: classic`과 `outFile`은 제거됐다. 7.0 은 전부 하드 에러.
- `paths`에 `baseUrl: "."`를 같이 쓴다 → `baseUrl`은 deprecated. 지우고 `paths` 값에 tsconfig 기준 접두를 붙인다(`"@/*": ["./src/*"]`).
- `@types/*`가 자동으로 잡히고 `strict`는 적어야 켜진다 → `types` 기본이 `[]`라 전역은 적어야 한다(`["node", "vitest/globals"]`, `["*"]`가 5.9 동작). `strict: true`, `module: esnext`, `target` 최신(es2025)도 6.0 기본.
- `import './x.css'`는 선언이 없어도 통과한다 → 6.0 기본 `noUncheckedSideEffectImports`로 해석 안 되는 사이드이펙트 import 는 `Cannot find module` 에러다. Vite 의 `vite-env.d.ts`처럼 `*.css`를 선언하는 파일이 없으면 전역 `.d.ts`에 `declare module "*.css" {}`를 둔다.

출처: devblogs.microsoft.com/typescript/announcing-typescript-6-0, devblogs.microsoft.com/typescript/announcing-typescript-7-0, registry.npmjs.org/typescript-eslint/latest
