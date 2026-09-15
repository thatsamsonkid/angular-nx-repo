/**
 * Parse the Angular application-builder index.html and rewrite asset URLs
 * so AEM page templates can load entry files from the clientlib proxy.
 *
 * Each hashed JS/CSS file becomes its own clientlib named after the file
 * basename. Loading `main-HASH.js` from
 * `/etc.clientlibs/<appId>/clientlibs/main-HASH.js` lets ESM
 * `import('./chunk-HASH.js')` resolve to the sibling chunk clientlib.
 */

const LINK_RE = /<link\b[^>]*>/gi;
const SCRIPT_RE = /<script\b[^>]*>[\s\S]*?<\/script>/gi;

export function parseAngularIndexHtml(html) {
  const links = [...html.matchAll(LINK_RE)].map((match) => match[0]);
  const scripts = [...html.matchAll(SCRIPT_RE)].map((match) => match[0]);
  return { links, scripts };
}

export function isStylesheet(tag) {
  return /rel=["']stylesheet["']/i.test(tag);
}

export function isModulepreload(tag) {
  return /rel=["']modulepreload["']/i.test(tag);
}

export function readAttr(tag, name) {
  const match = tag.match(new RegExp(`${name}=["']([^"']+)["']`, 'i'));
  return match ? match[1] : null;
}

export function clientlibProxyBase(config) {
  const appId = config.appId.replace(/^\/+|\/+$/g, '');
  return `/etc.clientlibs/${appId}/clientlibs`;
}

export function rewriteUrl(url, proxyBase) {
  if (!url) {
    return url;
  }
  if (
    url.startsWith('data:') ||
    url.startsWith('blob:') ||
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('//')
  ) {
    return url;
  }
  const normalizedBase = proxyBase.replace(/\/+$/, '');
  if (url === normalizedBase || url.startsWith(`${normalizedBase}/`)) {
    return url;
  }
  const filename = url.replace(/^\.\//, '').replace(/^\/+/, '').split('/').pop();
  return `${normalizedBase}/${filename}`;
}

export function rewriteTagUrls(tag, proxyBase) {
  return tag.replace(
    /(href|src)=["']([^"']+)["']/gi,
    (_full, attr, url) => `${attr}="${rewriteUrl(url, proxyBase)}"`,
  );
}

export function uniqueBy(items, keyFn) {
  const seen = new Set();
  const unique = [];
  for (const item of items) {
    const key = keyFn(item);
    if (!key || seen.has(key)) {
      continue;
    }
    seen.add(key);
    unique.push(item);
  }
  return unique;
}

export function buildAemIncludes(html, proxyBase) {
  const { links, scripts } = parseAngularIndexHtml(html);
  const styles = uniqueBy(links.filter(isStylesheet), (tag) => readAttr(tag, 'href'));
  const preloads = uniqueBy(
    links.filter(isModulepreload),
    (tag) => readAttr(tag, 'href'),
  );
  const head = [...styles, ...preloads]
    .map((tag) => rewriteTagUrls(tag, proxyBase))
    .join('\n');
  const body = scripts
    .map((tag) => rewriteTagUrls(tag, proxyBase))
    .join('\n');
  return { head, body };
}

export function buildManifest({
  name,
  version,
  gitSha,
  proxyBase,
  config,
  html,
  libs = [],
}) {
  const { links, scripts } = parseAngularIndexHtml(html);
  return {
    name,
    version,
    gitSha,
    proxyBase,
    clientlib: {
      categoryPrefix: config.categoryPrefix,
      allowProxy: config.allowProxy,
      jcrRootAppsPath: config.jcrRootAppsPath,
      libs: libs.map((lib) => ({
        name: lib.name,
        categories: lib.categories,
      })),
    },
    files: {
      styles: uniqueBy(
        links.filter(isStylesheet).map((tag) => readAttr(tag, 'href')),
        (href) => href,
      ),
      modulepreload: uniqueBy(
        links.filter(isModulepreload).map((tag) => readAttr(tag, 'href')),
        (href) => href,
      ),
      scripts: uniqueBy(
        scripts
          .map((tag) => ({
            src: readAttr(tag, 'src'),
            type: readAttr(tag, 'type'),
          }))
          .filter((script) => script.src),
        (script) => script.src,
      ),
    },
  };
}
