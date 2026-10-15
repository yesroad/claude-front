---
paths:
  - "**/queries/**"
  - "**/*.query.{ts,tsx}"
---
# TanStack Query - 쿼리 정의 규칙 (React 어댑터 v5, 클라이언트 fetch 전용)

- 쿼리 키는 `queries/<domain>.query.ts` 팩토리 한 곳에서만 만든다. 컴포넌트, 훅, 테스트 어디에도 문자열 리터럴 키를 쓰지 않는다 - 흩어진 키는 오타 하나로 캐시가 갈라지고 컴파일이 잡지 못한다.
- 팩토리는 `queryOptions()`로 키와 `queryFn`을 한 객체로 내보낸다. `useQuery`, `useSuspenseQuery`, `queryClient.query`는 그 객체를, `getQueryData`와 `setQueryData`는 그 `.queryKey`를 그대로 쓴다 - 키에 데이터 타입이 따라붙어 `getQueryData`와 `setQueryData`가 `unknown`이 아니다.
- `queryFn`은 서비스 함수를 부른다. fetch 호출과 응답 가공을 쿼리 정의 안에 쓰지 않는다 - 쿼리 파일에는 키와 캐시 정책만 남아야 서버 컴포넌트와 테스트가 같은 서비스 함수를 쓴다.
- 서버 상태를 `useState`에 복사하지 않는다. 가공은 `select`나 렌더 중 계산으로 한다 - 복사본은 refetch 와 invalidate 를 따라오지 않아 화면이 캐시와 어긋난다.
- QueryClient 기본값(`staleTime`, `retry`, `refetchOnWindowFocus`)은 `decisions.md`에서 정한 값을 쓴다. 쿼리 하나만 다르게 하려면 이유를 주석으로 적는다 - 기본값이 쿼리마다 흩어지면 어느 화면이 왜 다시 가져오는지 추적이 안 된다.
- 뮤테이션 뒤 `invalidateQueries`에 넘기는 `queryKey`도 팩토리에서 가져온다 - 손으로 쓴 키는 팩토리가 바뀌어도 에러 없이 빗나가 화면만 갱신되지 않는다.
- 서버 컴포넌트가 렌더에 쓰는 데이터는 Query 로 감싸지 않는다. 서버 쪽 캐시는 `'use cache'`가 맡고, Query 는 클라이언트에서 fetch 하는 서버 상태(입력에 따른 재조회, 폴링, 뮤테이션 뒤 갱신)에만 쓴다 - Next 16.4부터 Cache Components 가 권장 모델이고, 같은 데이터가 두 캐시에 있으면 무효화도 두 곳에서 해야 한다.

## 틀리기 쉬운 것 (2026-10 기준)

- `cacheTime`, `useErrorBoundary`, `keepPreviousData: true`, `isPreviousData` → `gcTime`, `throwOnError`, `placeholderData: keepPreviousData`(import 하는 함수), `isPlaceholderData`. placeholder 가 있으면 status 는 항상 `success`다.
- `status: 'loading'`, `isLoading`으로 첫 로딩 판정 → `status: 'pending'`, `isPending`. `isLoading`은 `isPending && isFetching`(옛 `isInitialLoading`, 폐기 예정)이라 `enabled: false`인 쿼리는 `data`가 없어도 false 다. `if (isLoading)` 가드를 지나 `undefined`를 그린다.
- `useQuery`의 `onSuccess`/`onError`/`onSettled` → 제거됐다(뮤테이션은 유지). 토스트 같은 전역 처리는 `new QueryCache({ onError })`가 받는 `(error, query)`에서 `query.meta`로 분기하고, 데이터 파생은 렌더 중 계산한다.
- `suspense: true` 옵션 → `useSuspenseQuery`. `enabled`, `placeholderData`, `skipToken`을 받지 않고 `data`는 항상 정의된다. 한 컴포넌트에 둘 이상이면 순차 요청이 되니 `useSuspenseQueries`로 묶는다.
- `useInfiniteQuery`의 `queryFn` 인자에 `pageParam = 1` 기본값 → `initialPageParam`과 `getNextPageParam`이 둘 다 필수다. `queryFn` 인자 기본값은 캐시에 `undefined`를 남긴다.
- `queryClient.fetchQuery`, `prefetchQuery`, `ensureQueryData` → `queryClient.query(options)` 하나. prefetch 는 `.catch(noop)`을 붙이고 ensure 는 `staleTime: 'static'`을 준다. infinite 는 `queryClient.infiniteQuery`. 옛 메서드는 폐기 예정으로 v6 에서 사라진다.

출처: tanstack.com/query/latest/docs/framework/react/guides/migrating-to-v5, tanstack.com/query/latest/docs/framework/react/guides/query-options, tanstack.com/query/latest/docs/framework/react/reference/useSuspenseQuery, tanstack.com/query/latest/docs/reference/QueryClient, nextjs.org/docs/app/api-reference/directives/use-cache
