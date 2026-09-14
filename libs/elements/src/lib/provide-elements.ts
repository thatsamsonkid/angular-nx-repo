import { EnvironmentProviders } from '@angular/core';
import { provideSharedStore } from '@angular-nx-repo/shared-store';

/**
 * Host registration for shared services owned by the aggregated library.
 * The Angular app imports this instead of wiring feature libraries or the
 * store by hand. Alternatively, the app can call `provideSharedStore()`
 * directly from `@angular-nx-repo/shared-store`.
 */
export function provideElements(): EnvironmentProviders {
  return provideSharedStore();
}
