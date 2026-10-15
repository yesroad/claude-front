# claude-front

프론트엔드 개발용 개인 Claude Code 하네스. 프로젝트의 `.claude/` 디렉터리가 이 저장소의 clone 이 된다.
rules 10, skills 7, agents 3, workflow 1, hooks 3, settings 1.

## 설치

```bash
git clone https://github.com/yesroad/claude-front.git .claude
echo ".claude/" >> .gitignore     # 프로젝트 저장소에는 올리지 않는다 (팀 공유면 submodule 로)
```

이미 `.claude/`가 있으면 `settings.local.json`, `plans/`, `_workspace/`를 옮겨 두고 디렉터리를 바꾼 뒤 되돌린다.
프로젝트 자체 설정과 권한은 `.claude/settings.local.json`에 둔다 - `settings.json`은 이 저장소 파일이라 고치면 pull 이 멈춘다. 같은 이유로 "프로젝트에 항상 허용"이나 `claude plugin install --scope project` 대신 local scope 를 쓴다.

## 업데이트

세션 시작 훅이 12시간 간격으로 `git -C .claude pull --ff-only`를 백그라운드로 돌린다. 실패하면 다음 세션 시작 때 한 줄 경고가 뜬다. 바로 받으려면 `git -C .claude pull`.

## 구성

| 종류 | 이름 | 언제 |
| --- | --- | --- |
| rule | `core` | 항상. 판단 경계, 표기, git/커밋/PR 규약 |
| rule | `react`, `typescript`, `nextjs`, `testing` | 해당 파일(`*.tsx`, `*.ts`, `app/**`, `*.test.*`)을 다룰 때 |
| rule | `tailwind-v4`, `emotion`, `tanstack-query`, `zod-v4`, `react-hook-form` | 라이브러리 전용 경로(`*.css`, `*.styles.ts`, `queries/`, `schemas/`, `forms/`)를 다룰 때 |
| skill | `/check [scope]` | 구현 직후. lint 게이트 → code-reviewer (+ a11y-checker) → `_workspace/<scope>/review.md` |
| skill | `/lint` | 타입과 린트 오류를 기계적으로 정리 |
| skill | `/commit [scope]` | 게이트 → commit-author 초안 → 확인 → 커밋 |
| skill | `/test-unit`, `/test-integration`, `/test-e2e` | 시나리오 합의 후 테스트 작성과 실행 |
| skill | `/web-design [화면]` | 톤 → HTML 목업 → 토큰 → 구현 → QA |
| workflow | `/feature <작업 설명>` | 계획 → 구현 → lint 게이트 → 병렬 검증(검토자 2, 단위 테스트) → `review.md`. 빈틈이 있으면 구현 전에, lint 오류가 남으면 검토 전에 멈춘다. `--autofix` 로 P0/P1 1회 자동 수정 |
| agent | `code-reviewer`(opus), `a11y-checker`(sonnet), `commit-author`(sonnet) | 스킬이 호출. 전부 읽기 전용 |
| hook | SessionStart `auto-pull`, PreToolUse `guard-pretool`, Notification/Stop `notify` | 자동 |

흐름: 구현 → `/check` → 지적을 재현하고 지정한 것만 수정 → `/commit` → PR 은 `gh pr create`(규약은 core 룰). 한 번에 가려면 `/feature <작업 설명>` - 검토까지 자동이고 수정과 커밋은 사람이 정한다. 정확성 버그 사냥은 내장 `/code-review`, 정리는 `/simplify`.

## 프로젝트별 조정 (`.claude/settings.local.json`)

- 권한 추가: `permissions.allow`.
- 특정 룰 제외: `"claudeMdExcludes": ["**/.claude/rules/emotion.md"]`.
- 알림은 macOS `terminal-notifier`(없으면 osascript), Linux `notify-send`. `brew install terminal-notifier`.
- `/workflows`에서 실행을 `s`로 저장할 때는 개인 위치(`~/.claude/workflows/`)를 고른다 - 프로젝트 위치는 이 clone 안이라 pull 이 멈춘다.

## 설계 원칙

- 한 줄을 남기는 조건은 둘 중 하나다 - 현재 모델이 말해주지 않으면 틀리는 것(버전 델타), 소유자의 유도 불가능한 취향. 모델이 아는 것은 쓰지 않는다.
- 검증자는 작성자와 분리하고 쓰기 도구를 주지 않는다. 빠지면 안 되는 전이는 훅으로 한다. 상태는 `_workspace/`에 파일로 남긴다. 재시도는 2회 상한, 그 뒤는 사람이 정한다.
- 심링크나 플러그인을 쓰지 않는 이유: 프로젝트 밖을 가리키는 rules 심링크는 `paths` 룰이 로드되지 않고, 플러그인은 rules 를 실을 수 없다.

## 개발

```bash
claude plugin validate skills --strict && claude plugin validate agents --strict
bash -n hooks/*.sh && python3 -c 'import json; json.load(open("settings.json"))'
grep -rnP '[\x{2014}\x{00B7}]' --include='*.md' --include='*.sh' --include='*.json' . || echo "표기 통과"
```
