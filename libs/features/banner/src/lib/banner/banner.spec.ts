import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideSharedStore } from '@angular-nx-repo/shared-store';
import { Banner } from './banner';

describe('Banner', () => {
  let fixture: ComponentFixture<Banner>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Banner],
      providers: [provideSharedStore()],
    }).compileComponents();

    fixture = TestBed.createComponent(Banner);
    fixture.componentRef.setInput('headline', 'Spring collection');
    fixture.componentRef.setInput('subheadline', 'New arrivals from the CMS.');
    fixture.componentRef.setInput('ctaLabel', 'Browse');
    await fixture.whenStable();
  });

  it('renders CMS-provided copy', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.banner__headline')?.textContent).toContain(
      'Spring collection',
    );
    expect(compiled.querySelector('.banner__cta')?.textContent).toContain(
      'Browse',
    );
  });

  it('emits ctaClick when the call to action is used', () => {
    const emissions: { headline: string }[] = [];
    fixture.componentInstance.ctaClick.subscribe((value) => emissions.push(value));

    (fixture.nativeElement as HTMLElement)
      .querySelector('a')
      ?.dispatchEvent(new Event('click'));

    expect(emissions).toEqual([{ headline: 'Spring collection' }]);
  });
});
