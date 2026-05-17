# Чистый push на GitHub

В прошлый раз в looper попал каталог `.opencode/` (~200 файлов агентского мусора). Сейчас это вычищено.

## looper

```bash
cd ~/projects/looper/looper
rm -rf .git
git init -b main
git add -A
git status   # проверь: нет node_modules, dist, .opencode
git commit -m "feat: Looper MF 2.0 reference + create-looper-app"
gh repo create EvgenyAbc/looper --public --source=. --remote=origin --push
```

## ui-looper

```bash
cd ~/projects/looper/ui-looper
rm -rf .git
git init -b main
git add -A
git status   # нет node_modules, dist, storybook-static
git commit -m "feat: ui-looper MF component library"
gh repo create EvgenyAbc/ui-looper --public --source=. --remote=origin --push
```

## После push

```bash
npx create-looper-app@latest
```

(один раз: `cd create-looper-app && npm login && npm publish --access public`)
