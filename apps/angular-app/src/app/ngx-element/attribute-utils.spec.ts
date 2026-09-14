import { camelCaseAttribute, readDataAttributes } from './attribute-utils';

describe('attribute-utils', () => {
  it('maps data-* attributes to camelCase component inputs', () => {
    expect(camelCaseAttribute('data-cta-label')).toBe('ctaLabel');
    expect(camelCaseAttribute('data-headline')).toBe('headline');
  });

  it('reads only data attributes from the host element', () => {
    const host = document.createElement('ngx-element');
    host.setAttribute('selector', 'banner');
    host.setAttribute('data-headline', 'Hello');
    host.setAttribute('data-cta-label', 'Go');

    expect(readDataAttributes(host)).toEqual([
      { name: 'headline', value: 'Hello' },
      { name: 'ctaLabel', value: 'Go' },
    ]);
  });
});
