import { Page, expect } from '@playwright/test';
import { BasePage } from '../core/base/BasePage';
import { Page as PageDecorator } from '../core/decorators/PageDecorator';
import { SelectorStrategies } from '../core/types/global.types';
import { AuthenticationFailedError } from '../core/utils/CustomErrors';

/**
 * SauceDemo login credentials interface
 */
export interface SauceDemoCredentials {
  username: string;
  password: string;
}

/**
 * SauceDemo login response interface
 */
export interface SauceDemoLoginResponse {
  success: boolean;
  redirectUrl?: string;
  errorMessage?: string;
}

/**
 * SauceDemo LoginPage class
 */
@PageDecorator('SauceDemoLoginPage', '/')
export class SauceDemoLoginPage extends BasePage {
  private readonly selectors = {
    usernameField: {
      dataTestId: 'username',
      id: 'user-name',
      css: '#user-name',
      xpath: '//input[@id="user-name"]',
      text: '',
      role: 'textbox'
    } as SelectorStrategies,
    
    passwordField: {
      dataTestId: 'password',
      id: 'password',
      css: '#password',
      xpath: '//input[@id="password"]',
      text: '',
      role: 'textbox'
    } as SelectorStrategies,
    
    loginButton: {
      dataTestId: 'login-button',
      id: 'login-button',
      css: '#login-button',
      xpath: '//input[@id="login-button"]',
      text: '',
      role: 'button'
    } as SelectorStrategies,
    
    errorMessage: {
      dataTestId: 'error',
      id: '',
      css: '[data-test="error"]',
      xpath: '//h3[@data-test="error"]',
      text: '',
      role: 'alert'
    } as SelectorStrategies,

    errorButton: {
      dataTestId: 'error-button',
      id: '',
      css: '.error-button',
      xpath: '//button[@class="error-button"]',
      text: '',
      role: 'button'
    } as SelectorStrategies,

    loginContainer: {
      dataTestId: 'login_container',
      id: '',
      css: '.login_container',
      xpath: '//div[@class="login_container"]',
      text: '',
      role: 'main'
    } as SelectorStrategies,

    loginLogo: {
      dataTestId: '',
      id: '',
      css: '.login_logo',
      xpath: '//div[@class="login_logo"]',
      text: 'Swag Labs',
      role: 'heading'
    } as SelectorStrategies
  };

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to SauceDemo login page
   */
  async navigateToLogin(): Promise<void> {
    this.logger.info('Navigating to SauceDemo login page');
    await this.navigate();
    await this.waitForPageToLoad();
  }

  /**
   * Wait for login page to be fully loaded
   */
  async waitForPageToLoad(): Promise<void> {
    this.logger.debug('Waiting for SauceDemo login page to load');
    await this.waitForVisible(this.selectors.loginContainer);
    await this.waitForVisible(this.selectors.usernameField);
    await this.waitForVisible(this.selectors.passwordField);
    await this.waitForVisible(this.selectors.loginButton);
  }

  /**
   * Perform login with credentials
   */
  async login(credentials: SauceDemoCredentials): Promise<SauceDemoLoginResponse> {
    this.logger.info('Attempting SauceDemo login', { username: credentials.username });
    
    try {
      await this.waitForPageToLoad();
      await this.fillLoginForm(credentials);
      await this.submitLogin();
      return await this.waitForLoginResult();
    } catch (error: any) {
      this.logger.error('SauceDemo login failed', { 
        username: credentials.username,
        error: error.message 
      });
      
      await this.captureScreenshot(`saucedemo-login-failure-${credentials.username}`);
      
      throw new AuthenticationFailedError('SauceDemo login failed', { 
        username: credentials.username,
        error: error.message 
      });
    }
  }

  /**
   * Fill login form with credentials
   */
  private async fillLoginForm(credentials: SauceDemoCredentials): Promise<void> {
    this.logger.debug('Filling SauceDemo login form');

    // Clear and fill username
    await this.typeText(this.selectors.usernameField, credentials.username, { clear: true });

    // Clear and fill password
    await this.typeText(this.selectors.passwordField, credentials.password, { clear: true });
  }

  /**
   * Submit the login form
   */
  private async submitLogin(): Promise<void> {
    this.logger.debug('Submitting SauceDemo login form');
    await this.clickElement(this.selectors.loginButton);
  }

  /**
   * Wait for login result (success or failure)
   */
  private async waitForLoginResult(timeout: number = 10000): Promise<SauceDemoLoginResponse> {
    this.logger.debug('Waiting for SauceDemo login result');

    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const currentUrl = this.page.url();
      
      // Check for successful login (redirect to inventory page)
      if (currentUrl.includes('/inventory.html')) {
        this.logger.info('SauceDemo login successful');
        return {
          success: true,
          redirectUrl: currentUrl,
        };
      }

      // Check for error message
      const errorMessage = await this.getErrorMessage();
      if (errorMessage) {
        this.logger.warn('SauceDemo login failed with error', { error: errorMessage });
        return {
          success: false,
          errorMessage,
        };
      }

      await this.page.waitForTimeout(500);
    }

    throw new AuthenticationFailedError('SauceDemo login result timeout', { timeout });
  }

  /**
   * Get current error message
   */
  async getErrorMessage(): Promise<string | null> {
    try {
      const errorVisible = await this.isElementVisible(this.selectors.errorMessage);
      if (errorVisible) {
        const errorText = await this.getElementText(this.selectors.errorMessage);
        return errorText?.trim() || null;
      }
    } catch (error) {
      this.logger.debug('No error message found');
    }
    
    return null;
  }

  /**
   * Clear error message
   */
  async clearErrorMessage(): Promise<void> {
    try {
      const errorButtonVisible = await this.isElementVisible(this.selectors.errorButton);
      if (errorButtonVisible) {
        await this.clickElement(this.selectors.errorButton);
        this.logger.debug('Error message cleared');
      }
    } catch (error) {
      this.logger.debug('No error button to clear');
    }
  }

  /**
   * Check if login page is displayed
   */
  async isDisplayed(): Promise<boolean> {
    try {
      return await this.isElementVisible(this.selectors.loginContainer);
    } catch {
      return false;
    }
  }

  /**
   * Get page title
   */
  async getPageTitle(): Promise<string> {
    return await this.getPageTitle();
  }

  /**
   * Check if logo is displayed
   */
  async isLogoDisplayed(): Promise<boolean> {
    return await this.isElementVisible(this.selectors.loginLogo);
  }

  /**
   * Get available usernames from the page (if displayed)
   */
  async getAcceptedUsernames(): Promise<string[]> {
    try {
      const usernamesText = await this.page.locator('#login_credentials').textContent();
      if (usernamesText) {
        const lines = usernamesText.split('\n');
        return lines
          .filter(line => line.trim() && !line.includes('Accepted usernames'))
          .map(line => line.trim());
      }
    } catch (error) {
      this.logger.debug('Could not get accepted usernames from page');
    }
    return [];
  }

  /**
   * Get password information from the page (if displayed)
   */
  async getPasswordInfo(): Promise<string | null> {
    try {
      const passwordText = await this.page.locator('.login_password').textContent();
      return passwordText?.trim() || null;
    } catch (error) {
      this.logger.debug('Could not get password info from page');
      return null;
    }
  }

  /**
   * Validate page elements are present
   */
  async validatePageElements(): Promise<{ isValid: boolean; missingElements: string[] }> {
    const missingElements: string[] = [];

    const elementsToCheck = [
      { name: 'Username Field', selector: this.selectors.usernameField },
      { name: 'Password Field', selector: this.selectors.passwordField },
      { name: 'Login Button', selector: this.selectors.loginButton },
      { name: 'Login Container', selector: this.selectors.loginContainer },
      { name: 'Logo', selector: this.selectors.loginLogo }
    ];

    for (const element of elementsToCheck) {
      const isVisible = await this.isElementVisible(element.selector);
      if (!isVisible) {
        missingElements.push(element.name);
      }
    }

    return {
      isValid: missingElements.length === 0,
      missingElements
    };
  }
}

// Export the class as default
export default SauceDemoLoginPage;