export type FederationManifest = Record<string, string>;

declare global {
  interface Window {
    /**
     * Optional overlay on the pinned federation manifest. Adobe Target can
     * write this before the host bootstrap, e.g. `{ banner: "https://cdn/.../1.5.0/remoteEntry.json" }`.
     */
    __FEDERATION_OVERRIDES__?: FederationManifest;
  }
}

export function mergeFederationManifest(
  pinned: FederationManifest,
  overlay?: FederationManifest | null,
): FederationManifest {
  if (!overlay) {
    return { ...pinned };
  }
  return { ...pinned, ...overlay };
}

/**
 * Pinned production URLs plus an optional Target (or query-string) overlay.
 * The host calls this before `initFederation`.
 */
export async function resolveFederationManifest(
  manifestUrl = '/federation.manifest.json',
): Promise<FederationManifest> {
  const response = await fetch(manifestUrl);
  if (!response.ok) {
    throw new Error(`Failed to load federation manifest from ${manifestUrl}`);
  }
  const pinned = (await response.json()) as FederationManifest;
  return mergeFederationManifest(pinned, window.__FEDERATION_OVERRIDES__);
}
