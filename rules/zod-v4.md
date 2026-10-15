---
paths:
  - "**/schemas/**"
  - "**/*.schema.ts"
---
# Zod - 스키마 작성 규칙 (Zod 4.6, v5 없음)

- 스키마는 `*.schema.ts`로 쓰고 도메인별 `schemas/`에 둔다 - 화면 파일에 묻히면 서버 액션과 테스트에서 같은 모양을 다시 쓰게 된다.
- 타입은 `z.infer<typeof Schema>` 한 벌만 둔다. 같은 모양의 `interface`나 `type`을 따로 쓰지 않는다 - 둘이 어긋나면 컴파일은 통과하고 런타임에서 깨진다.
- `error`에 넣는 문구는 사용자 문장(한국어)으로 쓴다. 필드 key 나 규칙 이름을 노출하지 않는다 - 기본 문구는 영어이고 `expected string`처럼 타입 이름을 그대로 내보낸다.

## 틀리기 쉬운 것 (2026-10 기준)

- `z.string({ message, invalid_type_error, required_error })`, `errorMap` → `error` 하나로 준다. `message`는 폐기 예정, `invalid_type_error`/`required_error`는 삭제. 필수 판정은 `error: (iss) => iss.input === undefined ? "필수 항목" : "형식 오류"`.
- `err.format()`, `err.flatten()`, `err.errors` → `z.treeifyError(err)`, `z.flattenError(err)`, `z.prettifyError(err)`, `err.issues`. `.format()`/`.flatten()`은 폐기, `.errors`는 삭제.
- `z.string().email()`, `.uuid()`, `.url()`, `.datetime()`, `.ip()`, `z.number().int()` → 톱레벨 `z.email()`, `z.uuid()`, `z.url()`, `z.iso.datetime()`, `z.ipv4()`/`z.ipv6()`, `z.int()`. 메서드형은 다음 메이저에서 삭제 예정, `.ip()`는 이미 삭제.
- `.merge()`, `.strict()`, `.passthrough()`, `z.record(z.string())` → `.extend()`, `z.strictObject()`, `z.looseObject()`, `z.record(z.string(), z.string())`. `z.record()`는 키 스키마 생략 불가.
- `.default(v)`가 `v`를 입력 타입으로 받아 파싱한다 → `undefined`면 파싱을 건너뛰고 출력 타입 `v`를 그대로 돌려준다. 이전 동작은 `.prefault(v)`.
- `interface Cat {...}` + `const Cat: z.ZodType<Cat> = z.lazy(...)`, 또는 `z.interface()` → `z.object({ get children() { return z.array(Cat) } })`. `z.interface`는 4.0 베타에만 있었고 안정판 전에 삭제. 순환 에러(ts7023)가 나면 그 getter 에만 반환 타입을 적는다.
- `z.nativeEnum(E)`, `z.function().args(a).returns(r)` → `z.enum(E)`가 TS enum 을 받는다. `z.function({ input: [a], output: r })`은 스키마가 아닌 함수 팩토리.
- Zod 4 를 4.0 으로 알거나 v5 를 찾는다 → 2026-10 최신은 4.6.x 이고 v5 는 없다. 4.5 `z.compile()`(`new Function`을 쓰므로 엄격한 CSP 에서는 `z.withParser()`), 4.6 `.validate()` 메서드, `@zod/mini` 독립 패키지는 선택 기능이다.

출처: zod.dev/v4/changelog, zod.dev/v4, zod.dev/api, zod.dev/error-formatting, github.com/colinhacks/zod/releases
