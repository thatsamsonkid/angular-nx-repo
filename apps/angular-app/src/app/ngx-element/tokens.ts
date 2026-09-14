import { InjectionToken } from '@angular/core';
import { LazyElementDef } from '@angular-nx-repo/elements';

export const LAZY_ELEMENT_CONFIG = new InjectionToken<LazyElementDef[]>(
  'ngx-lazy-cmp-registry',
);
