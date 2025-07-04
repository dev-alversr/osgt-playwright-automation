import { Page, Locator, expect } from '@playwright/test';
import { ElementLocator } from '../utils/ElementLocator';
import { Logger } from '../utils/LoggingUtils';
import { PerformanceMonitor } from '../utils/PerformanceMonitor';
import { MediaCapture } from '../utils/MediaCapture';
import { SelectorStrategies } from '../types/global.types';

/**
 * Base Page class providing common functionality for all page objects
 */
export abstract class BasePage {
  protected page: Page;
  protected elementLocator: ElementLocator;
  protected logger: Logger;
  protected performanceMonitor: PerformanceMonitor;
  protected mediaCapture: MediaCapture;

  constructor(page: Page) {
    this.page = page;
    this.logger = new Logger(this.constructor.name);
    this.elementLocator = new ElementLocator(page, this.logger);
    this.performanceMonitor = new PerformanceMonitor(page, this.logger);
    this.mediaCapture = new MediaCapture(page, this.logger);
  }

  /**
   * Navigate to page URL
   */
  async navigate(url?: string): Promise<void> {
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
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Get page URL from metadata
   */
  protected getPageUrl(): string {
    const url = Reflect.getMetadata('page:url', this.constructor);
    if (!url) {
      throw new Error(`Page URL not defined for ${this.constructor.name}`);
    }
    return url;
  }

  /**
   * Take screenshot on failure
   */
  async captureScreenshot(name: string): Promise<string> {
    return await this.mediaCapture.takeScreenshot(name);
  }

  /**
   * Generic form filling utility
   */
  async fillForm<T extends Record<string, unknown>>(
    formData: T,
    fieldMappings: Record<keyof T, SelectorStrategies>
  ): Promise<void> {
    this.logger.info('Filling form', { formData: Object.keys(formData) });

    for (const [field, value] of Object.entries(formData)) {
      const strategies = fieldMappings[field as keyof T];
      const element = await this.elementLocator.locate(strategies);
      
      if (typeof value === 'string') {
        await element.fill(value);
      } else if (typeof value === 'boolean') {
        await element.setChecked(value);
      }
    }
  }

  /**
   * Generic table interaction utility
   */
  async getTableData<T>(
    tableSelector: SelectorStrategies,
    rowSelector: string = 'tr',
    cellSelector: string = 'td'
  ): Promise<T[]> {
    const table = await this.elementLocator.locate(tableSelector);
    const rows = await table.locator(rowSelector).all();
    const data: T[] = [];

    for (const row of rows) {
      const cells = await row.locator(cellSelector).all();
      const rowData: any = {};
      
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
  async waitForAPIResponse(
    urlPattern: string | RegExp,
    timeout: number = 30000
  ): Promise<any> {
    const response = await this.page.waitForResponse(urlPattern, { timeout });
    return await response.json();
  }

  /**
   * Click element with retry mechanism
   */
  async clickElement(strategies: SelectorStrategies, options?: {
    timeout?: number;
    force?: boolean;
    clickCount?: number;
  }): Promise<void> {
    const element = await this.elementLocator.locate(strategies, options?.timeout);
    
    const clickOptions: any = {};
    if (options?.force !== undefined) clickOptions.force = options.force;
    if (options?.clickCount !== undefined) clickOptions.clickCount = options.clickCount;
    
    await element.click(clickOptions);
  }

  /**
   * Type text with optional delay
   */
  async typeText(
    strategies: SelectorStrategies,
    text: string,
    options?: { delay?: number; clear?: boolean }
  ): Promise<void> {
    const element = await this.elementLocator.locate(strategies);
    
    if (options?.clear) {
      await element.clear();
    }
    
    const typeOptions: any = {};
    if (options?.delay !== undefined) typeOptions.delay = options.delay;
    
    await element.type(text, typeOptions);
  }

  /**
   * Wait for element to be visible
   */
  async waitForVisible(strategies: SelectorStrategies, timeout: number = 30000): Promise<Locator> {
    return await this.elementLocator.waitForState(strategies, 'visible', timeout);
  }

  /**
   * Wait for element to be hidden
   */
  async waitForHidden(strategies: SelectorStrategies, timeout: number = 30000): Promise<Locator> {
    return await this.elementLocator.waitForState(strategies, 'hidden', timeout);
  }

  /**
   * Get element text content
   */
  async getElementText(strategies: SelectorStrategies): Promise<string | null> {
    const element = await this.elementLocator.locate(strategies);
    return await element.textContent();
  }

  /**
   * Get element attribute value
   */
  async getElementAttribute(strategies: SelectorStrategies, attributeName: string): Promise<string | null> {
    const element = await this.elementLocator.locate(strategies);
    return await element.getAttribute(attributeName);
  }

  /**
   * Check if element is visible
   */
  async isElementVisible(strategies: SelectorStrategies): Promise<boolean> {
    try {
      const element = await this.elementLocator.locate(strategies, 5000);
      return await element.isVisible();
    } catch {
      return false;
    }
  }

  /**
   * Check if element is enabled
   */
  async isElementEnabled(strategies: SelectorStrategies): Promise<boolean> {
    try {
      const element = await this.elementLocator.locate(strategies);
      return await element.isEnabled();
    } catch {
      return false;
    }
  }

  /**
   * Scroll element into view
   */
  async scrollToElement(strategies: SelectorStrategies): Promise<void> {
    const element = await this.elementLocator.locate(strategies);
    await element.scrollIntoViewIfNeeded();
  }

  /**
   * Hover over element
   */
  async hoverElement(strategies: SelectorStrategies): Promise<void> {
    const element = await this.elementLocator.locate(strategies);
    await element.hover();
  }

  /**
   * Select option from dropdown
   */
  async selectOption(
    strategies: SelectorStrategies,
    option: string | { label?: string; value?: string; index?: number }
  ): Promise<void> {
    const element = await this.elementLocator.locate(strategies);
    
    if (typeof option === 'string') {
      await element.selectOption(option);
    } else if (option.value) {
      await element.selectOption({ value: option.value });
    } else if (option.label) {
      await element.selectOption({ label: option.label });
    } else if (option.index !== undefined) {
      await element.selectOption({ index: option.index });
    }
  }

  /**
   * Upload file to file input
   */
  async uploadFile(strategies: SelectorStrategies, filePath: string | string[]): Promise<void> {
    const element = await this.elementLocator.locate(strategies);
    await element.setInputFiles(filePath);
  }

  /**
   * Get current page title
   */
  async getPageTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Get current page URL
   */
  async getCurrentURL(): Promise<string> {
    return this.page.url();
  }

  /**
   * Refresh the page
   */
  async refreshPage(): Promise<void> {
    await this.page.reload();
    await this.waitForPageLoad();
  }

  /**
   * Execute JavaScript in the page context
   */
  async executeScript<T>(script: string): Promise<T> {
    return await this.page.evaluate((scriptCode: string) => {
      return eval(scriptCode);
    }, script);
  }

  /**
   * Execute JavaScript with arguments in the page context
   */
  async executeScriptWithArgs<T>(script: string, args: any[]): Promise<T> {
    return await this.page.evaluate(
      ({ scriptCode, scriptArgs }: { scriptCode: string; scriptArgs: any[] }) => {
        const evalFunction = new Function('args', scriptCode);
        return evalFunction(scriptArgs);
      }, 
      { scriptCode: script, scriptArgs: args }
    );
  }
}