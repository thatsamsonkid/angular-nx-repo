import { NgModule, Type } from '@angular/core';
import { Banner } from './banner/banner';

/**
 * ngx-element host module. The loader reads `customElementComponent`
 * instead of registering this component as its own custom element.
 */
@NgModule({
  imports: [Banner],
  exports: [Banner],
})
export class BannerElementModule {
  customElementComponent: Type<Banner> = Banner;
}
