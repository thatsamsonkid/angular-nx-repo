/**
 * Shared AEM clientlib fields. The dist scanner only fills name, categories,
 * and assets for each hashed Angular file.
 */
export function createClientlibTemplate(config = {}) {
  return {
    allowProxy: config.allowProxy !== false,
    serializationFormat: config.serializationFormat ?? 'xml',
    cssProcessor: config.cssProcessor ?? ['default:none', 'min:none'],
    jsProcessor: config.jsProcessor ?? ['default:none', 'min:none'],
  };
}

export function populateClientlib(template, { name, categories, assets }) {
  return {
    ...template,
    name,
    categories,
    assets,
  };
}

export function clientlibNameFromFile(filePath) {
  return filePath.replace(/\\/g, '/').split('/').pop().replace(/\.(mjs|js|css)$/i, '');
}

export function categoryForName(config, name) {
  const prefix = config.categoryPrefix ?? config.categories?.[0] ?? config.appId;
  return `${prefix}.${name}`;
}
