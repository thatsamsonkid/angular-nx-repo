import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import clientlib from 'aem-clientlib-generator';
import { buildClientlibLibs } from './create-clientlib-libs.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function parseArgs(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith('--')) {
      continue;
    }
    options[arg.slice(2)] = argv[index + 1];
    index += 1;
  }
  return options;
}

export function generateClientlibs({ config, browserDir, clientlibsRoot }) {
  const libs = buildClientlibLibs(browserDir, config);
  fs.mkdirSync(clientlibsRoot, { recursive: true });
  const previousCwd = process.cwd();

  return new Promise((resolve, reject) => {
    clientlib(
      libs,
      {
        cwd: previousCwd,
        clientLibRoot: clientlibsRoot,
        verbose: true,
      },
      (error) => {
        process.chdir(previousCwd);
        if (error) {
          reject(error);
          return;
        }
        resolve(libs);
      },
    );
  }).catch((error) => {
    process.chdir(previousCwd);
    throw error;
  });
}

const isMain =
  process.argv[1] &&
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);

if (isMain) {
  const args = parseArgs(process.argv.slice(2));
  const configPath = path.resolve(
    args.config ?? path.join(__dirname, 'aem.config.json'),
  );
  const browserDir = path.resolve(args.browser ?? 'target/angular-app/browser');
  const clientlibsRoot = path.resolve(
    args.out ??
      '../ui.apps/src/main/content/jcr_root/apps/mysite/clientlibs',
  );
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

  generateClientlibs({ config, browserDir, clientlibsRoot })
    .then((libs) => {
      console.log(
        `Generated ${libs.length} clientlibs into ${clientlibsRoot}`,
      );
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
