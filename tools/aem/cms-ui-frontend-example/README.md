# CMS `ui.frontend` example

Copy these files into the AEM Maven `ui.frontend` module after the Angular
app has been removed from that repository. They assume:

- this module sits next to `ui.apps`
- Nexus (or `mvn install-file`) hosts `io.github.thatsamsonkid:angular-app:zip`
- `frontend-maven-plugin` only runs `aem-clientlib-generator`

Replace `mysite`, `groupId`, and `angular-app.version` with the real AEM
project values. Keep `clientlib.config.js` using `assets.resources` — do
not glob the dist into `js` / `css` or AEM will concatenate lazy chunks.

The page component should include the unpacked `includes/head.html` in
the document head and `includes/body.html` after `window.__CMS_STATE__`.
