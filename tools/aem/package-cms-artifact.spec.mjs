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

  it('creates one clientlib per hashed chunk and sibling proxy includes', async () => {
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
      fs.readFileSync(path.join(outDir, 'includes/body.html'), 'utf8'),
      /\/etc\.clientlibs\/mysite\/clientlibs\/main-bbb222\.js/,
    );

    const clientlibsRoot = path.join(outDir, 'jcr_root/apps/mysite/clientlibs');
    const mainJsTxt = fs.readFileSync(
      path.join(clientlibsRoot, 'main-bbb222/js.txt'),
      'utf8',
    );
    const chunkJsTxt = fs.readFileSync(
      path.join(clientlibsRoot, 'chunk-banner-def456/js.txt'),
      'utf8',
    );
    assert.match(mainJsTxt, /main-bbb222\.js/);
    assert.equal(mainJsTxt.includes('chunk-banner-def456.js'), false);
    assert.match(chunkJsTxt, /chunk-banner-def456\.js/);
    assert.equal(
      fs.existsSync(path.join(clientlibsRoot, 'styles-abc123/css.txt')),
      true,
    );
    assert.equal(
      fs.existsSync(
        path.join(clientlibsRoot, 'clientlib-angular-resources/resources/favicon.ico'),
      ),
      true,
    );
    assert.equal(fs.existsSync(path.join(outDir, 'scripts/create-clientlib-libs.mjs')), true);
    assert.deepEqual(
      result.libs.map((lib) => lib.name).sort(),
      [
        'chunk-banner-def456',
        'clientlib-angular-resources',
        'main-bbb222',
        'styles-abc123',
      ],
    );
  });
});
