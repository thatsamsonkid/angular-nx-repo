import { cmsActions } from './cms.actions';
import { cmsReducer } from './cms.feature';
import { initialCmsState } from './cms-state.model';

describe('cmsReducer', () => {
  it('starts with English page context and no page', () => {
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
