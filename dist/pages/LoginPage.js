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
exports.LoginPage = void 0;
const BasePage_1 = require("@core/base/BasePage");
const PageDecorator_1 = require("@core/decorators/PageDecorator");
const CustomErrors_1 = require("@core/utils/CustomErrors");
let LoginPage = class LoginPage extends BasePage_1.BasePage {
    selectors = {
        usernameField: {
            dataTestId: 'login-username',
            id: 'username',
            css: 'input[name="username"]',
            xpath: '//input[@name="username"]',
            text: '',
            role: 'textbox'
        },
        passwordField: {
            dataTestId: 'login-password',
            id: 'password',
            css: 'input[name="password"]',
            xpath: '//input[@name="password"]',
            text: '',
            role: 'textbox'
        },
        rememberMeCheckbox: {
            dataTestId: 'remember-me-checkbox',
            id: 'rememberMe',
            css: 'input[name="rememberMe"]',
            xpath: '//input[@name="rememberMe"]',
            text: '',
            role: 'checkbox'
        },
        loginButton: {
            dataTestId: 'login-submit',
            id: 'login-btn',
            css: 'button[type="submit"]',
            xpath: '//button[@type="submit"]',
            text: 'Sign In',
            role: 'button'
        },
        errorMessage: {
            dataTestId: 'login-error',
            id: 'error-message',
            css: '.error-message, .alert-danger',
            xpath: '//div[contains(@class, "error-message")]',
            text: '',
            role: 'alert'
        },
        loginForm: {
            dataTestId: 'login-form',
            id: 'loginForm',
            css: 'form[name="loginForm"], #loginForm',
            xpath: '//form[@name="loginForm" or @id="loginForm"]',
            text: '',
            role: 'form'
        }
    };
    constructor(page) {
        super(page);
    }
    async login(credentials) {
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
        }
        catch (error) {
            this.logger.error('Login failed', {
                username: credentials.username,
                error: error.message
            });
            await this.captureScreenshot(`login-failure-${credentials.username}`);
            throw new CustomErrors_1.AuthenticationFailedError('Login failed', {
                username: credentials.username,
                error: error.message
            });
        }
    }
    async fillLoginForm(credentials) {
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
            }
            catch (error) {
                this.logger.debug('Remember me checkbox not found', { error: error.message });
            }
        }
    }
    async submitLoginForm() {
        this.logger.debug('Submitting login form');
        const loginButton = await this.elementLocator.locate(this.selectors.loginButton);
        await this.elementLocator.waitForState(this.selectors.loginButton, 'enabled');
        await loginButton.click();
    }
    async waitForLoginFormReady() {
        this.logger.debug('Waiting for login form to be ready');
        await this.elementLocator.waitForState(this.selectors.loginForm, 'visible');
        await this.elementLocator.waitForState(this.selectors.usernameField, 'visible');
        await this.elementLocator.waitForState(this.selectors.passwordField, 'visible');
        await this.elementLocator.waitForState(this.selectors.loginButton, 'visible');
    }
    async waitForLoginResult(timeout = 15000) {
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
        throw new CustomErrors_1.AuthenticationFailedError('Login result timeout', { timeout });
    }
    async ensureOnLoginPage() {
        const currentUrl = this.page.url();
        if (!currentUrl.includes('/login')) {
            this.logger.debug('Not on login page, navigating');
            await this.navigate();
        }
        await this.waitForPageLoad();
    }
    async getErrorMessage() {
        try {
            const errorElement = await this.elementLocator.locate(this.selectors.errorMessage);
            const isVisible = await errorElement.isVisible();
            if (isVisible) {
                return await errorElement.textContent();
            }
        }
        catch {
            // Error element not found or not visible
        }
        return null;
    }
    async isDisplayed() {
        try {
            await this.elementLocator.waitForState(this.selectors.loginForm, 'visible', 5000);
            return true;
        }
        catch {
            return false;
        }
    }
};
exports.LoginPage = LoginPage;
exports.LoginPage = LoginPage = __decorate([
    (0, PageDecorator_1.Page)('LoginPage', '/login'),
    __metadata("design:paramtypes", [Object])
], LoginPage);
