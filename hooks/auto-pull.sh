#!/bin/bash
# SessionStart - 프로젝트 .claude/ (= claude-front clone) 를 12시간 간격으로 백그라운드 pull 한다.
# 직전 pull 이 실패했으면 이번 시작 때 stderr 로 한 줄 알리고 바로 다시 시도한다 (SessionStart 의 stderr 는 사용자에게 보인다).
# .claude 가 git clone 이 아니면(복사해 쓰는 경우) 아무것도 하지 않는다. stdout 에는 아무것도 쓰지 않는다 - 컨텍스트에 들어간다.

DIR="${CLAUDE_PROJECT_DIR:-.}/.claude"
[ -d "$DIR/.git" ] || exit 0

STAMP="$DIR/.git/claude-front-last-pull"
STATUS="$DIR/.git/claude-front-pull-status"
INTERVAL="${CLAUDE_FRONT_PULL_INTERVAL:-43200}"

FAILED=""
if [ -f "$STATUS" ] && [ "$(cat "$STATUS")" != "ok" ]; then
  FAILED="$(cat "$STATUS")"
  echo "claude-front: .claude 업데이트 실패 ($FAILED). git -C .claude status 로 확인한다." >&2
fi

NOW=$(date +%s)
LAST=$(cat "$STAMP" 2>/dev/null || echo 0)
if [ -z "$FAILED" ] && [ $((NOW - LAST)) -le "$INTERVAL" ]; then
  exit 0
fi

(
  if git -C "$DIR" pull --ff-only --quiet 2>/dev/null; then
    echo ok > "$STATUS"
  elif [ -n "$(git -C "$DIR" status --porcelain 2>/dev/null)" ]; then
    echo "로컬 변경 있음" > "$STATUS"
  else
    echo "pull 실패 - 오프라인 또는 충돌" > "$STATUS"
  fi
  echo "$NOW" > "$STAMP"
) &

exit 0
