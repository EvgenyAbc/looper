# Новое MF-remote приложение (appX)

Два способа: **скрипт** (рекомендуется) или **ручное копирование** шаблона [`templates/mf-remote-app/`](../templates/mf-remote-app/).

## Способ 1: scaffold (рекомендуется)

Из корня монорепы:

```bash
npm run scaffold:remote -- <имя> <порт> ["Название в меню"]
```

Пример:

```bash
npm run scaffold:remote -- app4 3005 "Мой модуль"
npm install
npm run dev
```

**Ограничения:**

- Имя remote: одна латинская буква в начале, дальше буквы/цифры (например `app4`, `billing`).
- Порт не должен совпадать с зарезервированными: **3000** (shell), **3002** (app1), **3003** (app2).

Скрипт сам:

| Что делает | Файл |
|------------|------|
| Копирует шаблон в `packages/<имя>/` и подставляет токены | новый каталог пакета |
| Добавляет dev/build/start/typecheck для нового workspace | [`package.json`](../package.json) (корень) |
| Регистрирует remote в меню шелла | [`packages/shell/public/mock-menu.json`](../packages/shell/public/mock-menu.json) |
| Поднимает dev-сервер нового приложения в e2e | [`playwright.config.ts`](../playwright.config.ts) |
| Добавляет порт в проверку mf-manifest | [`e2e/mf-remote-chunks.spec.ts`](../e2e/mf-remote-chunks.spec.ts) (`REMOTE_PORTS`) |
| Добавляет порт для `services:*` / `*:fresh` | [`scripts/looper-services.sh`](../scripts/looper-services.sh) (`PORTS`) |

После scaffold правите только код внутри `packages/<имя>/` (роуты, страницы, стили).

## CSS Modules

Общие правила Rspack вынесены в [`rspack.shared.mjs`](../rspack.shared.mjs):

- **`rspackCssRules()`** — файлы `*.module.css` собираются как `css/module`, обычный `*.css` (без суффикса `.module`) как глобальный `css`. Глобальные токены/layout оставляйте в обычных `.css` (как [`packages/shell/src/styles.css`](../packages/shell/src/styles.css)); компонентные стили — в `*.module.css`.
- **`rspackCssModuleGenerator()`** — `localIdentName` с `[uniqueName]`, чтобы имена классов не пересекались между shell и remotes на одной странице.
- **`rspackCssModuleParser()`** — `namedExports: false`, чтобы использовать **`import styles from './X.module.css'`** и **`styles.className`**; при `namedExports: true` удобнее **`import * as styles`** или **`import { локальныйКласс }`**.

Типы для `*.module.css`: [`types/css-modules.d.ts`](../types/css-modules.d.ts); в `tsconfig` пакетов он подключён через `include`.

Продакшен-сборка кладёт CSS рядом с чанками (например `__federation_expose_App.css` у remote), без отдельного `mini-css-extract` поверх нативного `css/module`.

## Страницы и виджеты в меню

В [`packages/shared/src/types.ts`](../packages/shared/src/types.ts) у пункта меню есть:

- **`displayMode`**: по умолчанию страница; значение **`widget`** — только встройка через слоты шелла (без записи в React Router как отдельный маршрут и без пункта в сайдбаре).
- **`remoteName`**: имя MF-контейнера для `init()` и `loadRemote` (совпадает с `ModuleFederationPlugin.name` в remote); если не задано — используется **`id`**. Несколько записей меню (страница + виджет) могут делить один **`remoteName`** и **`entry`**; shell регистрирует контейнер **один раз**, а загрузка модулей идёт через разные **`module`** (например `./App` и `./Widget`).
- **`widgetSlot`**: строка-слот, где шелл рендерит виджет (см. [`WidgetSlot.tsx`](../packages/shell/src/components/WidgetSlot.tsx); на главной — слот **`home`**).

В шаблоне remote объявлен второй expose `./Widget` в [`templates/mf-remote-app/rspack.config.ts`](../templates/mf-remote-app/rspack.config.ts). В JSON меню у виджета поле **`route`** не обязательно.

---

## Способ 2: вручную из шаблона

### Шаг A — новый пакет

1. Скопируйте каталог `templates/mf-remote-app/` в `packages/<REMOTE_NAME>/` (например `packages/app4/`).

2. Во **всех** файлах нового пакета замените токены (таблица также в [`templates/mf-remote-app/README.md`](../templates/mf-remote-app/README.md)):

| Токен | На что заменить |
|-------|------------------|
| `__REMOTE_NAME__` | Имя remote и папки (`app4`) |
| `__PORT__` | Число порта (**без кавычек** в `rspack.config.ts`) |
| `__PACKAGE_NAME__` | `@looper/<REMOTE_NAME>` |
| `__DISPLAY_NAME__` | Подпись в сайдбаре |

Затронутые файлы внутри пакета обычно: `package.json`, `rspack.config.ts`, `src/App.tsx`, `src/Widget.tsx`, `src/pages/HomePage.tsx`, `README.md`.

### Шаг B — монорепа (обязательно, иначе shell не узнает remote)

Отредактируйте вручную:

| Файл | Что сделать |
|------|-------------|
| [`package.json`](../package.json) (корень) | В скриптах `dev`, `build`, `build:apps`, `start`, `typecheck` добавить команду для `-w packages/<REMOTE_NAME>` (порядок: remote-приложения перед shell там, где есть shell). Для `dev` через `concurrently` нужно согласовать `-n`, `-c` и порядок кавычек-команд с остальными пакетами. |
| [`packages/shell/public/mock-menu.json`](../packages/shell/public/mock-menu.json) | В массив `apps` добавить объект: `id`, `name`, `entry` (`http://localhost:<PORT>/remoteEntry.js`), `route` (`/<id>/*`), `module`: `"./App"`, плюс `icon`, `features`, `permissions` по аналогии с app1/app2. |
| [`playwright.config.ts`](../playwright.config.ts) | В `webServer` добавить строку `{ command: 'npm run dev -w packages/<REMOTE_NAME>', port: <PORT>, ... }` **перед** записью для `packages/shell`. |
| [`e2e/mf-remote-chunks.spec.ts`](../e2e/mf-remote-chunks.spec.ts) | В `REMOTE_PORTS` добавить `<REMOTE_NAME>: <PORT>`, чтобы проверка mf-manifest охватывала новый remote. |
| [`scripts/looper-services.sh`](../scripts/looper-services.sh) | В массив `PORTS` добавить `<PORT>` (или см. `npm run services:*`). |

### Шаг C — проверка

```bash
npm install
npm run typecheck
npm run dev
```

Откройте маршрут из меню (например `/app4`): модуль грузится через runtime MF, код shell менять не нужно.

---

## `npm run start`: remote слушает не тот порт

Утилита **`serve`** по умолчанию при занятом порту молча выбирает другой (случайный). Тогда в логах будет не `localhost:3004`, а произвольный порт, а `mock-menu.json` по-прежнему указывает на заявленный порт — federated-модули перестают находиться.

Во всех пакетах скрипт `start` вызывает `serve … --no-port-switching`: если порт занят, процесс завершится с ошибкой вместо «тихого» переключения. Освободите порт (чаще всего остаётся висящий `npm run dev` на том же приложении) и запустите `npm run start` снова.

---

## Стоп и запуск на нужных портах

Скрипт [`scripts/looper-services.sh`](../scripts/looper-services.sh) завершает процессы, которые слушают порты shell и MF-remotes (по умолчанию **3000**, **3002**, **3003**, **3004**), затем при необходимости запускает обычные npm-скрипты монорепы.

Нужны **`lsof`** или **`fuser`** (пакет `psmisc`) для освобождения портов; для **`services:status`** удобно наличие **`ss`** (`iproute2`).

| Команда | Действие |
|---------|----------|
| `npm run services:stop` | только освободить порты |
| `npm run services:status` | кто слушает порты |
| `npm run dev:fresh` | стоп → `npm run dev` |
| `npm run start:fresh` | стоп → `npm run start` (нужны собранные `dist`) |
| `npm run prod:fresh` | стоп → `npm run prod` |

После добавления нового remote через **`npm run scaffold:remote`** порт подставляется в **`PORTS`** в `scripts/looper-services.sh` автоматически. Если приложение добавляли вручную, допишите порт в этот массив.

---

## Справка по архитектуре

- Общие singleton-зависимости для remote задаются в [`rspack.shared.mjs`](../rspack.shared.mjs) (`sharedFromHost`); для нового приложения этот файл обычно **не** правят.
- Регистрация menu-remotes: [`loadShellRuntime()`](../packages/shell/src/loaders/shellRuntime.ts) (loader + `patchRoutes`) из [`mock-menu.json`](../packages/shell/public/mock-menu.json); embed-remotes регистрирует родитель через `FederatedMount` + `entry` (см. [`mf-embed-remote-app.md`](./mf-embed-remote-app.md)).
