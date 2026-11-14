---
name: commit
description: "스테이지된 변경으로 lint(+ 코드 변경 시 test) 게이트를 통과시킨 뒤 커밋 메시지 초안을 쓰고, 사람이 확인하면 커밋한다. '커밋', '커밋 메시지', 'commit' 요청 시 사용. 메시지가 이미 정해진 git commit -m 의 대체는 아니다. 검토는 /check 가 담당."
user-invocable: true
argument-hint: "[scope]"
allowed-tools: Bash, Read, Write, AskUserQuestion
---

# Commit

게이트를 통과한 스테이지 변경으로 커밋 메시지 초안을 만들고, 확인을 받은 뒤 커밋한다.

## Workflow

1. scope 와 스테이지 확인. `$ARGUMENTS`가 있으면 그것, 없으면 현재 브랜치 이름에서 접두어를 뗀 것(`feat/slot-list` → `slot-list`). `main`이면 메시지에서 scope 를 생략하고 작업 폴더는 `wip`. `git diff --cached --quiet`가 exit 0 이면 "먼저 `git add <파일>`"을 안내하고 종료한다.
2. 게이트. 린트와 타입 검사(`package.json`의 `lint`, 그리고 `typecheck` 또는 `tsc`가 든 `build`, 없으면 `tsc --noEmit`)를 실행한다. 스테이지에 `src/` 또는 `app/` 아래 파일이 있으면 테스트(`test` 스크립트)도 실행한다. 실패하면 출력을 보여주고 중단한다 - 이 스킬은 고치지 않는다.
3. 초안. `git diff --cached`와 `git log -10 --oneline`을 보고 아래 형식으로 쓴다. 기능이 둘 이상 섞였으면 초안 대신 나눠 스테이지하는 방법을 제안하고 종료한다. 초안은 `.claude/_workspace/<작업 폴더>/commit-draft.md`에 쓴다.
4. 확인. 초안을 보여주고 `AskUserQuestion`으로 묻는다 - "이 메시지로 커밋 / 수정할 내용 / 취소".
5. 커밋. 확인을 받으면 `git commit -F .claude/_workspace/<작업 폴더>/commit-draft.md`를 실행하고 `git log -1 --oneline`을 보여준다. push 는 하지 않는다.

## 메시지 형식

```
type(scope): 요약

- 무엇을, 왜 (최대 3줄)
```

- type 은 영어 7개: `feat` `fix` `refactor` `style` `test` `docs` `chore`.
- 요약과 불릿은 한국어 명사형(`슬롯 목록을 라우팅으로 구성`, `~한다`/`~했다` 금지). 요약 50자, 불릿 한 줄 72자.
- diff 에 없는 변경을 쓰지 않는다.
