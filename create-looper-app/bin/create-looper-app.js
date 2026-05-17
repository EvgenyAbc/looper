#!/usr/bin/env node
/**
 * create-looper-app — interactive Looper MF monorepo installer
 *
 *   npx create-looper-app@latest
 *   npm create looper-app@latest
 */
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'fs';
import { basename, dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';
import * as p from '@clack/prompts';
import { spawnSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = join(__dirname, '..');
const TEMPLATES = join(PKG_ROOT, 'templates');
const UI_PARTIALS = join(TEMPLATES, 'partials/ui-looper-shared');
const UI_LOOPER_PAGES = 'https://evgenyabc.github.io/ui-looper';

function parseArgs(argv) {
  const out = {
    projectName: '',
    template: '',
    ui: '',
    docker: '',
    uiVersion: '',
    install: true,
    git: '',
  };
  const positional = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--template') out.template = argv[++i] ?? '';
    else if (a === '--ui') out.ui = argv[++i] ?? '';
    else if (a === '--docker') out.docker = argv[++i] ?? '';
    else if (a === '--ui-version') out.uiVersion = argv[++i] ?? '';
    else if (a === '--no-install') out.install = false;
    else if (a === '--git') out.git = argv[++i] ?? 'yes';
    else if (!a.startsWith('-')) positional.push(a);
  }
  if (positional[0]) out.projectName = positional[0];
  return out;
}

function copyDir(src, dest, replaceFn) {
  mkdirSync(dest, { recursive: true });
  for (const name of readdirSync(src)) {
    const s = join(src, name);
    const d = join(dest, name);
    if (statSync(s).isDirectory()) {
      copyDir(s, d, replaceFn);
    } else if (name.endsWith('.tpl')) {
      const outName = name.replace(/\.tpl$/, '');
      writeFileSync(join(dest, outName), replaceFn(readFileSync(s, 'utf8')), 'utf8');
    } else if (/\.(json|md|ts|tsx|mjs|sh|html|yml)$/.test(name)) {
      writeFileSync(d, replaceFn(readFileSync(s, 'utf8')), 'utf8');
    } else {
      cpSync(s, d);
    }
  }
}

function uiLooperEntry(ui, version) {
  if (ui === 'cdn') {
    if (!version || version === 'latest') {
      return `${UI_LOOPER_PAGES}/remoteEntry.js`;
    }
    const tag = version.startsWith('v') ? version : `v${version}`;
    return `${UI_LOOPER_PAGES}/${tag}/remoteEntry.js`;
  }
  if (ui === 'local') return 'http://localhost:3030/remoteEntry.js';
  return '';
}

function uiKitReadme(ui, uiVersion) {
  if (ui === 'none') {
    return 'Not included. Add later: `npm create looper-app` docs or [ui-looper](https://github.com/EvgenyAbc/ui-looper).';
  }
  if (ui === 'cdn') {
    const tag = uiVersion.startsWith('v') ? uiVersion : `v${uiVersion}`;
    return [
      `Using ui-looper from GitHub tag \`${tag}\` (jsDelivr).`,
      '',
      `Pages (latest release): ${UI_LOOPER_PAGES}/remoteEntry.js`,
      '',
      'No local ui-looper process required.',
    ].join('\n');
  }
  return [
    'Using **local** ui-looper on port 3030.',
    '',
    '1. Clone [ui-looper](https://github.com/EvgenyAbc/ui-looper) nearby',
    '2. `cd ui-looper && npm install && npm run dev`',
    '3. Then `npm run dev` in this project',
  ].join('\n');
}

function applyUiLooper(targetDir, ui, uiVersion) {
  const uiEntry = uiLooperEntry(ui, uiVersion);
  if (!uiEntry) return;

  const menuPath = join(targetDir, 'packages/shell/public/mock-menu.json');
  const menu = JSON.parse(readFileSync(menuPath, 'utf8'));
  menu.system = [
    {
      id: 'ui-looper',
      name: 'UI Looper',
      entry: uiEntry,
      module: './Button',
      remoteName: 'ui_looper',
      icon: 'puzzle',
      features: [],
      permissions: ['admin', 'user'],
    },
  ];
  writeFileSync(menuPath, `${JSON.stringify(menu, null, 2)}\n`, 'utf8');

  const sharedSrc = join(targetDir, 'packages/shared/src');
  cpSync(join(UI_PARTIALS, 'uiLooper.tsx'), join(sharedSrc, 'uiLooper.tsx'));
  cpSync(join(UI_PARTIALS, 'uiLooper.types.ts'), join(sharedSrc, 'uiLooper.types.ts'));
  const idx = join(sharedSrc, 'index.ts');
  let exp = readFileSync(idx, 'utf8');
  if (!exp.includes('uiLooper')) {
    exp += readFileSync(join(UI_PARTIALS, 'index.exports.ts'), 'utf8');
    writeFileSync(idx, exp, 'utf8');
  }

  if (ui === 'local') {
    const pkgPath = join(targetDir, 'package.json');
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
    const coreDev = pkg.scripts.dev;
    pkg.scripts['dev:core'] = coreDev;
    pkg.scripts['dev:ui'] = 'bash scripts/start-ui-looper.sh';
    pkg.scripts.dev =
      'concurrently -k -n ui,looper -c magenta,blue,green,red "bash scripts/start-ui-looper.sh" "npm run dev:core"';
    writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`, 'utf8');
  }
}

function applyDockerUiProfile(targetDir) {
  const composePath = join(targetDir, 'docker-compose.yml');
  if (!existsSync(composePath)) return;
  let yml = readFileSync(composePath, 'utf8');
  if (!yml.includes('ui-looper:')) {
    yml += `
  ui-looper:
    profiles: [with-ui]
    build:
      context: ../ui-looper
      dockerfile: Dockerfile
    ports:
      - "3030:3030"
`;
    const pkgPath = join(targetDir, 'package.json');
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
    pkg.scripts['docker:up:ui'] = 'docker compose --profile prod --profile with-ui up --build';
    writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`, 'utf8');
    writeFileSync(composePath, yml, 'utf8');
  }
}

function runGitInit(targetDir) {
  const r = spawnSync('git', ['init'], { cwd: targetDir, stdio: 'ignore' });
  if (r.status !== 0) return false;
  writeFileSync(
    join(targetDir, '.gitignore'),
    ['node_modules/', 'dist/', '**/@mf-types/', '*.log', '.DS_Store', 'docker/csp-*.txt', ''].join('\n'),
    'utf8',
  );
  spawnSync('git', ['add', '.'], { cwd: targetDir, stdio: 'ignore' });
  spawnSync('git', ['commit', '-m', 'chore: initial commit from create-looper-app'], {
    cwd: targetDir,
    stdio: 'ignore',
  });
  return true;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const isInteractive = !args.template && !args.ui && !args.docker && process.stdin.isTTY;

  p.intro('Looper — Module Federation 2.0');

  const nameArg = args.projectName;
  let projectName =
    nameArg && (nameArg.includes('/') || nameArg.startsWith('.'))
      ? basename(resolve(nameArg))
      : nameArg;

  if (!projectName && isInteractive) {
    projectName = await p.text({
      message: 'Project name',
      placeholder: 'my-looper-app',
      validate: (v) => (v && /^[a-z][a-z0-9-]*$/i.test(v) ? undefined : 'Letters, numbers, hyphens; start with a letter'),
    });
  }
  if (!projectName) projectName = 'my-looper-app';
  if (p.isCancel(projectName)) process.exit(0);

  const targetDir =
    nameArg && (nameArg.includes('/') || nameArg.startsWith('.'))
      ? resolve(nameArg)
      : resolve(process.cwd(), projectName);

  const template = args.template || 'minimal';
  if (template === 'full-demo') {
    const repo = 'https://github.com/EvgenyAbc/looper.git';
    p.log.info(`Clone the reference monorepo:\n  git clone ${repo}\n  cd looper && npm install && npm run dev`);
    p.outro('Full demo lives in the looper GitHub repository.');
    process.exit(0);
  }

  // Defaults that work out of the box (override with --ui / --docker / --git)
  const ui = args.ui || 'cdn';
  const uiVersion = args.uiVersion || 'v1.0.0';
  const docker = args.docker || 'compose';
  const runGit = args.git !== 'no';

  if (existsSync(targetDir)) {
    p.cancel(`Directory already exists: ${targetDir}`);
    process.exit(1);
  }


  const replace = (text) =>
    text
      .replaceAll('__PROJECT_NAME__', projectName)
      .replaceAll('__UI_LOOPER_ENTRY__', uiLooperEntry(ui, uiVersion))
      .replaceAll('__UI_KIT_DOCS__', uiKitReadme(ui, uiVersion));

  const spinner = p.spinner();
  spinner.start('Creating project…');

  copyDir(join(TEMPLATES, 'starter-minimal'), targetDir, replace);

  const readmeTpl = join(TEMPLATES, 'README.md.tpl');
  if (existsSync(readmeTpl)) {
    writeFileSync(join(targetDir, 'README.md'), replace(readFileSync(readmeTpl, 'utf8')), 'utf8');
  }

  if (ui !== 'none') applyUiLooper(targetDir, ui, uiVersion);
  if (docker === 'none') {
    for (const f of ['docker-compose.yml', 'docker']) {
      const pth = join(targetDir, f);
      if (existsSync(pth)) rmSync(pth, { recursive: true, force: true });
    }
  } else if (ui === 'local') {
    applyDockerUiProfile(targetDir);
  }

  spinner.stop('Project created');

  if (args.install) {
    const s = p.spinner();
    s.start('Installing dependencies…');
    const r = spawnSync('npm', ['install', '--no-audit', '--no-fund'], {
      cwd: targetDir,
      stdio: 'inherit',
    });
    s.stop(r.status === 0 ? 'Dependencies installed' : 'Run npm install manually');
  }

  if (runGit) {
    const s = p.spinner();
    s.start('git init…');
    s.stop(runGitInit(targetDir) ? 'Git repository initialized' : 'git init skipped');
  }

  p.note([`cd ${projectName}`, 'npm run dev'].join('\n'), 'Next');
  p.outro(`Done — ${projectName}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
