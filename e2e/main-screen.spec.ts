import { test, expect } from '@playwright/test';
import { seedSettings, readPersistedData } from './fixtures';

const SHORT_RANGES = {
  focusMinMs: 1500,
  focusMaxMs: 2000,
  breakMinMs: 1500,
  breakMaxMs: 2000,
};

const LONG_RANGES = {
  focusMinMs: 30_000,
  focusMaxMs: 40_000,
  breakMinMs: 30_000,
  breakMaxMs: 40_000,
};

test('runs a full focus -> break -> idle cycle and records both events', async ({
  page,
}) => {
  await seedSettings(page, SHORT_RANGES);
  await page.goto('/');

  await expect(page.getByText('Ready')).toBeVisible();
  await expect(page.locator('.action')).toHaveText('Start focus');

  await page.locator('.action').click();
  await expect(page.locator('.label:not([inert])')).toHaveText('Focus');
  await expect(page.locator('.clock')).toBeVisible();

  await expect(page.locator('.label:not([inert])')).toHaveText('Break', {
    timeout: 5000,
  });
  await expect(page.locator('.label:not([inert])')).toHaveText('Ready', {
    timeout: 5000,
  });
  await expect(page.locator('.action')).toHaveText('Start next session');

  const data = await readPersistedData(page);
  const events = Object.values(data.events);
  expect(events).toHaveLength(2);
  expect(events.find((event) => event.type === 'focus')?.completed).toBe(true);
  expect(events.find((event) => event.type === 'break')?.completed).toBe(true);
});

test('stopping mid-focus records an incomplete event with the actual elapsed time', async ({
  page,
}) => {
  await seedSettings(page, LONG_RANGES);
  await page.goto('/');

  await page.locator('.action').click();
  await expect(page.locator('.label:not([inert])')).toHaveText('Focus');
  await page.waitForTimeout(700);
  await page.locator('.action').click();
  await expect(page.locator('.label:not([inert])')).toHaveText('Ready');

  const data = await readPersistedData(page);
  const events = Object.values(data.events);
  expect(events).toHaveLength(1);
  expect(events[0].type).toBe('focus');
  expect(events[0].completed).toBe(false);
  expect(events[0].durationMs).toBeGreaterThan(500);
  expect(events[0].durationMs).toBeLessThan(LONG_RANGES.focusMinMs);
});

test('produces no console errors during a full cycle', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(String(err)));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  await seedSettings(page, SHORT_RANGES);
  await page.goto('/');
  await page.locator('.action').click();
  await expect(page.locator('.label:not([inert])')).toHaveText('Ready', {
    timeout: 8000,
  });

  expect(errors).toEqual([]);
});
