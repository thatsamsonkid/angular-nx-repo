import { Type } from '@angular/core';
import {
  ElementHostModule,
  elementLazyConfig,
  LazyElementDef,
} from '@angular-nx-repo/elements';

export type LoadRemoteModuleFn = (
  remoteName: string,
  exposedModule: string,
) => Promise<{ BannerElementModule: Type<ElementHostModule> }>;

/**
 * Host lazy map: banner is a Native Federation remote; gallery stays on
 * the pre-federation compile-time import in `elementLazyConfig`.
 */
export function createHostElementLazyConfig(
  loadRemoteModule: LoadRemoteModuleFn,
): LazyElementDef[] {
  const gallery = elementLazyConfig.find((entry) => entry.selector === 'gallery');
  if (!gallery) {
    throw new Error('elementLazyConfig is missing the gallery entry');
  }

  return [
    {
      selector: 'banner',
      loadChildren: () =>
        loadRemoteModule('banner', './Module').then(
          (module) => module.BannerElementModule,
        ),
    },
    gallery,
  ];
}
