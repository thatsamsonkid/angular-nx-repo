import { authActions } from './auth.actions';
import { authReducer } from './auth.feature';
import { AuthSession, initialAuthState } from './auth-state.model';

const session: AuthSession = {
  profile: { id: 'u1', name: 'Alex Rivera' },
  token: 'demo-token',
};

describe('authReducer', () => {
  it('starts with no session and not loaded', () => {
    expect(authReducer(undefined, { type: '[Init]' })).toEqual(initialAuthState);
  });

  it('loads a persisted session from storage', () => {
    const next = authReducer(
      initialAuthState,
      authActions.loadSessionSuccess({ session }),
    );
    expect(next.session).toEqual(session);
    expect(next.loaded).toBe(true);
  });

  it('marks loaded when session storage is empty', () => {
    const next = authReducer(initialAuthState, authActions.loadSessionEmpty());
    expect(next.session).toBeNull();
    expect(next.loaded).toBe(true);
  });

  it('signs in and out', () => {
    const signedIn = authReducer(
      initialAuthState,
      authActions.signedIn({ session }),
    );
    expect(signedIn.session?.token).toBe('demo-token');

    const signedOut = authReducer(signedIn, authActions.signedOut());
    expect(signedOut.session).toBeNull();
    expect(signedOut.loaded).toBe(true);
  });
});
