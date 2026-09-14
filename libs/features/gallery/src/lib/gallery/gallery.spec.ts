import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideSharedStore } from '@angular-nx-repo/shared-store';
import { Gallery, GalleryItem } from './gallery';

describe('Gallery', () => {
  let fixture: ComponentFixture<Gallery>;

  const items: GalleryItem[] = [
    { id: '1', title: 'Cedar Path', caption: 'North woods' },
    { id: '2', title: 'Harbor Light', caption: 'Evening tide' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Gallery],
      providers: [provideSharedStore()],
    }).compileComponents();

    fixture = TestBed.createComponent(Gallery);
    fixture.componentRef.setInput('title', 'Editorial picks');
    fixture.componentRef.setInput('items', JSON.stringify(items));
    await fixture.whenStable();
  });

  it('parses CMS data-items JSON into cards', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.gallery__title')?.textContent).toContain(
      'Editorial picks',
    );
    expect(compiled.querySelectorAll('.gallery__card').length).toBe(2);
    expect(compiled.textContent).toContain('Harbor Light');
  });

  it('emits the selected item', () => {
    const emissions: GalleryItem[] = [];
    fixture.componentInstance.itemSelect.subscribe((value) =>
      emissions.push(value),
    );

    (fixture.nativeElement as HTMLElement)
      .querySelectorAll('button')[1]
      ?.click();

    expect(emissions).toEqual([items[1]]);
  });
});
