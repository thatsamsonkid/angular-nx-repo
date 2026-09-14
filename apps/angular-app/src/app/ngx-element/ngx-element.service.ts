import { createNgModule, inject, Injectable, Injector, Type } from '@angular/core';
import {
  ElementHostModule,
  LazyElementDef,
} from '@angular-nx-repo/elements';
import { LAZY_ELEMENT_CONFIG } from './tokens';

export interface LoadedElement {
  selector: string;
  componentClass: Type<unknown>;
  injector: Injector;
}

@Injectable()
export class NgxElementService {
  private readonly injector = inject(Injector);
  private readonly registry = new Map<string, LazyElementDef>();
  private readonly loaded = new Map<string, LoadedElement>();
  private readonly loading = new Map<string, Promise<LoadedElement>>();

  constructor() {
    for (const definition of inject(LAZY_ELEMENT_CONFIG)) {
      this.registry.set(definition.selector, definition);
    }
  }

  loadComponent(selector: string): Promise<LoadedElement> {
    const cached = this.loaded.get(selector);
    if (cached) {
      return Promise.resolve(cached);
    }

    const inFlight = this.loading.get(selector);
    if (inFlight) {
      return inFlight;
    }

    const definition = this.registry.get(selector);
    if (!definition) {
      return Promise.reject(
        new Error(
          `Unrecognized component "${selector}". Register it in elementLazyConfig.`,
        ),
      );
    }

    const loadPromise = definition
      .loadChildren()
      .then((moduleType) => this.createLoadedElement(selector, moduleType));

    this.loading.set(selector, loadPromise);
    return loadPromise;
  }

  private createLoadedElement(
    selector: string,
    moduleType: Type<ElementHostModule>,
  ): LoadedElement {
    const moduleRef = createNgModule(moduleType, this.injector);
    const exposed = moduleRef.instance.customElementComponent;
    const componentClass =
      typeof exposed === 'function'
        ? exposed
        : exposed?.[selector];

    if (!componentClass) {
      throw new Error(
        `Module for "${selector}" did not expose customElementComponent.`,
      );
    }

    const loaded = {
      selector,
      componentClass,
      injector: moduleRef.injector,
    };
    this.loaded.set(selector, loaded);
    this.loading.delete(selector);
    return loaded;
  }
}
