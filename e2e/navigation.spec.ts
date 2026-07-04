import { test, expect } from '@playwright/test';

test('the gear icon toggles between the main screen and settings, and back', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(String(err)));

  await page.goto('./');
  await expect(page.getByText('Ready')).toBeVisible();

  await page.locator('.toggle').click();
  await expect(page.getByText('Settings')).toBeVisible();

  await page.locator('.toggle').click();
  await expect(page.getByText('Ready')).toBeVisible();

  expect(errors).toEqual([]);
});
