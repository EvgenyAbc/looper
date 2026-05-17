#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────
# start-all.sh — запуск @ui-looper/core + @looper/monorepo вместе
# ──────────────────────────────────────────────────────────────
# Режимы:
#   start-all.sh dev    — build --watch + serve (для разработки)
#   start-all.sh start  — production serve (нужен предварительный build)
#   start-all.sh prod   — build + serve (полный production-цикл)
#   start-all.sh stop   — остановить все сервисы
#   start-all.sh status — показать, что слушает порты
# ──────────────────────────────────────────────────────────────
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
UI_LOOPER_DIR="$(cd "$ROOT/../ui-looper" && pwd)"
LOOPER_DIR="$ROOT"

GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

info()  { echo -e "${GREEN}[start-all]${NC} $1"; }
warn()  { echo -e "${YELLOW}[start-all]${NC} $1"; }
error() { echo -e "${RED}[start-all]${NC} $1"; }

UI_PID=""
LOOPER_PID=""

usage() {
  echo "Usage: $(basename "$0") <command>"
  echo
  echo "  dev    — запустить всё в dev-режиме (build --watch + serve)"
  echo "  start  — запустить production serve (требуется предварительный build)"
  echo "  prod   — production сборка + serve"
  echo "  stop   — остановить все сервисы"
  echo "  status — показать состояние всех портов"
}

# ── Вспомогательные функции ───────────────────────────────────

kill_port_3030() {
  local pids
  if command -v lsof >/dev/null 2>&1; then
    pids="$(lsof -ti tcp:3030 -sTCP:LISTEN 2>/dev/null || true)"
    if [[ -n "$pids" ]]; then
      kill -TERM $pids 2>/dev/null || true
      sleep 0.3
      pids="$(lsof -ti tcp:3030 -sTCP:LISTEN 2>/dev/null || true)"
      if [[ -n "$pids" ]]; then
        kill -KILL $pids 2>/dev/null || true
      fi
    fi
  fi
}

wait_for_port_3030() {
  local wait=0
  while ! (command -v ss >/dev/null 2>&1 && ss -ltn "sport = :3030" 2>/dev/null | grep -qE '^LISTEN') && \
        ! (command -v lsof >/dev/null 2>&1 && lsof -iTCP:3030 -sTCP:LISTEN >/dev/null 2>&1); do
    sleep 0.5
    wait=$((wait + 1))
    if [[ $wait -gt 10 ]]; then
      warn "Таймаут ожидания @ui-looper/core на порту 3030"
      return 1
    fi
  done
}

# ── Остановка всех процессов ─────────────────────────────────
stop_all() {
  info "Остановка всех сервисов…"

  # Останавливаем looper (через его штатный скрипт; 3030 там нет)
  if [[ -f "$LOOPER_DIR/scripts/looper-services.sh" ]]; then
    bash "$LOOPER_DIR/scripts/looper-services.sh" stop 2>/dev/null || true
  fi

  # Останавливаем ui-looper
  if [[ -n "$UI_PID" ]] && kill -0 "$UI_PID" 2>/dev/null; then
    kill -TERM "$UI_PID" 2>/dev/null || true
    sleep 0.5
    kill -KILL "$UI_PID" 2>/dev/null || true
  fi

  # Добиваем порт 3030
  kill_port_3030

  info "Все сервисы остановлены."
}

# ── Статус ────────────────────────────────────────────────────
status_all() {
  echo -e "${CYAN}╔════════════════════════════════════════╗${NC}"
  echo -e "${CYAN}║        Состояние всех сервисов         ║${NC}"
  echo -e "${CYAN}╚════════════════════════════════════════╝${NC}"
  echo

  bash "$LOOPER_DIR/scripts/looper-services.sh" status 2>/dev/null || true
  echo

  local port=3030
  if command -v ss >/dev/null 2>&1; then
    local out
    out="$(ss -ltnp "sport = :${port}" 2>/dev/null || true)"
    if echo "$out" | grep -qE '^LISTEN[[:space:]]'; then
      echo "  :$port — @ui-looper/core"
      echo "$out" | head -1
    else
      echo "  :$port — @ui-looper/core: свободен"
    fi
  elif command -v lsof >/dev/null 2>&1; then
    if lsof -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1; then
      echo "  :$port — @ui-looper/core"
      lsof -iTCP:"$port" -sTCP:LISTEN
    else
      echo "  :$port — @ui-looper/core: свободен"
    fi
  fi
}

# ── Запуск @ui-looper/core ────────────────────────────────────
start_ui_looper() {
  local mode="$1"  # "dev" или "start"

  info "Запуск @ui-looper/core (режим: $mode)…"

  if [[ ! -d "$UI_LOOPER_DIR" ]]; then
    error "Директория @ui-looper/core не найдена: $UI_LOOPER_DIR"
    exit 1
  fi

  if [[ ! -d "$UI_LOOPER_DIR/node_modules" ]]; then
    warn "Устанавливаю зависимости @ui-looper/core…"
    (cd "$UI_LOOPER_DIR" && npm install) || {
      error "npm install в @ui-looper/core не удался"
      exit 1
    }
  fi

  case "$mode" in
    dev)
      (cd "$UI_LOOPER_DIR" && exec npx concurrently -k -n watch,serve -c cyan,magenta \
        "npx rspack build --watch" \
        "npx serve dist -l 3030 -C --no-port-switching") &
      UI_PID=$!
      info "@ui-looper/core запущен (PID $UI_PID) на http://localhost:3030"
      info "remoteEntry: http://localhost:3030/remoteEntry.js"
      ;;
    start)
      (cd "$UI_LOOPER_DIR" && exec npx serve dist -l 3030 -C --no-port-switching) &
      UI_PID=$!
      info "@ui-looper/core (production) запущен (PID $UI_PID) на http://localhost:3030"
      ;;
  esac

  wait_for_port_3030 || true
}

# ── Запуск @looper/monorepo ───────────────────────────────────
start_looper() {
  local mode="$1"

  info "Запуск @looper/monorepo (режим: $mode)…"

  case "$mode" in
    dev)
      (cd "$LOOPER_DIR" && exec npm run dev) &
      LOOPER_PID=$!
      ;;
    start)
      (cd "$LOOPER_DIR" && exec npm run start) &
      LOOPER_PID=$!
      ;;
  esac

  info "@looper/monorepo запущен (PID $LOOPER_PID)"
}

# ── Главная функция ───────────────────────────────────────────
main() {
  local sub="${1:-}"

  case "$sub" in
    dev)
      stop_all
      start_ui_looper "dev"
      sleep 1
      start_looper "dev"
      ;;

    start)
      # Требует предварительного build — не делаем его здесь
      stop_all
      start_ui_looper "start"
      sleep 1
      start_looper "start"
      ;;

    prod)
      # Отделяем build от serve, чтобы избежать конфликта портов
      # (npm run prod внутри looper больше не трогает 3030).
      stop_all

      info "Сборка @ui-looper/core…"
      (cd "$UI_LOOPER_DIR" && NODE_ENV=production npx rspack build) || {
        error "build @ui-looper/core не удался"
        exit 1
      }

      info "Сборка @looper/monorepo…"
      (cd "$LOOPER_DIR" && NODE_ENV=production npm run build) || {
        error "build @looper/monorepo не удался"
        exit 1
      }

      info "Сборка завершена. Запуск сервисов…"
      start_ui_looper "start"
      sleep 1
      start_looper "start"
      ;;

    stop)
      stop_all
      ;;

    status)
      status_all
      ;;

    -h|--help|help|'')
      usage
      [[ -n "$sub" ]] || exit 1
      ;;
    *)
      usage
      exit 1
      ;;
  esac

  # Баннер
  if [[ "$sub" =~ ^(dev|start|prod)$ ]]; then
    echo
    echo -e "${CYAN}╔══════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║     Все сервисы запущены                            ║${NC}"
    echo -e "${CYAN}║                                                    ║${NC}"
    echo -e "${CYAN}║  @ui-looper/core  →  http://localhost:3030          ║${NC}"
    echo -e "${CYAN}║  @looper/shell    →  http://localhost:3000          ║${NC}"
    echo -e "${CYAN}║  @looper/app4/UI  →  http://localhost:3000/app2/app4/ui-kit${NC}"
    echo -e "${CYAN}║                                                    ║${NC}"
    echo -e "${CYAN}║  Для остановки: npm run services:stop:all           ║${NC}"
    echo -e "${CYAN}║  Или нажмите Ctrl+C                                ║${NC}"
    echo -e "${CYAN}╚══════════════════════════════════════════════════════╝${NC}"
    echo

    # Ожидаем завершения любого из процессов
    set +e
    wait -n $LOOPER_PID $UI_PID 2>/dev/null
    local exit_code=$?
    set -e

    if [[ $exit_code -ne 0 ]] && [[ $exit_code -ne 127 ]]; then
      error "Один из процессов завершился с ошибкой (код: $exit_code)"
      stop_all
      exit $exit_code
    fi
  fi
}

# ── Обработка сигналов ────────────────────────────────────────
cleanup() {
  echo
  warn "Получен сигнал завершения…"
  stop_all
  exit 0
}
trap cleanup SIGINT SIGTERM

main "$@"
