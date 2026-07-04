import type { Page } from '@playwright/test';

export interface SeedSettings {
  focusMinMs: number;
  focusMaxMs: number;
  breakMinMs: number;
  breakMaxMs: number;
}

export interface StoredSessionEvent {
  id: string;
  deviceId: string;
  type: 'focus' | 'break';
  startedAt: number;
  durationMs: number;
  completed: boolean;
}

interface StoredData {
  version: 1;
  deviceId: string;
  settings: SeedSettings & { updatedAt: number; deviceId: string };
  events: Record<string, StoredSessionEvent>;
}

const STORAGE_KEY = 'drift';
const TEST_DEVICE_ID = 'test-device';

export async function seedSettings(
  page: Page,
  settings: SeedSettings,
): Promise<void> {
  await page.addInitScript(
    ({ key, deviceId, settings: seededSettings }) => {
      localStorage.setItem(
        key,
        JSON.stringify({
          version: 1,
          deviceId,
          settings: { ...seededSettings, updatedAt: Date.now(), deviceId },
          events: {},
        }),
      );
    },
    { key: STORAGE_KEY, deviceId: TEST_DEVICE_ID, settings },
  );
}

export async function readPersistedData(page: Page): Promise<StoredData> {
  const raw = await page.evaluate(
    (key) => localStorage.getItem(key),
    STORAGE_KEY,
  );
  if (raw === null) throw new Error('no persisted data found in localStorage');
  return JSON.parse(raw) as StoredData;
}
