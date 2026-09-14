import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
} from '@angular/core';
import { CmsFacade } from '@angular-nx-repo/shared-store';

export interface GalleryItem {
  id: string;
  title: string;
  caption?: string;
  image?: string;
}

@Component({
  selector: 'feat-gallery',
  templateUrl: './gallery.html',
  styleUrl: './gallery.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Gallery {
  private readonly cms = inject(CmsFacade);

  readonly title = input('Gallery');
  readonly columns = input('3');
  readonly items = input<string | GalleryItem[]>('[]');

  readonly itemSelect = output<GalleryItem>();

  readonly locale = this.cms.locale;
  readonly page = this.cms.page;

  readonly parsedItems = computed<GalleryItem[]>(() => {
    const value = this.items();
    if (Array.isArray(value)) {
      return value;
    }

    try {
      const parsed = JSON.parse(value) as unknown;
      return Array.isArray(parsed) ? (parsed as GalleryItem[]) : [];
    } catch {
      return [];
    }
  });

  selectItem(item: GalleryItem): void {
    this.itemSelect.emit(item);
  }
}
