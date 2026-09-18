import type { UiButtonElement } from './ui-button.types';

class FakeUiButton extends HTMLElement {
  label = '';
  disabled = false;
}

if (!customElements.get('ui-button')) {
  customElements.define('ui-button', FakeUiButton);
}

export function queryUiButton(
  container: ParentNode = document,
): UiButtonElement {
  const button = container.querySelector('ui-button');
  if (!button) {
    throw new Error('missing ui-button');
  }
  return button;
}
