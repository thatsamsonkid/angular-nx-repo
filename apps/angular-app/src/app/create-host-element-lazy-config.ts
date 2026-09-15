import { Type } from '@angular/core';
import {
  ElementHostModule,
  LazyElementDef,
} from '@angular-nx-repo/elements';

export type LoadRemoteModuleFn = (
  remoteName: string,
  exposedModule: string,
) => Promise<{ BannerElementModule: Type<ElementHostModule> }>;

/**
 * Host lazy map: banner is a Native Federation remote; gallery stays in
 * the host bundle as the pre-federation path.
 */
export function createHostElementLazyConfig(
  loadRemoteModule: LoadRemoteModuleFn,
): LazyElementDef[] {
  return [
    {
      selector: 'banner',
      loadChildren: () =>
        loadRemoteModule('banner', './Module').then(
          (module) => module.BannerElementModule,
        ),
    },
    {
      selector: 'gallery',
      loadChildren: () =>
        import('@angular-nx-repo/elements/gallery').then(
          (module) => module.GalleryElementModule,
        ),
    },
  ];
}
