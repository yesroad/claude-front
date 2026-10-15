#!/bin/bash
# Notification, Stop - 사람의 확인이 필요하거나 응답이 끝났을 때 데스크톱 알림.
# NOTIFIER_TITLE, NOTIFIER_MESSAGE 환경변수가 있으면 그것을, 없으면 훅 입력(JSON)의 message 를 쓴다.

INPUT=$(cat)
TITLE="${NOTIFIER_TITLE:-claude-front}"
MESSAGE="${NOTIFIER_MESSAGE:-}"

if [ -z "$MESSAGE" ] && command -v jq >/dev/null 2>&1; then
  MESSAGE=$(printf '%s' "$INPUT" | jq -r '.message // empty' 2>/dev/null)
fi
MESSAGE="${MESSAGE:-확인이 필요하다}"

case "$(uname -s)" in
  Darwin*)
    NOTIFIER=$(command -v terminal-notifier || echo "/opt/homebrew/bin/terminal-notifier")
    if [ -x "$NOTIFIER" ]; then
      "$NOTIFIER" -title "$TITLE" -message "$MESSAGE" -sound Glass
    else
      # terminal-notifier 가 없으면 osascript. 값은 argv 로 넘긴다 - 문자열 보간은 인젝션이 된다.
      osascript - "$TITLE" "$MESSAGE" <<'OSA' 2>/dev/null
on run argv
  display notification (item 2 of argv) with title (item 1 of argv) sound name "Glass"
end run
OSA
    fi
    ;;
  Linux*)
    command -v notify-send >/dev/null 2>&1 && notify-send "$TITLE" "$MESSAGE" 2>/dev/null
    ;;
esac

printf '\a'
exit 0
