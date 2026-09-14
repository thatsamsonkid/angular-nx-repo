import { elementLazyConfig } from './lazy-config';

describe('elementLazyConfig', () => {
  it('exposes lazy feature selectors for ngx-element', () => {
    expect(elementLazyConfig.map((entry) => entry.selector)).toEqual([
      'banner',
      'gallery',
    ]);
  });

  it('loads ngx-element host modules from secondary entry points', async () => {
    const [banner, gallery] = await Promise.all(
      elementLazyConfig.map((entry) => entry.loadChildren()),
    );

    expect(new banner().customElementComponent).toBeTruthy();
    expect(new gallery().customElementComponent).toBeTruthy();
  });
});
