import { defineConfig } from '@playwright/test';

const PORT = 5173;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  reporter: 'list',
  use: {
    // Matches the `base` in vite.config.ts — the dev server serves under it.
    baseURL: `http://localhost:${PORT}/drift/`,
    channel: 'chrome',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run dev',
    port: PORT,
    reuseExistingServer: !process.env.CI,
  },
});
