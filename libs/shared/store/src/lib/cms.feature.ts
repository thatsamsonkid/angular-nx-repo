import { createFeature, createReducer, on } from '@ngrx/store';
import { cmsActions } from './cms.actions';
import { CmsState, initialCmsState } from './cms-state.model';

export const cmsReducer = createReducer(
  initialCmsState,
  on(cmsActions.hydrate, (state, { state: incoming }): CmsState => ({
    ...state,
    ...incoming,
    user: incoming.user === undefined ? state.user : incoming.user,
    page: incoming.page === undefined ? state.page : incoming.page,
  })),
  on(
    cmsActions.setLocale,
    (state, { locale }): CmsState => ({
      ...state,
      locale,
    }),
  ),
  on(
    cmsActions.setUser,
    (state, { user }): CmsState => ({
      ...state,
      user,
    }),
  ),
  on(
    cmsActions.clearUser,
    (state): CmsState => ({
      ...state,
      user: null,
    }),
  ),
  on(
    cmsActions.setPageContext,
    (state, { page }): CmsState => ({
      ...state,
      page,
    }),
  ),
);

export const cmsFeature = createFeature({
  name: 'cms',
  reducer: cmsReducer,
});
