#!/bin/bash
# PreToolUse(Bash) - 파괴적 명령을 실행 전에 차단한다. exit 2 가 차단이다.
# 대상: 광역 rm -rf, 강제 push, reset --hard, 포크밤, mkfs, dd. 의도적이면 사람이 셸에서 직접 실행한다.

INPUT=$(cat)

if command -v jq >/dev/null 2>&1; then
  CMD=$(printf '%s' "$INPUT" | jq -r '.tool_input.command // empty' 2>/dev/null)
else
  CMD="$INPUT"
fi
[ -z "$CMD" ] && exit 0

PATTERN='rm[[:space:]]+(-[a-zA-Z]*r[a-zA-Z]*f|-[a-zA-Z]*f[a-zA-Z]*r)[[:space:]]+(/([[:space:]]|$|\*)|~([[:space:]/]|$)|\$HOME|\*([[:space:]]|$)|\.([[:space:]]|$))|git[[:space:]]+push[[:space:]]+(.*[[:space:]])?(-[a-zA-Z]*f|--force[a-z-]*)([[:space:]]|=|$)|git[[:space:]]+reset[[:space:]]+--hard|:\(\)[[:space:]]*\{[[:space:]]*:|mkfs|[[:space:]]dd[[:space:]]+if='

if printf '%s' "$CMD" | grep -qE "$PATTERN"; then
  echo "claude-front: 위험한 명령 패턴이라 차단했다." >&2
  echo "  명령: $CMD" >&2
  echo "  의도적이면 셸에서 직접 실행한다. 이 가드는 에이전트의 자동 실행만 막는다." >&2
  exit 2
fi

exit 0
