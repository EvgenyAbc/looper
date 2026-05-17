#!/usr/bin/env bash
# Publish create-looper-app → enables npx create-looper-app@latest
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CLI="$ROOT/create-looper-app"

cd "$CLI"
command -v npm >/dev/null || { echo "npm not found" >&2; exit 1; }
npm whoami >/dev/null 2>&1 || { echo "run: npm login" >&2; exit 1; }

VER="$(node -p "require('./package.json').version")"
echo "→ publish create-looper-app@${VER}"
echo "  (если спросит Enter OTP — 6 цифр из приложения для npmjs.com)"
echo

if [[ -n "${NPM_OTP:-}" ]]; then
  npm publish --access public --otp="$NPM_OTP"
else
  npm publish --access public
fi

echo
echo "✓ готово: npx create-looper-app@latest"
