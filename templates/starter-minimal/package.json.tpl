{
  "name": "__PROJECT_NAME__",
  "version": "0.1.0",
  "private": true,
  "sideEffects": false,
  "workspaces": ["packages/*"],
  "scripts": {
    "services:stop": "node scripts/looper-services.mjs stop",
    "services:status": "node scripts/looper-services.mjs status",
    "dev:fresh": "node scripts/looper-services.mjs dev",
    "dev": "concurrently -n shared,app1,shell -c blue,green,red \"npm run dev -w packages/shared\" \"npm run dev -w packages/app1\" \"node scripts/delay.mjs 2 && npm run dev -w packages/shell\"",
    "build": "cross-env NODE_ENV=production npm run build -w packages/shared && cross-env NODE_ENV=production npm run build -w packages/app1 && cross-env NODE_ENV=production npm run build -w packages/shell",
    "start": "node scripts/assert-mf-ports-free.mjs && concurrently -n app1,shell -c green,red \"npm run start -w packages/app1\" \"npm run start -w packages/shell\"",
    "prod": "npm run services:stop && npm run build && npm run start",
    "build:csp": "node scripts/build-csp.mjs",
    "lint": "eslint .",
    "lint:fix": "npm run lint -- --fix",
    "typecheck": "npm run typecheck -w packages/shared && npm run build -w packages/shared && npm run typecheck -w packages/app1 && npm run typecheck -w packages/shell",
    "docker:build": "docker compose --profile prod build",
    "docker:up": "docker compose --profile prod up",
    "docker:down": "docker compose down"
  },
  "devDependencies": {
    "@eslint/js": "^10.0.1",
    "@types/node": "^25.8.0",
    "concurrently": "^9.1.0",
    "cross-env": "^7.0.3",
    "eslint": "^10.4.0",
    "eslint-plugin-react-hooks": "^7.1.1",
    "eslint-plugin-react-refresh": "^0.5.2",
    "eslint-plugin-simple-import-sort": "^12.1.1",
    "globals": "^17.6.0",
    "serve": "^14.2.6",
    "typescript": "^5.7.0",
    "typescript-eslint": "^8.59.3"
  }
}
