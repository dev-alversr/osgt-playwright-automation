import * as winston from 'winston';
import { LoggingConfig } from '@core/types/global.types';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Enhanced logging utility with configurable levels and transports
 */
export class Logger {
  private logger: winston.Logger;
  private context: string;
  private static globalConfig: LoggingConfig | null = null;

  constructor(context: string, config?: LoggingConfig) {
    this.context = context;
    
    // Use provided config, global config, or default config
    const loggingConfig = config || Logger.globalConfig || this.getDefaultConfig();
    
    this.logger = winston.createLogger({
      level: loggingConfig.level,
      format: this.createFormat(loggingConfig),
      defaultMeta: { context: this.context, timestamp: new Date().toISOString() },
      transports: this.createTransports(loggingConfig),
      exitOnError: false,
    });
  }

  /**
   * Set global logging configuration
   */
  static setGlobalConfig(config: LoggingConfig): void {
    Logger.globalConfig = config;
  }

  /**
   * Get default logging configuration
   */
  private getDefaultConfig(): LoggingConfig {
    return {
      level: 'info',
      format: 'simple',
      transports: ['console'],
    };
  }

  /**
   * Create winston format based on configuration
   */
  private createFormat(config: LoggingConfig): winston.Logform.Format {
    const formats: winston.Logform.Format[] = [
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
    ];

    if (config.format === 'json') {
      formats.push(winston.format.json());
    } else {
      formats.push(
        winston.format.printf(({ timestamp, level, message, context, stack, ...meta }) => {
          const metaString = Object.keys(meta).length ? ` | ${JSON.stringify(meta)}` : '';
          const stackString = stack ? `\n${stack}` : '';
          const levelFormatted = level.toUpperCase().padEnd(5);
          const contextFormatted = context ? `[${context}]`.padEnd(20) : '[UNKNOWN]'.padEnd(20);
          
          return `${timestamp} ${levelFormatted} ${contextFormatted} ${message}${metaString}${stackString}`;
        })
      );
    }

    return winston.format.combine(...formats);
  }

  /**
   * Create winston transports based on configuration
   */
  private createTransports(config: LoggingConfig): winston.transport[] {
    const transports: winston.transport[] = [];

    if (!config.transports || config.transports.includes('console')) {
      transports.push(
        new winston.transports.Console({
          handleExceptions: true,
          handleRejections: true,
        })
      );
    }

    if (config.transports?.includes('file')) {
      const logDir = path.dirname(config.filename || 'logs/app.log');
      
      // Ensure log directory exists
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }

      // Main log file
      transports.push(
        new winston.transports.File({
          filename: config.filename || 'logs/app.log',
          handleExceptions: true,
          handleRejections: true,
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        })
      );

      // Error-only log file
      transports.push(
        new winston.transports.File({
          filename: config.filename?.replace('.log', '-error.log') || 'logs/error.log',
          level: 'error',
          handleExceptions: true,
          handleRejections: true,
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        })
      );
    }

    return transports;
  }

  /**
   * Log debug message
   */
  debug(message: string, meta?: any): void {
    this.logger.debug(message, this.sanitizeMeta(meta));
  }

  /**
   * Log info message
   */
  info(message: string, meta?: any): void {
    this.logger.info(message, this.sanitizeMeta(meta));
  }

  /**
   * Log warning message
   */
  warn(message: string, meta?: any): void {
    this.logger.warn(message, this.sanitizeMeta(meta));
  }

  /**
   * Log error message
   */
  error(message: string, meta?: any): void {
    this.logger.error(message, this.sanitizeMeta(meta));
  }

  /**
   * Log with custom level
   */
  log(level: string, message: string, meta?: any): void {
    this.logger.log(level, message, this.sanitizeMeta(meta));
  }

  /**
   * Create child logger with additional context
   */
  child(additionalContext: string): Logger {
    const childContext = `${this.context}:${additionalContext}`;
    return new Logger(childContext, Logger.globalConfig || undefined);
  }

  /**
   * Log performance metrics
   */
  performance(operation: string, duration: number, meta?: any): void {
    this.info(`Performance: ${operation} completed`, {
      operation,
      duration: `${duration}ms`,
      ...this.sanitizeMeta(meta),
    });
  }

  /**
   * Log test step
   */
  step(stepName: string, stepNumber?: number, meta?: any): void {
    const stepPrefix = stepNumber ? `Step ${stepNumber}` : 'Step';
    this.info(`${stepPrefix}: ${stepName}`, this.sanitizeMeta(meta));
  }

  /**
   * Log API request/response
   */
  api(method: string, url: string, status?: number, duration?: number, meta?: any): void {
    const statusText = status ? ` [${status}]` : '';
    const durationText = duration ? ` (${duration}ms)` : '';
    
    this.info(`API: ${method} ${url}${statusText}${durationText}`, this.sanitizeMeta(meta));
  }

  /**
   * Log database operation
   */
  database(operation: string, table: string, rowCount?: number, duration?: number, meta?: any): void {
    const rowText = rowCount !== undefined ? ` (${rowCount} rows)` : '';
    const durationText = duration ? ` (${duration}ms)` : '';
    
    this.info(`DB: ${operation} on ${table}${rowText}${durationText}`, this.sanitizeMeta(meta));
  }

  /**
   * Log test result
   */
  testResult(testName: string, status: 'PASS' | 'FAIL' | 'SKIP', duration?: number, meta?: any): void {
    const level = status === 'FAIL' ? 'error' : status === 'SKIP' ? 'warn' : 'info';
    const durationText = duration ? ` (${duration}ms)` : '';
    
    this.log(level, `Test ${status}: ${testName}${durationText}`, this.sanitizeMeta(meta));
  }

  /**
   * Sanitize metadata to remove sensitive information
   */
  private sanitizeMeta(meta?: any): any {
    if (!meta) return meta;

    const sensitiveKeys = ['password', 'token', 'secret', 'key', 'authorization', 'cookie'];
    const sanitized = { ...meta };

    const sanitizeObject = (obj: any, path: string = ''): any => {
      if (typeof obj !== 'object' || obj === null) return obj;

      if (Array.isArray(obj)) {
        return obj.map((item, index) => sanitizeObject(item, `${path}[${index}]`));
      }

      const result: any = {};
      for (const [key, value] of Object.entries(obj)) {
        const currentPath = path ? `${path}.${key}` : key;
        
        if (sensitiveKeys.some(sensitiveKey => 
          key.toLowerCase().includes(sensitiveKey) || 
          currentPath.toLowerCase().includes(sensitiveKey)
        )) {
          result[key] = '[REDACTED]';
        } else if (typeof value === 'object' && value !== null) {
          result[key] = sanitizeObject(value, currentPath);
        } else {
          result[key] = value;
        }
      }
      return result;
    };

    return sanitizeObject(sanitized);
  }

  /**
   * Start timing an operation
   */
  startTimer(label: string): { end: () => void } {
    const startTime = Date.now();
    
    return {
      end: () => {
        const duration = Date.now() - startTime;
        this.performance(label, duration);
      }
    };
  }

  /**
   * Log with structured data for analytics
   */
  analytics(event: string, data: Record<string, any>): void {
    this.info(`Analytics: ${event}`, {
      event,
      analyticsData: this.sanitizeMeta(data),
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Log security-related events
   */
  security(event: string, severity: 'low' | 'medium' | 'high' | 'critical', meta?: any): void {
    const level = severity === 'critical' || severity === 'high' ? 'error' : 
                  severity === 'medium' ? 'warn' : 'info';
    
    this.log(level, `Security [${severity.toUpperCase()}]: ${event}`, {
      securityEvent: true,
      severity,
      ...this.sanitizeMeta(meta),
    });
  }

  /**
   * Close logger and cleanup resources
   */
  close(): Promise<void> {
    return new Promise((resolve) => {
      this.logger.on('finish', resolve);
      this.logger.end();
    });
  }

  /**
   * Get current log level
   */
  getLevel(): string {
    return this.logger.level;
  }

  /**
   * Set log level dynamically
   */
  setLevel(level: string): void {
    this.logger.level = level;
  }

  /**
   * Check if level will be logged
   */
  isLevelEnabled(level: string): boolean {
    return this.logger.isLevelEnabled(level);
  }
}