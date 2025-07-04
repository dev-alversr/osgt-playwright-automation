import { Page, expect } from '@playwright/test';
import { BasePage } from '@core/base/BasePage';
import { Page as PageDecorator } from '@core/decorators/PageDecorator';
import { SelectorStrategies } from '@core/types/global.types';
import { AuthenticationFailedError } from '@core/utils/CustomErrors';

export interface LoginCredentials {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  success: boolean;
  redirectUrl?: string;
  errorMessage?: string;
  sessionId?: string;
}

@PageDecorator('LoginPage', '/login')
export class LoginPage extends BasePage {
  private readonly selectors = {
    usernameField: {
      dataTestId: 'login-username',
      id: 'username',
      css: 'input[name="username"]',
      xpath: '//input[@name="username"]',
      text: '',
      role: 'textbox'
    } as SelectorStrategies,
    
    passwordField: {
      dataTestId: 'login-password',
      id: 'password',
      css: 'input[name="password"]',
      xpath: '//input[@name="password"]',
      text: '',
      role: 'textbox'
    } as SelectorStrategies,
    
    rememberMeCheckbox: {
      dataTestId: 'remember-me-checkbox',
      id: 'rememberMe',
      css: 'input[name="rememberMe"]',
      xpath: '//input[@name="rememberMe"]',
      text: '',
      role: 'checkbox'
    } as SelectorStrategies,
    
    loginButton: {
      dataTestId: 'login-submit',
      id: 'login-btn',
      css: 'button[type="submit"]',
      xpath: '//button[@type="submit"]',
      text: 'Sign In',
      role: 'button'
    } as SelectorStrategies,
    
    errorMessage: {
      dataTestId: 'login-error',
      id: 'error-message',
      css: '.error-message, .alert-danger',
      xpath: '//div[contains(@class, "error-message")]',
      text: '',
      role: 'alert'
    } as SelectorStrategies,

    loginForm: {
      dataTestId: 'login-form',
      id: 'loginForm',
      css: 'form[name="loginForm"], #loginForm',
      xpath: '//form[@name="loginForm" or @id="loginForm"]',
      text: '',
      role: 'form'
    } as SelectorStrategies
  };

  constructor(page: Page) {
    super(page);
  }

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    this.logger.info('Attempting login', { username: credentials.username });
    
    try {
      await this.ensureOnLoginPage();
      await this.waitForLoginFormReady();
      await this.fillLoginForm(credentials);
      await this.submitLoginForm();
      const result = await this.waitForLoginResult();

      this.logger.info('Login completed', { 
        success: result.success, 
        username: credentials.username 
      });

      return result;
    } catch (error: any) {
      this.logger.error('Login failed', { 
        username: credentials.username,
        error: error.message 
      });
      
      await this.captureScreenshot(`login-failure-${credentials.username}`);
      
      throw new AuthenticationFailedError('Login failed', { 
        username: credentials.username,
        error: error.message 
      });
    }
  }

  private async fillLoginForm(credentials: LoginCredentials): Promise<void> {
    this.logger.debug('Filling login form');

    const usernameField = await this.elementLocator.locate(this.selectors.usernameField);
    await usernameField.clear();
    await usernameField.fill(credentials.username);

    const passwordField = await this.elementLocator.locate(this.selectors.passwordField);
    await passwordField.clear();
    await passwordField.fill(credentials.password);

    if (credentials.rememberMe !== undefined) {
      try {
        const rememberMeCheckbox = await this.elementLocator.locate(this.selectors.rememberMeCheckbox);
        await rememberMeCheckbox.setChecked(credentials.rememberMe);
      } catch (error: any) {
        this.logger.debug('Remember me checkbox not found', { error: error.message });
      }
    }
  }

  private async submitLoginForm(): Promise<void> {
    this.logger.debug('Submitting login form');
    const loginButton = await this.elementLocator.locate(this.selectors.loginButton);
    await this.elementLocator.waitForState(this.selectors.loginButton, 'enabled');
    await loginButton.click();
  }

  private async waitForLoginFormReady(): Promise<void> {
    this.logger.debug('Waiting for login form to be ready');
    await this.elementLocator.waitForState(this.selectors.loginForm, 'visible');
    await this.elementLocator.waitForState(this.selectors.usernameField, 'visible');
    await this.elementLocator.waitForState(this.selectors.passwordField, 'visible');
    await this.elementLocator.waitForState(this.selectors.loginButton, 'visible');
  }

  private async waitForLoginResult(timeout: number = 15000): Promise<LoginResponse> {
    this.logger.debug('Waiting for login result');
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const currentUrl = this.page.url();
      if (!currentUrl.includes('/login')) {
        return {
          success: true,
          redirectUrl: currentUrl,
        };
      }

      const errorMessage = await this.getErrorMessage();
      if (errorMessage) {
        return {
          success: false,
          errorMessage,
        };
      }

      await this.page.waitForTimeout(500);
    }

    throw new AuthenticationFailedError('Login result timeout', { timeout });
  }

  private async ensureOnLoginPage(): Promise<void> {
    const currentUrl = this.page.url();
    
    if (!currentUrl.includes('/login')) {
      this.logger.debug('Not on login page, navigating');
      await this.navigate();
    }
    
    await this.waitForPageLoad();
  }

  async getErrorMessage(): Promise<string | null> {
    try {
      const errorElement = await this.elementLocator.locate(this.selectors.errorMessage);
      const isVisible = await errorElement.isVisible();
      
      if (isVisible) {
        return await errorElement.textContent();
      }
    } catch {
      // Error element not found or not visible
    }
    
    return null;
  }

  async isDisplayed(): Promise<boolean> {
    try {
      await this.elementLocator.waitForState(this.selectors.loginForm, 'visible', 5000);
      return true;
    } catch {
      return false;
    }
  }
}