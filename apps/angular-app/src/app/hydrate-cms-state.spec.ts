import { Injector } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CmsFacade, provideElements } from '@angular-nx-repo/elements';
import { hydrateCmsState } from './hydrate-cms-state';

describe('hydrateCmsState', () => {
  it('writes window.__CMS_STATE__ into the shared store', async () => {
    window.__CMS_STATE__ = {
      locale: 'de',
    };

    await TestBed.configureTestingModule({
      providers: [provideElements()],
    }).compileComponents();

    hydrateCmsState(TestBed.inject(Injector));

    const cms = TestBed.inject(CmsFacade);
    expect(cms.locale()).toBe('de');
  });
});
