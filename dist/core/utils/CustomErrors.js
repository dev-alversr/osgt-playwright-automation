"use strict";
/**
 * Custom error classes with specific error codes for the test automation framework
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorHandler = exports.DatabaseOperationError = exports.EncryptionError = exports.TimeoutError = exports.ValidationError = exports.FileOperationError = exports.NetworkError = exports.ConfigurationError = exports.TestDataGenerationError = exports.PerformanceThresholdExceededError = exports.AuthenticationFailedError = exports.DatabaseConnectionError = exports.APIRequestFailedError = exports.PageLoadTimeoutError = exports.ElementNotFoundError = exports.CustomError = exports.ErrorCode = void 0;
var ErrorCode;
(function (ErrorCode) {
    ErrorCode["ELEMENT_NOT_FOUND"] = "ELEMENT_NOT_FOUND";
    ErrorCode["PAGE_LOAD_TIMEOUT"] = "PAGE_LOAD_TIMEOUT";
    ErrorCode["API_REQUEST_FAILED"] = "API_REQUEST_FAILED";
    ErrorCode["DATABASE_CONNECTION_FAILED"] = "DATABASE_CONNECTION_FAILED";
    ErrorCode["AUTHENTICATION_FAILED"] = "AUTHENTICATION_FAILED";
    ErrorCode["PERFORMANCE_THRESHOLD_EXCEEDED"] = "PERFORMANCE_THRESHOLD_EXCEEDED";
    ErrorCode["TEST_DATA_GENERATION_FAILED"] = "TEST_DATA_GENERATION_FAILED";
    ErrorCode["CONFIGURATION_ERROR"] = "CONFIGURATION_ERROR";
    ErrorCode["NETWORK_ERROR"] = "NETWORK_ERROR";
    ErrorCode["FILE_OPERATION_FAILED"] = "FILE_OPERATION_FAILED";
    ErrorCode["VALIDATION_ERROR"] = "VALIDATION_ERROR";
    ErrorCode["TIMEOUT_ERROR"] = "TIMEOUT_ERROR";
    ErrorCode["ENCRYPTION_ERROR"] = "ENCRYPTION_ERROR";
    ErrorCode["DATABASE_OPERATION_FAILED"] = "DATABASE_OPERATION_FAILED";
})(ErrorCode || (exports.ErrorCode = ErrorCode = {}));
class CustomError extends Error {
    code;
    details;
    timestamp;
    context;
    constructor(message, code, details, context) {
        super(message);
        this.name = this.constructor.name;
        this.code = code;
        this.details = details;
        this.timestamp = new Date();
        this.context = context || undefined;
        // Maintains proper stack trace for where our error was thrown
        Error.captureStackTrace(this, this.constructor);
    }
    /**
     * Convert error to JSON for logging
     */
    toJSON() {
        return {
            name: this.name,
            message: this.message,
            code: this.code,
            details: this.details,
            timestamp: this.timestamp.toISOString(),
            context: this.context,
            stack: this.stack,
        };
    }
    /**
     * Get formatted error message for reporting
     */
    getFormattedMessage() {
        const contextStr = this.context ? ` [${this.context}]` : '';
        const detailsStr = this.details ? ` Details: ${JSON.stringify(this.details)}` : '';
        return `${this.code}${contextStr}: ${this.message}${detailsStr}`;
    }
}
exports.CustomError = CustomError;
class ElementNotFoundError extends CustomError {
    constructor(selector, details, context) {
        super(`Element not found: ${selector}`, ErrorCode.ELEMENT_NOT_FOUND, details, context);
    }
}
exports.ElementNotFoundError = ElementNotFoundError;
class PageLoadTimeoutError extends CustomError {
    constructor(url, timeout, details, context) {
        super(`Page load timeout after ${timeout}ms: ${url}`, ErrorCode.PAGE_LOAD_TIMEOUT, details, context);
    }
}
exports.PageLoadTimeoutError = PageLoadTimeoutError;
class APIRequestFailedError extends CustomError {
    constructor(url, status, details, context) {
        super(`API request failed: ${url} (Status: ${status})`, ErrorCode.API_REQUEST_FAILED, details, context);
    }
}
exports.APIRequestFailedError = APIRequestFailedError;
class DatabaseConnectionError extends CustomError {
    constructor(database, details, context) {
        super(`Database connection failed: ${database}`, ErrorCode.DATABASE_CONNECTION_FAILED, details, context);
    }
}
exports.DatabaseConnectionError = DatabaseConnectionError;
class AuthenticationFailedError extends CustomError {
    constructor(reason, details, context) {
        super(`Authentication failed: ${reason}`, ErrorCode.AUTHENTICATION_FAILED, details, context);
    }
}
exports.AuthenticationFailedError = AuthenticationFailedError;
class PerformanceThresholdExceededError extends CustomError {
    constructor(metric, actual, threshold, details, context) {
        super(`Performance threshold exceeded: ${metric} (${actual} > ${threshold})`, ErrorCode.PERFORMANCE_THRESHOLD_EXCEEDED, { metric, actual, threshold, ...details }, context);
    }
}
exports.PerformanceThresholdExceededError = PerformanceThresholdExceededError;
class TestDataGenerationError extends CustomError {
    constructor(reason, details, context) {
        super(`Test data generation failed: ${reason}`, ErrorCode.TEST_DATA_GENERATION_FAILED, details, context);
    }
}
exports.TestDataGenerationError = TestDataGenerationError;
class ConfigurationError extends CustomError {
    constructor(reason, details, context) {
        super(`Configuration error: ${reason}`, ErrorCode.CONFIGURATION_ERROR, details, context);
    }
}
exports.ConfigurationError = ConfigurationError;
class NetworkError extends CustomError {
    constructor(reason, details, context) {
        super(`Network error: ${reason}`, ErrorCode.NETWORK_ERROR, details, context);
    }
}
exports.NetworkError = NetworkError;
class FileOperationError extends CustomError {
    constructor(operation, filePath, details, context) {
        super(`File operation failed: ${operation} on ${filePath}`, ErrorCode.FILE_OPERATION_FAILED, details, context);
    }
}
exports.FileOperationError = FileOperationError;
class ValidationError extends CustomError {
    constructor(field, reason, details, context) {
        super(`Validation failed for ${field}: ${reason}`, ErrorCode.VALIDATION_ERROR, details, context);
    }
}
exports.ValidationError = ValidationError;
class TimeoutError extends CustomError {
    constructor(operation, timeout, details, context) {
        super(`Timeout after ${timeout}ms: ${operation}`, ErrorCode.TIMEOUT_ERROR, details, context);
    }
}
exports.TimeoutError = TimeoutError;
class EncryptionError extends CustomError {
    constructor(operation, details, context) {
        super(`Encryption operation failed: ${operation}`, ErrorCode.ENCRYPTION_ERROR, details, context);
    }
}
exports.EncryptionError = EncryptionError;
class DatabaseOperationError extends CustomError {
    constructor(operation, table, details, context) {
        super(`Database operation failed: ${operation} on ${table}`, ErrorCode.DATABASE_OPERATION_FAILED, details, context);
    }
}
exports.DatabaseOperationError = DatabaseOperationError;
/**
 * Error handler utility class
 */
class ErrorHandler {
    /**
     * Handle and log errors appropriately
     */
    static handle(error, context) {
        if (error instanceof CustomError) {
            // Already a custom error, just add context if provided
            if (context && !error.context) {
                error.context = context;
            }
            throw error;
        }
        // Convert generic error to custom error
        let customError;
        if (error.message.includes('timeout') || error.message.includes('Timeout')) {
            customError = new TimeoutError(error.message, 30000, { originalError: error.message }, context);
        }
        else if (error.message.includes('network') || error.message.includes('Network')) {
            customError = new NetworkError(error.message, { originalError: error.message }, context);
        }
        else if (error.message.includes('authentication') || error.message.includes('Authentication')) {
            customError = new AuthenticationFailedError(error.message, { originalError: error.message }, context);
        }
        else {
            // Generic custom error
            customError = new CustomError(error.message, ErrorCode.VALIDATION_ERROR, { originalError: error.message }, context);
        }
        throw customError;
    }
    /**
     * Create error from response object
     */
    static fromResponse(response, context) {
        return new APIRequestFailedError(response.url, response.status, { statusText: response.statusText }, context);
    }
    /**
     * Check if error is retryable
     */
    static isRetryable(error) {
        const retryableCodes = [
            ErrorCode.NETWORK_ERROR,
            ErrorCode.PAGE_LOAD_TIMEOUT,
            ErrorCode.TIMEOUT_ERROR,
            ErrorCode.DATABASE_CONNECTION_FAILED,
        ];
        return retryableCodes.includes(error.code);
    }
    /**
     * Get error severity level
     */
    static getSeverity(error) {
        const criticalCodes = [
            ErrorCode.AUTHENTICATION_FAILED,
            ErrorCode.DATABASE_CONNECTION_FAILED,
            ErrorCode.CONFIGURATION_ERROR,
        ];
        const highCodes = [
            ErrorCode.API_REQUEST_FAILED,
            ErrorCode.PERFORMANCE_THRESHOLD_EXCEEDED,
            ErrorCode.ENCRYPTION_ERROR,
        ];
        const mediumCodes = [
            ErrorCode.ELEMENT_NOT_FOUND,
            ErrorCode.PAGE_LOAD_TIMEOUT,
            ErrorCode.VALIDATION_ERROR,
        ];
        if (criticalCodes.includes(error.code))
            return 'critical';
        if (highCodes.includes(error.code))
            return 'high';
        if (mediumCodes.includes(error.code))
            return 'medium';
        return 'low';
    }
}
exports.ErrorHandler = ErrorHandler;
