import { initFederation } from '@angular-architects/native-federation';
import { resolveFederationManifest } from './app/resolve-federation-manifest';

async function start(): Promise<void> {
  const manifest = await resolveFederationManifest();
  const { loadRemoteModule } = await initFederation(manifest, {
    // Absolute so MPA routes like /campaign still resolve the host entry.
    hostRemoteEntry: { url: '/remoteEntry.json' },
  });
  const { bootstrap } = await import('./bootstrap');
  await bootstrap(
    loadRemoteModule as Parameters<typeof bootstrap>[0],
  );
}

start().catch((error) => console.error(error));
