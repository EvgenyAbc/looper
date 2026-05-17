#!/usr/bin/env bash
# MF remote dev: disk build (correct shared/ConsumeShared) + static serve + watch.
# Avoid rspack serve — it compiles exposes with direct node_modules/react/jsx-dev-runtime.
set -euo pipefail

PORT="${1:?usage: mf-remote-dev.sh <port>}"
export NODE_ENV=development

npx rspack build
exec npx concurrently -k -n watch,serve -c cyan,magenta \
  "npx rspack build --watch" \
  "npx serve dist -l ${PORT} -C --no-port-switching"
