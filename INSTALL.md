# Looper

```bash
npx create-looper-app@latest
```

**Порт 3030 не нужен.** UI с CDN.

---

## Сломанный проект (ошибка `:3030`)

В папке проекта:

```bash
sed -i 's|http://localhost:3030/remoteEntry.js|https://evgenyabc.github.io/ui-looper/v1.0.0/remoteEntry.js|' packages/shell/public/mock-menu.json
npm run dev
```

Или новый проект с актуального CLI (без npm):

```bash
node /path/to/looper/create-looper-app/bin/create-looper-app.js my-app
cd my-app && npm run dev
```
