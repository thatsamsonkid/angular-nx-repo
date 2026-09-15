import { LazyElementDef } from './element-types';

/**
 * Compile-time lazy map used by tests and as the pre-federation pattern.
 * The host keeps the gallery entry and replaces banner with a Native
 * Federation remote in `createHostElementLazyConfig`.
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
