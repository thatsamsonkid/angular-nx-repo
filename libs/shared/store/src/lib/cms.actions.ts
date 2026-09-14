import { createActionGroup, props } from '@ngrx/store';
import { CmsBootstrapState, CmsPage } from './cms-state.model';

export const cmsActions = createActionGroup({
  source: 'CMS',
  events: {
    Hydrate: props<{ state: CmsBootstrapState }>(),
    'Set Locale': props<{ locale: string }>(),
    'Set Page Context': props<{ page: CmsPage }>(),
  },
});
