# Native Federation reference (banner remote)

This is a **slow-roll reference**, not a full migration. Gallery still ships
inside the host bundle. Banner is a Native Federation remote so a later
version can be selected at runtime (manifest or Adobe Target overlay)
without rebuilding the shell.

## What runs on the page

One Angular application, one NgRx store. Banner JS is just another ESM
graph that joins that app through `loadRemoteModule`. Features still
`inject(CmsFacade)`. No window-event bus between features.

```
cms-host :4200
  /                         EJS pages + <ngx-element>
  /federation.manifest.json pinned remote URLs (from the host dist)
  /remotes/banner/          static files from dist/apps/banner/browser
```

Local `npm run serve` watches **both** `banner` and `angular-app` into
`dist/` and serves the remote as static files. You do **not** need
`nx serve banner` unless you want a dedicated remote dev server on
`:4201`.

## Slow rollout

Pinned production map (`apps/angular-app/public/federation.manifest.json`):

```json
{
  "banner": "/remotes/banner/remoteEntry.json"
}
```

In AEM/prod that value would be a versioned CDN URL:

```json
{
  "banner": "https://cdn.example.com/features/banner/1.4.2/remoteEntry.json"
}
```

Adobe Target (client-side) should only overlay the map **before**
`initFederation`. Example:

```html
<script>
  window.__FEDERATION_OVERRIDES__ = {
    banner: 'https://cdn.example.com/features/banner/1.5.0/remoteEntry.json',
  };
</script>
```

`resolveFederationManifest()` merges that onto the pin. If Target is
slow, blocked, or absent, the pin is used. Do not mount 1.4.2 and then
swap to 1.5.0.

When the experiment wins, change the pinned manifest (or S3 pointer) and
turn the activity off.

AEM packaging is unchanged: `package:cms` still zips the **host** dist
(gallery stays in that bundle). Deploy `dist/apps/banner/browser` as its
own static prefix (or S3/CloudFront folder) and point the manifest at
that `remoteEntry.json`. CDN remotes need CORS.

## Commands

```sh
npm run serve            # CMS host + watched host + watched banner remote
npm run serve:banner     # optional live remote on :4201
npx nx build banner
npx nx test angular-app
```

Grouping later: one remote app can `exposes` several modules
(`./banner`, `./gallery`) so you do not run a process per island.
