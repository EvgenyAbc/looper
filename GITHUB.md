# GitHub

| Repo | URL |
|------|-----|
| looper | https://github.com/EvgenyAbc/looper |
| ui-looper | https://github.com/EvgenyAbc/ui-looper |

## New project

```bash
npx create-looper-app@latest
```

(Requires one-time `npm publish` of `create-looper-app` — see [create-looper-app/README.md](create-looper-app/README.md).)

## Push changes

```bash
cd looper && npm run deploy
# or: git push origin main
cd ui-looper && git add -A && git commit -m "..." && git push origin main
```

## ui-looper CDN (GitHub Pages)

```
https://evgenyabc.github.io/ui-looper/remoteEntry.js
https://evgenyabc.github.io/ui-looper/v1.0.0/remoteEntry.js
```

Tag release: `git tag v1.0.0 && git push origin v1.0.0` (enable Pages → GitHub Actions in repo settings).
