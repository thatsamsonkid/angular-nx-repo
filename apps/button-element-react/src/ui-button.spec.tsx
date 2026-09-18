import { cleanup, render } from '@testing-library/react';
import { queryUiButton } from './test-setup';
import { UiButton } from './ui-button';

describe('UiButton', () => {
  afterEach(() => {
    cleanup();
  });

  it('assigns label and disabled on the custom element', () => {
    const { rerender } = render(<UiButton label="Save draft" />);
    const button = queryUiButton();

    expect(button.label).toBe('Save draft');
    expect(button.disabled).toBe(false);

    rerender(<UiButton label="Publish" disabled />);
    expect(button.label).toBe('Publish');
    expect(button.disabled).toBe(true);
  });

  it('forwards pressed CustomEvents to onPressed', () => {
    const emissions: { label: string }[] = [];

    render(
      <UiButton
        label="Save draft"
        onPressed={(detail) => emissions.push(detail)}
      />,
    );

    queryUiButton().dispatchEvent(
      new CustomEvent('pressed', { detail: { label: 'Save draft' } }),
    );

    expect(emissions).toEqual([{ label: 'Save draft' }]);
  });
});
