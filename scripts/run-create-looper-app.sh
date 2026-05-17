#!/usr/bin/env bash
# Run create-looper-app WITHOUT npm registry (works before npm publish).
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/EvgenyAbc/looper/main/scripts/run-create-looper-app.sh | bash
#   curl -fsSL ... | bash -s -- my-app --template minimal --ui none
set -euo pipefail

REPO="${LOOPER_INSTALL_REPO:-https://github.com/EvgenyAbc/looper.git}"
BRANCH="${LOOPER_INSTALL_BRANCH:-main}"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

echo "→ clone looper ($BRANCH)…"
git clone --depth 1 --branch "$BRANCH" "$REPO" "$TMP" 2>/dev/null || git clone --depth 1 "$REPO" "$TMP"

cd "$TMP/create-looper-app"
echo "→ install CLI deps…"
npm install --omit=dev --no-audit --no-fund --silent

echo "→ create-looper-app…"
exec node bin/create-looper-app.js "$@"
