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
| `aem-clientlib-generator` categories, JCR path, `allowProxy` | CMS `ui.frontend` (or `tools/aem/aem.config.json` if you generate clientlibs here) |
| Page templates that emit `<ngx-element>` and include the entry scripts | CMS |

`aem-clientlib-generator` does **not** compile Angular. It only copies
already-built JS/CSS into a clientlib folder. That is why the CMS Maven
frontend plugin should stop running `ng build` / `npm run build` for the
Angular app and instead unpack a published dist, then run `clientlib`.

## Why not concatenate into `js.txt`

ngx-element loads banner/gallery with `import()`. Those hashed chunks must
remain sibling files next to `main-*.js`. If the generator lists `**/*.js`
under `assets.js`, AEM writes `js.txt` and concatenates the chunks. The
dynamic imports then 404.

The generator config in this repo copies the browser dist as
**resources only**. AEM pages load the app with the generated
`includes/head.html` and `includes/body.html` (or equivalent HTL), not
`cq:includeClientLib` for the Angular JS.

Entry scripts are rewritten to:

```
/etc.clientlibs/<appId>/clientlibs/<clientlibName>/resources/<hashed-file>
```

ES module lazy imports resolve relative to that URL, so `baseHref` can stay
`/` for both local `cms-host` and AEM.

## Produce the artifact

```sh
npx nx run aem-packaging:package
```

That builds `angular-app` (production) and writes:

```
dist/cms/angular-app/
  manifest.json
  aem.config.json
  includes/head.html
  includes/body.html
  browser/                 # Angular dist, including lazy chunks
  jcr_root/apps/<appId>/clientlibs/clientlib-angular/
dist/cms/angular-app-<version>.zip
```

Edit `tools/aem/aem.config.json` so `appId`, `categories`, and
`jcrRootAppsPath` match the AEM project before you publish.

## CMS `ui.frontend` Maven module

Remove the Angular sources from the CMS repo. Keep Node in that module only
for `aem-clientlib-generator`.

1. Publish `dist/cms/angular-app-<version>.zip` to Nexus / Artifactory as
   a Maven artifact (`type=zip`), or attach it to a GitHub Release.
2. Pin the version in the CMS parent POM (`angular-app.version`).
3. `maven-dependency-plugin` unpacks the zip during `generate-resources`.
4. `frontend-maven-plugin` runs `npm ci` and `npm run clientlib` against the
   unpacked `browser/` folder. It must **not** run `ng build`.
5. Copy `includes/head.html` and `includes/body.html` into the page
   component (or HTL that the page template includes).
6. Install the generated clientlib via `ui.apps` as you already do.

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

The zip already contains `jcr_root/.../clientlib-angular`. The CMS build
can unpack that tree straight into `ui.apps` and delete the frontend Maven
plugin. Use that once `aem.config.json` matches the AEM app id and you no
longer need CMS-side category tweaks.

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
