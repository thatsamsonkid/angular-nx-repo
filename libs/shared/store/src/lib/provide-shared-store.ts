import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { provideEffects } from '@ngrx/effects';
import { provideState, provideStore } from '@ngrx/store';
import { authEffects } from './auth/auth.effects';
import { authFeature } from './auth/auth.feature';
import { provideCmsAuthBridge } from './auth/provide-cms-auth-bridge';
import { cmsFeature } from './cms.feature';

/**
 * Registers the global CMS and auth stores. Call this once from the host
 * (or via `provideElements()` on the aggregated library).
 */
export function provideSharedStore(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideStore(),
    provideState(cmsFeature),
    provideState(authFeature),
    provideEffects(authEffects),
    provideCmsAuthBridge(),
  ]);
}
