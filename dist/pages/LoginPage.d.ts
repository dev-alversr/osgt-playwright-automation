import { Page } from '@playwright/test';
import { BasePage } from '@core/base/BasePage';
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
export declare class LoginPage extends BasePage {
    private readonly selectors;
    constructor(page: Page);
    login(credentials: LoginCredentials): Promise<LoginResponse>;
    private fillLoginForm;
    private submitLoginForm;
    private waitForLoginFormReady;
    private waitForLoginResult;
    private ensureOnLoginPage;
    getErrorMessage(): Promise<string | null>;
    isDisplayed(): Promise<boolean>;
}
