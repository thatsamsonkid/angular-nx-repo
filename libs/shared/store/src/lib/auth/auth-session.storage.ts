import { Injectable } from '@angular/core';
import { AuthSession } from './auth-state.model';

@Injectable({ providedIn: 'root' })
export class AuthSessionStorage {
  static readonly storageKey = 'cms.auth.session';

  read(): AuthSession | null {
    const raw = sessionStorage.getItem(AuthSessionStorage.storageKey);
    if (!raw) {
      return null;
    }

    try {
      const parsed = JSON.parse(raw) as AuthSession;
      if (!parsed?.profile?.id || !parsed.profile.name || !parsed.token) {
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  }

  write(session: AuthSession): void {
    sessionStorage.setItem(AuthSessionStorage.storageKey, JSON.stringify(session));
  }

  clear(): void {
    sessionStorage.removeItem(AuthSessionStorage.storageKey);
  }
}
