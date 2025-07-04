import { Page } from '@playwright/test';
import { BasePage } from '../core/base/BasePage';
/**
 * Product interface for SauceDemo
 */
export interface SauceDemoProduct {
    name: string;
    description: string;
    price: string;
    image: string;
}
/**
 * Cart summary interface
 */
export interface CartSummary {
    itemCount: number;
    items: string[];
}
/**
 * SauceDemo InventoryPage class
 */
export declare class SauceDemoInventoryPage extends BasePage {
    private readonly selectors;
    constructor(page: Page);
    /**
     * Wait for inventory page to load
     */
    waitForPageToLoad(): Promise<void>;
    /**
     * Get all products on the page
     */
    getAllProducts(): Promise<SauceDemoProduct[]>;
    /**
     * Add product to cart by name
     */
    addProductToCart(productName: string): Promise<void>;
    /**
     * Remove product from cart by name
     */
    removeProductFromCart(productName: string): Promise<void>;
    /**
     * Get cart item count
     */
    getCartItemCount(): Promise<number>;
    /**
     * Navigate to shopping cart
     */
    goToCart(): Promise<void>;
    /**
     * Sort products by option
     */
    sortProducts(sortOption: 'az' | 'za' | 'lohi' | 'hilo'): Promise<void>;
    /**
     * Get product by name
     */
    getProduct(productName: string): Promise<SauceDemoProduct | null>;
    /**
     * Check if product exists
     */
    isProductAvailable(productName: string): Promise<boolean>;
    /**
     * Get product price by name
     */
    getProductPrice(productName: string): Promise<string | null>;
    /**
     * Click on product name to view details
     */
    clickProductName(productName: string): Promise<void>;
    /**
     * Logout from the application
     */
    logout(): Promise<void>;
    /**
     * Get page title/logo text
     */
    getPageTitle(): Promise<string>;
    /**
     * Check if user is logged in (on inventory page)
     */
    isLoggedIn(): Promise<boolean>;
    /**
     * Add multiple products to cart
     */
    addMultipleProductsToCart(productNames: string[]): Promise<void>;
    /**
     * Verify all products are displayed
     */
    verifyAllProductsDisplayed(expectedCount?: number): Promise<boolean>;
    /**
     * Get cart summary
     */
    getCartSummary(): Promise<CartSummary>;
}
