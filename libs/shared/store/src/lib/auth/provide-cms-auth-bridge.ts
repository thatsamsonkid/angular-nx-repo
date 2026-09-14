import {
  EnvironmentProviders,
  inject,
  makeEnvironmentProviders,
  provideEnvironmentInitializer,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { authActions } from './auth.actions';
import {
  AuthSession,
  CMS_AUTH_SIGNED_IN,
  CMS_AUTH_SIGNED_OUT,
} from './auth-state.model';

function isAuthSession(value: unknown): value is AuthSession {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const session = value as AuthSession;
  return Boolean(session.profile?.id && session.profile.name && session.token);
}

export function bindCmsAuthEvents(store: Store): () => void {
  const onSignedIn = (event: Event) => {
    const session = (event as CustomEvent<AuthSession>).detail;
    if (isAuthSession(session)) {
      store.dispatch(authActions.signedIn({ session }));
    }
  };
  const onSignedOut = () => store.dispatch(authActions.signedOut());

  window.addEventListener(CMS_AUTH_SIGNED_IN, onSignedIn);
  window.addEventListener(CMS_AUTH_SIGNED_OUT, onSignedOut);

  return () => {
    window.removeEventListener(CMS_AUTH_SIGNED_IN, onSignedIn);
    window.removeEventListener(CMS_AUTH_SIGNED_OUT, onSignedOut);
  };
}

/**
 * Host-owned auth wiring. Dispatches `loadSession` on boot and listens for
 * CMS vanilla-JS events. No page markup or global web component required.
 */
export function provideCmsAuthBridge(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideEnvironmentInitializer(() => {
      const store = inject(Store);
      store.dispatch(authActions.loadSession());
      bindCmsAuthEvents(store);
    }),
  ]);
}
