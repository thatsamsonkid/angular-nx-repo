import { UI_PACKAGE } from './ui-package';

describe('ui package', () => {
  it('identifies the publishable package name', () => {
    expect(UI_PACKAGE).toBe('@angular-nx-repo/ui');
  });
});
