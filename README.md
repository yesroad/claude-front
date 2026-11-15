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
│   ├── react.md             // *.tsx, *.css, *.styles.ts - 화면, 폼, 스타일 규칙
│   ├── typescript.md        // *.ts, *.tsx - 타입, 네이밍, 스키마, 쿼리 위치
│   └── testing.md           // *.test.*, *.spec.* - 테스트 형식과 단언
├── skills/
│   ├── check/               // /check [scope] - lint 게이트 → code-reviewer → review.md
│   ├── commit/              // /commit [scope] - 게이트 → 메시지 초안 → 확인 → 커밋
│   ├── test/                // /test [대상] - 단위, 통합, E2E 중 골라 references/ 를 읽고 작성
│   └── web-design/          // /web-design [화면] - 목업 → 토큰 → 구현 → QA
├── agents/                  // 읽기 전용. 스킬이 부른다
│   └── code-reviewer.md     // opus - 동작 결함, 규칙 위반, 접근성
├── settings.json            // 기본 허용 권한
└── _workspace/<scope>/      // review.md, commit-draft.md, decisions.md
```

## 동작

- 스킬은 `/check`로 직접 부르거나 "봐줘", "커밋 메시지", "테스트 짜줘" 같은 말로 선택된다. scope 가 없으면 브랜치 이름, `main`이면 `wip`.
- `/check`는 린트와 타입 검사를 먼저 돌리고 code-reviewer 를 불러 `review.md`에 남긴다. 고치지 않는다. 사람이 재현하고 지정한 것만 고친다.
- `/commit`은 lint 와 test 를 돌린 뒤 메시지 초안을 보여주고 확인을 받아 커밋한다. 기능이 섞여 있으면 분리 제안만 한다.
