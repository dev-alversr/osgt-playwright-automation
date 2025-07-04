"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerformanceMonitor = void 0;
/**
 * Performance monitoring utility
 */
class PerformanceMonitor {
    page;
    logger;
    startTime = 0;
    metrics = null;
    constructor(page, logger) {
        this.page = page;
        this.logger = logger;
    }
    async startMonitoring() {
        this.startTime = Date.now();
        this.logger.debug('Performance monitoring started');
    }
    async stopMonitoring() {
        const endTime = Date.now();
        const pageLoadTime = endTime - this.startTime;
        // Get performance metrics from the browser
        const performanceData = await this.page.evaluate(() => {
            const perfData = performance.getEntriesByType('navigation')[0];
            const paintEntries = performance.getEntriesByType('paint');
            const memoryInfo = performance.memory;
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
    async getNetworkMetrics() {
        // This would be implemented with network request tracking
        // For now, returning empty array as placeholder
        return [];
    }
    getLastMetrics() {
        return this.metrics;
    }
    validateThresholds(thresholds) {
        if (!this.metrics)
            return false;
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
exports.PerformanceMonitor = PerformanceMonitor;
