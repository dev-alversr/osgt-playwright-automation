/**
 * Global type definitions for the Test Automation Framework
 */
export interface TestConfig {
    browser: 'chromium' | 'firefox' | 'webkit';
    headless: boolean;
    timeout: number;
    retries: number;
    baseURL: string;
    apiBaseURL: string;
    database: DatabaseConfig;
    logging: LoggingConfig;
    media: MediaConfig;
    performance: PerformanceConfig;
    mocking: MockingConfig;
}
export interface DatabaseConfig {
    mssql: {
        server: string;
        database: string;
        username: string;
        password: string;
        options: {
            encrypt: boolean;
            trustServerCertificate: boolean;
        };
    };
    postgresql: {
        host: string;
        port: number;
        database: string;
        username: string;
        password: string;
    };
    dynamodb: {
        region: string;
        accessKeyId: string;
        secretAccessKey: string;
        endpoint?: string;
    };
}
export interface LoggingConfig {
    level: 'debug' | 'info' | 'warn' | 'error';
    format: 'json' | 'simple';
    transports: ('console' | 'file')[];
    filename?: string;
}
export interface MediaConfig {
    screenshot: {
        mode: 'off' | 'only-on-failure' | 'on';
        fullPage: boolean;
    };
    video: {
        mode: 'off' | 'on-first-retry' | 'retain-on-failure' | 'on';
        size: {
            width: number;
            height: number;
        };
    };
}
export interface PerformanceConfig {
    monitoring: boolean;
    metrics: ('memory' | 'network' | 'pageLoad' | 'rendering')[];
    thresholds: {
        pageLoadTime: number;
        memoryUsage: number;
        networkLatency: number;
    };
}
export interface MockingConfig {
    enabled: boolean;
    routes: string[];
    responses: Record<string, unknown>;
}
export interface ElementLocatorStrategy {
    primary: string;
    fallback: string[];
    timeout: number;
    retries: number;
}
export interface SelectorStrategies {
    id: string;
    dataTestId: string;
    xpath: string;
    css: string;
    text: string;
    role: string;
}
export interface PerformanceMetrics {
    pageLoadTime: number;
    domContentLoaded: number;
    networkRequests: NetworkMetric[];
    memoryUsage: MemoryMetric;
    renderingMetrics: RenderingMetric;
}
export interface NetworkMetric {
    url: string;
    method: string;
    status: number;
    duration: number;
    size: number;
}
export interface MemoryMetric {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
}
export interface RenderingMetric {
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    cumulativeLayoutShift: number;
    firstInputDelay: number;
}
export interface APIResponse<T = unknown> {
    status: number;
    headers: Record<string, string>;
    body: T;
    duration: number;
}
export interface GraphQLQuery {
    query: string;
    variables?: Record<string, unknown>;
    operationName?: string;
}
export interface TestMetadata {
    category: 'smoke' | 'regression' | 'integration' | 'e2e';
    priority: 'high' | 'medium' | 'low';
    tags: string[];
    author: string;
    description: string;
    requirements: string[];
}
