import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const appRoot = dirname(fileURLToPath(import.meta.url));
const workspaceRoot = resolve(appRoot, '../..');
const from = resolve(workspaceRoot, 'dist/apps/button-element/browser');
const to = resolve(appRoot, 'public/button-element');

if (!existsSync(from)) {
  throw new Error(
    'Missing button-element build at dist/apps/button-element/browser. Run `npx nx build button-element` first.',
  );
}

if (existsSync(to)) {
  rmSync(to, { recursive: true, force: true });
}

mkdirSync(dirname(to), { recursive: true });
cpSync(from, to, { recursive: true });
