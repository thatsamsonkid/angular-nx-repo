import { cmsActions } from './cms.actions';
import { cmsReducer } from './cms.feature';
import { initialCmsState } from './cms-state.model';

describe('cmsReducer', () => {
  it('starts with an anonymous English session', () => {
    expect(cmsReducer(undefined, { type: '[Init]' })).toEqual(initialCmsState);
  });

  it('hydrates only the fields provided by the CMS page', () => {
    const next = cmsReducer(
      initialCmsState,
      cmsActions.hydrate({
        state: {
          locale: 'fr',
          page: { id: 'home', title: 'Home', path: '/' },
        },
      }),
    );

    expect(next.locale).toBe('fr');
    expect(next.page?.id).toBe('home');
    expect(next.user).toBeNull();
  });

  it('sets and clears the signed-in user', () => {
    const user = { id: 'u1', name: 'Alex Rivera', authenticated: true };
    const signedIn = cmsReducer(initialCmsState, cmsActions.setUser({ user }));
    expect(signedIn.user).toEqual(user);

    const signedOut = cmsReducer(signedIn, cmsActions.clearUser());
    expect(signedOut.user).toBeNull();
  });

  it('updates locale and page context independently', () => {
    const withLocale = cmsReducer(
      initialCmsState,
      cmsActions.setLocale({ locale: 'de' }),
    );
    const withPage = cmsReducer(
      withLocale,
      cmsActions.setPageContext({
        page: { id: 'campaign', title: 'Campaign', path: '/campaign' },
      }),
    );

    expect(withPage.locale).toBe('de');
    expect(withPage.page?.path).toBe('/campaign');
  });
});
