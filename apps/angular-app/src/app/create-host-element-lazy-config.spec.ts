import { createHostElementLazyConfig } from './create-host-element-lazy-config';

describe('createHostElementLazyConfig', () => {
  it('loads banner from a remote and gallery from the host bundle', async () => {
    const BannerElementModule = class {
      customElementComponent = class {};
    };
    const loadRemoteModule = async (remoteName: string, exposed: string) => {
      expect(remoteName).toBe('banner');
      expect(exposed).toBe('./Module');
      return { BannerElementModule };
    };

    const config = createHostElementLazyConfig(loadRemoteModule);
    expect(config.map((entry) => entry.selector)).toEqual(['banner', 'gallery']);

    const banner = await config[0].loadChildren();
    expect(banner).toBe(BannerElementModule);

    const gallery = await config[1].loadChildren();
    expect(new gallery().customElementComponent).toBeTruthy();
  });
});
