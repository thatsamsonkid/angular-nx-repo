import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  inject,
} from '@angular/core';
import { CmsFacade } from '@angular-nx-repo/shared-store';

@Component({
  selector: 'feat-banner',
  templateUrl: './banner.html',
  styleUrl: './banner.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Banner {
  private readonly cms = inject(CmsFacade);

  @Input() headline = '';
  @Input() subheadline = '';
  @Input() ctaLabel = '';
  @Input() ctaHref = '#';
  @Input() theme: 'light' | 'dark' = 'light';

  @Output() readonly ctaClick = new EventEmitter<{ headline: string }>();

  readonly user = this.cms.user;
  readonly locale = this.cms.locale;
  readonly page = this.cms.page;

  onCta(event: Event): void {
    event.preventDefault();
    this.ctaClick.emit({ headline: this.headline });
  }
}
