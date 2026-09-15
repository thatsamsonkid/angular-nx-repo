import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, before, describe, it } from 'node:test';
import { buildClientlibLibs, listDistAssets } from './create-clientlib-libs.mjs';
import { categoryForName, clientlibNameFromFile } from './clientlib.template.mjs';

const config = {
  appId: 'mysite',
  categoryPrefix: 'mysite.angular',
  resourcesClientlibName: 'clientlib-angular-resources',
  allowProxy: true,
  serializationFormat: 'xml',
};

describe('create-clientlib-libs', () => {
  let browserDir;

  before(() => {
    browserDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aem-clientlib-libs-'));
    fs.writeFileSync(path.join(browserDir, 'index.html'), '<html></html>');
    fs.writeFileSync(path.join(browserDir, 'main-bbb222.js'), 'console.log("main")');
    fs.writeFileSync(path.join(browserDir, 'main-bbb222.js.map'), '{"version":3}');
    fs.writeFileSync(
      path.join(browserDir, 'chunk-banner-def456.js'),
      'console.log("banner")',
    );
    fs.writeFileSync(path.join(browserDir, 'styles-abc123.css'), 'body{}');
    fs.writeFileSync(path.join(browserDir, 'favicon.ico'), 'ico');
  });

  after(() => {
    fs.rmSync(browserDir, { recursive: true, force: true });
  });

  it('names a clientlib after the hashed file basename', () => {
    assert.equal(clientlibNameFromFile('main-bbb222.js'), 'main-bbb222');
    assert.equal(
      categoryForName(config, 'chunk-banner-def456'),
      'mysite.angular.chunk-banner-def456',
    );
  });

  it('groups dist files and skips index.html', () => {
    const grouped = listDistAssets(browserDir);
    assert.deepEqual(
      grouped.js.map((filePath) => path.basename(filePath)).sort(),
      ['chunk-banner-def456.js', 'main-bbb222.js'],
    );
    assert.deepEqual(
      grouped.css.map((filePath) => path.basename(filePath)),
      ['styles-abc123.css'],
    );
    assert.deepEqual(
      grouped.resources.map((filePath) => path.basename(filePath)),
      ['favicon.ico'],
    );
  });

  it('fills the template with one clientlib per js/css chunk', () => {
    const libs = buildClientlibLibs(browserDir, config);
    const byName = Object.fromEntries(libs.map((lib) => [lib.name, lib]));

    assert.equal(libs.length, 4);
    assert.equal(byName['main-bbb222'].categories[0], 'mysite.angular.main-bbb222');
    assert.equal(byName['main-bbb222'].allowProxy, true);
    assert.deepEqual(byName['main-bbb222'].jsProcessor, ['default:none', 'min:none']);
    assert.equal(byName['main-bbb222'].assets.js[0].dest, 'main-bbb222.js');
    assert.equal(byName['main-bbb222'].assets.resources[0].dest, 'main-bbb222.js.map');
    assert.equal(byName['chunk-banner-def456'].assets.js.length, 1);
    assert.equal(byName['styles-abc123'].assets.css[0].dest, 'styles-abc123.css');
    assert.equal(
      byName['clientlib-angular-resources'].assets.resources[0].dest,
      'favicon.ico',
    );
  });
});
