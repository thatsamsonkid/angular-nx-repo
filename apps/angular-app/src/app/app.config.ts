import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideElements } from '@angular-nx-repo/elements';
import { provideNgxElement } from 'ngx-el';
import {
  createHostElementLazyConfig,
  LoadRemoteModuleFn,
} from './create-host-element-lazy-config';

export function createAppConfig(
  loadRemoteModule: LoadRemoteModuleFn,
): ApplicationConfig {
  return {
    providers: [
      provideBrowserGlobalErrorListeners(),
      provideElements(),
      provideNgxElement(createHostElementLazyConfig(loadRemoteModule)),
    ],
  };
}
