import {
  ENVIRONMENT_INITIALIZER,
  EnvironmentProviders,
  Injector,
  inject,
  makeEnvironmentProviders,
} from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { LazyElementDef } from '@angular-nx-repo/elements';
import { NgxElementComponent } from './ngx-element';
import { NgxElementService } from './ngx-element.service';
import { LAZY_ELEMENT_CONFIG } from './tokens';

/** Local stand-in for `NgxElementModule.forRoot` until `ngx-el` is published. */
export function provideNgxElement(
  config: LazyElementDef[],
): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: LAZY_ELEMENT_CONFIG, useValue: config },
    NgxElementService,
    {
      provide: ENVIRONMENT_INITIALIZER,
      multi: true,
      useFactory: () => {
        const injector = inject(Injector);
        return () => {
          if (customElements.get('ngx-element')) {
            return;
          }

          customElements.define(
            'ngx-element',
            createCustomElement(NgxElementComponent, { injector }),
          );
        };
      },
    },
  ]);
}
