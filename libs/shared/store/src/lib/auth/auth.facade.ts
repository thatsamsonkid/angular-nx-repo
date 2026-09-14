import { computed, inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { authActions } from './auth.actions';
import { authFeature } from './auth.feature';
import { AuthSession } from './auth-state.model';

@Injectable({ providedIn: 'root' })
export class AuthFacade {
  private readonly store = inject(Store);

  readonly session = this.store.selectSignal(authFeature.selectSession);
  readonly loaded = this.store.selectSignal(authFeature.selectLoaded);
  readonly profile = computed(() => this.session()?.profile ?? null);
  readonly token = computed(() => this.session()?.token ?? null);

  loadSession(): void {
    this.store.dispatch(authActions.loadSession());
  }

  signedIn(session: AuthSession): void {
    this.store.dispatch(authActions.signedIn({ session }));
  }

  signedOut(): void {
    this.store.dispatch(authActions.signedOut());
  }
}
