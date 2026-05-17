# Установка Looper — без боли

## Сейчас (без npm publish)

Одна команда — wizard как `npx create-looper-app`, тянет с GitHub:

```bash
curl -fsSL https://raw.githubusercontent.com/EvgenyAbc/looper/main/scripts/run-create-looper-app.sh | bash
```

С именем проекта:

```bash
curl -fsSL https://raw.githubusercontent.com/EvgenyAbc/looper/main/scripts/run-create-looper-app.sh | bash -s -- my-app
```

## Чтобы работало `npx create-looper-app@latest`

**Один раз** (без OTP на каждый publish):

1. https://www.npmjs.com → **Access Tokens** → **Granular Access Token**
   - Permissions: **Read and write**
   - Packages: `create-looper-app` (or all)
   - Enable **Automation** / bypass 2FA for publish (if offered)

2. https://github.com/EvgenyAbc/looper → **Settings** → **Secrets** → **Actions** → New secret:
   - Name: `NPM_TOKEN`
   - Value: paste token

3. В терминале:

```bash
cd looper
git add -A && git commit -m "chore: publish CLI via Actions" && git push
git tag cli-v1.0.0 && git push origin cli-v1.0.0
```

4. Открой **Actions** на GitHub — дождись зелёной галочки.

5. Проверка:

```bash
npx create-looper-app@latest
```

## Локальный publish (если всё же с OTP)

```bash
NPM_OTP=123456 npm run ship:cli
```
