# claude-front

프론트엔드 개발용 개인 Claude Code 하네스. 프로젝트의 `.claude/`가 이 저장소의 clone 이다.

```bash
git clone https://github.com/yesroad/claude-front.git .claude
echo ".claude/" >> .gitignore
```

프로젝트 설정은 `.claude/settings.local.json`에 둔다. 업데이트는 `git -C .claude pull`.

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
│   ├── check/               // /check [scope] - lint 게이트 → code-reviewer → review.md
│   ├── commit/              // /commit [scope] - 게이트 → 초안 → 확인 → 커밋
│   ├── test-unit/           // /test-unit [대상] - 순수 로직
│   └── web-design/          // /web-design [화면] - 목업 → 토큰 → 구현 → QA
├── agents/                  // 읽기 전용. 스킬이 부른다
│   ├── code-reviewer.md     // opus - 동작 결함, 규칙 위반, 접근성
│   └── commit-author.md     // sonnet - 커밋 메시지 초안
├── workflows/
│   └── work.js              // /work <작업> - 계획 → 구현 → 게이트 → 검토 → review.md
├── settings.json            // 기본 허용 권한
└── _workspace/<scope>/      // review.md, commit-draft.md, decisions.md
```

## 동작

- 스킬은 `/check`로 직접 부르거나 "봐줘", "커밋 메시지", "테스트 짜줘" 같은 말로 선택된다. scope 가 없으면 브랜치 이름, `main`이면 `wip`.
- `/check`는 린트와 타입 검사를 먼저 돌리고 code-reviewer 를 불러 `review.md`에 남긴다. 고치지 않는다. 사람이 재현하고 지정한 것만 고친다.
- `/commit`은 lint 와 test 를 돌린 뒤 commit-author 초안을 보여주고 확인을 받아 커밋한다. 기능이 섞여 있으면 분리 제안만 한다.
- `/work`는 계획에서 요구사항 빈틈이 나오면 선택지만 돌려주고 멈춘다. 고른 것을 `decisions.md`에 적고 다시 돌리면 구현, lint 게이트, 검토, 테스트까지 간다.

## /work 사용법

```
/work 슬롯 목록에 페이지 크기 선택 드롭다운 추가              # 계획 → 구현 → lint → 검토 → review.md 까지, 수정과 커밋은 사람이
/work --autofix 슬롯 목록에 페이지 크기 선택 드롭다운 추가    # 리뷰 지적(P0/P1)을 1회 자동 수정하고 재검토
/work --scope page-size 슬롯 목록에 ...                      # 작업 폴더 이름 지정. 없으면 브랜치 이름, main 이면 wip
```

끝나면 `_workspace/<scope>/review.md`의 지적을 재현해 고칠 것을 지정하고, `git add <파일>` → `/commit <scope>`. 빈틈 선택지가 돌아오면 번호를 고르면 `decisions.md`에 기록하고 다시 돌린다.
