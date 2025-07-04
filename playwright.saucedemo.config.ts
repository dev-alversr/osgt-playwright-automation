import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

// Load SauceDemo environment variables
dotenv.config({ path: '.env.saucedemo' });

/**
 * Playwright configuration for SauceDemo tests
 * Using Test Automation Framework
 */
export default defineConfig({
  testDir: './src/tests/ui',
  testMatch: '**/SauceDemoTests.ts',
  
  // Global test settings
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 2,
  timeout: 60000,

  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'playwright-report-saucedemo' }],
    ['json', { outputFile: 'test-results/saucedemo-results.json' }],
    ['allure-playwright', { outputFolder: 'allure-results-saucedemo' }],
    ['list']
  ],

  // Global test configuration
  use: {
    // Base URL for SauceDemo
    baseURL: process.env.BASE_URL || 'https://www.saucedemo.com',
    
    // Browser settings
    headless: process.env.HEADLESS === 'true',
    
    // Viewport
    viewport: { 
      width: parseInt(process.env.VIEWPORT_WIDTH || '1920'), 
      height: parseInt(process.env.VIEWPORT_HEIGHT || '1080') 
    },

    // Screenshots and videos
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    // Tracing
    trace: 'on-first-retry',
    
    // Timeouts
    actionTimeout: 10000,
    navigationTimeout: 30000,
    
    // Other settings
    ignoreHTTPSErrors: true,
    
    // Locale
    locale: 'en-US',
    timezoneId: 'America/New_York',
  },

  // Test projects for different browsers
  projects: [
    {
      name: 'chromium-saucedemo',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
      },
    },

    {
      name: 'firefox-saucedemo',
      use: { 
        ...devices['Desktop Firefox'],
        viewport: { width: 1920, height: 1080 },
      },
    },

    {
      name: 'webkit-saucedemo',
      use: { 
        ...devices['Desktop Safari'],
        viewport: { width: 1920, height: 1080 },
      },
    },

    // Mobile testing
    {
      name: 'mobile-chrome-saucedemo',
      use: { ...devices['Pixel 5'] },
    },

    {
      name: 'mobile-safari-saucedemo',
      use: { ...devices['iPhone 12'] },
    },

    // Tablet testing
    {
      name: 'tablet-saucedemo',
      use: { ...devices['iPad Pro'] },
    },
  ],

  // Output directories
  outputDir: 'test-results/saucedemo',
  
  // Global setup and teardown (if needed)
  // globalSetup: require.resolve('./src/config/saucedemo-setup.ts'),
  // globalTeardown: require.resolve('./src/config/saucedemo-teardown.ts'),

  // Web server (not needed for SauceDemo as it's external)
  // webServer: undefined,

  // Expect configuration
  expect: {
    // Global test timeout
    timeout: 10000,
    
    // Screenshot comparison threshold
    threshold: 0.2,
    
    // Animation handling
    toHaveScreenshot: { 
      threshold: 0.2, 
      mode: 'visual',
      animations: 'disabled'
    },
    
    toMatchSnapshot: { 
      threshold: 0.2,
      mode: 'visual'
    },
  },
});