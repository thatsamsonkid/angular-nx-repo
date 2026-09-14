import { Injector } from '@angular/core';
import { CmsFacade } from '@angular-nx-repo/elements';

export function hydrateCmsState(injector: Injector): void {
  const bootstrapState = window.__CMS_STATE__;
  if (!bootstrapState) {
    return;
  }

  injector.get(CmsFacade).hydrate(bootstrapState);
}
