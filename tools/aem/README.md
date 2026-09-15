# AEM / Maven CMS integration

The Angular sources in this repo are the **only** frontend source of truth.
The AEM Maven project should consume a **versioned build artifact**, not a
second copy of the Angular app.

Do not keep a mirror of `apps/angular-app` in the CMS repository. Hashed
filenames, lazy ngx-element chunks, and NgRx registration will drift, and
you will still be compiling Angular twice.

## Maven's job: clean one folder, unpack the zip

Nx builds Angular, walks the dist, and writes finished clientlib folders
into the zip. CMS Maven does **not** run Node, `ng build`, or
`aem-clientlib-generator`.

Use a dedicated directory so other site clientlibs are left alone:

```
ui.apps/src/main/content/jcr_root/apps/<appId>/clientlibs/angular-app/
```

Each `mvn` build:

1. Deletes that `angular-app` folder.
2. Unpacks `angular-app-<version>.zip` into it.

The zip root is already that folder: hashed clientlib directories plus
`includes/`.

```
angular-app-0.0.0.zip
  main-HASH/
  chunk-HASH/
  styles-HASH/
  clientlib-angular-resources/
  includes/head.html
  includes/body.html
  manifest.json
```

Proxy URLs stay siblings inside that folder:

```
/etc.clientlibs/<appId>/clientlibs/angular-app/main-HASH.js
/etc.clientlibs/<appId>/clientlibs/angular-app/chunk-HASH.js
```

## Recommended split

| Concern | Lives in |
| --- | --- |
| Angular / Nx source and `nx build angular-app` | this repo |
| Template + dist walk + zip of finished clientlibs | this repo CI |
| Clean `.../clientlibs/angular-app` and unpack the zip | CMS Maven |
| Page templates that emit `<ngx-element>` | CMS |

## One clientlib per chunk

`create-clientlib-libs.mjs` walks the Angular browser output and fills a
templated clientlib object per hashed JS/CSS file (`name`, `categories`,
`assets` only). Shared settings stay on `clientlib.template.mjs`.

Each JS clientlib's `js.txt` lists **only that file**. The page loads
`includes/body.html` (the main module). Do not `cq:includeClientLib`
every chunk or AEM concatenates them.

## Produce the artifact

```sh
npx nx run aem-packaging:package
```

Edit `tools/aem/aem.config.json` so `appId`, `categoryPrefix`,
`clientlibsFolder`, and `jcrRootAppsPath` match the AEM project before
you publish.

## CMS Maven module

1. Publish `dist/cms/angular-app-<version>.zip` to Nexus / Artifactory as
   a Maven artifact (`type=zip`).
2. Pin `angular-app.version` in the CMS parent POM.
3. `maven-clean-plugin` deletes
   `ui.apps/.../clientlibs/angular-app`.
4. `maven-dependency-plugin` unpacks the zip into that same path.
5. Include `includes/head.html` / `body.html` from that folder on the
   page component after `window.__CMS_STATE__`.

A drop-in POM is in [`cms-ui-frontend-example/`](cms-ui-frontend-example/).

Local override while iterating:

```sh
npx nx run aem-packaging:package
mvn org.apache.maven.plugins:maven-install-plugin:3.1.2:install-file \
  -Dfile=dist/cms/angular-app-0.0.0.zip \
  -DgroupId=io.github.thatsamsonkid \
  -DartifactId=angular-app \
  -Dversion=0.0.0 \
  -Dpackaging=zip
```

## What the AEM page still owns

The CMS continues to render the page and place islands:

```html
<ngx-element
  selector="banner"
  data-headline="Stories from the ridge line"
  data-cta-label="Open the collection">
</ngx-element>
```

Seed `window.__CMS_STATE__` before the Angular entry scripts from
`includes/body.html`. Auth events stay on the CMS document
(`cms:signin` / `cms:logout`).
