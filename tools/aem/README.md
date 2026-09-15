# AEM / Maven CMS integration

The Angular sources in this repo are the **only** frontend source of truth.
The AEM Maven project should consume a **versioned build artifact**, not a
second copy of the Angular app.

Do not keep a mirror of `apps/angular-app` in the CMS repository. Hashed
filenames, lazy ngx-element chunks, and NgRx registration will drift, and
you will still be compiling Angular twice.

## Recommended split

| Concern | Lives in |
| --- | --- |
| Angular / Nx source and `nx build angular-app` | this repo |
| Versioned zip of `dist/apps/angular-app/browser` plus includes | this repo CI, published as a Maven (or GitHub Release) artifact |
| Clientlib **template** (allowProxy, processors, serialization) | `tools/aem/clientlib.template.mjs` |
| Dist walk that fills one clientlib object per chunk | `tools/aem/create-clientlib-libs.mjs` |
| Page templates that emit `<ngx-element>` and include the entry scripts | CMS |

`aem-clientlib-generator` does **not** compile Angular. It only writes
clientlib folders from already-built JS/CSS. The CMS Maven frontend plugin
should stop running `ng build` and instead unpack a published dist, then
run the same scanner this repo ships.

## One clientlib per chunk

The current CMS repo builds generator input dynamically: a templated
clientlib object, then a pass over `dist` that fills `name`, `categories`,
and `assets` for each file. That script now lives here.

`create-clientlib-libs.mjs` walks the Angular browser output and emits:

- one clientlib per `.js` / `.css` file, named after the hashed basename
  (`main-3YN42ASX`, `chunk-XSJCQZZ3`, `styles-A2GI2JIS`)
- `jsProcessor` / `cssProcessor` set to `default:none` so AEM does not
  minify a second time
- a single `clientlib-angular-resources` clientlib for leftover assets
  (favicon, media)

Each JS clientlib's `js.txt` lists **only that file**. Putting every chunk
into one `assets.js` glob concatenates them and ngx-element `import()`
404s.

Naming the clientlib after the file is what makes lazy loading work on AEM.
The page loads:

```
/etc.clientlibs/<appId>/clientlibs/main-HASH.js
```

ESM then resolves `import('./chunk-HASH.js')` to:

```
/etc.clientlibs/<appId>/clientlibs/chunk-HASH.js
```

which is the sibling chunk clientlib's proxy URL. Do not load those chunks
through `cq:includeClientLib` (that concatenates). Use the generated
`includes/head.html` and `includes/body.html`.

Only a few fields are filled per file. Shared settings stay on the
template in `clientlib.template.mjs` and `aem.config.json`
(`categoryPrefix`, processors, `allowProxy`).

## Produce the artifact

```sh
npx nx run aem-packaging:package
```

That builds `angular-app` (production) and writes:

```
dist/cms/angular-app/
  manifest.json
  clientlibs.json
  aem.config.json
  includes/head.html
  includes/body.html
  browser/
  scripts/                 # same scanner the CMS module can run
  jcr_root/apps/<appId>/clientlibs/<chunk-name>/
dist/cms/angular-app-<version>.zip
```

Edit `tools/aem/aem.config.json` so `appId`, `categoryPrefix`, and
`jcrRootAppsPath` match the AEM project before you publish.

## CMS `ui.frontend` Maven module

Remove the Angular sources from the CMS repo. Keep Node in that module only
for `aem-clientlib-generator` plus this scanner.

1. Publish `dist/cms/angular-app-<version>.zip` to Nexus / Artifactory as
   a Maven artifact (`type=zip`), or attach it to a GitHub Release.
2. Pin the version in the CMS parent POM (`angular-app.version`).
3. `maven-dependency-plugin` unpacks the zip during `generate-resources`.
4. `frontend-maven-plugin` runs `npm ci` and `npm run clientlib`. That
   script calls `scripts/generate-and-run-clientlibs.mjs` against the
   unpacked `browser/` folder. It must **not** run `ng build`.
5. Copy `includes/head.html` and `includes/body.html` into the page
   component (or HTL that the page template includes).
6. Install the generated clientlibs via `ui.apps` as you already do.

A drop-in sketch of that module is in
[`cms-ui-frontend-example/`](cms-ui-frontend-example/).

Local CMS Maven override while iterating:

```xml
<angular-app.version>0.0.0</angular-app.version>
```

and install the zip into the local `.m2` from this repo:

```sh
npx nx run aem-packaging:package
mvn org.apache.maven.plugins:maven-install-plugin:3.1.2:install-file \
  -Dfile=dist/cms/angular-app-0.0.0.zip \
  -DgroupId=io.github.thatsamsonkid \
  -DartifactId=angular-app \
  -Dversion=0.0.0 \
  -Dpackaging=zip
```

Bump `package.json` `version` (or your CI git tag) whenever you want the
CMS build to pick up a new frontend.

## Optional: skip Node in Maven

The zip already contains `jcr_root/.../clientlibs/<chunk>`. The CMS build
can unpack that tree straight into `ui.apps` and delete the frontend Maven
plugin. Use that once `aem.config.json` matches the AEM app id.

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
