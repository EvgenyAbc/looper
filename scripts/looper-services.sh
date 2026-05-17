#!/usr/bin/env bash
# Looper: освободить порты MF и поднять сервисы на заявленных портах.
# Зависимости: lsof (рекомендуется) или fuser из psmisc.
# При добавлении нового remote обновите массив PORTS ниже и порты в rspack/mock-menu.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

# shell + MF-remotes (remotes: serve dist; dev через scripts/mf-remote-dev.sh, не rspack serve).
# Порт 3030 (@ui-looper/core) управляется отдельно через scripts/start-all.sh.
PORTS=(3000 3002 3003 3004 3005)

usage() {
  echo "Looper MF — стоп по портам и чистый запуск."
  echo
  echo "Usage: $(basename "$0") <command>"
  echo "  stop       — завершить процессы, слушающие указанные TCP-порты"
  echo "  status     — показать слушателей на этих портах"
  echo "  dev        — stop, затем npm run dev"
  echo "  start      — stop, затем npm run start (нужен собранный dist)"
  echo "  prod       — stop, npm run build, затем npm run start"
}

kill_port_listeners() {
  local port=$1
  local pids=""

  if command -v lsof >/dev/null 2>&1; then
    pids="$(lsof -ti tcp:"$port" -sTCP:LISTEN 2>/dev/null || true)"
    if [[ -n "${pids}" ]]; then
      echo "  port $port: TERM → PID(s) $pids"
      if ! kill -TERM $pids 2>/dev/null; then
        echo "  port $port: warning — could not signal PID(s) $pids (run kill -9 manually)"
      fi
    fi
  elif command -v fuser >/dev/null 2>&1; then
    if fuser "$port/tcp" >/dev/null 2>&1; then
      echo "  port $port: fuser -k"
      fuser -k "$port/tcp" 2>/dev/null || true
    fi
  else
    echo "Установите lsof или fuser (пакет psmisc), чтобы освобождать порты." >&2
    exit 1
  fi
}

finalize_ports() {
  sleep 0.75
  local port pids
  for port in "${PORTS[@]}"; do
    if command -v lsof >/dev/null 2>&1; then
      pids="$(lsof -ti tcp:"$port" -sTCP:LISTEN 2>/dev/null || true)"
      if [[ -n "${pids}" ]]; then
        echo "  port $port: KILL → PID(s) $pids"
        kill -KILL $pids 2>/dev/null || true
      fi
    fi
  done
}

cmd_stop() {
  echo "Остановка слушателей на портах: ${PORTS[*]}"
  local port
  for port in "${PORTS[@]}"; do
    kill_port_listeners "$port"
  done
  finalize_ports
  echo "Готово."
}

cmd_status() {
  echo "Порты MF (LISTEN):"
  local port
  for port in "${PORTS[@]}"; do
    if command -v ss >/dev/null 2>&1; then
      out="$(ss -ltnp "sport = :${port}" 2>/dev/null || true)"
      if echo "${out}" | grep -qE '^LISTEN[[:space:]]'; then
        echo "${out}"
      else
        echo "  $port — свободен"
      fi
    elif command -v lsof >/dev/null 2>&1; then
      if lsof -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1; then
        lsof -iTCP:"$port" -sTCP:LISTEN
      else
        echo "  $port — свободен"
      fi
    else
      echo "Установите ss (iproute2) или lsof для status." >&2
      exit 1
    fi
  done
}

cmd_dev() {
  cmd_stop
  echo "Запуск: npm run dev"
  exec npm run dev
}

cmd_start() {
  cmd_stop
  echo "Запуск: npm run start"
  exec npm run start
}

cmd_prod() {
  cmd_stop
  echo "Сборка и запуск: npm run prod"
  exec npm run prod
}

main() {
  local sub="${1:-}"
  case "$sub" in
    stop) cmd_stop ;;
    status) cmd_status ;;
    dev) cmd_dev ;;
    start) cmd_start ;;
    prod) cmd_prod ;;
    -h|--help|help|'') usage; [[ -n "$sub" ]] || exit 1 ;;
    *) usage; exit 1 ;;
  esac
}

main "$@"
