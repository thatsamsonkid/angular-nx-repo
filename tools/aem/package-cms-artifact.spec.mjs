import assert from 'node:assert/strict';
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

  it('zips browser files, AEM includes, and clientlib resources without concatenating JS', async () => {
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
    assert.equal(fs.existsSync(path.join(outDir, 'browser', 'main-bbb222.js')), true);
    assert.equal(
      fs.existsSync(path.join(outDir, 'browser', 'chunk-banner-def456.js')),
      true,
    );

    const head = fs.readFileSync(path.join(outDir, 'includes/head.html'), 'utf8');
    const body = fs.readFileSync(path.join(outDir, 'includes/body.html'), 'utf8');
    const manifest = JSON.parse(
      fs.readFileSync(path.join(outDir, 'manifest.json'), 'utf8'),
    );
    assert.match(head, /styles-abc123\.css/);
    assert.match(body, /main-bbb222\.js/);
    assert.equal(manifest.files.scripts[0].src, 'main-bbb222.js');

    const clientlibDir = path.join(
      outDir,
      'jcr_root/apps/mysite/clientlibs/clientlib-angular',
    );
    assert.equal(
      fs.existsSync(path.join(clientlibDir, 'resources/main-bbb222.js')),
      true,
    );
    assert.equal(
      fs.existsSync(path.join(clientlibDir, 'resources/chunk-banner-def456.js')),
      true,
    );
    assert.equal(fs.existsSync(path.join(clientlibDir, 'js.txt')), false);
    assert.equal(fs.existsSync(path.join(clientlibDir, 'js')), false);
  });
});
