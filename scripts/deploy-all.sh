#!/usr/bin/env bash
# Push looper + ui-looper to GitHub (current branch). Optional release tags.
#
#   npm run deploy
#   bash scripts/deploy-all.sh
#   bash scripts/deploy-all.sh --tag-ui v1.0.0 --tag-cli cli-v1.0.1
#
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
UI_DIR="${UI_LOOPER_DIR:-$(dirname "$ROOT")/ui-looper}"

# GitHub slugs (override if you forked)
LOOPER_REMOTE="${LOOPER_REMOTE:-https://github.com/EvgenyAbc/looper.git}"
UI_LOOPER_REMOTE="${UI_LOOPER_REMOTE:-https://github.com/EvgenyAbc/ui-looper.git}"

TAG_UI=""
TAG_CLI=""
SKIP_VERIFY=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --tag-ui) TAG_UI="${2:?}"; shift 2 ;;
    --tag-cli) TAG_CLI="${2:?}"; shift 2 ;;
    --no-verify) SKIP_VERIFY=1; shift ;;
    -h|--help)
      echo "Usage: $(basename "$0") [--tag-ui v1.0.0] [--tag-cli cli-v1.0.1] [--no-verify]"
      exit 0
      ;;
    *) echo "Unknown option: $1" >&2; exit 1 ;;
  esac
done

GREEN='\033[0;32m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m'

info() { echo -e "${GREEN}[deploy]${NC} $*"; }
warn() { echo -e "${CYAN}[deploy]${NC} $*"; }
fail() { echo -e "${RED}[deploy]${NC} $*" >&2; exit 1; }

ensure_origin() {
  local dir="$1"
  local url="$2"
  cd "$dir"
  if ! git remote get-url origin >/dev/null 2>&1; then
    git remote add origin "$url"
    warn "Added origin → $url"
  fi
}

push_repo() {
  local dir="$1"
  local msg="$2"
  local remote_url="$3"
  local name
  name="$(basename "$dir")"

  [[ -d "$dir/.git" ]] || fail "Not a git repo: $dir"

  info "── $name ──"
  ensure_origin "$dir" "$remote_url"
  cd "$dir"
  local branch
  branch="$(git rev-parse --abbrev-ref HEAD)"

  git add -A
  if git diff --staged --quiet; then
    warn "No changes to commit ($name)"
  else
    git commit -m "$msg"
  fi

  git fetch origin "$branch" 2>/dev/null || true
  if git rev-parse "origin/$branch" >/dev/null 2>&1; then
    git pull --rebase origin "$branch"
  fi
  git push -u origin "$branch"
  info "Pushed origin/$branch ($name)"
}

setup_ui_pages() {
  command -v gh >/dev/null 2>&1 || return 0
  gh api -X POST repos/EvgenyAbc/ui-looper/pages -f build_type=workflow >/dev/null 2>&1 || true
  echo '{"name":"v*","type":"tag"}' | gh api --method POST \
    repos/EvgenyAbc/ui-looper/environments/github-pages/deployment-branch-policies \
    --input - >/dev/null 2>&1 || true
}

tag_repo() {
  local dir="$1"
  local tag="$2"
  local name
  name="$(basename "$dir")"
  cd "$dir"
  git tag -f "$tag"
  git push origin "$tag" --force
  info "Tagged and pushed $tag ($name)"
}

push_repo "$ROOT" "${DEPLOY_MSG:-chore: deploy looper}" "$LOOPER_REMOTE"
push_repo "$UI_DIR" "${DEPLOY_MSG_UI:-chore: deploy ui-looper}" "$UI_LOOPER_REMOTE"

if [[ -n "$TAG_UI" ]]; then
  setup_ui_pages
  tag_repo "$UI_DIR" "$TAG_UI"
  warn "CDN: wait for Actions → Release on ui-looper, then re-run deploy to verify"
fi
[[ -n "$TAG_CLI" ]] && tag_repo "$ROOT" "$TAG_CLI"

if [[ "$SKIP_VERIFY" -eq 0 ]]; then
  info "── verify ──"
  check() {
    local label="$1"
    shift
    if "$@" >/dev/null 2>&1; then
      echo "  OK  $label"
    else
      echo "  FAIL $label"
    fi
  }
  check "looper on GitHub" curl -fsSL "https://raw.githubusercontent.com/EvgenyAbc/looper/main/create-looper-app/package.json"
  check "ui-looper on GitHub" curl -fsSL "https://raw.githubusercontent.com/EvgenyAbc/ui-looper/main/package.json"
  check "ui-looper CDN (Pages)" curl -fsSL "https://evgenyabc.github.io/ui-looper/remoteEntry.js"
  if command -v npm >/dev/null 2>&1; then
    ver="$(npm view create-looper-app version 2>/dev/null || echo '?')"
    echo "  npm create-looper-app@$ver"
  fi
fi

info "Done. Branch is main (not master). CLI release: tag cli-v* + NPM_TOKEN. UI CDN: tag v* + Pages Actions."
