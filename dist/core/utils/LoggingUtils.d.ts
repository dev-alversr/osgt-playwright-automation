import { LoggingConfig } from '@core/types/global.types';
/**
 * Enhanced logging utility with configurable levels and transports
 */
export declare class Logger {
    private logger;
    private context;
    private static globalConfig;
    constructor(context: string, config?: LoggingConfig);
    /**
     * Set global logging configuration
     */
    static setGlobalConfig(config: LoggingConfig): void;
    /**
     * Get default logging configuration
     */
    private getDefaultConfig;
    /**
     * Create winston format based on configuration
     */
    private createFormat;
    /**
     * Create winston transports based on configuration
     */
    private createTransports;
    /**
     * Log debug message
     */
    debug(message: string, meta?: any): void;
    /**
     * Log info message
     */
    info(message: string, meta?: any): void;
    /**
     * Log warning message
     */
    warn(message: string, meta?: any): void;
    /**
     * Log error message
     */
    error(message: string, meta?: any): void;
    /**
     * Log with custom level
     */
    log(level: string, message: string, meta?: any): void;
    /**
     * Create child logger with additional context
     */
    child(additionalContext: string): Logger;
    /**
     * Log performance metrics
     */
    performance(operation: string, duration: number, meta?: any): void;
    /**
     * Log test step
     */
    step(stepName: string, stepNumber?: number, meta?: any): void;
    /**
     * Log API request/response
     */
    api(method: string, url: string, status?: number, duration?: number, meta?: any): void;
    /**
     * Log database operation
     */
    database(operation: string, table: string, rowCount?: number, duration?: number, meta?: any): void;
    /**
     * Log test result
     */
    testResult(testName: string, status: 'PASS' | 'FAIL' | 'SKIP', duration?: number, meta?: any): void;
    /**
     * Sanitize metadata to remove sensitive information
     */
    private sanitizeMeta;
    /**
     * Start timing an operation
     */
    startTimer(label: string): {
        end: () => void;
    };
    /**
     * Log with structured data for analytics
     */
    analytics(event: string, data: Record<string, any>): void;
    /**
     * Log security-related events
     */
    security(event: string, severity: 'low' | 'medium' | 'high' | 'critical', meta?: any): void;
    /**
     * Close logger and cleanup resources
     */
    close(): Promise<void>;
    /**
     * Get current log level
     */
    getLevel(): string;
    /**
     * Set log level dynamically
     */
    setLevel(level: string): void;
    /**
     * Check if level will be logged
     */
    isLevelEnabled(level: string): boolean;
}
