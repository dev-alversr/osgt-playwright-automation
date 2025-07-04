import { Page, Locator } from '@playwright/test';
import { ElementLocator } from '../utils/ElementLocator';
import { Logger } from '../utils/LoggingUtils';
import { PerformanceMonitor } from '../utils/PerformanceMonitor';
import { MediaCapture } from '../utils/MediaCapture';
import { SelectorStrategies } from '../types/global.types';
/**
 * Base Page class providing common functionality for all page objects
 */
export declare abstract class BasePage {
    protected page: Page;
    protected elementLocator: ElementLocator;
    protected logger: Logger;
    protected performanceMonitor: PerformanceMonitor;
    protected mediaCapture: MediaCapture;
    constructor(page: Page);
    /**
     * Navigate to page URL
     */
    navigate(url?: string): Promise<void>;
    /**
     * Wait for page to be fully loaded
     */
    waitForPageLoad(): Promise<void>;
    /**
     * Get page URL from metadata
     */
    protected getPageUrl(): string;
    /**
     * Take screenshot on failure
     */
    captureScreenshot(name: string): Promise<string>;
    /**
     * Generic form filling utility
     */
    fillForm<T extends Record<string, unknown>>(formData: T, fieldMappings: Record<keyof T, SelectorStrategies>): Promise<void>;
    /**
     * Generic table interaction utility
     */
    getTableData<T>(tableSelector: SelectorStrategies, rowSelector?: string, cellSelector?: string): Promise<T[]>;
    /**
     * Wait for API response
     */
    waitForAPIResponse(urlPattern: string | RegExp, timeout?: number): Promise<any>;
    /**
     * Click element with retry mechanism
     */
    clickElement(strategies: SelectorStrategies, options?: {
        timeout?: number;
        force?: boolean;
        clickCount?: number;
    }): Promise<void>;
    /**
     * Type text with optional delay
     */
    typeText(strategies: SelectorStrategies, text: string, options?: {
        delay?: number;
        clear?: boolean;
    }): Promise<void>;
    /**
     * Wait for element to be visible
     */
    waitForVisible(strategies: SelectorStrategies, timeout?: number): Promise<Locator>;
    /**
     * Wait for element to be hidden
     */
    waitForHidden(strategies: SelectorStrategies, timeout?: number): Promise<Locator>;
    /**
     * Get element text content
     */
    getElementText(strategies: SelectorStrategies): Promise<string | null>;
    /**
     * Get element attribute value
     */
    getElementAttribute(strategies: SelectorStrategies, attributeName: string): Promise<string | null>;
    /**
     * Check if element is visible
     */
    isElementVisible(strategies: SelectorStrategies): Promise<boolean>;
    /**
     * Check if element is enabled
     */
    isElementEnabled(strategies: SelectorStrategies): Promise<boolean>;
    /**
     * Scroll element into view
     */
    scrollToElement(strategies: SelectorStrategies): Promise<void>;
    /**
     * Hover over element
     */
    hoverElement(strategies: SelectorStrategies): Promise<void>;
    /**
     * Select option from dropdown
     */
    selectOption(strategies: SelectorStrategies, option: string | {
        label?: string;
        value?: string;
        index?: number;
    }): Promise<void>;
    /**
     * Upload file to file input
     */
    uploadFile(strategies: SelectorStrategies, filePath: string | string[]): Promise<void>;
    /**
     * Get current page title
     */
    getPageTitle(): Promise<string>;
    /**
     * Get current page URL
     */
    getCurrentURL(): Promise<string>;
    /**
     * Refresh the page
     */
    refreshPage(): Promise<void>;
    /**
     * Execute JavaScript in the page context
     */
    executeScript<T>(script: string): Promise<T>;
    /**
     * Execute JavaScript with arguments in the page context
     */
    executeScriptWithArgs<T>(script: string, args: any[]): Promise<T>;
}
