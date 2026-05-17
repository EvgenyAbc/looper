# MF remote app template

Полная инструкция (scaffold и ручное копирование, список файлов монорепы): [docs/mf-remote-new-app.md](../../docs/mf-remote-new-app.md).

Tokens (replaced by `npm run scaffold:remote -- <name> <port> [displayName]`):

| Token | Meaning |
|--------|---------|
| `__REMOTE_NAME__` | Federated remote id / folder name (e.g. `app3`) |
| `__PORT__` | Dev and `npm start` port |
| `__PACKAGE_NAME__` | Workspace package name (`@looper/<name>`) |
| `__DISPLAY_NAME__` | Sidebar label in `mock-menu.json` |

Global design tokens and primitives (`@looper/shared/styles/tokens.css`, `primitives.css`) are loaded **once** by the shell host ([`packages/shell/src/styles.css`](../../packages/shell/src/styles.css)). Remotes use only `*.module.css` for component styles — do not import those global sheets in `App.tsx`.

Manual copy checklist:

1. Copy this folder to `packages/<REMOTE_NAME>/`.
2. Replace all tokens above across files (including `className` and rspack `port`).
3. Register the workspace package: extend root `package.json` scripts (`dev`, `build`, `build:apps`, `start`, `typecheck`).
4. Add an entry to `packages/shell/public/mock-menu.json` (`id`, `entry`, `route`, `module`).
5. Add a Playwright `webServer` row in `playwright.config.ts` for e2e.
6. Optionally extend `REMOTE_PORTS` in `e2e/mf-remote-chunks.spec.ts`.
