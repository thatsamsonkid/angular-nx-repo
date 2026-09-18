export interface ButtonPressed {
  label: string;
}

export type UiButtonElement = HTMLElement & {
  label: string;
  disabled: boolean;
};
