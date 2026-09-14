import { Type } from '@angular/core';

/**
 * Contract expected by ngx-element: a lazily loaded NgModule exposes the
 * Angular component that should be projected into `<ngx-element>`.
 */
export interface ElementHostModule {
  customElementComponent: Type<unknown> | Record<string, Type<unknown>>;
}

export interface LazyElementDef {
  selector: string;
  loadChildren: () => Promise<Type<ElementHostModule>>;
}
