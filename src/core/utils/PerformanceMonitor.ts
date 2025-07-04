import { Page } from '@playwright/test';
import { PerformanceMetrics, NetworkMetric, MemoryMetric, RenderingMetric } from '../types/global.types';
import { Logger } from './LoggingUtils';

/**
 * Performance monitoring utility
 */
export class PerformanceMonitor {
  private page: Page;
  private logger: Logger;
  private startTime: number = 0;
  private metrics: PerformanceMetrics | null = null;

  constructor(page: Page, logger: Logger) {
    this.page = page;
    this.logger = logger;
  }

  async startMonitoring(): Promise<void> {
    this.startTime = Date.now();
    this.logger.debug('Performance monitoring started');
  }

  async stopMonitoring(): Promise<PerformanceMetrics> {
    const endTime = Date.now();
    const pageLoadTime = endTime - this.startTime;

    // Get performance metrics from the browser
    const performanceData = await this.page.evaluate(() => {
      const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paintEntries = performance.getEntriesByType('paint');
      const memoryInfo = (performance as any).memory;

      return {
        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
        firstContentfulPaint: paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
        memoryUsage: memoryInfo ? {
          usedJSHeapSize: memoryInfo.usedJSHeapSize,
          totalJSHeapSize: memoryInfo.totalJSHeapSize,
          jsHeapSizeLimit: memoryInfo.jsHeapSizeLimit,
        } : null,
      };
    });

    // Get network metrics
    const networkMetrics = await this.getNetworkMetrics();

    this.metrics = {
      pageLoadTime,
      domContentLoaded: performanceData.domContentLoaded,
      networkRequests: networkMetrics,
      memoryUsage: performanceData.memoryUsage || {
        usedJSHeapSize: 0,
        totalJSHeapSize: 0,
        jsHeapSizeLimit: 0,
      },
      renderingMetrics: {
        firstContentfulPaint: performanceData.firstContentfulPaint,
        largestContentfulPaint: 0,
        cumulativeLayoutShift: 0,
        firstInputDelay: 0,
      },
    };

    this.logger.info('Performance monitoring completed', { metrics: this.metrics });
    return this.metrics;
  }

  private async getNetworkMetrics(): Promise<NetworkMetric[]> {
    // This would be implemented with network request tracking
    // For now, returning empty array as placeholder
    return [];
  }

  getLastMetrics(): PerformanceMetrics | null {
    return this.metrics;
  }

  validateThresholds(thresholds: { pageLoadTime: number; memoryUsage: number; networkLatency: number }): boolean {
    if (!this.metrics) return false;

    const isPageLoadValid = this.metrics.pageLoadTime <= thresholds.pageLoadTime;
    const isMemoryValid = this.metrics.memoryUsage.usedJSHeapSize <= thresholds.memoryUsage;
    
    this.logger.info('Performance thresholds validation', {
      pageLoadValid: isPageLoadValid,
      memoryValid: isMemoryValid,
      actualMetrics: this.metrics,
      thresholds,
    });

    return isPageLoadValid && isMemoryValid;
  }
}