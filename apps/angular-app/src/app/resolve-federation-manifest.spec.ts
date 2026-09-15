import { mergeFederationManifest } from './resolve-federation-manifest';

describe('mergeFederationManifest', () => {
  it('keeps the pinned remote URLs when Target does not override', () => {
    const pinned = {
      banner: '/remotes/banner/remoteEntry.json',
    };
    expect(mergeFederationManifest(pinned)).toEqual(pinned);
  });

  it('lets an overlay replace one remote for a slow rollout', () => {
    const merged = mergeFederationManifest(
      { banner: '/remotes/banner/remoteEntry.json' },
      { banner: 'https://cdn.example.com/features/banner/1.5.0/remoteEntry.json' },
    );
    expect(merged['banner']).toBe(
      'https://cdn.example.com/features/banner/1.5.0/remoteEntry.json',
    );
  });
});
