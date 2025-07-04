import { Page } from '@playwright/test';
import { BasePage } from '../core/base/BasePage';
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
export declare class SauceDemoLoginPage extends BasePage {
    private readonly selectors;
    constructor(page: Page);
    /**
     * Navigate to SauceDemo login page
     */
    navigateToLogin(): Promise<void>;
    /**
     * Wait for login page to be fully loaded
     */
    waitForPageToLoad(): Promise<void>;
    /**
     * Perform login with credentials
     */
    login(credentials: SauceDemoCredentials): Promise<SauceDemoLoginResponse>;
    /**
     * Fill login form with credentials
     */
    private fillLoginForm;
    /**
     * Submit the login form
     */
    private submitLogin;
    /**
     * Wait for login result (success or failure)
     */
    private waitForLoginResult;
    /**
     * Get current error message
     */
    getErrorMessage(): Promise<string | null>;
    /**
     * Clear error message
     */
    clearErrorMessage(): Promise<void>;
    /**
     * Check if login page is displayed
     */
    isDisplayed(): Promise<boolean>;
    /**
     * Get page title
     */
    getPageTitle(): Promise<string>;
    /**
     * Check if logo is displayed
     */
    isLogoDisplayed(): Promise<boolean>;
    /**
     * Get available usernames from the page (if displayed)
     */
    getAcceptedUsernames(): Promise<string[]>;
    /**
     * Get password information from the page (if displayed)
     */
    getPasswordInfo(): Promise<string | null>;
    /**
     * Validate page elements are present
     */
    validatePageElements(): Promise<{
        isValid: boolean;
        missingElements: string[];
    }>;
}
export default SauceDemoLoginPage;
