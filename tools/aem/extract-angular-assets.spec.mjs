import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  buildAemIncludes,
  buildManifest,
  clientlibProxyBase,
  parseAngularIndexHtml,
  rewriteUrl,
} from './extract-angular-assets.mjs';

const sampleHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>angular-app</title>
    <base href="/" />
    <link rel="icon" type="image/x-icon" href="favicon.ico" />
    <link rel="stylesheet" href="styles-abc123.css" />
    <link rel="modulepreload" href="chunk-banner-def456.js" />
  </head>
  <body>
    <script src="polyfills-aaa111.js" type="module"></script>
    <script src="main-bbb222.js" type="module"></script>
  </body>
</html>`;

const config = {
  appId: 'mysite',
  categoryPrefix: 'mysite.angular',
  allowProxy: true,
  jcrRootAppsPath: 'apps/mysite/clientlibs',
};

describe('extract-angular-assets', () => {
  it('parses stylesheet, modulepreload, and entry scripts from index.html', () => {
    const { links, scripts } = parseAngularIndexHtml(sampleHtml);
    assert.equal(links.length, 3);
    assert.equal(scripts.length, 2);
    assert.match(scripts[1], /main-bbb222\.js/);
  });

  it('builds the AEM clientlib proxy directory', () => {
    assert.equal(
      clientlibProxyBase(config),
      '/etc.clientlibs/mysite/clientlibs',
    );
  });

  it('rewrites hashed files to sibling clientlib proxy URLs', () => {
    const proxyBase = clientlibProxyBase(config);
    assert.equal(
      rewriteUrl('main-bbb222.js', proxyBase),
      '/etc.clientlibs/mysite/clientlibs/main-bbb222.js',
    );
    assert.equal(
      rewriteUrl('/styles-abc123.css', proxyBase),
      '/etc.clientlibs/mysite/clientlibs/styles-abc123.css',
    );
  });

  it('omits favicon from AEM head includes and rewrites entry assets', () => {
    const proxyBase = clientlibProxyBase(config);
    const includes = buildAemIncludes(sampleHtml, proxyBase);
    assert.equal(includes.head.includes('favicon.ico'), false);
    assert.match(
      includes.head,
      /\/etc\.clientlibs\/mysite\/clientlibs\/styles-abc123\.css/,
    );
    assert.match(
      includes.head,
      /\/etc\.clientlibs\/mysite\/clientlibs\/chunk-banner-def456\.js/,
    );
    assert.match(
      includes.body,
      /\/etc\.clientlibs\/mysite\/clientlibs\/main-bbb222\.js/,
    );
  });

  it('keeps one stylesheet when Angular emits print/onload plus noscript fallback', () => {
    const html = `<head>
      <link rel="stylesheet" href="styles-abc123.css" media="print" onload="this.media='all'">
      <noscript><link rel="stylesheet" href="styles-abc123.css"></noscript>
    </head>
    <body>
      <link rel="modulepreload" href="chunk-banner-def456.js">
      <script src="main-bbb222.js" type="module"></script>
    </body>`;
    const proxyBase = clientlibProxyBase(config);
    const includes = buildAemIncludes(html, proxyBase);
    const stylesheetCount = includes.head.split('rel="stylesheet"').length - 1;
    assert.equal(stylesheetCount, 1);
    assert.match(includes.head, /media="print"/);
    assert.match(includes.head, /chunk-banner-def456\.js/);
    const manifest = buildManifest({
      name: 'angular-app',
      version: '0.0.0',
      gitSha: 'abc',
      proxyBase,
      config,
      html,
    });
    assert.deepEqual(manifest.files.styles, ['styles-abc123.css']);
  });

  it('records hashed files and generated clientlibs in the manifest', () => {
    const manifest = buildManifest({
      name: 'angular-app',
      version: '0.0.0',
      gitSha: 'abc',
      proxyBase: clientlibProxyBase(config),
      config,
      html: sampleHtml,
      libs: [
        { name: 'main-bbb222', categories: ['mysite.angular.main-bbb222'] },
      ],
    });
    assert.deepEqual(manifest.files.styles, ['styles-abc123.css']);
    assert.deepEqual(manifest.files.modulepreload, ['chunk-banner-def456.js']);
    assert.equal(manifest.files.scripts[1].src, 'main-bbb222.js');
    assert.equal(manifest.clientlib.libs[0].name, 'main-bbb222');
  });
});
