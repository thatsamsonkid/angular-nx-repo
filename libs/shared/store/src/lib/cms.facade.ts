import { inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { cmsActions } from './cms.actions';
import { cmsFeature } from './cms.feature';
import { CmsBootstrapState, CmsPage, CmsUser } from './cms-state.model';

@Injectable({ providedIn: 'root' })
export class CmsFacade {
  private readonly store = inject(Store);

  readonly user = this.store.selectSignal(cmsFeature.selectUser);
  readonly locale = this.store.selectSignal(cmsFeature.selectLocale);
  readonly page = this.store.selectSignal(cmsFeature.selectPage);
  readonly state = this.store.selectSignal(cmsFeature.selectCmsState);

  hydrate(state: CmsBootstrapState): void {
    this.store.dispatch(cmsActions.hydrate({ state }));
  }

  setLocale(locale: string): void {
    this.store.dispatch(cmsActions.setLocale({ locale }));
  }

  setUser(user: CmsUser): void {
    this.store.dispatch(cmsActions.setUser({ user }));
  }

  clearUser(): void {
    this.store.dispatch(cmsActions.clearUser());
  }

  setPageContext(page: CmsPage): void {
    this.store.dispatch(cmsActions.setPageContext({ page }));
  }
}
