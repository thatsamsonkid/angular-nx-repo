import type { ButtonPressed, UiButtonElement } from '@angular-nx-repo/ui/button';

/**
 * Vanilla host wiring. This is what a CMS page would do after loading the
 * button-element script: set properties on `<ui-button>` and listen for
 * the `pressed` CustomEvent.
 */
export function wireButtonDemo(root: ParentNode = document): void {
  const button = root.querySelector<UiButtonElement>('ui-button');
  const labelInput = root.querySelector<HTMLInputElement>('[data-demo="label"]');
  const disabledInput = root.querySelector<HTMLInputElement>(
    '[data-demo="disabled"]',
  );
  const log = root.querySelector('[data-demo="log"]');

  if (!button || !labelInput || !disabledInput || !log) {
    return;
  }

  const applyInputs = (): void => {
    button.label = labelInput.value;
    button.disabled = disabledInput.checked;
  };

  labelInput.addEventListener('input', applyInputs);
  disabledInput.addEventListener('change', applyInputs);
  button.addEventListener('pressed', (event) => {
    const detail = (event as CustomEvent<ButtonPressed>).detail;
    const line = document.createElement('p');
    line.textContent = `pressed → ${JSON.stringify(detail)}`;
    log.prepend(line);
  });

  applyInputs();
}
