# Module Federation 2.0 — заметки по этому репозиторию

Документ зафиксирован для будущих сессий: как устроены host / remote, что считается «правильно» по документации MF 2.0 и где смотреть первичные источники.

## Карта примеров: что включено → как выглядит билд / рантайм

Ниже — **не** все комбинации мира MF, а ориентиры для **этого** репозитория. После изменения флагов всегда перезапускать `npm run build` и смотреть `packages/*/dist/` и `mf-manifest.json`.

### Remote (app1 / app2): `shared` и `import`

| Включено | Ожидаемый артефакт / manifest | Примечание |
|----------|----------------------------------|------------|
| **`import: false`** на `react`, `react-dom`, `react-router`, `@looper/shared` (как в [`sharedFromHost`](../rspack.shared.mjs)) | В `packages/app1/dist/*.js` только **`remoteEntry.js`** и **`__federation_expose_*.js`** (плюс манифест/stats). В `mf-manifest.json` у **`shared`** → **`assets.js.sync` / `async` пустые**. | Remote **не** тянет второй копией framework; нужен хост с тем же `shared` и обычно **`eager: true`**. |
| То же, но **без** `import: false` (fallback внутри remote) | Появляются **дополнительные числовые / vendor чанки** в `dist/`; в manifest у shared — **непустые** `sync`/`async` с путями к `.js`. | Больший **объём загрузки с origin remote**; дубль версий, если не `singleton`. |
| **`singleton: false`** для React | Теоретически две копии React — **ломает контексты**. В проекте везде **`singleton: true`**. | Не использовать для React/router/shared-пакета. |

### Host (shell): `eager` у `shared`

| Включено | Ожидаемый эффект | Примечание |
|----------|-------------------|------------|
| **`eager: true`** (как в [`sharedEagerHost`](../rspack.shared.mjs)) | Shared попадают в **стартовые чанки** shell (`react*.js`, `react-dom*.js`, …, `main.js`). Можно синхронно стартовать приложение и отдавать scope до `init(remotes)`. | Раздувает **первую загрузку** shell — осознанный обмен на простоту и контексты. |
| **`eager: false`** на хосте | Shared чаще **асинхронные**; риск **RUNTIME-012 / loadShare** при раннем обращении remote, если scope ещё не готов. | Для текущего shell с провайдерами обычно **не** целевая конфигурация. |

### Remote: `shareStrategy`

| Значение | Поведение (по докам MF) | Артефакты |
|----------|---------------------------|-----------|
| **`loaded-first`** (у app1/app2 сейчас) | Сначала переиспользуются **уже загруженные** shared (хост); remotes **по запросу**; проще пережить **offline** remote на старте. | Тот же `remoteEntry.js` по размеру порядка с `version-first`; отличие в **логике рантайма**, не в количестве файлов в `dist`. |
| **`version-first`** (дефолт плагина) | Приоритет версий; при инициализации может **раньше трогать** remote entry для согласования shared. | Если remote **недоступен** на старте — чаще ошибки на **bootstrap**, а не при первом клике. |

### Remote: production `entry`

| Режим | `packages/app1/dist` после `npm run build` | Примечание |
|---------|---------------------------------------------|------------|
| **`entry: {}`** при `NODE_ENV=production` (как сейчас) | Нет **`main.js`** у remote — только контейнер + expose. | Меньше лишнего с origin remote. |
| **`entry: './src/bootstrap.tsx'`** в production | Появляется **ещё один крупный `.js`** (аналог бывшего main) с dev-bootstrap. | Обычно **не нужен**, если remote живёт только из shell. |

### Shell: `baseOptimization({ shell: true })` vs remote

| Где | `splitChunks` | Типичная картина `packages/shell/dist` |
|------|----------------|----------------------------------------|
| **`shell: true`** | [`shellSplitChunks`](../rspack.shared.mjs) | Отдельные **`react.js`**, **`react-dom.js`**, **`react-router.js`**, **`mf-runtime.js`**, **`main.js`** (плюс `index.html`, стили, копия `public/`). |
| **`shell: false`** (или забыли флаг) | `vendorSplitChunks` | Один тяжёлый **`vendor.js`** + **`main.js`** — проще, но хуже кеш и прозрачность бюджета. |
| **Remote** `baseOptimization({ remote: true })` | `vendorSplitChunks` + `concatenateModules: false` в prod | У remote — **не** именованные react-чанки как у shell; обычно мало файлов, если `import: false`. |

### Сборка: `devtool` (shell / remote)

| Режим | Эффект |
|---------|--------|
| **`NODE_ENV=production`** (как в корневом `npm run build`) | В прод-артефактах **нет** `.map` рядом с основными JS (у вас `devtool: false` в prod). |
| **Development** (`rspack serve`) | **`source-map`** — удобно отлаживать, тяжелее в Network. |

### Host + remote: `experiments` (runtime-core на shell)

| Включено | Ожидаемый эффект | Примечание |
|----------|-------------------|------------|
| Shell: **`provideExternalRuntime: true`** ([`mfExperimentsHost`](../rspack.shared.mjs)) | При первом `init()` в [`shellRuntime.ts`](../packages/shell/src/loaders/shellRuntime.ts) в глобал кладётся `_FEDERATION_RUNTIME_CORE` (inject-плагин MF). | Только на **хосте без `exposes`**. |
| Remote: **`externalRuntime: true`** + `optimization.target: 'web'`, **`disableSnapshot: true`** ([`mfExperimentsRemote`](../rspack.shared.mjs)) | `remoteEntry.js` **~43 KB** raw / **~14 KB** gzip (вместо ~100 KB / ~30 KB без флагов). Остаётся контейнерный bootstrap + shared mapping, без вшитого runtime-core. | Remote **обязан** грузиться после `init()` shell; standalone origin не работает. |
| Remote с **`externalRuntime`**, shell **без** `provideExternalRuntime` | **Падение** при загрузке remote entry — нет глобала runtime-core. | Пара включается **вместе**. |

### Связка «хост + remote» (обязательно вместе)

| Сценарий | Результат |
|---------|-----------|
| Remote с **`import: false`**, хост **без** соответствующих пакетов в `shared` | **Падение в рантайме** (нет fallback в бандле remote). |
| Remote с **`import: false`**, открыть **только** `http://localhost:3002` без shell | Часто **не работает** — нет провайдера shared и runtime-core; по дизайну **shell-first**. |

---

## Официальные источники (приоритет)

- [shared](https://module-federation.io/configure/shared) — `singleton`, `requiredVersion`, `eager`, **`import: false`** (не упаковывать в продукт, только consumer/host).
- **Remotes** компилируются с `swcTsxRemote` (`runtime: 'classic'`) + `mfRemoteProvidePlugin`; **`entry: {}`** в dev (без bootstrap → без `vendor.js` с `react-jsx-dev-runtime`). Host — `swcTsxHost` (`automatic`).
- Для React 19 + automatic JSX в remote также шарить **`react/jsx-runtime`** и **`react/jsx-dev-runtime`** (иначе `dispatcher.getOwner is not a function` в dev при виджетах/exposes).
- [experiments](https://module-federation.io/configure/experiments) — **`externalRuntime`** / **`provideExternalRuntime`**, `optimization.target`, `disableSnapshot`.
- [shareStrategy](https://module-federation.io/configure/sharestrategy) — `version-first` vs **`loaded-first`** (переиспользование уже загруженного shared, remotes по запросу, устойчивее к offline remotes на старте).
- [Rspack + enhanced](https://module-federation.io/guide/build-plugins/plugins-rspack) — `@module-federation/enhanced`, плагин из `@module-federation/enhanced/rspack`.
- Агрегатор доков для инструментов: [Context7 / module-federation](https://context7.com/module-federation) — удобно как указатель; **источник правды** — module-federation.io и фактический `mf-manifest.json` после сборки.

## Конфигурация в этом монорепо

| Слой | Файл | Суть |
|------|------|------|
| Общие правила | [`rspack.shared.mjs`](../rspack.shared.mjs) | `sharedFromHost`, `sharedEagerHost`, **`mfExperimentsHost`**, **`mfExperimentsRemote`**. |
| Remote (app1–app3, template) | [`packages/app1/rspack.config.ts`](../packages/app1/rspack.config.ts), … | `exposes`, **`shareStrategy: 'loaded-first'`**, `shared: sharedFromHost`, **`experiments: mfExperimentsRemote`**, `mf-manifest.json`. |
| Host (shell) | [`packages/shell/rspack.config.ts`](../packages/shell/rspack.config.ts) | **`sharedEagerHost`**, **`experiments: mfExperimentsHost`**. Remotes: `init()` в [`shellRuntime.ts`](../packages/shell/src/loaders/shellRuntime.ts) до `loadRemote`. |

## Соответствие рекомендациям MF 2.0 (краткий вердикт)

- Используется рекомендуемый пакет **enhanced** и Rspack-плагин — ок.
- На remote **`import: false`** + на host **eager shared** — ровно тот сценарий, что описан в доках: remote не кладёт копии в артефакты, берёт из хоста.
- **`shareStrategy: 'loaded-first'`** на remote согласуется с доками и часто рекомендуется рядом с **`import: false`** (в т.ч. из-за возможных RUNTIME-012 при неверном порядке/провайдере).
- **`experiments.externalRuntime` + `provideExternalRuntime`** — runtime-core один раз на shell (аналог `import: false` для React).
- **`runtimeChunk`** в конфиге не задан — избегаем класса проблем с загрузкой remote entry из troubleshooting.

## Размер `remoteEntry.js` vs прикладной код

- **Дефолт MF** (без `externalRuntime`): `remoteEntry.js` ~**100 KB** raw — вшит `@module-federation/runtime-core` + контейнерный bootstrap.
- **В этом репо** (с `mfExperimentsRemote` / `mfExperimentsHost`): ~**43 KB** raw, ~**14 KB** gzip — runtime-core с хоста, в entry остаётся shared scope, chunk mapping и bundler-хвост контейнера.
- Прикладной код remote — в **`__federation_expose_*.js`** (несколько KB) + CSS рядом с expose.
- Полностью убрать `remoteEntry.js` нельзя: это entry контейнера, как и раньше URL в меню (`remoteEntry.js`).

## Практическая проверка без «угадывания»

- После `npm run build`: [`packages/app1/dist/mf-manifest.json`](../packages/app1/dist/mf-manifest.json) — у **`shared`** должны быть пустые **`assets.js.sync` / `async`** (нет отдельных vendor-чанков с remote).
- E2E: [`e2e/mf-remote-chunks.spec.ts`](../e2e/mf-remote-chunks.spec.ts) — manifest + cap `remoteEntry` **50 KB** raw с origin app1.

## Риски / что проверить при регрессии

- **RUNTIME-012** или сходные ошибки при **`import: false`**, если хост не предоставил shared до загрузки remote — смотреть порядок bootstrap и `eager` на host.
- **`externalRuntime` без `init()` shell** — remote entry не найдёт `_FEDERATION_RUNTIME_CORE`; `loadShellRuntime()` должен отработать до первого `loadRemote`.
- Версии `@module-federation/*` на host и remotes должны совпадать; иначе warn inject-плагина «Detect multiple module federation runtime».
- Монорепо на **pnpm** с жёстким hoisting — при странном дублировании shared иногда включают **`allowNodeModulesSuffixMatch`** (см. доку `shared`).
- В `remoteEntry` остаётся **контейнерный** хвост (не React, не полный runtime-core); это норма MF 2.4.

## Дата заметки

Сводка зафиксирована для репозитория looper; при смене major MF/Rspack перепроверять ссылки на module-federation.io.
