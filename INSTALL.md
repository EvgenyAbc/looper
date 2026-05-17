# Looper — как запустить

## Скинь коллеге

```bash
npx create-looper-app@latest my-app -- --ui cdn --ui-version v1.0.0
cd my-app && npm run dev
```

Браузер: **http://localhost:3000**

Пока на npm старая `1.0.0` — флаги `--ui cdn` **обязательны**. После `1.0.2` достаточно `npx create-looper-app@latest`.

**Без npm** (всегда свежий CLI с GitHub):

```bash
curl -fsSL https://raw.githubusercontent.com/EvgenyAbc/looper/main/scripts/run-create-looper-app.sh | bash -s -- my-app
cd my-app && npm run dev
```

---

## Уже создал проект и ошибка `:3030`?

В `packages/shell/public/mock-menu.json` замени entry:

```json
"entry": "https://evgenyabc.github.io/ui-looper/v1.0.0/remoteEntry.js"
```

Перезапусти `npm run dev`.

---

## Maintainer

```bash
cd looper && npm run deploy
npm run deploy -- --tag-ui v1.0.0 --tag-cli cli-v1.0.2
```
