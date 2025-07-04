"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SauceDemoLoginPage = void 0;
const BasePage_1 = require("../core/base/BasePage");
const PageDecorator_1 = require("../core/decorators/PageDecorator");
const CustomErrors_1 = require("../core/utils/CustomErrors");
/**
 * SauceDemo LoginPage class
 */
let SauceDemoLoginPage = class SauceDemoLoginPage extends BasePage_1.BasePage {
    selectors = {
        usernameField: {
            dataTestId: 'username',
            id: 'user-name',
            css: '#user-name',
            xpath: '//input[@id="user-name"]',
            text: '',
            role: 'textbox'
        },
        passwordField: {
            dataTestId: 'password',
            id: 'password',
            css: '#password',
            xpath: '//input[@id="password"]',
            text: '',
            role: 'textbox'
        },
        loginButton: {
            dataTestId: 'login-button',
            id: 'login-button',
            css: '#login-button',
            xpath: '//input[@id="login-button"]',
            text: '',
            role: 'button'
        },
        errorMessage: {
            dataTestId: 'error',
            id: '',
            css: '[data-test="error"]',
            xpath: '//h3[@data-test="error"]',
            text: '',
            role: 'alert'
        },
        errorButton: {
            dataTestId: 'error-button',
            id: '',
            css: '.error-button',
            xpath: '//button[@class="error-button"]',
            text: '',
            role: 'button'
        },
        loginContainer: {
            dataTestId: 'login_container',
            id: '',
            css: '.login_container',
            xpath: '//div[@class="login_container"]',
            text: '',
            role: 'main'
        },
        loginLogo: {
            dataTestId: '',
            id: '',
            css: '.login_logo',
            xpath: '//div[@class="login_logo"]',
            text: 'Swag Labs',
            role: 'heading'
        }
    };
    constructor(page) {
        super(page);
    }
    /**
     * Navigate to SauceDemo login page
     */
    async navigateToLogin() {
        this.logger.info('Navigating to SauceDemo login page');
        await this.navigate();
        await this.waitForPageToLoad();
    }
    /**
     * Wait for login page to be fully loaded
     */
    async waitForPageToLoad() {
        this.logger.debug('Waiting for SauceDemo login page to load');
        await this.waitForVisible(this.selectors.loginContainer);
        await this.waitForVisible(this.selectors.usernameField);
        await this.waitForVisible(this.selectors.passwordField);
        await this.waitForVisible(this.selectors.loginButton);
    }
    /**
     * Perform login with credentials
     */
    async login(credentials) {
        this.logger.info('Attempting SauceDemo login', { username: credentials.username });
        try {
            await this.waitForPageToLoad();
            await this.fillLoginForm(credentials);
            await this.submitLogin();
            return await this.waitForLoginResult();
        }
        catch (error) {
            this.logger.error('SauceDemo login failed', {
                username: credentials.username,
                error: error.message
            });
            await this.captureScreenshot(`saucedemo-login-failure-${credentials.username}`);
            throw new CustomErrors_1.AuthenticationFailedError('SauceDemo login failed', {
                username: credentials.username,
                error: error.message
            });
        }
    }
    /**
     * Fill login form with credentials
     */
    async fillLoginForm(credentials) {
        this.logger.debug('Filling SauceDemo login form');
        // Clear and fill username
        await this.typeText(this.selectors.usernameField, credentials.username, { clear: true });
        // Clear and fill password
        await this.typeText(this.selectors.passwordField, credentials.password, { clear: true });
    }
    /**
     * Submit the login form
     */
    async submitLogin() {
        this.logger.debug('Submitting SauceDemo login form');
        await this.clickElement(this.selectors.loginButton);
    }
    /**
     * Wait for login result (success or failure)
     */
    async waitForLoginResult(timeout = 10000) {
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
        throw new CustomErrors_1.AuthenticationFailedError('SauceDemo login result timeout', { timeout });
    }
    /**
     * Get current error message
     */
    async getErrorMessage() {
        try {
            const errorVisible = await this.isElementVisible(this.selectors.errorMessage);
            if (errorVisible) {
                const errorText = await this.getElementText(this.selectors.errorMessage);
                return errorText?.trim() || null;
            }
        }
        catch (error) {
            this.logger.debug('No error message found');
        }
        return null;
    }
    /**
     * Clear error message
     */
    async clearErrorMessage() {
        try {
            const errorButtonVisible = await this.isElementVisible(this.selectors.errorButton);
            if (errorButtonVisible) {
                await this.clickElement(this.selectors.errorButton);
                this.logger.debug('Error message cleared');
            }
        }
        catch (error) {
            this.logger.debug('No error button to clear');
        }
    }
    /**
     * Check if login page is displayed
     */
    async isDisplayed() {
        try {
            return await this.isElementVisible(this.selectors.loginContainer);
        }
        catch {
            return false;
        }
    }
    /**
     * Get page title
     */
    async getPageTitle() {
        return await this.getPageTitle();
    }
    /**
     * Check if logo is displayed
     */
    async isLogoDisplayed() {
        return await this.isElementVisible(this.selectors.loginLogo);
    }
    /**
     * Get available usernames from the page (if displayed)
     */
    async getAcceptedUsernames() {
        try {
            const usernamesText = await this.page.locator('#login_credentials').textContent();
            if (usernamesText) {
                const lines = usernamesText.split('\n');
                return lines
                    .filter(line => line.trim() && !line.includes('Accepted usernames'))
                    .map(line => line.trim());
            }
        }
        catch (error) {
            this.logger.debug('Could not get accepted usernames from page');
        }
        return [];
    }
    /**
     * Get password information from the page (if displayed)
     */
    async getPasswordInfo() {
        try {
            const passwordText = await this.page.locator('.login_password').textContent();
            return passwordText?.trim() || null;
        }
        catch (error) {
            this.logger.debug('Could not get password info from page');
            return null;
        }
    }
    /**
     * Validate page elements are present
     */
    async validatePageElements() {
        const missingElements = [];
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
};
exports.SauceDemoLoginPage = SauceDemoLoginPage;
exports.SauceDemoLoginPage = SauceDemoLoginPage = __decorate([
    (0, PageDecorator_1.Page)('SauceDemoLoginPage', '/'),
    __metadata("design:paramtypes", [Object])
], SauceDemoLoginPage);
// Export the class as default
exports.default = SauceDemoLoginPage;
