/**
 * Custom error classes with specific error codes for the test automation framework
 */
export declare enum ErrorCode {
    ELEMENT_NOT_FOUND = "ELEMENT_NOT_FOUND",
    PAGE_LOAD_TIMEOUT = "PAGE_LOAD_TIMEOUT",
    API_REQUEST_FAILED = "API_REQUEST_FAILED",
    DATABASE_CONNECTION_FAILED = "DATABASE_CONNECTION_FAILED",
    AUTHENTICATION_FAILED = "AUTHENTICATION_FAILED",
    PERFORMANCE_THRESHOLD_EXCEEDED = "PERFORMANCE_THRESHOLD_EXCEEDED",
    TEST_DATA_GENERATION_FAILED = "TEST_DATA_GENERATION_FAILED",
    CONFIGURATION_ERROR = "CONFIGURATION_ERROR",
    NETWORK_ERROR = "NETWORK_ERROR",
    FILE_OPERATION_FAILED = "FILE_OPERATION_FAILED",
    VALIDATION_ERROR = "VALIDATION_ERROR",
    TIMEOUT_ERROR = "TIMEOUT_ERROR",
    ENCRYPTION_ERROR = "ENCRYPTION_ERROR",
    DATABASE_OPERATION_FAILED = "DATABASE_OPERATION_FAILED"
}
export declare class CustomError extends Error {
    code: ErrorCode;
    details: any;
    timestamp: Date;
    context?: string;
    constructor(message: string, code: ErrorCode, details?: any, context?: string);
    /**
     * Convert error to JSON for logging
     */
    toJSON(): object;
    /**
     * Get formatted error message for reporting
     */
    getFormattedMessage(): string;
}
export declare class ElementNotFoundError extends CustomError {
    constructor(selector: string, details?: any, context?: string);
}
export declare class PageLoadTimeoutError extends CustomError {
    constructor(url: string, timeout: number, details?: any, context?: string);
}
export declare class APIRequestFailedError extends CustomError {
    constructor(url: string, status: number, details?: any, context?: string);
}
export declare class DatabaseConnectionError extends CustomError {
    constructor(database: string, details?: any, context?: string);
}
export declare class AuthenticationFailedError extends CustomError {
    constructor(reason: string, details?: any, context?: string);
}
export declare class PerformanceThresholdExceededError extends CustomError {
    constructor(metric: string, actual: number, threshold: number, details?: any, context?: string);
}
export declare class TestDataGenerationError extends CustomError {
    constructor(reason: string, details?: any, context?: string);
}
export declare class ConfigurationError extends CustomError {
    constructor(reason: string, details?: any, context?: string);
}
export declare class NetworkError extends CustomError {
    constructor(reason: string, details?: any, context?: string);
}
export declare class FileOperationError extends CustomError {
    constructor(operation: string, filePath: string, details?: any, context?: string);
}
export declare class ValidationError extends CustomError {
    constructor(field: string, reason: string, details?: any, context?: string);
}
export declare class TimeoutError extends CustomError {
    constructor(operation: string, timeout: number, details?: any, context?: string);
}
export declare class EncryptionError extends CustomError {
    constructor(operation: string, details?: any, context?: string);
}
export declare class DatabaseOperationError extends CustomError {
    constructor(operation: string, table: string, details?: any, context?: string);
}
/**
 * Error handler utility class
 */
export declare class ErrorHandler {
    /**
     * Handle and log errors appropriately
     */
    static handle(error: Error, context?: string): never;
    /**
     * Create error from response object
     */
    static fromResponse(response: {
        status: number;
        statusText: string;
        url: string;
    }, context?: string): APIRequestFailedError;
    /**
     * Check if error is retryable
     */
    static isRetryable(error: CustomError): boolean;
    /**
     * Get error severity level
     */
    static getSeverity(error: CustomError): 'low' | 'medium' | 'high' | 'critical';
}
