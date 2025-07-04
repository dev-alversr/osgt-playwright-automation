"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasePage = void 0;
const ElementLocator_1 = require("../utils/ElementLocator");
const LoggingUtils_1 = require("../utils/LoggingUtils");
const PerformanceMonitor_1 = require("../utils/PerformanceMonitor");
const MediaCapture_1 = require("../utils/MediaCapture");
/**
 * Base Page class providing common functionality for all page objects
 */
class BasePage {
    page;
    elementLocator;
    logger;
    performanceMonitor;
    mediaCapture;
    constructor(page) {
        this.page = page;
        this.logger = new LoggingUtils_1.Logger(this.constructor.name);
        this.elementLocator = new ElementLocator_1.ElementLocator(page, this.logger);
        this.performanceMonitor = new PerformanceMonitor_1.PerformanceMonitor(page, this.logger);
        this.mediaCapture = new MediaCapture_1.MediaCapture(page, this.logger);
    }
    /**
     * Navigate to page URL
     */
    async navigate(url) {
        const targetUrl = url || this.getPageUrl();
        this.logger.info(`Navigating to ${targetUrl}`);
        await this.performanceMonitor.startMonitoring();
        await this.page.goto(targetUrl);
        await this.waitForPageLoad();
        await this.performanceMonitor.stopMonitoring();
    }
    /**
     * Wait for page to be fully loaded
     */
    async waitForPageLoad() {
        await this.page.waitForLoadState('networkidle');
        await this.page.waitForLoadState('domcontentloaded');
    }
    /**
     * Get page URL from metadata
     */
    getPageUrl() {
        const url = Reflect.getMetadata('page:url', this.constructor);
        if (!url) {
            throw new Error(`Page URL not defined for ${this.constructor.name}`);
        }
        return url;
    }
    /**
     * Take screenshot on failure
     */
    async captureScreenshot(name) {
        return await this.mediaCapture.takeScreenshot(name);
    }
    /**
     * Generic form filling utility
     */
    async fillForm(formData, fieldMappings) {
        this.logger.info('Filling form', { formData: Object.keys(formData) });
        for (const [field, value] of Object.entries(formData)) {
            const strategies = fieldMappings[field];
            const element = await this.elementLocator.locate(strategies);
            if (typeof value === 'string') {
                await element.fill(value);
            }
            else if (typeof value === 'boolean') {
                await element.setChecked(value);
            }
        }
    }
    /**
     * Generic table interaction utility
     */
    async getTableData(tableSelector, rowSelector = 'tr', cellSelector = 'td') {
        const table = await this.elementLocator.locate(tableSelector);
        const rows = await table.locator(rowSelector).all();
        const data = [];
        for (const row of rows) {
            const cells = await row.locator(cellSelector).all();
            const rowData = {};
            for (const [index, cell] of cells.entries()) {
                rowData[`column${index}`] = await cell.textContent();
            }
            data.push(rowData);
        }
        return data;
    }
    /**
     * Wait for API response
     */
    async waitForAPIResponse(urlPattern, timeout = 30000) {
        const response = await this.page.waitForResponse(urlPattern, { timeout });
        return await response.json();
    }
    /**
     * Click element with retry mechanism
     */
    async clickElement(strategies, options) {
        const element = await this.elementLocator.locate(strategies, options?.timeout);
        const clickOptions = {};
        if (options?.force !== undefined)
            clickOptions.force = options.force;
        if (options?.clickCount !== undefined)
            clickOptions.clickCount = options.clickCount;
        await element.click(clickOptions);
    }
    /**
     * Type text with optional delay
     */
    async typeText(strategies, text, options) {
        const element = await this.elementLocator.locate(strategies);
        if (options?.clear) {
            await element.clear();
        }
        const typeOptions = {};
        if (options?.delay !== undefined)
            typeOptions.delay = options.delay;
        await element.type(text, typeOptions);
    }
    /**
     * Wait for element to be visible
     */
    async waitForVisible(strategies, timeout = 30000) {
        return await this.elementLocator.waitForState(strategies, 'visible', timeout);
    }
    /**
     * Wait for element to be hidden
     */
    async waitForHidden(strategies, timeout = 30000) {
        return await this.elementLocator.waitForState(strategies, 'hidden', timeout);
    }
    /**
     * Get element text content
     */
    async getElementText(strategies) {
        const element = await this.elementLocator.locate(strategies);
        return await element.textContent();
    }
    /**
     * Get element attribute value
     */
    async getElementAttribute(strategies, attributeName) {
        const element = await this.elementLocator.locate(strategies);
        return await element.getAttribute(attributeName);
    }
    /**
     * Check if element is visible
     */
    async isElementVisible(strategies) {
        try {
            const element = await this.elementLocator.locate(strategies, 5000);
            return await element.isVisible();
        }
        catch {
            return false;
        }
    }
    /**
     * Check if element is enabled
     */
    async isElementEnabled(strategies) {
        try {
            const element = await this.elementLocator.locate(strategies);
            return await element.isEnabled();
        }
        catch {
            return false;
        }
    }
    /**
     * Scroll element into view
     */
    async scrollToElement(strategies) {
        const element = await this.elementLocator.locate(strategies);
        await element.scrollIntoViewIfNeeded();
    }
    /**
     * Hover over element
     */
    async hoverElement(strategies) {
        const element = await this.elementLocator.locate(strategies);
        await element.hover();
    }
    /**
     * Select option from dropdown
     */
    async selectOption(strategies, option) {
        const element = await this.elementLocator.locate(strategies);
        if (typeof option === 'string') {
            await element.selectOption(option);
        }
        else if (option.value) {
            await element.selectOption({ value: option.value });
        }
        else if (option.label) {
            await element.selectOption({ label: option.label });
        }
        else if (option.index !== undefined) {
            await element.selectOption({ index: option.index });
        }
    }
    /**
     * Upload file to file input
     */
    async uploadFile(strategies, filePath) {
        const element = await this.elementLocator.locate(strategies);
        await element.setInputFiles(filePath);
    }
    /**
     * Get current page title
     */
    async getPageTitle() {
        return await this.page.title();
    }
    /**
     * Get current page URL
     */
    async getCurrentURL() {
        return this.page.url();
    }
    /**
     * Refresh the page
     */
    async refreshPage() {
        await this.page.reload();
        await this.waitForPageLoad();
    }
    /**
     * Execute JavaScript in the page context
     */
    async executeScript(script) {
        return await this.page.evaluate((scriptCode) => {
            return eval(scriptCode);
        }, script);
    }
    /**
     * Execute JavaScript with arguments in the page context
     */
    async executeScriptWithArgs(script, args) {
        return await this.page.evaluate(({ scriptCode, scriptArgs }) => {
            const evalFunction = new Function('args', scriptCode);
            return evalFunction(scriptArgs);
        }, { scriptCode: script, scriptArgs: args });
    }
}
exports.BasePage = BasePage;
