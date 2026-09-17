# button-element

Standalone application that exports **only** the button secondary entry as a
web component. It does not bootstrap an Angular component tree. `main.ts`
calls `defineUiButton()` from `@angular-nx-repo/ui/button`, then this page
uses `<ui-button>` like any other custom element.

```sh
npx nx serve button-element   # http://localhost:4400
npx nx build button-element   # dist/apps/button-element/browser
```

Production hashing is off so a CMS can load stable script filenames from
the `browser` output. Drop those files onto a non-Angular page; Angular is
already bundled.
