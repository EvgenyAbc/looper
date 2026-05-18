#!/usr/bin/env bash
# Wrapper for Linux/macOS; Windows: use `node scripts/looper-services.mjs` directly.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
exec node "$ROOT/scripts/looper-services.mjs" "$@"
