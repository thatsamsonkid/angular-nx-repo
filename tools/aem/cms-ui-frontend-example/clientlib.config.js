import path from 'node:path';
import { fileURLToPath } from 'node:url';

const angularDist = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  'target/angular-app/browser',
);

export default {
  context: path.dirname(fileURLToPath(import.meta.url)),
  clientLibRoot: path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    '../ui.apps/src/main/content/jcr_root/apps/mysite/clientlibs',
  ),
  libs: {
    name: 'clientlib-angular',
    categories: ['mysite.angular'],
    allowProxy: true,
    serializationFormat: 'xml',
    assets: {
      // Copy hashed bundles as resources. Do not put **/*.js in `js` or
      // AEM concatenates ngx-element lazy chunks into js.txt.
      resources: {
        cwd: angularDist,
        flatten: false,
        files: ['**/*'],
        ignore: ['index.html'],
      },
    },
  },
};
