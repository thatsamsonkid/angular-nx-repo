import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { CmsBootstrapState, CmsPage, CmsUser } from './cms-state.model';

export const cmsActions = createActionGroup({
  source: 'CMS',
  events: {
    Hydrate: props<{ state: CmsBootstrapState }>(),
    'Set Locale': props<{ locale: string }>(),
    'Set User': props<{ user: CmsUser }>(),
    'Clear User': emptyProps(),
    'Set Page Context': props<{ page: CmsPage }>(),
  },
});
