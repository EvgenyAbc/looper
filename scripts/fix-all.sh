#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────
# fix-all.sh — deps, ESLint --fix, typecheck (looper; ui-looper optional)
# ──────────────────────────────────────────────────────────────
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
UI_LOOPER_DIR="${UI_LOOPER_DIR:-$(cd "$ROOT/../ui-looper" 2>/dev/null && pwd || true)}"

GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

DO_INSTALL=1
DO_LINT=1
DO_TYPECHECK=1
WITH_UI=0

for arg in "$@"; do
  case "$arg" in
    --quick) DO_INSTALL=0 ;;
    --lint) DO_TYPECHECK=0 ;;
    --install-only) DO_LINT=0; DO_TYPECHECK=0 ;;
    --with-ui-looper) WITH_UI=1 ;;
    -h|--help)
      sed -n '2,12p' "$0"
      exit 0
      ;;
    *)
      echo -e "${RED}Unknown option: $arg${NC}" >&2
      exit 1
      ;;
  esac
done

info()  { echo -e "${GREEN}[fix-all]${NC} $1"; }
warn()  { echo -e "${YELLOW}[fix-all]${NC} $1"; }
fail()  { echo -e "${RED}[fix-all]${NC} $1" >&2; exit 1; }

run() {
  info "$1"
  shift
  "$@"
}

if [[ "$DO_INSTALL" -eq 1 ]]; then
  run "npm install (@looper/monorepo)" bash -c "cd '$ROOT' && npm install --no-audit --no-fund"
  if [[ "$WITH_UI" -eq 1 && -n "$UI_LOOPER_DIR" && -d "$UI_LOOPER_DIR" ]]; then
    run "npm install (@ui-looper/core)" bash -c "cd '$UI_LOOPER_DIR' && npm install --no-audit --no-fund"
  fi
fi

if [[ "$DO_LINT" -eq 1 ]]; then
  run "ESLint --fix (looper)" bash -c "cd '$ROOT' && npm run lint:fix"
  if [[ "$WITH_UI" -eq 1 && -n "$UI_LOOPER_DIR" && -d "$UI_LOOPER_DIR" ]]; then
    run "ESLint --fix (ui-looper)" bash -c "cd '$UI_LOOPER_DIR' && npm run lint:fix"
  fi
fi

if [[ "$DO_TYPECHECK" -eq 1 ]]; then
  run "Typecheck @looper/monorepo" bash -c "cd '$ROOT' && npm run typecheck"
  if [[ "$WITH_UI" -eq 1 && -n "$UI_LOOPER_DIR" && -d "$UI_LOOPER_DIR" ]]; then
    run "Typecheck @ui-looper/core" bash -c "cd '$UI_LOOPER_DIR' && npm run typecheck"
  fi
fi

if [[ "$DO_LINT" -eq 1 ]]; then
  info "Lint verify (errors must be zero)…"
  set +e
  bash -c "cd '$ROOT' && npm run lint -- --quiet"
  LOOPER_LINT=$?
  UI_LINT=0
  if [[ "$WITH_UI" -eq 1 && -n "$UI_LOOPER_DIR" && -d "$UI_LOOPER_DIR" ]]; then
    bash -c "cd '$UI_LOOPER_DIR' && npm run lint -- --quiet"
    UI_LINT=$?
  fi
  set -e

  if [[ "$LOOPER_LINT" -ne 0 || "$UI_LINT" -ne 0 ]]; then
    warn "Lint still reports errors."
    exit 1
  fi
fi

echo
echo -e "${CYAN}╔══════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║  fix-all: OK                                 ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════╝${NC}"
