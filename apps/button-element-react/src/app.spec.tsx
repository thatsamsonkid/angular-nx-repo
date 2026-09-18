import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { App } from './app';
import { queryUiButton } from './test-setup';

describe('App', () => {
  afterEach(() => {
    cleanup();
  });

  it('copies the label input onto the custom element and logs pressed events', () => {
    const { container } = render(<App />);

    const button = queryUiButton(container);
    expect(button.label).toBe('Save draft');
    expect(button.disabled).toBe(false);

    fireEvent.change(screen.getByLabelText('Label input'), {
      target: { value: 'Publish' },
    });
    expect(button.label).toBe('Publish');

    fireEvent.click(screen.getByLabelText('Disabled'));
    expect(button.disabled).toBe(true);

    act(() => {
      button.dispatchEvent(
        new CustomEvent('pressed', { detail: { label: 'Publish' } }),
      );
    });

    expect(screen.getByText('pressed → {"label":"Publish"}')).toBeTruthy();
  });
});
