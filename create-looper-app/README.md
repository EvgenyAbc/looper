# create-looper-app

```bash
npx create-looper-app@latest
```

Or:

```bash
npm create looper-app@latest
```

Interactive wizard: project name → template → ui-looper (none / GitHub CDN / local) → Docker → git init.

## Flags

```bash
npx create-looper-app@latest my-app -- --template minimal --ui cdn --ui-version v1.0.0 --docker compose
```

| Flag | Values |
|------|--------|
| `--ui` | `none`, `cdn`, `local` |
| `--docker` | `none`, `compose` |

## Maintainer: publish to npm (once)

```bash
cd create-looper-app
npm login
npm publish --access public
```

After that, users only need `npx create-looper-app@latest`.
