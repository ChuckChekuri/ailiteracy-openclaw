const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [
    ['html', { outputFolder: 'reports/playwright' }],
    ['json', { outputFile: 'reports/test-results.json' }]
  ],
  use: {
    trace: 'on-first-retry',
    video: 'on',
    screenshot: 'only-on-failure',
    baseURL: 'https://discord.com',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  outputDir: 'videos/',
});
