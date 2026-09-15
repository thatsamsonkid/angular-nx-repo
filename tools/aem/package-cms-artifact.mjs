import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildClientlibLibs, serializeClientlibLibs } from './create-clientlib-libs.mjs';
import {
  buildAemIncludes,
  buildManifest,
  clientlibProxyBase,
} from './extract-angular-assets.mjs';
import { generateClientlibs } from './generate-and-run-clientlibs.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(__dirname, '../..');

const SCRIPT_FILES = [
  'aem.config.json',
  'clientlib.template.mjs',
  'create-clientlib-libs.mjs',
  'extract-angular-assets.mjs',
  'generate-and-run-clientlibs.mjs',
];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function gitSha() {
  const result = spawnSync('git', ['rev-parse', '--short', 'HEAD'], {
    cwd: workspaceRoot,
    encoding: 'utf8',
  });
  if (result.status !== 0) {
    return null;
  }
  return result.stdout.trim();
}

function copyDir(from, to) {
  fs.cpSync(from, to, { recursive: true });
}

function zipDirectory(sourceDir, zipPath) {
  fs.mkdirSync(path.dirname(zipPath), { recursive: true });
  if (fs.existsSync(zipPath)) {
    fs.rmSync(zipPath);
  }
  const archiveBase = zipPath.replace(/\.zip$/i, '');
  const result = spawnSync(
    'python3',
    [
      '-c',
      'import shutil, sys; shutil.make_archive(sys.argv[1], "zip", sys.argv[2])',
      archiveBase,
      sourceDir,
    ],
    { cwd: workspaceRoot, encoding: 'utf8' },
  );
  if (result.status !== 0) {
    throw new Error(
      `Failed to zip CMS artifact: ${result.stderr || result.stdout}`,
    );
  }
}

export async function packageCmsArtifact(options = {}) {
  const configPath = options.configPath ?? path.join(__dirname, 'aem.config.json');
  const browserDir =
    options.browserDir ??
    path.join(workspaceRoot, 'dist/apps/angular-app/browser');
  const outDir =
    options.outDir ?? path.join(workspaceRoot, 'dist/cms/angular-app');
  const skipClientlib = options.skipClientlib === true;
  const packageJson = readJson(path.join(workspaceRoot, 'package.json'));
  const config = readJson(configPath);

  if (!fs.existsSync(path.join(browserDir, 'index.html'))) {
    throw new Error(
      `Angular browser dist not found at ${browserDir}. Run \`npx nx build angular-app\` first.`,
    );
  }

  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });

  const html = fs.readFileSync(path.join(browserDir, 'index.html'), 'utf8');
  const proxyBase = clientlibProxyBase(config);
  const libs = buildClientlibLibs(browserDir, config);
  const includes = buildAemIncludes(html, proxyBase);
  const manifest = buildManifest({
    name: 'angular-app',
    version: packageJson.version,
    gitSha: gitSha(),
    proxyBase,
    config,
    html,
    libs,
  });

  const browserOut = path.join(outDir, 'browser');
  const includesOut = path.join(outDir, 'includes');
  const scriptsOut = path.join(outDir, 'scripts');
  copyDir(browserDir, browserOut);
  fs.mkdirSync(includesOut, { recursive: true });
  fs.mkdirSync(scriptsOut, { recursive: true });
  fs.writeFileSync(path.join(includesOut, 'head.html'), `${includes.head}\n`);
  fs.writeFileSync(path.join(includesOut, 'body.html'), `${includes.body}\n`);
  fs.writeFileSync(
    path.join(outDir, 'manifest.json'),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );
  fs.writeFileSync(
    path.join(outDir, 'clientlibs.json'),
    `${JSON.stringify(serializeClientlibLibs(libs, browserDir), null, 2)}\n`,
  );
  fs.copyFileSync(configPath, path.join(outDir, 'aem.config.json'));
  for (const filename of SCRIPT_FILES) {
    fs.copyFileSync(path.join(__dirname, filename), path.join(scriptsOut, filename));
  }

  if (!skipClientlib) {
    const clientlibsRoot = path.join(
      outDir,
      'jcr_root',
      config.jcrRootAppsPath,
    );
    await generateClientlibs({
      config,
      browserDir,
      clientlibsRoot,
    });
  }

  const zipName = `angular-app-${packageJson.version}.zip`;
  const zipPath = path.join(path.dirname(outDir), zipName);
  zipDirectory(outDir, zipPath);

  return {
    outDir,
    zipPath,
    manifest,
    proxyBase,
    libs,
  };
}

const isMain =
  process.argv[1] &&
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);

if (isMain) {
  packageCmsArtifact()
    .then((result) => {
      console.log(`CMS artifact directory: ${result.outDir}`);
      console.log(`CMS artifact zip: ${result.zipPath}`);
      console.log(`Clientlib proxy base: ${result.proxyBase}`);
      console.log(`Generated clientlibs: ${result.libs.map((lib) => lib.name).join(', ')}`);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
