#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
PORTS=(3000 3002)

usage() {
  echo "Usage: $(basename "$0") <stop|status|dev|start|prod>"
}

kill_port_listeners() {
  local port=$1 pids=""
  if command -v lsof >/dev/null 2>&1; then
    pids="$(lsof -ti tcp:"$port" -sTCP:LISTEN 2>/dev/null || true)"
    [[ -n "$pids" ]] && kill -TERM $pids 2>/dev/null || true
  fi
}

cmd_stop() {
  for port in "${PORTS[@]}"; do kill_port_listeners "$port"; done
  sleep 0.3
}

cmd_status() {
  for port in "${PORTS[@]}"; do
    if command -v ss >/dev/null 2>&1; then
      ss -ltn "sport = :$port" 2>/dev/null | head -3 || true
    fi
  done
}

case "${1:-}" in
  stop) cmd_stop ;;
  status) cmd_status ;;
  dev) cmd_stop; exec npm run dev ;;
  start) cmd_stop; exec npm run start ;;
  prod) cmd_stop; npm run build; exec npm run start ;;
  *) usage; exit 1 ;;
esac
