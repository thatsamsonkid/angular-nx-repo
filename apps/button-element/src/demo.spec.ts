import { wireButtonDemo } from './demo';

describe('wireButtonDemo', () => {
  it('copies the label input onto the custom element and logs pressed events', () => {
    const root = document.createElement('div');
    root.innerHTML = `
      <input data-demo="label" value="Save draft" />
      <input data-demo="disabled" type="checkbox" />
      <ui-button></ui-button>
      <div data-demo="log"></div>
    `;

    const button = root.querySelector('ui-button') as HTMLElement & {
      label: string;
      disabled: boolean;
    };

    wireButtonDemo(root);

    expect(button.label).toBe('Save draft');
    expect(button.disabled).toBe(false);

    const labelInput = root.querySelector<HTMLInputElement>('[data-demo="label"]');
    if (!labelInput) {
      throw new Error('missing label input');
    }
    labelInput.value = 'Publish';
    labelInput.dispatchEvent(new Event('input'));
    expect(button.label).toBe('Publish');

    button.dispatchEvent(
      new CustomEvent('pressed', { detail: { label: 'Publish' } }),
    );

    expect(root.querySelector('[data-demo="log"]')?.textContent).toContain(
      'pressed → {"label":"Publish"}',
    );
  });
});
