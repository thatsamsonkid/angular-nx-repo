# CMS drop-in example

Copy this POM pattern into the AEM Maven project after the Angular app has
been removed. It assumes:

- Nexus (or `mvn install-file`) hosts `io.github.thatsamsonkid:angular-app:zip`
- generated Angular clientlibs live in a dedicated folder
  `ui.apps/.../clientlibs/angular-app`
- Maven only deletes that folder and unpacks the zip into it

No Node, no `frontend-maven-plugin`, no `aem-clientlib-generator` on the
CMS side. The zip root is already the flat clientlib folders plus
`includes/`.

Replace `mysite`, `groupId`, and `angular-app.version` with the real AEM
project values.

The page component can include
`/apps/mysite/clientlibs/angular-app/includes/head.html` and `body.html`
after `window.__CMS_STATE__`. Do not `cq:includeClientLib` every chunk.
