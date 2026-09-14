import { TestBed } from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { AuthFacade } from './auth.facade';
import { AuthSessionStorage } from './auth-session.storage';
import {
  AuthSession,
  CMS_AUTH_SIGNED_IN,
  CMS_AUTH_SIGNED_OUT,
} from './auth-state.model';
import { bindCmsAuthEvents } from './provide-cms-auth-bridge';
import { provideSharedStore } from '../provide-shared-store';

describe('provideCmsAuthBridge', () => {
  const session: AuthSession = {
    profile: { id: 'u1', name: 'Alex Rivera' },
    token: 'demo-token',
  };

  beforeEach(() => {
    sessionStorage.clear();
  });

  it('dispatches loadSession on bootstrap and hydrates from sessionStorage', async () => {
    sessionStorage.setItem(
      AuthSessionStorage.storageKey,
      JSON.stringify(session),
    );

    await TestBed.configureTestingModule({
      providers: [provideSharedStore()],
    }).compileComponents();

    const auth = TestBed.inject(AuthFacade);
    expect(auth.profile()?.name).toBe('Alex Rivera');
    expect(auth.token()).toBe('demo-token');
  });

  it('writes sessionStorage when the CMS emits sign-in', async () => {
    await TestBed.configureTestingModule({
      providers: [provideSharedStore()],
    }).compileComponents();

    const unbind = bindCmsAuthEvents(TestBed.inject(Store));
    window.dispatchEvent(
      new CustomEvent(CMS_AUTH_SIGNED_IN, { detail: session }),
    );

    const auth = TestBed.inject(AuthFacade);
    expect(auth.profile()?.name).toBe('Alex Rivera');
    expect(
      JSON.parse(sessionStorage.getItem(AuthSessionStorage.storageKey) ?? '{}'),
    ).toEqual(session);
    unbind();
  });

  it('clears the store and sessionStorage on CMS logout', async () => {
    sessionStorage.setItem(
      AuthSessionStorage.storageKey,
      JSON.stringify(session),
    );

    await TestBed.configureTestingModule({
      providers: [provideSharedStore()],
    }).compileComponents();

    const unbind = bindCmsAuthEvents(TestBed.inject(Store));
    window.dispatchEvent(new Event(CMS_AUTH_SIGNED_OUT));

    const auth = TestBed.inject(AuthFacade);
    expect(auth.session()).toBeNull();
    expect(sessionStorage.getItem(AuthSessionStorage.storageKey)).toBeNull();
    unbind();
  });
});
