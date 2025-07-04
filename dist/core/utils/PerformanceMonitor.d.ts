import { Page } from '@playwright/test';
import { PerformanceMetrics } from '../types/global.types';
import { Logger } from './LoggingUtils';
/**
 * Performance monitoring utility
 */
export declare class PerformanceMonitor {
    private page;
    private logger;
    private startTime;
    private metrics;
    constructor(page: Page, logger: Logger);
    startMonitoring(): Promise<void>;
    stopMonitoring(): Promise<PerformanceMetrics>;
    private getNetworkMetrics;
    getLastMetrics(): PerformanceMetrics | null;
    validateThresholds(thresholds: {
        pageLoadTime: number;
        memoryUsage: number;
        networkLatency: number;
    }): boolean;
}
