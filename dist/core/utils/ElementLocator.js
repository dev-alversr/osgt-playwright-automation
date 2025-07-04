"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElementLocator = void 0;
const test_1 = require("@playwright/test");
const CustomErrors_1 = require("./CustomErrors");
/**
 * Element locator with self-healing capabilities
 */
class ElementLocator {
    page;
    logger;
    constructor(page, logger) {
        this.page = page;
        this.logger = logger;
    }
    /**
     * Locate element using multiple strategies with self-healing capabilities
     */
    async locate(strategies, timeout = 30000) {
        const attempts = [
            {
                name: 'data-testid',
                locator: () => this.page.locator(`[data-testid="${strategies.dataTestId}"]`),
                condition: () => !!strategies.dataTestId
            },
            {
                name: 'id',
                locator: () => this.page.locator(`#${strategies.id}`),
                condition: () => !!strategies.id
            },
            {
                name: 'css',
                locator: () => this.page.locator(strategies.css),
                condition: () => !!strategies.css
            },
            {
                name: 'role',
                locator: () => this.page.getByRole(strategies.role),
                condition: () => !!strategies.role
            },
            {
                name: 'text',
                locator: () => this.page.getByText(strategies.text),
                condition: () => !!strategies.text
            },
            {
                name: 'xpath',
                locator: () => this.page.locator(strategies.xpath),
                condition: () => !!strategies.xpath
            },
        ];
        const validAttempts = attempts.filter(attempt => attempt.condition());
        const timeoutPerAttempt = Math.floor(timeout / validAttempts.length);
        for (const [index, attempt] of validAttempts.entries()) {
            try {
                this.logger.debug(`Trying strategy: ${attempt.name}`, { strategies });
                const locator = attempt.locator();
                await (0, test_1.expect)(locator).toBeVisible({ timeout: timeoutPerAttempt });
                if (index > 0) {
                    this.logger.warn(`Element found using fallback strategy: ${attempt.name}`, {
                        strategies,
                        usedStrategy: attempt.name,
                        attemptNumber: index + 1,
                    });
                }
                else {
                    this.logger.debug(`Element found using primary strategy: ${attempt.name}`);
                }
                return locator;
            }
            catch (error) {
                this.logger.debug(`Strategy ${attempt.name} failed`, {
                    error: error instanceof Error ? error.message : String(error),
                    strategyIndex: index + 1,
                    totalStrategies: validAttempts.length
                });
                continue;
            }
        }
        const errorMessage = `Element not found using any strategy: ${JSON.stringify(strategies)}`;
        this.logger.error(errorMessage, { strategies, timeout, attemptCount: validAttempts.length });
        throw new CustomErrors_1.ElementNotFoundError(errorMessage, { strategies, timeout });
    }
    /**
     * Wait for element to be in specific state
     */
    async waitForState(strategies, state = 'visible', timeout = 30000) {
        const locator = await this.locate(strategies, timeout);
        this.logger.debug(`Waiting for element state: ${state}`, { strategies });
        switch (state) {
            case 'visible':
                await (0, test_1.expect)(locator).toBeVisible({ timeout });
                break;
            case 'hidden':
                await (0, test_1.expect)(locator).toBeHidden({ timeout });
                break;
            case 'enabled':
                await (0, test_1.expect)(locator).toBeEnabled({ timeout });
                break;
            case 'disabled':
                await (0, test_1.expect)(locator).toBeDisabled({ timeout });
                break;
            case 'stable':
                await locator.waitFor({ state: 'attached', timeout });
                await this.page.waitForTimeout(1000); // Wait for stability
                break;
        }
        this.logger.debug(`Element reached desired state: ${state}`);
        return locator;
    }
    /**
     * Wait for element to contain specific text
     */
    async waitForText(strategies, expectedText, timeout = 30000) {
        const locator = await this.locate(strategies, timeout);
        await (0, test_1.expect)(locator).toContainText(expectedText, { timeout });
        this.logger.debug(`Element contains expected text: ${expectedText}`, { strategies });
        return locator;
    }
    /**
     * Wait for element to have specific attribute
     */
    async waitForAttribute(strategies, attributeName, expectedValue, timeout = 30000) {
        const locator = await this.locate(strategies, timeout);
        await (0, test_1.expect)(locator).toHaveAttribute(attributeName, expectedValue, { timeout });
        this.logger.debug(`Element has expected attribute: ${attributeName}=${expectedValue}`, { strategies });
        return locator;
    }
    /**
     * Wait for element to have specific CSS class
     */
    async waitForClass(strategies, className, timeout = 30000) {
        const locator = await this.locate(strategies, timeout);
        await (0, test_1.expect)(locator).toHaveClass(new RegExp(className), { timeout });
        this.logger.debug(`Element has expected class: ${className}`, { strategies });
        return locator;
    }
    /**
     * Get all matching elements
     */
    async locateAll(strategies, timeout = 30000) {
        // Use the first available strategy to get all elements
        const attempts = [
            () => this.page.locator(`[data-testid="${strategies.dataTestId}"]`),
            () => this.page.locator(`#${strategies.id}`),
            () => this.page.locator(strategies.css),
            () => this.page.getByRole(strategies.role),
            () => this.page.getByText(strategies.text),
            () => this.page.locator(strategies.xpath),
        ];
        for (const attempt of attempts) {
            try {
                const locator = attempt();
                const count = await locator.count();
                if (count > 0) {
                    const elements = [];
                    for (let i = 0; i < count; i++) {
                        elements.push(locator.nth(i));
                    }
                    this.logger.debug(`Found ${count} elements`, { strategies });
                    return elements;
                }
            }
            catch (error) {
                continue;
            }
        }
        this.logger.warn('No elements found with any strategy', { strategies });
        return [];
    }
    /**
     * Check if element exists (without waiting)
     */
    async exists(strategies, timeout = 5000) {
        try {
            await this.locate(strategies, timeout);
            return true;
        }
        catch {
            return false;
        }
    }
    /**
     * Get element count
     */
    async getCount(strategies) {
        try {
            const elements = await this.locateAll(strategies, 5000);
            return elements.length;
        }
        catch {
            return 0;
        }
    }
    /**
     * Wait for element to appear and then disappear
     */
    async waitForAppearAndDisappear(strategies, appearTimeout = 30000, disappearTimeout = 30000) {
        this.logger.debug('Waiting for element to appear and then disappear', { strategies });
        // Wait for element to appear
        await this.waitForState(strategies, 'visible', appearTimeout);
        // Wait for element to disappear
        await this.waitForState(strategies, 'hidden', disappearTimeout);
        this.logger.debug('Element appeared and disappeared successfully');
    }
}
exports.ElementLocator = ElementLocator;
