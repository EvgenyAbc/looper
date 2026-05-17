# MF remote app template

Tokens (replaced by `npm run scaffold:remote -- <name> <port> [displayName]`):

| Token | Meaning |
|--------|---------|
| `app3` | Federated remote id / folder name (e.g. `app3`) |
| `3004` | Dev and `npm start` port |
| `@looper/app3` | Workspace package name (`@looper/<name>`) |
| `App three` | Sidebar label in `mock-menu.json` |

Manual copy checklist:

1. Copy this folder to `packages/<REMOTE_NAME>/`.
2. Replace all tokens above across files (including `className` and rspack `port`).
3. Register the workspace package: extend root `package.json` scripts (`dev`, `build`, `build:apps`, `start`, `typecheck`).
4. Add an entry to `packages/shell/public/mock-menu.json` (`id`, `entry`, `route`, `module`).
5. Add a Playwright `webServer` row in `playwright.config.ts` for e2e.
6. Optionally extend `REMOTE_PORTS` in `e2e/mf-remote-chunks.spec.ts`.
