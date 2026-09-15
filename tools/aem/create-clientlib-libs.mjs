import fs from 'node:fs';
import path from 'node:path';
import {
  categoryForName,
  clientlibNameFromFile,
  createClientlibTemplate,
  populateClientlib,
} from './clientlib.template.mjs';

const SKIP_NAMES = new Set(['index.html']);

function walkFiles(rootDir) {
  const files = [];

  function visit(current) {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        visit(fullPath);
        continue;
      }
      files.push(fullPath);
    }
  }

  visit(rootDir);
  return files;
}

function classifyAsset(filePath) {
  const filename = path.basename(filePath);
  if (SKIP_NAMES.has(filename) || filename.endsWith('.map')) {
    return 'skip';
  }
  if (/\.m?js$/i.test(filename)) {
    return 'js';
  }
  if (/\.css$/i.test(filename)) {
    return 'css';
  }
  return 'resource';
}

function mapFor(filePath) {
  const mapPath = `${filePath}.map`;
  return fs.existsSync(mapPath) ? mapPath : null;
}

function chunkAssets(kind, filePath) {
  const filename = path.basename(filePath);
  const assets = {
    [kind]: [{ src: filePath, dest: filename }],
  };
  const sourceMap = mapFor(filePath);
  if (sourceMap) {
    assets.resources = [{ src: sourceMap, dest: path.basename(sourceMap) }];
  }
  return assets;
}

export function listDistAssets(browserDir) {
  const grouped = { js: [], css: [], resources: [] };
  for (const filePath of walkFiles(browserDir)) {
    const kind = classifyAsset(filePath);
    if (kind === 'skip') {
      continue;
    }
    grouped[kind === 'resource' ? 'resources' : kind].push(filePath);
  }
  return grouped;
}

export function buildClientlibLibs(browserDir, config) {
  if (!fs.existsSync(browserDir)) {
    throw new Error(`Angular browser dist not found at ${browserDir}`);
  }

  const template = createClientlibTemplate(config);
  const grouped = listDistAssets(browserDir);
  const libs = [];

  for (const filePath of grouped.js) {
    const name = clientlibNameFromFile(filePath);
    libs.push(
      populateClientlib(template, {
        name,
        categories: [categoryForName(config, name)],
        assets: chunkAssets('js', filePath),
      }),
    );
  }

  for (const filePath of grouped.css) {
    const name = clientlibNameFromFile(filePath);
    libs.push(
      populateClientlib(template, {
        name,
        categories: [categoryForName(config, name)],
        assets: chunkAssets('css', filePath),
      }),
    );
  }

  if (grouped.resources.length > 0) {
    const name = config.resourcesClientlibName ?? 'clientlib-angular-resources';
    libs.push(
      populateClientlib(template, {
        name,
        categories: [categoryForName(config, name)],
        assets: {
          resources: grouped.resources.map((filePath) => ({
            src: filePath,
            dest: path.relative(browserDir, filePath).replace(/\\/g, '/'),
          })),
        },
      }),
    );
  }

  return libs;
}

export function createClientlibGeneratorConfig({
  browserDir,
  config,
  clientLibRoot,
  context,
}) {
  return {
    context,
    clientLibRoot,
    libs: buildClientlibLibs(browserDir, config),
  };
}

export function serializeClientlibLibs(libs, browserDir) {
  return libs.map((lib) => ({
    name: lib.name,
    categories: lib.categories,
    assets: Object.fromEntries(
      Object.entries(lib.assets).map(([kind, asset]) => {
        if (Array.isArray(asset)) {
          return [
            kind,
            asset.map((item) => ({
              src: path.relative(browserDir, item.src).replace(/\\/g, '/'),
              dest: item.dest,
            })),
          ];
        }
        return [kind, asset];
      }),
    ),
  }));
}
