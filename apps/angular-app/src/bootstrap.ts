import { createApplication } from '@angular/platform-browser';
import { createAppConfig } from './app/app.config';
import { LoadRemoteModuleFn } from './app/create-host-element-lazy-config';
import { hydrateCmsState } from './app/hydrate-cms-state';

export async function bootstrap(
  loadRemoteModule: LoadRemoteModuleFn,
): Promise<void> {
  const appRef = await createApplication(createAppConfig(loadRemoteModule));
  hydrateCmsState(appRef.injector);
}
