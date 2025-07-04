/**
 * Custom error classes with specific error codes for the test automation framework
 */

export enum ErrorCode {
  ELEMENT_NOT_FOUND = 'ELEMENT_NOT_FOUND',
  PAGE_LOAD_TIMEOUT = 'PAGE_LOAD_TIMEOUT',
  API_REQUEST_FAILED = 'API_REQUEST_FAILED',
  DATABASE_CONNECTION_FAILED = 'DATABASE_CONNECTION_FAILED',
  AUTHENTICATION_FAILED = 'AUTHENTICATION_FAILED',
  PERFORMANCE_THRESHOLD_EXCEEDED = 'PERFORMANCE_THRESHOLD_EXCEEDED',
  TEST_DATA_GENERATION_FAILED = 'TEST_DATA_GENERATION_FAILED',
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  FILE_OPERATION_FAILED = 'FILE_OPERATION_FAILED',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  ENCRYPTION_ERROR = 'ENCRYPTION_ERROR',
  DATABASE_OPERATION_FAILED = 'DATABASE_OPERATION_FAILED',
}

export class CustomError extends Error {
  public code: ErrorCode;
  public details: any;
  public timestamp: Date;
  public context?: string;

  constructor(message: string, code: ErrorCode, details?: any, context?: string) {
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
  toJSON(): object {
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
  getFormattedMessage(): string {
    const contextStr = this.context ? ` [${this.context}]` : '';
    const detailsStr = this.details ? ` Details: ${JSON.stringify(this.details)}` : '';
    return `${this.code}${contextStr}: ${this.message}${detailsStr}`;
  }
}

export class ElementNotFoundError extends CustomError {
  constructor(selector: string, details?: any, context?: string) {
    super(`Element not found: ${selector}`, ErrorCode.ELEMENT_NOT_FOUND, details, context);
  }
}

export class PageLoadTimeoutError extends CustomError {
  constructor(url: string, timeout: number, details?: any, context?: string) {
    super(`Page load timeout after ${timeout}ms: ${url}`, ErrorCode.PAGE_LOAD_TIMEOUT, details, context);
  }
}

export class APIRequestFailedError extends CustomError {
  constructor(url: string, status: number, details?: any, context?: string) {
    super(`API request failed: ${url} (Status: ${status})`, ErrorCode.API_REQUEST_FAILED, details, context);
  }
}

export class DatabaseConnectionError extends CustomError {
  constructor(database: string, details?: any, context?: string) {
    super(`Database connection failed: ${database}`, ErrorCode.DATABASE_CONNECTION_FAILED, details, context);
  }
}

export class AuthenticationFailedError extends CustomError {
  constructor(reason: string, details?: any, context?: string) {
    super(`Authentication failed: ${reason}`, ErrorCode.AUTHENTICATION_FAILED, details, context);
  }
}

export class PerformanceThresholdExceededError extends CustomError {
  constructor(metric: string, actual: number, threshold: number, details?: any, context?: string) {
    super(
      `Performance threshold exceeded: ${metric} (${actual} > ${threshold})`,
      ErrorCode.PERFORMANCE_THRESHOLD_EXCEEDED,
      { metric, actual, threshold, ...details },
      context
    );
  }
}

export class TestDataGenerationError extends CustomError {
  constructor(reason: string, details?: any, context?: string) {
    super(`Test data generation failed: ${reason}`, ErrorCode.TEST_DATA_GENERATION_FAILED, details, context);
  }
}

export class ConfigurationError extends CustomError {
  constructor(reason: string, details?: any, context?: string) {
    super(`Configuration error: ${reason}`, ErrorCode.CONFIGURATION_ERROR, details, context);
  }
}

export class NetworkError extends CustomError {
  constructor(reason: string, details?: any, context?: string) {
    super(`Network error: ${reason}`, ErrorCode.NETWORK_ERROR, details, context);
  }
}

export class FileOperationError extends CustomError {
  constructor(operation: string, filePath: string, details?: any, context?: string) {
    super(`File operation failed: ${operation} on ${filePath}`, ErrorCode.FILE_OPERATION_FAILED, details, context);
  }
}

export class ValidationError extends CustomError {
  constructor(field: string, reason: string, details?: any, context?: string) {
    super(`Validation failed for ${field}: ${reason}`, ErrorCode.VALIDATION_ERROR, details, context);
  }
}

export class TimeoutError extends CustomError {
  constructor(operation: string, timeout: number, details?: any, context?: string) {
    super(`Timeout after ${timeout}ms: ${operation}`, ErrorCode.TIMEOUT_ERROR, details, context);
  }
}

export class EncryptionError extends CustomError {
  constructor(operation: string, details?: any, context?: string) {
    super(`Encryption operation failed: ${operation}`, ErrorCode.ENCRYPTION_ERROR, details, context);
  }
}

export class DatabaseOperationError extends CustomError {
  constructor(operation: string, table: string, details?: any, context?: string) {
    super(`Database operation failed: ${operation} on ${table}`, ErrorCode.DATABASE_OPERATION_FAILED, details, context);
  }
}

/**
 * Error handler utility class
 */
export class ErrorHandler {
  /**
   * Handle and log errors appropriately
   */
  static handle(error: Error, context?: string): never {
    if (error instanceof CustomError) {
      // Already a custom error, just add context if provided
      if (context && !error.context) {
        error.context = context;
      }
      throw error;
    }

    // Convert generic error to custom error
    let customError: CustomError;
    
    if (error.message.includes('timeout') || error.message.includes('Timeout')) {
      customError = new TimeoutError(error.message, 30000, { originalError: error.message }, context);
    } else if (error.message.includes('network') || error.message.includes('Network')) {
      customError = new NetworkError(error.message, { originalError: error.message }, context);
    } else if (error.message.includes('authentication') || error.message.includes('Authentication')) {
      customError = new AuthenticationFailedError(error.message, { originalError: error.message }, context);
    } else {
      // Generic custom error
      customError = new CustomError(error.message, ErrorCode.VALIDATION_ERROR, { originalError: error.message }, context);
    }

    throw customError;
  }

  /**
   * Create error from response object
   */
  static fromResponse(response: { status: number; statusText: string; url: string }, context?: string): APIRequestFailedError {
    return new APIRequestFailedError(
      response.url,
      response.status,
      { statusText: response.statusText },
      context
    );
  }

  /**
   * Check if error is retryable
   */
  static isRetryable(error: CustomError): boolean {
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
  static getSeverity(error: CustomError): 'low' | 'medium' | 'high' | 'critical' {
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

    if (criticalCodes.includes(error.code)) return 'critical';
    if (highCodes.includes(error.code)) return 'high';
    if (mediumCodes.includes(error.code)) return 'medium';
    return 'low';
  }
}