# AngularNxRepo

Nx workspace for Angular web-component features that a **separate CMS** embeds
into multi-page templates. This repo does **not** use Angular Router. Pages
come from the CMS (or, locally, from an EJS stand-in).

## Architecture

```
CMS / EJS page
  └── <ngx-element selector="banner" data-headline="...">
        └── angular-app bootstrap
              └── @angular-nx-repo/elements   (publishable aggregator)
                    ├── feature-banner        (buildable only)
                    ├── feature-gallery       (buildable only)
                    └── shared-store          (buildable only, NgRx)
```

| Project | Kind | Role |
| --- | --- | --- |
| `apps/cms-host` | Express + EJS | Local stand-in for the external CMS. Renders multi-page views and places `<ngx-element>` tags. |
| `apps/angular-app` | Angular host | Bootstraps ngx-element and the global store. No router, no page components. |
| `libs/elements` | Publishable | Only package the host consumes. Re-exports features, lazy config, and store registration. |
| `libs/features/banner` | Buildable | Banner feature + `BannerElementModule.customElementComponent`. |
| `libs/features/gallery` | Buildable | Gallery feature + `GalleryElementModule.customElementComponent`. |
| `libs/shared/store` | Buildable | Shared NgRx store (page context + auth session). |

The production CMS lives in another repository. `cms-host` only mimics how that
system would emit pages. AEM should consume a versioned Angular **build
artifact** from this repo (see [tools/aem/README.md](tools/aem/README.md)),
not a mirrored copy of the Angular sources.

## ngx-element

The host does **not** call `customElements.define` for each feature. It
registers the single `<ngx-element>` loader from
[`ngx-el`](https://github.com/thatsamsonkid/ngx-element) and passes the
aggregated lazy map:

```ts
import { provideNgxElement } from 'ngx-el';

provideNgxElement(elementLazyConfig);
```

CMS markup:

```html
<ngx-element
  selector="banner"
  data-headline="Stories from the ridge line"
  data-cta-label="Open the collection">
</ngx-element>
```

Feature modules expose `customElementComponent`. `elementLazyConfig` lists
`loadChildren`. CMS `data-*` attributes map onto `@Input()`s.

## Shared store

Feature libraries inject `CmsFacade` from the shared store. Register it once:

- **Preferred:** `provideElements()` from `@angular-nx-repo/elements`
- **Alternative:** `provideSharedStore()` from `@angular-nx-repo/shared-store` in the Angular app

Page context (locale, current page) can be seeded with `window.__CMS_STATE__`.

Auth is not a page-level web component. The host dispatches `loadSession` on
boot, reads the Angular-owned `sessionStorage` key, and listens for CMS
vanilla events `cms:signin` / `cms:logout`. Sign-in writes profile + token
into that same storage so the next document load can restore the slice.

## Commands

```sh
npm run serve          # EJS CMS host + watched Angular bundle (port 4200)
npm run serve:app      # Angular-only fallback (port 4300)
npm run package:cms    # Production Angular dist + AEM clientlib zip
npx nx build elements  # Build the publishable aggregator
npx nx test feature-banner
npx nx test feature-gallery
npx nx test shared-store
```

AEM Maven integration: [tools/aem/README.md](tools/aem/README.md). The
`ui.frontend` module should unpack `dist/cms/angular-app-<version>.zip` and
run the shipped per-chunk clientlib scanner; it should not compile this Angular app.

Adding a feature later: create another buildable library, expose an NgModule
with `customElementComponent`, add a secondary entry on `elements`, and append
one row to `elementLazyConfig`. The Angular app does not change.
