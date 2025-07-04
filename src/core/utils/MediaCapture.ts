import { Page } from '@playwright/test';
import { MediaConfig } from '../types/global.types';
import { Logger } from './LoggingUtils';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Media capture utility for screenshots and videos
 */
export class MediaCapture {
  private page: Page;
  private logger: Logger;
  private config: MediaConfig;

  constructor(page: Page, logger: Logger, config?: MediaConfig) {
    this.page = page;
    this.logger = logger;
    this.config = config || {
      screenshot: { mode: 'only-on-failure', fullPage: true },
      video: { mode: 'retain-on-failure', size: { width: 1920, height: 1080 } },
    };
  }

  async takeScreenshot(name: string): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${name}-${timestamp}.png`;
    const filepath = path.join('test-results', 'screenshots', filename);

    // Ensure directory exists
    const dir = path.dirname(filepath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    await this.page.screenshot({
      path: filepath,
      fullPage: this.config.screenshot.fullPage,
    });

    this.logger.info(`Screenshot captured: ${filepath}`);
    return filepath;
  }

  async startVideoRecording(): Promise<void> {
    if (this.config.video.mode !== 'off') {
      // Video recording is typically configured at the test runner level
      this.logger.info('Video recording started');
    }
  }

  async stopVideoRecording(): Promise<string | null> {
    if (this.config.video.mode !== 'off') {
      // Video recording is typically configured at the test runner level
      this.logger.info('Video recording stopped');
      return 'video-path'; // Placeholder
    }
    return null;
  }
}