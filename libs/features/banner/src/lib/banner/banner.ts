import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { CmsFacade } from '@angular-nx-repo/shared-store';

@Component({
  selector: 'feat-banner',
  templateUrl: './banner.html',
  styleUrl: './banner.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Banner {
  private readonly cms = inject(CmsFacade);

  readonly headline = input('');
  readonly subheadline = input('');
  readonly ctaLabel = input('');
  readonly ctaHref = input('#');
  readonly theme = input<'light' | 'dark'>('light');

  readonly ctaClick = output<{ headline: string }>();

  readonly user = this.cms.user;
  readonly locale = this.cms.locale;
  readonly page = this.cms.page;

  onCta(event: Event): void {
    event.preventDefault();
    this.ctaClick.emit({ headline: this.headline() });
  }
}
