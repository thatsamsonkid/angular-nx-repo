# button-element-react

React host that consumes the same `<ui-button>` custom element as the vanilla
`button-element` demo. This application does not compile Angular. It loads the
drop-in `button-element` browser scripts, then uses a small React wrapper to
set `label` / `disabled` and listen for the `pressed` CustomEvent.

```sh
npx nx serve button-element-react   # http://localhost:4500
npx nx build button-element-react   # dist/apps/button-element-react
npx nx test button-element-react
```

Serve and build first run `button-element:build` and copy that `browser`
output to `public/button-element`. A React page would do the same thing with a
script tag pointing at those files.
