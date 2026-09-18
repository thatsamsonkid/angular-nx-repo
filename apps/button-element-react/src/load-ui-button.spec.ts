import { loadUiButton } from './load-ui-button';

describe('loadUiButton', () => {
  it('is a no-op when ui-button is already defined', async () => {
    expect(customElements.get('ui-button')).toBeTruthy();
    await expect(loadUiButton()).resolves.toBeUndefined();
  });
});
