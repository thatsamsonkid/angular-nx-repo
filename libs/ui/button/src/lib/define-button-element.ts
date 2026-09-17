import {
  ApplicationRef,
  Injector,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { createApplication } from '@angular/platform-browser';
import { Button } from './button';

export const UI_BUTTON_TAG = 'ui-button';

export interface DefineUiButtonOptions {
  /**
   * Reuse an existing Angular injector (for example an already-bootstrapped
   * host app). When omitted, a dedicated application is created so the
   * custom element can run outside Angular.
   */
  injector?: Injector;
}

export type UiButtonElement = HTMLElement & {
  label: string;
  disabled: boolean;
};

let registration: Promise<void> | undefined;
let elementApp: ApplicationRef | undefined;

/**
 * Registers `<ui-button>` from this secondary entry only. Other widgets in
 * `@angular-nx-repo/ui` are not part of the custom-element definition.
 */
export function defineUiButton(
  options: DefineUiButtonOptions = {},
): Promise<void> {
  if (customElements.get(UI_BUTTON_TAG)) {
    return Promise.resolve();
  }

  registration ??= registerUiButton(options);
  return registration;
}

/** Flushes the standalone element application created when no injector was passed. */
export async function whenUiButtonStable(): Promise<void> {
  await elementApp?.whenStable();
}

async function registerUiButton(
  options: DefineUiButtonOptions,
): Promise<void> {
  let injector = options.injector;

  if (!injector) {
    elementApp = await createApplication({
      providers: [
        provideBrowserGlobalErrorListeners(),
        provideZonelessChangeDetection(),
      ],
    });
    injector = elementApp.injector;
  }

  const element = createCustomElement(Button, { injector });
  customElements.define(UI_BUTTON_TAG, element);
}
