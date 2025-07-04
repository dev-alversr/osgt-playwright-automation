import { defineConfig, devices } from '@playwright/test';
import { ConfigManager } from './src/config/ConfigManager';
import { Logger } from './src/core/utils/LoggingUtils';

const logger = new Logger('PlaywrightConfig');
const configManager = new ConfigManager(logger);
const testConfig = configManager.loadConfig(process.env.TEST_ENV || 'dev');

export default defineConfig({
  testDir: './src/tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? testConfig.retries : 0,
  workers: process.env.CI ? 1 : undefined,
  timeout: testConfig.timeout,
  
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['allure-playwright', { outputFolder: 'allure-results' }],
  ],

  use: {
    baseURL: testConfig.baseURL,
    headless: testConfig.headless,
    trace: 'on-first-retry',
    screenshot: testConfig.media.screenshot.mode,
    video: testConfig.media.video.mode,
    
    // Global test timeout
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },

  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
      },
    },
    
    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        viewport: { width: 1920, height: 1080 },
      },
    },
    
    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'],
        viewport: { width: 1920, height: 1080 },
      },
    },

    // Mobile testing
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  // Global setup and teardown
  globalSetup: require.resolve('./src/config/global-setup.ts'),
  globalTeardown: require.resolve('./src/config/global-teardown.ts'),

  // Web server for local testing
  webServer: process.env.CI ? undefined : {
    command: 'npm run start:test-server',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
});