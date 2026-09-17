import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation,
} from '@angular/core';

export interface ButtonPressed {
  label: string;
}

@Component({
  selector: 'ui-button',
  templateUrl: './button.html',
  styleUrl: './button.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.ShadowDom,
})
export class Button {
  @Input() label = 'Button';
  @Input() disabled = false;

  @Output() readonly pressed = new EventEmitter<ButtonPressed>();

  onClick(): void {
    if (this.disabled) {
      return;
    }

    this.pressed.emit({ label: this.label });
  }
}
