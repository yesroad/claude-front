# claude-front

프론트엔드 개발용 개인 Claude Code 하네스. 프로젝트의 `.claude/`가 이 저장소의 clone 이다.

```bash
git clone https://github.com/yesroad/claude-front.git .claude
echo ".claude/" >> .gitignore
```

프로젝트 설정은 `.claude/settings.local.json`에 둔다. 세션 시작 훅이 12시간 간격으로 pull 하고, 바로 받으려면 `git -C .claude pull`.

## 구조

```
.claude/
├── rules/                   // paths 가 맞는 파일을 다룰 때만 로드. core 만 항상
│   ├── core.md              // 판단 경계, 표기, git 규약
│   ├── react.md             // *.tsx
│   ├── typescript.md        // *.ts, *.tsx
│   ├── nextjs.md            // app/**, proxy.ts, next.config
│   ├── testing.md           // *.test.*, vitest, playwright config
│   ├── tailwind-v4.md       // *.css, postcss.config
│   ├── emotion.md           // *.styles.ts, styled.ts, registry, theme
│   ├── tanstack-query.md    // queries/**, *.query.ts
│   ├── zod-v4.md            // schemas/**, *.schema.ts
│   └── react-hook-form.md   // forms/**, *.form.tsx
├── skills/
│   ├── check/               // /check [scope] - lint 게이트 → 검토자 → review.md
│   ├── lint/                // /lint - 기계적 오류만 수정
│   ├── commit/              // /commit [scope] - 게이트 → 초안 → 확인 → 커밋
│   ├── test-unit/           // /test-unit [대상] - 순수 로직
│   ├── test-integration/    // /test-integration [대상] - Testing Library + MSW
│   ├── test-e2e/            // /test-e2e [여정] - Playwright
│   └── web-design/          // /web-design [화면] - 목업 → 토큰 → 구현 → QA
├── agents/                  // 읽기 전용. 스킬이 부른다
│   ├── code-reviewer.md     // opus - 동작 결함, 규칙 위반
│   ├── a11y-checker.md      // sonnet - 라벨, 키보드, 포커스
│   └── commit-author.md     // sonnet - 커밋 메시지 초안
├── workflows/
│   └── work.js           // /work <작업> - 계획 → 구현 → 게이트 → 검토 → review.md
├── hooks/
│   ├── auto-pull.sh         // SessionStart - clone 갱신
│   ├── guard-pretool.sh     // PreToolUse - 위험 Bash 차단
│   └── notify.sh            // Notification, Stop - 알림
├── settings.json            // 훅 등록, 기본 권한
└── _workspace/<scope>/      // review.md, commit-draft.md, decisions.md
```

## 동작

- 스킬은 `/check`로 직접 부르거나 "봐줘", "커밋 메시지", "테스트 짜줘" 같은 말로 선택된다. scope 가 없으면 브랜치 이름, `main`이면 `wip`.
- `/check`는 `/lint`를 먼저 돌리고 code-reviewer 와 a11y-checker(화면 변경 시)를 병렬로 불러 `review.md`에 남긴다. 고치지 않는다. 사람이 재현하고 지정한 것만 고친다.
- `/commit`은 lint 와 test 를 돌린 뒤 commit-author 초안을 보여주고 확인을 받아 커밋한다. 기능이 섞여 있으면 분리 제안만 한다.
- `/work`는 계획에서 요구사항 빈틈이 나오면 선택지만 돌려주고 멈춘다. 고른 것을 `decisions.md`에 적고 다시 돌리면 구현, lint 게이트, 검토, 테스트까지 간다. `--autofix`는 P0/P1 을 1회 고친 뒤 재검토한다.
- 훅은 매번 돈다. 위험 명령은 실행 전에 막히고, 권한 요청과 응답 완료는 알림으로 온다.
