import { defineConfig, devices } from '@playwright/test';

const host = process.env.PLAYWRIGHT_HOST || '127.0.0.1';
const port = process.env.PLAYWRIGHT_PORT || process.env.PORT || '5174';
const baseURL = process.env.PLAYWRIGHT_BASE_URL || `http://${host}:${port}`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'on',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: `npm run dev -- --host ${host} --port ${port} --strictPort`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
  },
});
