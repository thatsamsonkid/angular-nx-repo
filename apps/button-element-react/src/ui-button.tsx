import { useEffect, useLayoutEffect, useRef } from 'react';
import type { ButtonPressed, UiButtonElement } from './ui-button.types';

export type UiButtonProps = {
  label: string;
  disabled?: boolean;
  onPressed?: (detail: ButtonPressed) => void;
};

/**
 * React wrapper around the `<ui-button>` custom element.
 *
 * React does not map `onPressed` to a `pressed` CustomEvent, and boolean
 * properties are safer to assign on the element than to pass as JSX
 * attributes. This is the same contract the vanilla demo uses: set `label`
 * / `disabled`, then listen for `pressed`.
 */
export function UiButton({
  label,
  disabled = false,
  onPressed,
}: UiButtonProps) {
  const elementRef = useRef<UiButtonElement>(null);
  const onPressedRef = useRef(onPressed);
  onPressedRef.current = onPressed;

  useLayoutEffect(() => {
    const element = elementRef.current;
    if (!element) {
      return;
    }

    element.label = label;
    element.disabled = disabled;
  }, [label, disabled]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) {
      return;
    }

    const handlePressed = (event: Event) => {
      onPressedRef.current?.((event as CustomEvent<ButtonPressed>).detail);
    };

    element.addEventListener('pressed', handlePressed);
    return () => element.removeEventListener('pressed', handlePressed);
  }, []);

  return <ui-button ref={elementRef}></ui-button>;
}
