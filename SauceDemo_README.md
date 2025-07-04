# SauceDemo UI Tests - Quick Start Guide

This guide shows how to run SauceDemo tests using the Thompson Reuters ONESOURCE Test Automation Framework.

## 🚀 Quick Setup

### 1. **Set Environment Variables**
Create `.env.saucedemo` file in your project root:

```bash
# Copy the provided configuration
BROWSER=chromium
HEADLESS=true
BASE_URL=https://www.saucedemo.com
STANDARD_USER=standard_user
LOCKED_USER=locked_out_user
PROBLEM_USER=problem_user
PASSWORD=secret_sauce
```

### 2. **Add Scripts to package.json**
Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "test:saucedemo": "playwright test --config=playwright.saucedemo.config.ts",
    "test:saucedemo:ui": "playwright test --config=playwright.saucedemo.config.ts --ui",
    "test:saucedemo:headed": "playwright test --config=playwright.saucedemo.config.ts --headed",
    "test:saucedemo:chromium": "playwright test --config=playwright.saucedemo.config.ts --project=chromium-saucedemo",
    "test:saucedemo:report": "playwright show-report playwright-report-saucedemo"
  }
}
```

### 3. **Install Dependencies** (if not already done)
```bash
npm install
npx playwright install
```

## 🎯 Running Tests

### **Basic Test Execution**
```bash
# Run all SauceDemo tests
npm run test:saucedemo

# Run tests with UI mode (interactive)
npm run test:saucedemo:ui

# Run tests in headed mode (see browser)
npm run test:saucedemo:headed

# Run tests in debug mode
npm run test:saucedemo:debug
```

### **Browser-Specific Tests**
```bash
# Run only on Chromium
npm run test:saucedemo:chromium

# Run only on Firefox
npm run test:saucedemo:firefox

# Run only on WebKit (Safari)
npm run test:saucedemo:webkit

# Run on mobile browser
npm run test:saucedemo:mobile
```

### **Test Categories**
```bash
# Run only smoke tests
npm run test:saucedemo:smoke

# Run only regression tests
npm run test:saucedemo:regression

# Run specific test
npx playwright test --config=playwright.saucedemo.config.ts --grep="should login successfully"
```

## 📊 Viewing Results

### **HTML Report**
```bash
# View test results
npm run test:saucedemo:report
```

### **Allure Report** (if Allure is installed)
```bash
# Generate and view Allure report
npm run test:saucedemo:allure
```

## 🧪 Available Test Cases

The SauceDemo test suite includes:

### **Authentication Tests**
- ✅ Login with standard user
- ❌ Login with locked user (negative test)
- ❌ Login with invalid credentials (negative test)

### **Product Tests**
- ✅ Display all products on inventory page
- ✅ Sort products by name and price
- ✅ View product details

### **Shopping Cart Tests**
- ✅ Add products to cart
- ✅ Remove products from cart
- ✅ Multiple product workflow

### **Navigation Tests**
- ✅ Logout functionality
- ✅ Page element validation

### **Edge Case Tests**
- ⚠️ Problem user behavior testing

## 🔧 Framework Features Used

This SauceDemo implementation demonstrates:

- **Page Object Model**: Clean separation of page logic
- **Self-Healing Selectors**: Multiple location strategies
- **Custom Decorators**: Test metadata and categorization
- **Performance Monitoring**: Built-in performance tracking
- **Error Handling**: Custom error classes with specific codes
- **Logging**: Comprehensive test execution logging
- **Screenshots**: Automatic capture on failures
- **Cross-Browser Testing**: Chromium, Firefox, WebKit support
- **Mobile Testing**: Responsive design validation

## 🎯 Test Data

The tests use these predefined SauceDemo users:

| Username | Password | Purpose |
|----------|----------|---------|
| `standard_user` | `secret_sauce` | Normal user testing |
| `locked_out_user` | `secret_sauce` | Negative testing |
| `problem_user` | `secret_sauce` | Edge case testing |
| `performance_glitch_user` | `secret_sauce` | Performance testing |

## 📈 Expected Results

When you run the tests, you should see:

```
Running 12 tests using 2 workers

  ✓ should login successfully with standard user
  ✓ should display all products on inventory page  
  ✓ should add products to cart successfully
  ✓ should remove products from cart successfully
  ✓ should sort products correctly
  ✓ should logout successfully
  ✓ should have all required login page elements
  ✓ should complete full shopping workflow
  ✓ should view product details
  ✓ should handle problem user login and behavior
  ✗ should fail to login with locked out user
  ✗ should show error message for invalid credentials

  10 passed, 2 expected failures (12s)
```

## 🐛 Troubleshooting

### **Common Issues**

1. **Environment Variables Not Loaded**
   ```bash
   # Make sure .env.saucedemo exists and has correct values
   cat .env.saucedemo
   ```

2. **Playwright Browsers Not Installed**
   ```bash
   npx playwright install
   ```

3. **TypeScript Compilation Errors**
   ```bash
   npm run build
   ```

4. **Test Timeouts**
   - Increase timeout in `playwright.saucedemo.config.ts`
   - Check network connectivity to saucedemo.com

### **Debug Mode**
```bash
# Run single test in debug mode
npx playwright test --config=playwright.saucedemo.config.ts --debug --grep="should login successfully"
```

This will open the Playwright Inspector for step-by-step debugging.

## 🎉 Success!

You now have a fully functional SauceDemo test suite using the enterprise-grade Thompson Reuters ONESOURCE Test Automation Framework! 

The tests demonstrate real-world scenarios including authentication, product browsing, shopping cart functionality, and edge case handling - all using the robust framework architecture with Page Object Model, self-healing selectors, and comprehensive logging.