import {
  UI_BUTTON_TAG,
  defineUiButton,
  whenUiButtonStable,
} from './define-button-element';
import type { UiButtonElement } from './define-button-element';

async function whenButtonReady(host: UiButtonElement): Promise<HTMLButtonElement> {
  await customElements.whenDefined(UI_BUTTON_TAG);

  const deadline = Date.now() + 2000;
  while (Date.now() < deadline) {
    const inner = host.shadowRoot?.querySelector('button');
    if (inner) {
      return inner;
    }
    await new Promise((resolve) => setTimeout(resolve, 10));
  }

  throw new Error('ui-button did not render its inner button');
}

async function whenLabel(
  host: UiButtonElement,
  label: string,
): Promise<HTMLButtonElement> {
  const inner = await whenButtonReady(host);
  const deadline = Date.now() + 2000;

  while (Date.now() < deadline) {
    if (inner.textContent?.includes(label)) {
      return inner;
    }
    await new Promise((resolve) => setTimeout(resolve, 10));
  }

  throw new Error(
    `ui-button label did not update to "${label}": ${inner.textContent ?? ''}`,
  );
}

describe('defineUiButton', () => {
  let host: UiButtonElement;

  beforeEach(async () => {
    await defineUiButton();
    host = document.createElement(UI_BUTTON_TAG) as UiButtonElement;
    document.body.appendChild(host);
    await whenButtonReady(host);
  });

  afterEach(() => {
    host.remove();
  });

  it('registers the custom element once', async () => {
    await defineUiButton();
    expect(customElements.get(UI_BUTTON_TAG)).toBeTruthy();
  });

  it('reflects the label input onto the rendered button', async () => {
    host.label = 'Publish';
    await whenUiButtonStable();
    const inner = await whenLabel(host, 'Publish');
    expect(inner.textContent).toContain('Publish');
  });

  it('dispatches a pressed CustomEvent with the label payload', async () => {
    host.label = 'Save draft';
    await whenUiButtonStable();
    const inner = await whenLabel(host, 'Save draft');
    const emissions: unknown[] = [];

    host.addEventListener('pressed', (event) => {
      emissions.push((event as CustomEvent<{ label: string }>).detail);
    });

    inner.click();

    expect(emissions).toEqual([{ label: 'Save draft' }]);
  });
});
