import { expect, test } from '@playwright/test';

test('home page lazy-loads banner and gallery from the CMS markup', async ({
  page,
}) => {
  const bannerRemote = page.waitForResponse(
    (response) =>
      response.url().includes('/remotes/banner/remoteEntry.json') &&
      response.ok(),
  );

  await page.goto('/');
  await bannerRemote;

  await expect(page.locator('h1')).toContainText('Welcome to the editorial site');
  await expect(page.locator('feat-banner h2')).toContainText(
    'Stories from the ridge line',
  );
  await expect(page.locator('feat-gallery .gallery__card')).toHaveCount(3);
  await expect(page.locator('.banner__welcome')).toHaveCount(0);
});

test('campaign page only mounts the banner feature', async ({ page }) => {
  await page.goto('/campaign');

  await expect(page.locator('h1')).toContainText('Spring campaign landing');
  await expect(page.locator('feat-banner h2')).toContainText(
    'Reserve the spring issue',
  );
  await expect(page.locator('feat-gallery')).toHaveCount(0);
});

test('collection page only mounts the gallery feature', async ({ page }) => {
  await page.goto('/collection');

  await expect(page.locator('h1')).toContainText('Editorial collection');
  await expect(page.locator('feat-gallery .gallery__card')).toHaveCount(4);
  await expect(page.locator('feat-banner')).toHaveCount(0);
});

test('article page hydrates mixed islands without a signed-in session', async ({
  page,
}) => {
  await page.goto('/article');

  await expect(page.locator('feat-banner h2')).toContainText(
    'Read the full dispatch',
  );
  await expect(page.locator('feat-gallery .gallery__card')).toHaveCount(3);
  await expect(page.locator('.banner__welcome')).toHaveCount(0);
  await expect(page.locator('.banner__eyebrow')).toContainText('fr');
});

test('CMS sign-in events populate auth and loadSession restores it', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.locator('feat-banner')).toBeVisible();
  await expect(page.locator('.banner__welcome')).toHaveCount(0);

  await page.getByTestId('cms-signin').click();
  await expect(page.locator('.banner__welcome')).toContainText('Alex Rivera');

  await page.goto('/campaign');
  await expect(page.locator('.banner__welcome')).toContainText('Alex Rivera');

  await page.getByTestId('cms-signout').click();
  await expect(page.locator('.banner__welcome')).toHaveCount(0);

  await page.goto('/');
  await expect(page.locator('.banner__welcome')).toHaveCount(0);
});
