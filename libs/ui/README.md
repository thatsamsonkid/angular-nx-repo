# @angular-nx-repo/ui

Publishable UI kit whose widgets live on **secondary entry points**. The
primary barrel does not re-export components, so a consumer can depend on
one widget without importing the rest of the package.

| Entry   | Import                       | What you get                          |
| ------- | ---------------------------- | ------------------------------------- |
| Primary | `@angular-nx-repo/ui`        | Package identity only                 |
| Button  | `@angular-nx-repo/ui/button` | Angular `Button` + `defineUiButton()` |

This is the example of a design-system library where the real widget code
lives at `@scope/ui/button`, not in a separate feature project.

## Export just the button as a web component

Two delivery modes share the same secondary-entry class:

1. **Publishable library** — `npx nx build ui`, then import
   `defineUiButton` from `@angular-nx-repo/ui/button`. Angular hosts can
   pass `{ injector: appRef.injector }` so the element shares the existing
   application.
2. **Application bundle** — `npx nx serve button-element` (or
   `npx nx build button-element`). That app calls `defineUiButton()` and
   ships a script any HTML page can load. Angular is bundled, so the CMS
   does not need to be an Angular app. `npx nx serve button-element-react`
   is a React host that loads those same scripts.

```sh
npx nx build ui
npx nx test ui
npx nx serve button-element
npx nx serve button-element-react
```
