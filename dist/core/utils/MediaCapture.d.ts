import { Page } from '@playwright/test';
import { MediaConfig } from '../types/global.types';
import { Logger } from './LoggingUtils';
/**
 * Media capture utility for screenshots and videos
 */
export declare class MediaCapture {
    private page;
    private logger;
    private config;
    constructor(page: Page, logger: Logger, config?: MediaConfig);
    takeScreenshot(name: string): Promise<string>;
    startVideoRecording(): Promise<void>;
    stopVideoRecording(): Promise<string | null>;
}
