#!/usr/bin/env bash
# One command: create project, npm install, start dev server.
#   curl -fsSL https://raw.githubusercontent.com/EvgenyAbc/looper/main/scripts/install-looper.sh | bash
#   curl -fsSL ... | bash -s -- my-app
set -euo pipefail

PROJECT="${1:-my-looper-app}"
REPO="${LOOPER_INSTALL_REPO:-https://github.com/EvgenyAbc/looper.git}"
BRANCH="${LOOPER_INSTALL_BRANCH:-main}"
TARGET="$(pwd)/$PROJECT"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

if [[ -e "$TARGET" ]]; then
  echo "error: already exists: $TARGET" >&2
  exit 1
fi

echo "→ looper installer ($PROJECT)…"
git clone --depth 1 --branch "$BRANCH" "$REPO" "$TMP" 2>/dev/null || git clone --depth 1 "$REPO" "$TMP"

cd "$TMP/create-looper-app"
npm install --omit=dev --no-audit --no-fund --silent

node bin/create-looper-app.js "$TARGET" --git no --no-install

cd "$TARGET"
npm install --no-audit --no-fund

echo ""
echo "→ http://localhost:3000"
exec npm run dev
