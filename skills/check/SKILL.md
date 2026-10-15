---
name: check
description: "/lint 로 타입과 린트를 정리한 뒤 방금 구현한 변경(scope)을 code-reviewer 가 검토하고, 화면이 바뀌었으면 a11y-checker 가 함께 본다. 파일:줄과 재현 절차를 그대로 보여주고 .claude/_workspace/<scope>/review.md 에 남긴다. '리뷰', '검토', '봐줘', '문제 없나' 요청 시 사용. 코드를 고치지 않는다. 정확성 버그 사냥은 내장 /code-review, 커밋은 /commit 이 담당."
user-invocable: true
argument-hint: "[scope]"
allowed-tools: Agent, Bash, Read, Write, Skill
---

# Check

구현 직후 검토자를 불러 지적을 모은다. 승인 없이 고치지 않는다 - 지적을 보여주고, 사용자가 재현해 지정한 것만 고친다.

## Workflow

1. scope. `$ARGUMENTS`가 있으면 그것. 없으면 현재 브랜치 이름에서 `feat/`, `fix/` 같은 접두어를 뗀 것(`feat/slot-list` → `slot-list`). `main`이나 `master`면 `wip`. 폴더는 `.claude/_workspace/<scope>/`.
2. 변경 확인. `git status --porcelain`이 비면 "검토할 변경 없음" 후 종료. 변경 범위는 `git rev-parse HEAD`가 성공하면 `git diff HEAD`, 실패하면(첫 커밋 전) `git diff --cached`.
3. 게이트. `/lint`를 부른다. lint 가 오류를 남긴 채 끝나면(우회 없이 못 고치는 것, 2회 수정 후에도 남은 것) 그 보고를 그대로 보여주고 중단한다 - 타입이 안 맞는 코드 위에서는 지적이 갈라진다.
4. 검토자 호출. Agent 도구로 `code-reviewer`를 부르고 scope 와 어느 diff 를 기준으로 볼지 넘긴다. 변경에 `.tsx`나 `.css`가 있으면 `a11y-checker`를 같은 메시지에서 함께 부른다 - 둘 다 읽기 전용이라 병렬로 돌고, 접근성은 화면이 바뀌었을 때만 볼 것이 있다.
5. 저장. 받은 보고서를 `.claude/_workspace/<scope>/review.md`에 쓴다. 둘을 불렀으면 `## 동작`, `## 접근성` 두 절로 한 파일에 이어 붙인다. 재실행이면 덮어쓴다 - 세션이 바뀌어도 근거로 남아야 한다.
6. 그대로 출력. 절마다 P0 → P1 순으로, 요약하지 않고 보여준다. `P2`는 개수만. `파일:줄`과 재현 절차를 줄이지 않는다 - 사용자가 이걸 보고 직접 재현한다.
7. 마무리. "재현해 보고 고칠 항목을 지정해 주세요. 지정한 것만 고칩니다. 고친 뒤 `/check <scope>` 재실행(최대 2회, 그 뒤는 그대로 기록)". 지적이 없으면 "발견 없음"을 그대로 전한다.

## 작업 원칙

- 이 스킬은 호출하고 받아 적고 보여주기만 한다. 판정 텍스트를 쓰지 않고 리뷰 지적을 고치지 않는다 - 리뷰어가 바로 고치면 사람이 재현하고 판단할 자리가 사라진다.
- 게이트에서 `/lint`가 고치는 것은 기계가 판정하는 오류뿐이다. 설계 판단이 필요한 문제는 `/lint`가 손대지 않고 검토자에게 남긴다.
- 테스트는 여기서 돌리지 않는다 - 시나리오 합의가 필요한 일이라 `/test-unit`이 맡고, 커밋 직전 `/commit`이 한 번 더 돌린다.
- 쓰기는 `.claude/_workspace/<scope>/review.md` 하나뿐이다.
- 정확성 버그를 넓게 찾고 싶으면 내장 `/code-review`를 따로 돌린다 - 이 스킬은 소유자 규칙과 화면 UX, 접근성을 본다.
