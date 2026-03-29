import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  retries: 0,
  use: {
    baseURL: 'http://localhost:8081',
    viewport: { width: 390, height: 844 },
    actionTimeout: 10000,
  },
  webServer: {
    command: 'npx expo start --web --port 8081',
    port: 8081,
    timeout: 30000,
    reuseExistingServer: true,
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
  ],
});
