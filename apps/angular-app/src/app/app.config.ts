import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { elementLazyConfig, provideElements } from '@angular-nx-repo/elements';
import { provideNgxElement } from './ngx-element/provide-ngx-element';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideElements(),
    provideNgxElement(elementLazyConfig),
  ],
};
