// Test: Evoloom web app — serves nothing itself; expects the app on :9131
// Run:  PLAYWRIGHT_BROWSERS_PATH=/home/ruben/.playwright-browsers npx playwright test tutorial.spec.js --project=chromium
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: '.',
  timeout: 120000,
  outputDir: 'test-results',
  use: {
    headless: true,
    screenshot: 'on',
    trace: 'on-first-retry',
    launchOptions: {
      executablePath: '/home/ruben/.playwright-browsers/chromium-1217/chrome-linux64/chrome',
      args: ['--no-sandbox'],
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
});
