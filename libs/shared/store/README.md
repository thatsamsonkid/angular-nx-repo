# shared-store

Buildable library for the global CMS NgRx store (locale, user, page). Feature
libraries inject `CmsFacade`. The host registers the store once via
`provideElements()` or `provideSharedStore()`.

```sh
npx nx test shared-store
npx nx build shared-store
```
