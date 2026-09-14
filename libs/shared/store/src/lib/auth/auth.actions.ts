import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { AuthSession } from './auth-state.model';

export const authActions = createActionGroup({
  source: 'Auth',
  events: {
    'Load Session': emptyProps(),
    'Load Session Success': props<{ session: AuthSession }>(),
    'Load Session Empty': emptyProps(),
    'Signed In': props<{ session: AuthSession }>(),
    'Signed Out': emptyProps(),
  },
});
