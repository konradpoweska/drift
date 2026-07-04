import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('./');
  await page.locator('.toggle').click();
  await expect(page.getByText('Settings')).toBeVisible();
});

test('dragging and keyboard interaction update slider values live', async ({
  page,
}) => {
  const focusMaxThumb = page.locator('[data-melt-slider-thumb]').nth(1);
  await focusMaxThumb.focus();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('.value').nth(1)).toHaveText('37 min');

  await page.keyboard.press('ArrowLeft');
  await expect(page.locator('.value').nth(1)).toHaveText('36 min');
});

test('min slider clamps against max instead of crossing it', async ({
  page,
}) => {
  const breakMinThumb = page.locator('[data-melt-slider-thumb]').nth(2);
  await breakMinThumb.focus();
  for (let i = 0; i < 20; i++) await page.keyboard.press('ArrowRight');

  await expect(page.locator('.value').nth(2)).toHaveText('10 min');
  await expect(page.locator('.value').nth(3)).toHaveText('10 min');
});

test('thumb position on screen reflects its value', async ({ page }) => {
  const root = page.locator('[data-melt-slider-root]').first();
  const thumb = root.locator('[data-melt-slider-thumb]');
  const rootBox = await root.boundingBox();
  const thumbBox = await thumb.boundingBox();
  if (rootBox === null || thumbBox === null)
    throw new Error('slider not rendered');

  // default focus-min is 20 out of the [5, 60] slider range -> ~27% along the track
  const relative = (thumbBox.x - rootBox.x) / rootBox.width;
  expect(relative).toBeGreaterThan(0.15);
  expect(relative).toBeLessThan(0.4);
});

test('settings persist across a reload', async ({ page }) => {
  const focusMaxThumb = page.locator('[data-melt-slider-thumb]').nth(1);
  await focusMaxThumb.focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('.value').nth(1)).toHaveText('36 min');

  // The reload lands back on the main screen (view state isn't persisted,
  // only setting values are) so navigate back to settings to check.
  await page.reload();
  await expect(page.getByText('Ready')).toBeVisible();
  await page.locator('.toggle').click();
  await expect(page.getByText('Settings')).toBeVisible();
  await expect(page.locator('.value').nth(1)).toHaveText('36 min');
});
