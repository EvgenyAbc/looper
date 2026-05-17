# Looper

## Установка

```bash
npx create-looper-app@latest
```

Имя проекта → зависимости → **http://localhost:3000**

---

## Один раз: выложить CLI на npm (чтобы `npx` работал у всех)

**Вариант А — в терминале (проще всего)**

```bash
cd looper/create-looper-app
npm publish --access public
```

Спросит `Enter OTP:` — введи **6 цифр из Google Authenticator** (запись **npm**, не GitHub). Это не «токен с сайта», это код с телефона.

**Вариант Б — без OTP в терминале (токен для GitHub Actions)**

1. https://www.npmjs.com → войти → аватар → **Access Tokens** → **Generate New Token** → **Granular Access Token**
2. Permissions: **Read and write**, пакет `create-looper-app`
3. Включи **Bypass 2FA** / **Automation** (если есть галочка)
4. **Generate** → скопируй строку `npm_xxxxxxxx…` (это и есть **токен**, один раз)
5. https://github.com/EvgenyAbc/looper → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**
   - Name: `NPM_TOKEN`
   - Secret: вставь `npm_…`
6. `cd looper && npm run deploy` — опубликует сам

---

## Деплой (GitHub + CDN)

```bash
cd looper && npm run deploy
```
