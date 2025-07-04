"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
const winston = __importStar(require("winston"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
/**
 * Enhanced logging utility with configurable levels and transports
 */
class Logger {
    logger;
    context;
    static globalConfig = null;
    constructor(context, config) {
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
    static setGlobalConfig(config) {
        Logger.globalConfig = config;
    }
    /**
     * Get default logging configuration
     */
    getDefaultConfig() {
        return {
            level: 'info',
            format: 'simple',
            transports: ['console'],
        };
    }
    /**
     * Create winston format based on configuration
     */
    createFormat(config) {
        const formats = [
            winston.format.timestamp(),
            winston.format.errors({ stack: true }),
        ];
        if (config.format === 'json') {
            formats.push(winston.format.json());
        }
        else {
            formats.push(winston.format.printf(({ timestamp, level, message, context, stack, ...meta }) => {
                const metaString = Object.keys(meta).length ? ` | ${JSON.stringify(meta)}` : '';
                const stackString = stack ? `\n${stack}` : '';
                const levelFormatted = level.toUpperCase().padEnd(5);
                const contextFormatted = context ? `[${context}]`.padEnd(20) : '[UNKNOWN]'.padEnd(20);
                return `${timestamp} ${levelFormatted} ${contextFormatted} ${message}${metaString}${stackString}`;
            }));
        }
        return winston.format.combine(...formats);
    }
    /**
     * Create winston transports based on configuration
     */
    createTransports(config) {
        const transports = [];
        if (!config.transports || config.transports.includes('console')) {
            transports.push(new winston.transports.Console({
                handleExceptions: true,
                handleRejections: true,
            }));
        }
        if (config.transports?.includes('file')) {
            const logDir = path.dirname(config.filename || 'logs/app.log');
            // Ensure log directory exists
            if (!fs.existsSync(logDir)) {
                fs.mkdirSync(logDir, { recursive: true });
            }
            // Main log file
            transports.push(new winston.transports.File({
                filename: config.filename || 'logs/app.log',
                handleExceptions: true,
                handleRejections: true,
                maxsize: 5242880, // 5MB
                maxFiles: 5,
            }));
            // Error-only log file
            transports.push(new winston.transports.File({
                filename: config.filename?.replace('.log', '-error.log') || 'logs/error.log',
                level: 'error',
                handleExceptions: true,
                handleRejections: true,
                maxsize: 5242880, // 5MB
                maxFiles: 5,
            }));
        }
        return transports;
    }
    /**
     * Log debug message
     */
    debug(message, meta) {
        this.logger.debug(message, this.sanitizeMeta(meta));
    }
    /**
     * Log info message
     */
    info(message, meta) {
        this.logger.info(message, this.sanitizeMeta(meta));
    }
    /**
     * Log warning message
     */
    warn(message, meta) {
        this.logger.warn(message, this.sanitizeMeta(meta));
    }
    /**
     * Log error message
     */
    error(message, meta) {
        this.logger.error(message, this.sanitizeMeta(meta));
    }
    /**
     * Log with custom level
     */
    log(level, message, meta) {
        this.logger.log(level, message, this.sanitizeMeta(meta));
    }
    /**
     * Create child logger with additional context
     */
    child(additionalContext) {
        const childContext = `${this.context}:${additionalContext}`;
        return new Logger(childContext, Logger.globalConfig || undefined);
    }
    /**
     * Log performance metrics
     */
    performance(operation, duration, meta) {
        this.info(`Performance: ${operation} completed`, {
            operation,
            duration: `${duration}ms`,
            ...this.sanitizeMeta(meta),
        });
    }
    /**
     * Log test step
     */
    step(stepName, stepNumber, meta) {
        const stepPrefix = stepNumber ? `Step ${stepNumber}` : 'Step';
        this.info(`${stepPrefix}: ${stepName}`, this.sanitizeMeta(meta));
    }
    /**
     * Log API request/response
     */
    api(method, url, status, duration, meta) {
        const statusText = status ? ` [${status}]` : '';
        const durationText = duration ? ` (${duration}ms)` : '';
        this.info(`API: ${method} ${url}${statusText}${durationText}`, this.sanitizeMeta(meta));
    }
    /**
     * Log database operation
     */
    database(operation, table, rowCount, duration, meta) {
        const rowText = rowCount !== undefined ? ` (${rowCount} rows)` : '';
        const durationText = duration ? ` (${duration}ms)` : '';
        this.info(`DB: ${operation} on ${table}${rowText}${durationText}`, this.sanitizeMeta(meta));
    }
    /**
     * Log test result
     */
    testResult(testName, status, duration, meta) {
        const level = status === 'FAIL' ? 'error' : status === 'SKIP' ? 'warn' : 'info';
        const durationText = duration ? ` (${duration}ms)` : '';
        this.log(level, `Test ${status}: ${testName}${durationText}`, this.sanitizeMeta(meta));
    }
    /**
     * Sanitize metadata to remove sensitive information
     */
    sanitizeMeta(meta) {
        if (!meta)
            return meta;
        const sensitiveKeys = ['password', 'token', 'secret', 'key', 'authorization', 'cookie'];
        const sanitized = { ...meta };
        const sanitizeObject = (obj, path = '') => {
            if (typeof obj !== 'object' || obj === null)
                return obj;
            if (Array.isArray(obj)) {
                return obj.map((item, index) => sanitizeObject(item, `${path}[${index}]`));
            }
            const result = {};
            for (const [key, value] of Object.entries(obj)) {
                const currentPath = path ? `${path}.${key}` : key;
                if (sensitiveKeys.some(sensitiveKey => key.toLowerCase().includes(sensitiveKey) ||
                    currentPath.toLowerCase().includes(sensitiveKey))) {
                    result[key] = '[REDACTED]';
                }
                else if (typeof value === 'object' && value !== null) {
                    result[key] = sanitizeObject(value, currentPath);
                }
                else {
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
    startTimer(label) {
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
    analytics(event, data) {
        this.info(`Analytics: ${event}`, {
            event,
            analyticsData: this.sanitizeMeta(data),
            timestamp: new Date().toISOString(),
        });
    }
    /**
     * Log security-related events
     */
    security(event, severity, meta) {
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
    close() {
        return new Promise((resolve) => {
            this.logger.on('finish', resolve);
            this.logger.end();
        });
    }
    /**
     * Get current log level
     */
    getLevel() {
        return this.logger.level;
    }
    /**
     * Set log level dynamically
     */
    setLevel(level) {
        this.logger.level = level;
    }
    /**
     * Check if level will be logged
     */
    isLevelEnabled(level) {
        return this.logger.isLevelEnabled(level);
    }
}
exports.Logger = Logger;
