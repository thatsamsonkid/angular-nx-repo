import { LazyElementDef } from './element-types';

/**
 * Compile-time lazy map used by tests and as the pre-federation pattern.
 * The host (`angular-app`) does not consume this file: banner loads via
 * Native Federation and gallery is inlined in createHostElementLazyConfig.
 */
export const elementLazyConfig: LazyElementDef[] = [
  {
    selector: 'banner',
    loadChildren: () =>
      import('@angular-nx-repo/elements/banner').then(
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
