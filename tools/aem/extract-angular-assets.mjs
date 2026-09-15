/**
 * Parse the Angular application-builder index.html and rewrite asset URLs
 * so AEM page templates can load the same files from a clientlib proxy path.
 *
 * Lazy ngx-element chunks are loaded relative to the entry script URL, so the
 * rewritten script src must point at the clientlib resources folder and the
 * chunk files must be copied as sibling resources — never concatenated into
 * js.txt.
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

export function clientlibResourceBase(config) {
  const appId = config.appId.replace(/^\/+|\/+$/g, '');
  const clientlibName = config.clientlibName.replace(/^\/+|\/+$/g, '');
  return `/etc.clientlibs/${appId}/clientlibs/${clientlibName}/resources`;
}

export function rewriteUrl(url, resourceBase) {
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
  const normalizedBase = resourceBase.replace(/\/+$/, '');
  if (url === normalizedBase || url.startsWith(`${normalizedBase}/`)) {
    return url;
  }
  const relative = url.replace(/^\.\//, '').replace(/^\/+/, '');
  return `${normalizedBase}/${relative}`;
}

export function rewriteTagUrls(tag, resourceBase) {
  return tag.replace(
    /(href|src)=["']([^"']+)["']/gi,
    (_full, attr, url) => `${attr}="${rewriteUrl(url, resourceBase)}"`,
  );
}

export function buildAemIncludes(html, resourceBase) {
  const { links, scripts } = parseAngularIndexHtml(html);
  const head = links
    .filter((tag) => isStylesheet(tag) || isModulepreload(tag))
    .map((tag) => rewriteTagUrls(tag, resourceBase))
    .join('\n');
  const body = scripts
    .map((tag) => rewriteTagUrls(tag, resourceBase))
    .join('\n');
  return { head, body };
}

export function buildManifest({
  name,
  version,
  gitSha,
  resourceBase,
  config,
  html,
}) {
  const { links, scripts } = parseAngularIndexHtml(html);
  return {
    name,
    version,
    gitSha,
    resourceBase,
    clientlib: {
      name: config.clientlibName,
      categories: config.categories,
      allowProxy: config.allowProxy,
      jcrRootAppsPath: config.jcrRootAppsPath,
    },
    files: {
      styles: links
        .filter(isStylesheet)
        .map((tag) => readAttr(tag, 'href'))
        .filter(Boolean),
      modulepreload: links
        .filter(isModulepreload)
        .map((tag) => readAttr(tag, 'href'))
        .filter(Boolean),
      scripts: scripts
        .map((tag) => ({
          src: readAttr(tag, 'src'),
          type: readAttr(tag, 'type'),
        }))
        .filter((script) => script.src),
    },
  };
}
