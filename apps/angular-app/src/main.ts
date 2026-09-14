import { createApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { hydrateCmsState } from './app/hydrate-cms-state';

createApplication(appConfig)
  .then((appRef) => {
    hydrateCmsState(appRef.injector);
  })
  .catch((error) => console.error(error));
