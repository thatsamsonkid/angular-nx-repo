# CMS `ui.frontend` example

Copy these files into the AEM Maven `ui.frontend` module after the Angular
app has been removed from that repository. They assume:

- this module sits next to `ui.apps`
- Nexus (or `mvn install-file`) hosts `io.github.thatsamsonkid:angular-app:zip`
- `frontend-maven-plugin` only unpacks that zip and runs the shipped
  clientlib scanner — it does not compile Angular

The zip includes `scripts/generate-and-run-clientlibs.mjs`. That is the same
template-plus-dist-walk used in this Nx repo: one clientlib per hashed JS/CSS
file, named after the file basename so AEM proxy URLs stay sibling to
`import('./chunk-….js')`.

Replace `mysite`, `groupId`, and `angular-app.version` with the real AEM
project values.

The page component should include the unpacked `includes/head.html` in
the document head and `includes/body.html` after `window.__CMS_STATE__`.
Do not `cq:includeClientLib` every chunk clientlib — that concatenates
them. Load `main-*.js` as a module from the proxy URL in `body.html`.
