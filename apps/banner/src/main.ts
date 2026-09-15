import { initFederation } from '@angular-architects/native-federation';

// Standalone remote bootstrap for `nx serve banner`. The CMS host never
// loads this file; it only consumes remoteEntry.json + ./Module.
initFederation(
  {},
  {
    hostRemoteEntry: { url: '/remoteEntry.json' },
  },
)
  .catch((err) => console.error(err))
  .then(() => import('./bootstrap'))
  .catch((err) => console.error(err));
