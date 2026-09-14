import { AuthSessionStorage } from './auth-session.storage';
import { AuthSession } from './auth-state.model';

describe('AuthSessionStorage', () => {
  const storage = new AuthSessionStorage();
  const session: AuthSession = {
    profile: { id: 'u1', name: 'Alex Rivera' },
    token: 'demo-token',
  };

  beforeEach(() => {
    sessionStorage.clear();
  });

  it('reads nothing when empty', () => {
    expect(storage.read()).toBeNull();
  });

  it('round-trips a session', () => {
    storage.write(session);
    expect(storage.read()).toEqual(session);
  });

  it('clears the host-owned key', () => {
    storage.write(session);
    storage.clear();
    expect(sessionStorage.getItem(AuthSessionStorage.storageKey)).toBeNull();
  });

  it('ignores malformed payloads', () => {
    sessionStorage.setItem(AuthSessionStorage.storageKey, '{not-json');
    expect(storage.read()).toBeNull();
  });
});
