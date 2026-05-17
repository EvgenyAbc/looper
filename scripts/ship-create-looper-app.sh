#!/usr/bin/env bash
# Publish create-looper-app to npm → enables: npx create-looper-app@latest
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CLI="$ROOT/create-looper-app"

RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m'

die() { echo -e "${RED}error:${NC} $*" >&2; exit 1; }
ok()  { echo -e "${GREEN}✓${NC} $*"; }

if [[ -z "${NPM_OTP:-}" ]]; then
  echo -e "${CYAN}One command to enable npx create-looper-app@latest:${NC}"
  echo
  echo "  NPM_OTP=123456 npm run ship:cli"
  echo
  echo "  (123456 = code from your authenticator app, npm 2FA required)"
  echo
  die "NPM_OTP is not set"
fi

command -v npm >/dev/null || die "npm not found"
npm whoami >/dev/null 2>&1 || die "not logged in — run: npm login"

cd "$CLI"
[[ -f package.json ]] || die "create-looper-app not found at $CLI"

echo "→ dry-run pack…"
npm pack --dry-run >/dev/null
ok "package looks fine ($(node -p "require('./package.json').name")@$(node -p "require('./package.json').version"))"

echo "→ publishing to npm…"
npm publish --access public --otp="$NPM_OTP"

VER="$(node -p "require('./package.json').version")"
ok "published create-looper-app@$VER"
echo
echo -e "${GREEN}Now run:${NC}"
echo "  npx create-looper-app@latest"
echo "  npm create looper-app@latest"
