import type { DetailedHTMLProps, HTMLAttributes } from 'react';
import type { UiButtonElement } from './ui-button.types';

type UiButtonAttributes = DetailedHTMLProps<
  HTMLAttributes<UiButtonElement>,
  UiButtonElement
> & {
  label?: string;
  disabled?: boolean;
};

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'ui-button': UiButtonAttributes;
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ui-button': UiButtonElement;
  }
}

export {};
