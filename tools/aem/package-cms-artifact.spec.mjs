import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, before, describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { packageCmsArtifact } from './package-cms-artifact.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const sampleHtml = `<!doctype html>
<html lang="en">
  <head>
    <link rel="icon" href="favicon.ico" />
    <link rel="stylesheet" href="styles-abc123.css" />
    <link rel="modulepreload" href="chunk-banner-def456.js" />
  </head>
  <body>
    <script src="main-bbb222.js" type="module"></script>
  </body>
</html>`;

describe('packageCmsArtifact', () => {
  let tempRoot;

  before(() => {
    tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'aem-cms-artifact-'));
  });

  after(() => {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  });

  it('zips a flat clientlib drop-in that Maven can unpack over a cleaned folder', async () => {
    const browserDir = path.join(tempRoot, 'browser');
    const outDir = path.join(tempRoot, 'out');
    fs.mkdirSync(browserDir, { recursive: true });
    fs.writeFileSync(path.join(browserDir, 'index.html'), sampleHtml);
    fs.writeFileSync(path.join(browserDir, 'styles-abc123.css'), 'body{color:red}');
    fs.writeFileSync(path.join(browserDir, 'main-bbb222.js'), 'console.log("main")');
    fs.writeFileSync(
      path.join(browserDir, 'chunk-banner-def456.js'),
      'console.log("banner-chunk")',
    );
    fs.writeFileSync(path.join(browserDir, 'favicon.ico'), 'ico');

    const result = await packageCmsArtifact({
      configPath: path.join(__dirname, 'aem.config.json'),
      browserDir,
      outDir,
    });

    assert.equal(fs.existsSync(result.zipPath), true);
    assert.match(
      fs.readFileSync(path.join(result.dropinDir, 'includes/body.html'), 'utf8'),
      /\/etc\.clientlibs\/mysite\/clientlibs\/angular-app\/main-bbb222\.js/,
    );

    const mainJsTxt = fs.readFileSync(
      path.join(result.dropinDir, 'main-bbb222/js.txt'),
      'utf8',
    );
    assert.match(mainJsTxt, /main-bbb222\.js/);
    assert.equal(mainJsTxt.includes('chunk-banner-def456.js'), false);
    assert.equal(fs.existsSync(path.join(result.dropinDir, 'browser')), false);

    const unpacked = path.join(tempRoot, 'ui.apps-clientlibs/angular-app');
    fs.mkdirSync(unpacked, { recursive: true });
    execFileSync('python3', [
      '-c',
      'import shutil, sys; shutil.unpack_archive(sys.argv[1], sys.argv[2])',
      result.zipPath,
      unpacked,
    ]);
    assert.equal(fs.existsSync(path.join(unpacked, 'main-bbb222/js.txt')), true);
    assert.equal(
      fs.existsSync(path.join(unpacked, 'chunk-banner-def456/js.txt')),
      true,
    );
    assert.equal(fs.existsSync(path.join(unpacked, 'includes/head.html')), true);
    assert.equal(fs.existsSync(path.join(unpacked, 'browser')), false);
  });
});
