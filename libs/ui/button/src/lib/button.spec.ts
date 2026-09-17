import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Button } from './button';

function innerButton(fixture: ComponentFixture<Button>): HTMLButtonElement {
  const host = fixture.nativeElement as HTMLElement;
  const button =
    host.shadowRoot?.querySelector('button') ?? host.querySelector('button');

  if (!button) {
    throw new Error('Button template did not render a <button>');
  }

  return button;
}

describe('Button', () => {
  let fixture: ComponentFixture<Button>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Button],
    }).compileComponents();

    fixture = TestBed.createComponent(Button);
    fixture.componentRef.setInput('label', 'Save draft');
    await fixture.whenStable();
  });

  it('renders the label input', () => {
    expect(innerButton(fixture).textContent).toContain('Save draft');
  });

  it('emits pressed with the current label', () => {
    const emissions: { label: string }[] = [];
    fixture.componentInstance.pressed.subscribe((value) => emissions.push(value));

    innerButton(fixture).dispatchEvent(new Event('click'));

    expect(emissions).toEqual([{ label: 'Save draft' }]);
  });

  it('does not emit when disabled', () => {
    const emissions: { label: string }[] = [];
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    fixture.componentInstance.pressed.subscribe((value) => emissions.push(value));

    innerButton(fixture).dispatchEvent(new Event('click'));

    expect(emissions).toEqual([]);
  });
});
