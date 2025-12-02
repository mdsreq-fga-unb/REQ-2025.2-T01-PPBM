import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for PPBM Admin Integration Tests
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,

  /* Opt out of parallel tests on CI */
  workers: process.env.CI ? 1 : undefined,

  /* Reporter to use */
  reporter: [
    ['html', { open: 'never' }],
    ['list']
  ],

  /* Shared settings for all the projects below */
  use: {
    /* Base URL to use in actions like `await page.goto('/')` */
    baseURL: 'http://localhost:4321',

    /* Collect trace when retrying the failed test */
    trace: 'on-first-retry',

    /* Take screenshot on failure */
    screenshot: 'only-on-failure',

    /* Video recording on failure */
    video: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Uncomment to test in other browsers
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  /* 
   * Web server configuration
   * For local development: Start servers manually before running tests
   * - Frontend: cd app/apps/frontend && npm run dev (port 4321)
   * - Backend: cd app/apps/backend && npm run dev (port 3000)
   * 
   * Set PLAYWRIGHT_START_SERVERS=1 to have Playwright start them automatically
   */
  webServer: process.env.PLAYWRIGHT_START_SERVERS ? [
    {
      command: 'npm run dev',
      url: 'http://localhost:4321',
      cwd: './',
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
      stdout: 'pipe',
    },
    {
      command: 'npm run dev',
      url: 'http://localhost:3000',
      cwd: '../backend',
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
      stdout: 'pipe',
    },
  ] : undefined,

  /* Global timeout for each test */
  timeout: 30000,

  /* Expect timeout */
  expect: {
    timeout: 5000,
  },
});
