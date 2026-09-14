import { NgModule, Type } from '@angular/core';
import { Gallery } from './gallery/gallery';

/**
 * ngx-element host module. The loader reads `customElementComponent`
 * instead of registering this component as its own custom element.
 */
@NgModule({
  imports: [Gallery],
  exports: [Gallery],
})
export class GalleryElementModule {
  customElementComponent: Type<Gallery> = Gallery;
}
