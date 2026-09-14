# shared-store

Buildable library for the global NgRx store.

- `cms` — page context (locale, current page)
- `auth` — CMS session (profile + token) persisted in `sessionStorage`

The host registers both via `provideElements()` or `provideSharedStore()`.
`provideCmsAuthBridge()` dispatches `loadSession` on boot and listens for
`cms:signin` / `cms:logout`. No global auth web component is required.

```sh
npx nx test shared-store
npx nx build shared-store
```
