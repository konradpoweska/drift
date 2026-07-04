import { test, expect, type Page } from '@playwright/test';
import { seedSettings } from './fixtures';

function screen(page: Page) {
  return page.locator('.screen:not([inert])');
}

const SHORT_RANGES = {
  focusMinMs: 1500,
  focusMaxMs: 2000,
  breakMinMs: 1500,
  breakMaxMs: 2000,
};

interface RecordedNotification {
  title: string;
  body: string | undefined;
}

declare global {
  interface Window {
    __notifications: RecordedNotification[];
  }
}

// Records every notification the app tries to show, whichever path it takes
// (Service Worker registration.showNotification or the page-scoped fallback).
async function spyOnNotifications(page: Page): Promise<void> {
  await page.addInitScript(() => {
    window.__notifications = [];
    const record = (title: string, options?: NotificationOptions): void => {
      window.__notifications.push({ title, body: options?.body });
    };

    ServiceWorkerRegistration.prototype.showNotification = async function (
      title: string,
      options?: NotificationOptions,
    ) {
      record(title, options);
    };

    const OriginalNotification = window.Notification;
    const FakeNotification = function (
      title: string,
      options?: NotificationOptions,
    ) {
      record(title, options);
    } as unknown as typeof Notification;
    Object.defineProperty(FakeNotification, 'permission', {
      get: () => OriginalNotification.permission,
    });
    FakeNotification.requestPermission =
      OriginalNotification.requestPermission.bind(OriginalNotification);
    window.Notification = FakeNotification;
  });
}

test('first start shows the permission prompt once; "Not now" starts the session anyway', async ({
  page,
}) => {
  await seedSettings(page, SHORT_RANGES);
  await page.goto('/');

  await screen(page).locator('.action').click();
  await expect(page.getByText('Get notified between phases')).toBeVisible();
  await expect(screen(page).locator('.clock')).not.toBeVisible();

  await page.getByRole('button', { name: 'Not now' }).click();
  await expect(screen(page).locator('.label')).toHaveText('Focus');

  // Wait out the cycle, then start again: no prompt the second time.
  await expect(screen(page).locator('.label')).toHaveText('Ready', {
    timeout: 8000,
  });
  await screen(page).locator('.action').click();
  await expect(screen(page).locator('.label')).toHaveText('Focus');
  await expect(page.getByText('Get notified between phases')).not.toBeVisible();
});

test('the prompt stays dismissed across a reload', async ({ page }) => {
  await seedSettings(page, SHORT_RANGES);
  await page.goto('/');

  await screen(page).locator('.action').click();
  await page.getByRole('button', { name: 'Not now' }).click();
  await expect(screen(page).locator('.label')).toHaveText('Focus');

  await page.reload();
  await screen(page).locator('.action').click();
  await expect(screen(page).locator('.label')).toHaveText('Focus');
});

test('with permission granted, a notification fires on each phase transition', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['notifications']);
  await spyOnNotifications(page);
  await seedSettings(page, SHORT_RANGES);
  await page.goto('/');

  // Permission is already granted, so no prompt: straight into focus.
  await screen(page).locator('.action').click();
  await expect(screen(page).locator('.label')).toHaveText('Focus');
  await expect(screen(page).locator('.label')).toHaveText('Ready', {
    timeout: 8000,
  });

  await expect
    .poll(() => page.evaluate(() => window.__notifications))
    .toEqual([
      { title: 'Focus complete', body: 'Your break has started.' },
      {
        title: 'Break is over',
        body: 'Ready to start the next focus session?',
      },
    ]);
});

test('stopping manually fires no notification', async ({ page, context }) => {
  await context.grantPermissions(['notifications']);
  await spyOnNotifications(page);
  await seedSettings(page, {
    focusMinMs: 30_000,
    focusMaxMs: 40_000,
    breakMinMs: 30_000,
    breakMaxMs: 40_000,
  });
  await page.goto('/');

  await screen(page).locator('.action').click();
  await expect(screen(page).locator('.label')).toHaveText('Focus');
  await page.waitForTimeout(500);
  await screen(page).locator('.action').click();
  await expect(screen(page).locator('.label')).toHaveText('Ready');
  await page.waitForTimeout(500);

  expect(await page.evaluate(() => window.__notifications)).toEqual([]);
});
