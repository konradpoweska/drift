import { test, expect, type Page } from '@playwright/test';
import {
  seedSettings,
  readPersistedData,
  suppressNotificationPrompt,
} from './fixtures';

// The active screen; during a phase transition the outgoing copy is [inert].
function screen(page: Page) {
  return page.locator('.screen:not([inert])');
}

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
  await suppressNotificationPrompt(page);
  await seedSettings(page, SHORT_RANGES);
  await page.goto('/');

  await expect(page.getByText('Ready')).toBeVisible();
  await expect(screen(page).locator('.action')).toHaveText('Start focus');

  await screen(page).locator('.action').click();
  await expect(screen(page).locator('.label')).toHaveText('Focus');
  await expect(screen(page).locator('.clock')).toBeVisible();

  await expect(screen(page).locator('.label')).toHaveText('Break', {
    timeout: 5000,
  });
  await expect(screen(page).locator('.label')).toHaveText('Ready', {
    timeout: 5000,
  });
  await expect(screen(page).locator('.action')).toHaveText(
    'Start next session',
  );

  const data = await readPersistedData(page);
  const events = Object.values(data.events);
  expect(events).toHaveLength(2);
  expect(events.find((event) => event.type === 'focus')?.completed).toBe(true);
  expect(events.find((event) => event.type === 'break')?.completed).toBe(true);
});

test('stopping mid-focus records an incomplete event with the actual elapsed time', async ({
  page,
}) => {
  await suppressNotificationPrompt(page);
  await seedSettings(page, LONG_RANGES);
  await page.goto('/');

  await screen(page).locator('.action').click();
  await expect(screen(page).locator('.label')).toHaveText('Focus');
  await page.waitForTimeout(700);
  await screen(page).locator('.action').click();
  await expect(screen(page).locator('.label')).toHaveText('Ready');

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

  await suppressNotificationPrompt(page);
  await seedSettings(page, SHORT_RANGES);
  await page.goto('/');
  await screen(page).locator('.action').click();
  await expect(screen(page).locator('.label')).toHaveText('Ready', {
    timeout: 8000,
  });

  expect(errors).toEqual([]);
});
