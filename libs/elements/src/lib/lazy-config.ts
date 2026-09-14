import { LazyElementDef } from './element-types';

/**
 * Single export the host app passes to ngx-element. The app does not
 * register individual web components or feature modules itself.
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
