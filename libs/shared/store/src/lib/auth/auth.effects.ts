import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map, tap } from 'rxjs/operators';
import { authActions } from './auth.actions';
import { AuthSessionStorage } from './auth-session.storage';

export const loadSession$ = createEffect(
  (actions$ = inject(Actions), storage = inject(AuthSessionStorage)) =>
    actions$.pipe(
      ofType(authActions.loadSession),
      map(() => {
        const session = storage.read();
        return session
          ? authActions.loadSessionSuccess({ session })
          : authActions.loadSessionEmpty();
      }),
    ),
  { functional: true },
);

export const persistSignedIn$ = createEffect(
  (actions$ = inject(Actions), storage = inject(AuthSessionStorage)) =>
    actions$.pipe(
      ofType(authActions.signedIn),
      tap(({ session }) => storage.write(session)),
    ),
  { functional: true, dispatch: false },
);

export const persistSignedOut$ = createEffect(
  (actions$ = inject(Actions), storage = inject(AuthSessionStorage)) =>
    actions$.pipe(
      ofType(authActions.signedOut),
      tap(() => storage.clear()),
    ),
  { functional: true, dispatch: false },
);

export const authEffects = {
  loadSession$,
  persistSignedIn$,
  persistSignedOut$,
};
