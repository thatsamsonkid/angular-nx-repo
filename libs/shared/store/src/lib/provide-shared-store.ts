import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { provideState, provideStore } from '@ngrx/store';
import { cmsFeature } from './cms.feature';

/**
 * Registers the global CMS store. Call this once from the host app
 * (or via `provideElements()` on the aggregated library).
 */
export function provideSharedStore(): EnvironmentProviders {
  return makeEnvironmentProviders([provideStore(), provideState(cmsFeature)]);
}
