# @angular-nx-repo/ui/button

The button widget lives entirely on this secondary entry. It is not re-exported
from the primary `@angular-nx-repo/ui` barrel.

## Angular component

```ts
import { Button } from '@angular-nx-repo/ui/button';
```

- `@Input() label` — button text
- `@Output() pressed` — emits `{ label }` when clicked

## Web component

`defineUiButton()` wraps the same class with Angular Elements and registers
`<ui-button>`. Call it from a publishable Angular host, or from the
`button-element` application which bundles Angular for non-Angular pages.

```ts
import { defineUiButton } from '@angular-nx-repo/ui/button';

await defineUiButton();
```

```html
<ui-button label="Save draft"></ui-button>
<script>
  document.querySelector('ui-button').addEventListener('pressed', (event) => {
    console.log(event.detail);
  });
</script>
```

A React host can load the same `button-element` browser bundle and wrap the
tag so JSX sets properties and listens for `pressed`. See
`apps/button-element-react`.
