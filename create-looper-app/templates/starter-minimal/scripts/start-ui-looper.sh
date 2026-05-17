#!/usr/bin/env bash
# Start @ui-looper/core on :3030 (sibling clone ../ui-looper by default).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
UI_DIR="${UI_LOOPER_DIR:-$ROOT/../ui-looper}"

if [[ ! -d "$UI_DIR" ]]; then
  echo "[ui-looper] WARNING: directory not found: $UI_DIR" >&2
  echo "[ui-looper] Clone next to your project:" >&2
  echo "  git clone https://github.com/EvgenyAbc/ui-looper.git $(dirname "$ROOT")/ui-looper" >&2
  echo "[ui-looper] Shell will run; UI components need http://localhost:3030/remoteEntry.js" >&2
  exit 0
fi

if [[ ! -d "$UI_DIR/node_modules" ]]; then
  echo "[ui-looper] npm install in $UI_DIR …"
  (cd "$UI_DIR" && npm install --no-audit --no-fund)
fi

echo "[ui-looper] http://localhost:3030/remoteEntry.js"
cd "$UI_DIR"
exec npm run dev
