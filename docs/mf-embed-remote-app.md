# Embed MF-remote (без пункта меню shell)

Для модулей, которые **не** появляются в сайдбаре и **не** имеют top-level маршрута shell (`/appX/*`), но монтируются **внутри другого remote** (например `/app2/app4/*`).

Для приложений с собственным пунктом меню используйте [`scaffold:remote`](./mf-remote-new-app.md).

## Scaffold

```bash
npm run scaffold:embed -- <имя> <порт> ["Отображаемое имя"]
```

Пример:

```bash
npm run scaffold:embed -- app4 3005 "App four"
npm install
npm run dev
```

Скрипт:

| Делает | Не делает |
|--------|-----------|
| Копирует [`templates/mf-embed-remote-app/`](../templates/mf-embed-remote-app/) в `packages/<имя>/` | Запись в [`mock-menu.json`](../packages/shell/public/mock-menu.json) |
| Патчит корневые `dev` / `build` / `start` / `typecheck` | Top-level маршрут в shell |
| Playwright `webServer`, `REMOTE_PORTS`, `looper-services.sh` | |

Шаблон: expose `./App`, вложенные роуты (Page A / Page B). Subnav embed-remote: `useLeafPathnameBase()` (innermost splat) + `joinRemotePath`.

## Монтирование в родителе

Родитель (например app2) работает **под shell** — на хосте уже выполнен `init()` и доступен `_FEDERATION_RUNTIME_CORE` (см. [`module-federation-2-notes.md`](./module-federation-2-notes.md)).

```tsx
import { FederatedApp, joinRemotePath, useLeafPathnameBase } from '@looper/shared';
import { APP4_REMOTE } from './embedded/app4';

// Parent App: <Routes location={useEmbedRelativeLocation({ scope: 'outermost' })} />
<Route path={`${APP4_REMOTE.mountSegment}/*`} element={<FederatedApp config={APP4_REMOTE} />} />
<NavLink to={joinRemotePath(useLeafPathnameBase({ scope: 'outermost' }), APP4_REMOTE.mountSegment)}>App four</NavLink>

// Embed App: <Routes location={useEmbedRelativeLocation()} />
```

`FederatedApp` регистрирует remote по `config.entry`, выставляет `RemoteMountBaseProvider` и грузит expose через `FederatedMount`.

Демо: [`packages/app2/src/App.tsx`](../packages/app2/src/App.tsx) + [`packages/app2/src/embedded/app4.ts`](../packages/app2/src/embedded/app4.ts).

## Deep link и F5

URL вроде `/app2/app4/page-b` должны открываться и **перезагружаться (F5)** без ошибок.

Shell поднимает menu-маршруты через [`shellConfigLoader`](../packages/shell/src/loaders/shellConfigLoader.ts) → [`loadShellRuntime`](../packages/shell/src/loaders/shellRuntime.ts) → `patchRoutes` **до** первого match вложенного пути (без async bootstrap).

## Проверка

```bash
npm run typecheck
npm run dev
# http://localhost:3000/app2/app4
# http://localhost:3000/app2/app4/page-b  (F5)
```

E2E: [`e2e/embed-remote-mount.spec.ts`](../e2e/embed-remote-mount.spec.ts) — ждёт маркеры `[looper] shell:ready`, `remote:…:loaded`, `embed:…:loaded`, `page:…:ready` (см. `e2e/helpers/looper-debug.ts`).
