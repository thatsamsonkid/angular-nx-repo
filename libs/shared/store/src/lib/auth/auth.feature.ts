import { createFeature, createReducer, on } from '@ngrx/store';
import { authActions } from './auth.actions';
import { AuthState, initialAuthState } from './auth-state.model';

export const authReducer = createReducer(
  initialAuthState,
  on(
    authActions.loadSessionSuccess,
    authActions.signedIn,
    (state, { session }): AuthState => ({
      ...state,
      session,
      loaded: true,
    }),
  ),
  on(
    authActions.loadSessionEmpty,
    authActions.signedOut,
    (state): AuthState => ({
      ...state,
      session: null,
      loaded: true,
    }),
  ),
);

export const authFeature = createFeature({
  name: 'auth',
  reducer: authReducer,
});
