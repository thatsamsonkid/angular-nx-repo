import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  inject,
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

  @Input() title = 'Gallery';
  @Input() columns = '3';
  @Input() items: string | GalleryItem[] = '[]';

  @Output() readonly itemSelect = new EventEmitter<GalleryItem>();

  readonly locale = this.cms.locale;
  readonly page = this.cms.page;

  get parsedItems(): GalleryItem[] {
    if (Array.isArray(this.items)) {
      return this.items;
    }

    try {
      const parsed = JSON.parse(this.items) as unknown;
      return Array.isArray(parsed) ? (parsed as GalleryItem[]) : [];
    } catch {
      return [];
    }
  }

  selectItem(item: GalleryItem): void {
    this.itemSelect.emit(item);
  }
}
