import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import clientlib from 'aem-clientlib-generator';
import {
  buildAemIncludes,
  buildManifest,
  clientlibResourceBase,
} from './extract-angular-assets.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(__dirname, '../..');

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

function generateClientlibs({ config, browserDir, clientlibsRoot }) {
  fs.mkdirSync(clientlibsRoot, { recursive: true });
  const previousCwd = process.cwd();

  return new Promise((resolve, reject) => {
    clientlib(
      {
        name: config.clientlibName,
        categories: config.categories,
        allowProxy: config.allowProxy,
        serializationFormat: config.serializationFormat,
        assets: {
          // Keep hashed lazy chunks as individual files. Putting them in
          // `js` writes js.txt and AEM concatenates the bundle, which
          // breaks ngx-element loadChildren.
          resources: {
            cwd: browserDir,
            flatten: false,
            files: ['**/*'],
            ignore: ['index.html'],
          },
        },
      },
      {
        cwd: workspaceRoot,
        clientLibRoot: clientlibsRoot,
        verbose: true,
      },
      (error) => {
        process.chdir(previousCwd);
        if (error) {
          reject(error);
          return;
        }
        resolve();
      },
    );
  }).catch((error) => {
    process.chdir(previousCwd);
    throw error;
  });
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
  const resourceBase = clientlibResourceBase(config);
  const includes = buildAemIncludes(html, resourceBase);
  const manifest = buildManifest({
    name: 'angular-app',
    version: packageJson.version,
    gitSha: gitSha(),
    resourceBase,
    config,
    html,
  });

  const browserOut = path.join(outDir, 'browser');
  const includesOut = path.join(outDir, 'includes');
  copyDir(browserDir, browserOut);
  fs.mkdirSync(includesOut, { recursive: true });
  fs.writeFileSync(path.join(includesOut, 'head.html'), `${includes.head}\n`);
  fs.writeFileSync(path.join(includesOut, 'body.html'), `${includes.body}\n`);
  fs.writeFileSync(
    path.join(outDir, 'manifest.json'),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );
  fs.copyFileSync(configPath, path.join(outDir, 'aem.config.json'));

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
    resourceBase,
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
      console.log(`Clientlib resource base: ${result.resourceBase}`);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
