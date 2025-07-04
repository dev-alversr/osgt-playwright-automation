import { Locator, Page } from '@playwright/test';
import { SelectorStrategies } from '../types/global.types';
import { Logger } from './LoggingUtils';
/**
 * Element locator with self-healing capabilities
 */
export declare class ElementLocator {
    private page;
    private logger;
    constructor(page: Page, logger: Logger);
    /**
     * Locate element using multiple strategies with self-healing capabilities
     */
    locate(strategies: SelectorStrategies, timeout?: number): Promise<Locator>;
    /**
     * Wait for element to be in specific state
     */
    waitForState(strategies: SelectorStrategies, state?: 'visible' | 'hidden' | 'stable' | 'enabled' | 'disabled', timeout?: number): Promise<Locator>;
    /**
     * Wait for element to contain specific text
     */
    waitForText(strategies: SelectorStrategies, expectedText: string, timeout?: number): Promise<Locator>;
    /**
     * Wait for element to have specific attribute
     */
    waitForAttribute(strategies: SelectorStrategies, attributeName: string, expectedValue: string, timeout?: number): Promise<Locator>;
    /**
     * Wait for element to have specific CSS class
     */
    waitForClass(strategies: SelectorStrategies, className: string, timeout?: number): Promise<Locator>;
    /**
     * Get all matching elements
     */
    locateAll(strategies: SelectorStrategies, timeout?: number): Promise<Locator[]>;
    /**
     * Check if element exists (without waiting)
     */
    exists(strategies: SelectorStrategies, timeout?: number): Promise<boolean>;
    /**
     * Get element count
     */
    getCount(strategies: SelectorStrategies): Promise<number>;
    /**
     * Wait for element to appear and then disappear
     */
    waitForAppearAndDisappear(strategies: SelectorStrategies, appearTimeout?: number, disappearTimeout?: number): Promise<void>;
}
