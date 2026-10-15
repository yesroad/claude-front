---
name: commit
description: "스테이지된 변경으로 lint(+ 코드 변경 시 test) 게이트를 통과시킨 뒤 commit-author 가 커밋 메시지 초안을 쓰고, 사람이 확인하면 커밋한다. '커밋', '커밋 메시지', 'commit' 요청 시 사용. 메시지가 이미 정해진 git commit -m 의 대체는 아니다. 검토는 /check 가 담당."
user-invocable: true
argument-hint: "[scope]"
allowed-tools: Agent, Bash, Read, Write, AskUserQuestion
---

# Commit

게이트를 통과한 스테이지 변경으로 커밋 메시지 초안을 만들고, 확인을 받은 뒤 커밋한다.

## Workflow

1. scope 와 스테이지 확인. `$ARGUMENTS`가 있으면 그것, 없으면 현재 브랜치 이름에서 접두어를 뗀 것(`feat/slot-list` → `slot-list`), `main`이면 작업 폴더 이름은 `wip`(`/check`와 같다)이고 에이전트에는 scope 로 `없음`을 넘겨 메시지에서 생략하게 한다. `git diff --cached --quiet`가 exit 0(스테이지 없음)이면 "먼저 `git add <파일>`"을 안내하고 종료한다 - `git add -A`를 대신 실행하지 않는다.
2. 게이트. `/lint`와 같은 방식으로 린트와 타입 검사를 실행한다. `git diff --cached --name-only`에 `src/` 또는 `app/` 아래 파일이 있으면 테스트(`test` 스크립트 또는 `vitest --run`)도 실행하고, 문서와 설정만 바뀌었으면 "테스트 생략(코드 변경 없음)" 한 줄로 알린다. 실패하면 출력을 보여주고 중단한다 - 이 스킬은 고치지 않는다.
3. 초안. Agent 도구로 `commit-author`를 부르고 scope(또는 `없음`)를 넘긴다. 에이전트는 읽기 전용이라 초안을 텍스트로 돌려준다. 받은 본문을 그대로 `.claude/_workspace/<작업 폴더>/commit-draft.md`에 쓴다 - `git commit -F`가 읽을 파일이다.
4. 표시. 초안을 그대로 보여준다. `SPLIT_REQUIRED`면 분리 제안만 전달하고 종료한다.
5. 확인. `AskUserQuestion`으로 한 번 묻는다 - "이 메시지로 커밋 / 수정할 내용 / 취소". 수정 요청이면 반영해 다시 보여준다(최대 2회).
6. 커밋. 확인을 받으면 `git commit -F .claude/_workspace/<작업 폴더>/commit-draft.md`를 실행하고 `git log -1 --oneline`을 보여준다. push 는 하지 않는다.

## 작업 원칙

- 게이트는 `/lint`와 같은 명령을 돌리기만 하고 고치지 않는다 - 게이트 안에서 검증자가 코드를 고치는 구조를 만들지 않기 위해서다. 오류를 고치는 일은 `/lint`가 맡는다.
- 테스트를 조건부로 돌리는 이유는 문서와 설정 커밋에 테스트가 돌면 커밋당 오버헤드가 늘기 때문이다.
- 커밋은 사람이 확인한 뒤에만 실행한다 - 정지점이 없으면 잘못된 메시지가 이력에 남는다.
- `--amend`, `--no-verify`를 쓰지 않는다.
