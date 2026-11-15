---
paths:
  - "**/*.{ts,tsx}"
---
# TypeScript

- 함수와 훅의 반환 타입을 명시한다.
- 유니온으로 갈라지는 분기는 `Record<Union, ...>`나 `satisfies`로 묶어 누락이 컴파일 에러가 되게 한다.
- 파일 이름은 camelCase, 타입 이름은 단수 명사, 타입만 담는 파일은 `*.types.ts`. 배럴(`index.ts`)은 도메인 경계에서만 둔다.
- 데이터 타입은 한 벌만 정의한다. 스키마가 있으면 `z.infer`가 그 한 벌이고, 스키마는 `schemas/<도메인>.schema.ts`에 둔다. 검증 에러 문구는 한국어 사용자 문장으로 쓴다.
- TanStack Query 의 키와 `queryOptions`는 `queries/<도메인>.query.ts` 한 곳에서 만들고 `queryFn`은 서비스 함수를 부른다. QueryClient 기본값은 `decisions.md`에서 정한 값을 쓴다.
