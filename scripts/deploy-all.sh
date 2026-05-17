#!/usr/bin/env bash
# Push looper + ui-looper + CDN tag. No npm.
#   cd looper && npm run deploy
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
UI_DIR="${UI_LOOPER_DIR:-$(dirname "$ROOT")/ui-looper}"
LOOPER_REMOTE="${LOOPER_REMOTE:-https://github.com/EvgenyAbc/looper.git}"
UI_LOOPER_REMOTE="${UI_LOOPER_REMOTE:-https://github.com/EvgenyAbc/ui-looper.git}"

GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m'
info() { echo -e "${GREEN}[deploy]${NC} $*"; }
warn() { echo -e "${CYAN}[deploy]${NC} $*"; }

ensure_origin() {
  cd "$1"
  if ! git remote get-url origin >/dev/null 2>&1; then
    git remote add origin "$2"
    warn "Added origin → $2"
  fi
}

push_repo() {
  local dir="$1" msg="$2" url="$3" name
  name="$(basename "$dir")"
  info "── $name ──"
  ensure_origin "$dir" "$url"
  cd "$dir"
  local branch
  branch="$(git rev-parse --abbrev-ref HEAD)"
  git add -A
  if ! git diff --staged --quiet; then
    git commit -m "$msg"
  else
    warn "nothing to commit ($name)"
  fi
  git fetch origin "$branch" 2>/dev/null || true
  if git rev-parse "origin/$branch" >/dev/null 2>&1; then
    git pull --rebase origin "$branch" || true
  fi
  git push -u origin "$branch"
}

setup_ui_pages() {
  command -v gh >/dev/null 2>&1 || return 0
  gh api -X POST repos/EvgenyAbc/ui-looper/pages -f build_type=workflow >/dev/null 2>&1 || true
  echo '{"name":"v*","type":"tag"}' | gh api --method POST \
    repos/EvgenyAbc/ui-looper/environments/github-pages/deployment-branch-policies \
    --input - >/dev/null 2>&1 || true
}

tag_push() {
  local dir="$1" tag="$2"
  cd "$dir"
  git tag -f "$tag"
  git push origin "$tag" --force
  info "tag $tag → $(basename "$dir")"
}

UI_VER="$(node -p "require('$UI_DIR/package.json').version")"
TAG_UI="v${UI_VER}"

push_repo "$ROOT" "chore: deploy" "$LOOPER_REMOTE"
push_repo "$UI_DIR" "chore: deploy" "$UI_LOOPER_REMOTE"

setup_ui_pages
tag_push "$UI_DIR" "$TAG_UI"

info "── verify ──"
for label in looper ui-looper CDN install-script; do
  case "$label" in
    looper) url="https://raw.githubusercontent.com/EvgenyAbc/looper/main/create-looper-app/package.json" ;;
    ui-looper) url="https://raw.githubusercontent.com/EvgenyAbc/ui-looper/main/package.json" ;;
    CDN) url="https://evgenyabc.github.io/ui-looper/remoteEntry.js" ;;
    install-script) url="https://raw.githubusercontent.com/EvgenyAbc/looper/main/scripts/install-looper.sh" ;;
  esac
  if curl -fsSL "$url" >/dev/null 2>&1; then
    echo "  OK  $label"
  else
    echo "  …  $label"
  fi
done
info "done — install: curl install-looper.sh (see INSTALL.md)"
