"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
const SauceDemoLoginPage_1 = __importDefault(require("../../pages/SauceDemoLoginPage"));
const SauceDemoInventoryPage_1 = __importDefault(require("../../pages/SauceDemoInventoryPage"));
/**
 * SauceDemo UI Test Suite
 * Using Thompson Reuters ONESOURCE Test Automation Framework
 */
test_1.test.describe('SauceDemo UI Tests', () => {
    let loginPage;
    let inventoryPage;
    // Test credentials from environment
    const credentials = {
        standard: { username: process.env.STANDARD_USER || 'standard_user', password: process.env.PASSWORD || 'secret_sauce' },
        locked: { username: process.env.LOCKED_USER || 'locked_out_user', password: process.env.PASSWORD || 'secret_sauce' },
        problem: { username: process.env.PROBLEM_USER || 'problem_user', password: process.env.PASSWORD || 'secret_sauce' }
    };
    test_1.test.beforeEach(async ({ page }) => {
        loginPage = new SauceDemoLoginPage_1.default(page);
        inventoryPage = new SauceDemoInventoryPage_1.default(page);
        // Navigate to SauceDemo
        await loginPage.navigateToLogin();
    });
    test_1.test.afterEach(async ({ page }) => {
        // Take screenshot on failure
        if (test_1.test.info().status === 'failed') {
            await page.screenshot({
                path: `test-results/screenshots/failed-${test_1.test.info().title}-${Date.now()}.png`,
                fullPage: true
            });
        }
    });
    (0, test_1.test)('should login successfully with standard user @smoke @authentication', async () => {
        // Verify login page is displayed
        const isLoginPageDisplayed = await loginPage.isDisplayed();
        (0, test_1.expect)(isLoginPageDisplayed).toBeTruthy();
        // Perform login
        const loginResult = await loginPage.login(credentials.standard);
        // Verify login success
        (0, test_1.expect)(loginResult.success).toBeTruthy();
        (0, test_1.expect)(loginResult.redirectUrl).toContain('/inventory.html');
        // Verify inventory page is loaded
        await inventoryPage.waitForPageToLoad();
        const isLoggedIn = await inventoryPage.isLoggedIn();
        (0, test_1.expect)(isLoggedIn).toBeTruthy();
        // Verify page title
        const pageTitle = await inventoryPage.getPageTitle();
        (0, test_1.expect)(pageTitle).toBe('Swag Labs');
    });
    (0, test_1.test)('should fail to login with locked out user @regression @security @negative', async () => {
        // Attempt login with locked user
        const loginResult = await loginPage.login(credentials.locked);
        // Verify login failure
        (0, test_1.expect)(loginResult.success).toBeFalsy();
        (0, test_1.expect)(loginResult.errorMessage).toContain('locked out');
        // Verify still on login page
        const currentUrl = await loginPage.getCurrentURL();
        (0, test_1.expect)(currentUrl).not.toContain('/inventory.html');
    });
    (0, test_1.test)('should show error message for invalid credentials @regression @validation @negative', async () => {
        // Attempt login with invalid credentials
        const invalidCredentials = { username: 'invalid_user', password: 'invalid_password' };
        const loginResult = await loginPage.login(invalidCredentials);
        // Verify login failure
        (0, test_1.expect)(loginResult.success).toBeFalsy();
        (0, test_1.expect)(loginResult.errorMessage).toContain('Username and password do not match');
        // Clear error message
        await loginPage.clearErrorMessage();
        // Verify error message is cleared
        const errorMessage = await loginPage.getErrorMessage();
        (0, test_1.expect)(errorMessage).toBeNull();
    });
    (0, test_1.test)('should display all products on inventory page @smoke @products', async () => {
        // Login first
        await loginPage.login(credentials.standard);
        await inventoryPage.waitForPageToLoad();
        // Get all products
        const products = await inventoryPage.getAllProducts();
        // Verify expected number of products (SauceDemo has 6 products)
        (0, test_1.expect)(products).toHaveLength(6);
        // Verify each product has required properties
        for (const product of products) {
            (0, test_1.expect)(product.name).toBeTruthy();
            (0, test_1.expect)(product.description).toBeTruthy();
            (0, test_1.expect)(product.price).toBeTruthy();
            (0, test_1.expect)(product.image).toBeTruthy();
        }
        // Verify specific products exist
        const productNames = products.map((p) => p.name);
        (0, test_1.expect)(productNames).toContain('Sauce Labs Backpack');
        (0, test_1.expect)(productNames).toContain('Sauce Labs Bike Light');
        (0, test_1.expect)(productNames).toContain('Sauce Labs Bolt T-Shirt');
    });
    (0, test_1.test)('should add products to cart successfully @regression @cart @shopping', async () => {
        // Login first
        await loginPage.login(credentials.standard);
        await inventoryPage.waitForPageToLoad();
        // Verify cart is initially empty
        let cartCount = await inventoryPage.getCartItemCount();
        (0, test_1.expect)(cartCount).toBe(0);
        // Add first product to cart
        await inventoryPage.addProductToCart('Sauce Labs Backpack');
        // Verify cart count increased
        cartCount = await inventoryPage.getCartItemCount();
        (0, test_1.expect)(cartCount).toBe(1);
        // Add second product to cart
        await inventoryPage.addProductToCart('Sauce Labs Bike Light');
        // Verify cart count increased again
        cartCount = await inventoryPage.getCartItemCount();
        (0, test_1.expect)(cartCount).toBe(2);
    });
    (0, test_1.test)('should remove products from cart successfully @regression @cart @shopping', async () => {
        // Login first
        await loginPage.login(credentials.standard);
        await inventoryPage.waitForPageToLoad();
        // Add products to cart first
        await inventoryPage.addProductToCart('Sauce Labs Backpack');
        await inventoryPage.addProductToCart('Sauce Labs Bike Light');
        // Verify cart has 2 items
        let cartCount = await inventoryPage.getCartItemCount();
        (0, test_1.expect)(cartCount).toBe(2);
        // Remove one product
        await inventoryPage.removeProductFromCart('Sauce Labs Backpack');
        // Verify cart count decreased
        cartCount = await inventoryPage.getCartItemCount();
        (0, test_1.expect)(cartCount).toBe(1);
        // Remove second product
        await inventoryPage.removeProductFromCart('Sauce Labs Bike Light');
        // Verify cart is empty
        cartCount = await inventoryPage.getCartItemCount();
        (0, test_1.expect)(cartCount).toBe(0);
    });
    (0, test_1.test)('should sort products correctly @regression @sorting @products', async () => {
        // Login first
        await loginPage.login(credentials.standard);
        await inventoryPage.waitForPageToLoad();
        // Sort by name A-Z
        await inventoryPage.sortProducts('az');
        const sortedAZ = await inventoryPage.getAllProducts();
        // Verify sorting worked (first product should be alphabetically first)
        (0, test_1.expect)(sortedAZ[0].name).toBe('Sauce Labs Backpack');
        // Sort by name Z-A
        await inventoryPage.sortProducts('za');
        const sortedZA = await inventoryPage.getAllProducts();
        // Verify reverse sorting worked
        (0, test_1.expect)(sortedZA[0].name).toBe('Test.allTheThings() T-Shirt (Red)');
        // Sort by price low to high
        await inventoryPage.sortProducts('lohi');
        const sortedLowHigh = await inventoryPage.getAllProducts();
        // Verify price sorting (extract numeric price for comparison)
        const firstPrice = parseFloat(sortedLowHigh[0].price.replace('$', ''));
        const secondPrice = parseFloat(sortedLowHigh[1].price.replace('$', ''));
        (0, test_1.expect)(firstPrice).toBeLessThanOrEqual(secondPrice);
    });
    (0, test_1.test)('should complete full shopping workflow @regression @shopping @workflow', async () => {
        // Login
        await loginPage.login(credentials.standard);
        await inventoryPage.waitForPageToLoad();
        // Add multiple products to cart
        const productsToAdd = ['Sauce Labs Backpack', 'Sauce Labs Bike Light', 'Sauce Labs Bolt T-Shirt'];
        await inventoryPage.addMultipleProductsToCart(productsToAdd);
        // Verify cart count
        const cartCount = await inventoryPage.getCartItemCount();
        (0, test_1.expect)(cartCount).toBe(productsToAdd.length);
        // Navigate to cart
        await inventoryPage.goToCart();
        // Verify we're on cart page
        const currentUrl = await inventoryPage.getCurrentURL();
        (0, test_1.expect)(currentUrl).toContain('/cart.html');
    });
    (0, test_1.test)('should logout successfully @smoke @logout @authentication', async () => {
        // Login first
        await loginPage.login(credentials.standard);
        await inventoryPage.waitForPageToLoad();
        // Verify user is logged in
        const isLoggedIn = await inventoryPage.isLoggedIn();
        (0, test_1.expect)(isLoggedIn).toBeTruthy();
        // Logout
        await inventoryPage.logout();
        // Verify redirected to login page
        const currentUrl = await inventoryPage.getCurrentURL();
        (0, test_1.expect)(currentUrl).not.toContain('/inventory.html');
        // Verify login page is displayed
        const isLoginPageDisplayed = await loginPage.isDisplayed();
        (0, test_1.expect)(isLoginPageDisplayed).toBeTruthy();
    });
    (0, test_1.test)('should view product details @regression @products @details', async () => {
        // Login first
        await loginPage.login(credentials.standard);
        await inventoryPage.waitForPageToLoad();
        // Click on a product name to view details
        await inventoryPage.clickProductName('Sauce Labs Backpack');
        // Verify we're on product detail page
        const currentUrl = await inventoryPage.getCurrentURL();
        (0, test_1.expect)(currentUrl).toContain('/inventory-item.html');
        (0, test_1.expect)(currentUrl).toContain('id=');
    });
    (0, test_1.test)('should have all required login page elements @smoke @validation @page-elements', async () => {
        // Validate page elements
        const validation = await loginPage.validatePageElements();
        (0, test_1.expect)(validation.isValid).toBeTruthy();
        (0, test_1.expect)(validation.missingElements).toHaveLength(0);
        // Verify logo is displayed
        const isLogoDisplayed = await loginPage.isLogoDisplayed();
        (0, test_1.expect)(isLogoDisplayed).toBeTruthy();
    });
    (0, test_1.test)('should handle problem user login and behavior @integration @problem-user @edge-cases', async () => {
        // Login with problem user
        const loginResult = await loginPage.login(credentials.problem);
        // Verify login success (problem user can login but has issues)
        (0, test_1.expect)(loginResult.success).toBeTruthy();
        // Wait for inventory page
        await inventoryPage.waitForPageToLoad();
        // Verify products are displayed (problem user may have different behavior)
        const products = await inventoryPage.getAllProducts();
        (0, test_1.expect)(products.length).toBeGreaterThan(0);
        // Note: Problem user typically has issues with images or other functionality
        // This test serves as a baseline for detecting UI issues
    });
});
