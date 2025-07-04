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
exports.SauceDemoInventoryPage = void 0;
const BasePage_1 = require("../core/base/BasePage");
const PageDecorator_1 = require("../core/decorators/PageDecorator");
/**
 * SauceDemo InventoryPage class
 */
let SauceDemoInventoryPage = class SauceDemoInventoryPage extends BasePage_1.BasePage {
    selectors = {
        inventoryContainer: {
            dataTestId: 'inventory-container',
            id: 'inventory_container',
            css: '#inventory_container',
            xpath: '//div[@id="inventory_container"]',
            text: '',
            role: 'main'
        },
        inventoryList: {
            dataTestId: 'inventory-list',
            id: '',
            css: '.inventory_list',
            xpath: '//div[@class="inventory_list"]',
            text: '',
            role: 'list'
        },
        inventoryItem: {
            dataTestId: 'inventory-item',
            id: '',
            css: '.inventory_item',
            xpath: '//div[@class="inventory_item"]',
            text: '',
            role: 'listitem'
        },
        productTitle: {
            dataTestId: 'inventory-item-name',
            id: '',
            css: '.inventory_item_name',
            xpath: '//div[@class="inventory_item_name"]',
            text: '',
            role: 'link'
        },
        productDescription: {
            dataTestId: 'inventory-item-desc',
            id: '',
            css: '.inventory_item_desc',
            xpath: '//div[@class="inventory_item_desc"]',
            text: '',
            role: 'text'
        },
        productPrice: {
            dataTestId: 'inventory-item-price',
            id: '',
            css: '.inventory_item_price',
            xpath: '//div[@class="inventory_item_price"]',
            text: '',
            role: 'text'
        },
        addToCartButton: {
            dataTestId: 'add-to-cart',
            id: '',
            css: '.btn_inventory',
            xpath: '//button[@class="btn btn_primary btn_small btn_inventory"]',
            text: 'Add to cart',
            role: 'button'
        },
        removeButton: {
            dataTestId: 'remove',
            id: '',
            css: '.btn_inventory[data-test*="remove"]',
            xpath: '//button[contains(@data-test, "remove")]',
            text: 'Remove',
            role: 'button'
        },
        shoppingCartBadge: {
            dataTestId: 'shopping-cart-badge',
            id: '',
            css: '.shopping_cart_badge',
            xpath: '//span[@class="shopping_cart_badge"]',
            text: '',
            role: 'text'
        },
        shoppingCartLink: {
            dataTestId: 'shopping-cart-link',
            id: 'shopping_cart_container',
            css: '#shopping_cart_container',
            xpath: '//div[@id="shopping_cart_container"]',
            text: '',
            role: 'link'
        },
        menuButton: {
            dataTestId: 'open-menu',
            id: 'react-burger-menu-btn',
            css: '#react-burger-menu-btn',
            xpath: '//button[@id="react-burger-menu-btn"]',
            text: '',
            role: 'button'
        },
        logoutLink: {
            dataTestId: 'logout-sidebar-link',
            id: 'logout_sidebar_link',
            css: '#logout_sidebar_link',
            xpath: '//a[@id="logout_sidebar_link"]',
            text: 'Logout',
            role: 'link'
        },
        sortDropdown: {
            dataTestId: 'product-sort-container',
            id: '',
            css: '.product_sort_container',
            xpath: '//select[@class="product_sort_container"]',
            text: '',
            role: 'combobox'
        },
        appLogo: {
            dataTestId: '',
            id: '',
            css: '.app_logo',
            xpath: '//div[@class="app_logo"]',
            text: 'Swag Labs',
            role: 'banner'
        }
    };
    constructor(page) {
        super(page);
    }
    /**
     * Wait for inventory page to load
     */
    async waitForPageToLoad() {
        this.logger.debug('Waiting for SauceDemo inventory page to load');
        await this.waitForVisible(this.selectors.inventoryContainer);
        await this.waitForVisible(this.selectors.inventoryList);
        await this.waitForVisible(this.selectors.appLogo);
    }
    /**
     * Get all products on the page
     */
    async getAllProducts() {
        this.logger.info('Getting all products from inventory page');
        await this.waitForPageToLoad();
        const productElements = await this.page.locator(this.selectors.inventoryItem.css).all();
        const products = [];
        for (const productElement of productElements) {
            const name = await productElement.locator('.inventory_item_name').textContent() || '';
            const description = await productElement.locator('.inventory_item_desc').textContent() || '';
            const price = await productElement.locator('.inventory_item_price').textContent() || '';
            const image = await productElement.locator('.inventory_item_img img').getAttribute('src') || '';
            products.push({
                name: name.trim(),
                description: description.trim(),
                price: price.trim(),
                image: image.trim()
            });
        }
        this.logger.info(`Found ${products.length} products`, { productCount: products.length });
        return products;
    }
    /**
     * Add product to cart by name
     */
    async addProductToCart(productName) {
        this.logger.info('Adding product to cart', { productName });
        const productElement = this.page.locator('.inventory_item').filter({
            has: this.page.locator('.inventory_item_name', { hasText: productName })
        });
        const addToCartButton = productElement.locator('button[data-test*="add-to-cart"]');
        await addToCartButton.click();
        this.logger.info('Product added to cart successfully', { productName });
    }
    /**
     * Remove product from cart by name
     */
    async removeProductFromCart(productName) {
        this.logger.info('Removing product from cart', { productName });
        const productElement = this.page.locator('.inventory_item').filter({
            has: this.page.locator('.inventory_item_name', { hasText: productName })
        });
        const removeButton = productElement.locator('button[data-test*="remove"]');
        await removeButton.click();
        this.logger.info('Product removed from cart successfully', { productName });
    }
    /**
     * Get cart item count
     */
    async getCartItemCount() {
        try {
            const cartBadgeVisible = await this.isElementVisible(this.selectors.shoppingCartBadge);
            if (cartBadgeVisible) {
                const badgeText = await this.getElementText(this.selectors.shoppingCartBadge);
                return parseInt(badgeText || '0', 10);
            }
            return 0;
        }
        catch (error) {
            this.logger.debug('No cart badge found, assuming 0 items');
            return 0;
        }
    }
    /**
     * Navigate to shopping cart
     */
    async goToCart() {
        this.logger.info('Navigating to shopping cart');
        await this.clickElement(this.selectors.shoppingCartLink);
        await this.page.waitForURL('**/cart.html');
    }
    /**
     * Sort products by option
     */
    async sortProducts(sortOption) {
        this.logger.info('Sorting products', { sortOption });
        const sortValue = {
            'az': 'az',
            'za': 'za',
            'lohi': 'lohi',
            'hilo': 'hilo'
        }[sortOption];
        await this.selectOption(this.selectors.sortDropdown, { value: sortValue });
        // Wait a moment for the sort to take effect
        await this.page.waitForTimeout(1000);
    }
    /**
     * Get product by name
     */
    async getProduct(productName) {
        const products = await this.getAllProducts();
        return products.find(product => product.name === productName) || null;
    }
    /**
     * Check if product exists
     */
    async isProductAvailable(productName) {
        const product = await this.getProduct(productName);
        return product !== null;
    }
    /**
     * Get product price by name
     */
    async getProductPrice(productName) {
        const product = await this.getProduct(productName);
        return product?.price || null;
    }
    /**
     * Click on product name to view details
     */
    async clickProductName(productName) {
        this.logger.info('Clicking on product name', { productName });
        const productNameElement = this.page.locator('.inventory_item_name', { hasText: productName });
        await productNameElement.click();
        // Wait for navigation to product detail page
        await this.page.waitForURL('**/inventory-item.html?id=*');
    }
    /**
     * Logout from the application
     */
    async logout() {
        this.logger.info('Logging out from SauceDemo');
        // Open the menu
        await this.clickElement(this.selectors.menuButton);
        // Wait for menu to open
        await this.page.waitForTimeout(500);
        // Click logout
        await this.clickElement(this.selectors.logoutLink);
        // Wait for redirect to login page
        await this.page.waitForURL('**/');
        this.logger.info('Successfully logged out');
    }
    /**
     * Get page title/logo text
     */
    async getPageTitle() {
        return await this.getElementText(this.selectors.appLogo) || '';
    }
    /**
     * Check if user is logged in (on inventory page)
     */
    async isLoggedIn() {
        try {
            await this.waitForPageToLoad();
            return true;
        }
        catch {
            return false;
        }
    }
    /**
     * Add multiple products to cart
     */
    async addMultipleProductsToCart(productNames) {
        this.logger.info('Adding multiple products to cart', { products: productNames });
        for (const productName of productNames) {
            await this.addProductToCart(productName);
            // Small delay between adding items
            await this.page.waitForTimeout(500);
        }
        this.logger.info(`Added ${productNames.length} products to cart`);
    }
    /**
     * Verify all products are displayed
     */
    async verifyAllProductsDisplayed(expectedCount = 6) {
        const products = await this.getAllProducts();
        const isValid = products.length === expectedCount;
        this.logger.info('Product count verification', {
            expected: expectedCount,
            actual: products.length,
            isValid
        });
        return isValid;
    }
    /**
     * Get cart summary
     */
    async getCartSummary() {
        const itemCount = await this.getCartItemCount();
        // Note: To get actual items, we'd need to navigate to cart page
        // This is a simplified version that just returns the count
        return {
            itemCount,
            items: [] // Would need cart page implementation to get actual items
        };
    }
};
exports.SauceDemoInventoryPage = SauceDemoInventoryPage;
exports.SauceDemoInventoryPage = SauceDemoInventoryPage = __decorate([
    (0, PageDecorator_1.Page)('SauceDemoInventoryPage', '/inventory.html'),
    __metadata("design:paramtypes", [Object])
], SauceDemoInventoryPage);
