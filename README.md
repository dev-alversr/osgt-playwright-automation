# PlayWright JS/TS Test Automation Framework

[![CI/CD Pipeline](https://github.com/dev-alversr/osgt-playwright-automation/actions/workflows/test-automation.yml/badge.svg)](https://github.com/dev-alversr/osgt-playwright-automation/actions)
[![Test Coverage](https://codecov.io/gh/dev-alversr/osgt-playwright-automation/branch/main/graph/badge.svg)](https://codecov.io/gh/dev-alversr/osgt-playwright-automation)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🎯 Overview

A comprehensive, enterprise-grade test automation framework for the Thompson Reuters ONESOURCE Analyzer Suite built with TypeScript and Playwright. This framework provides robust testing capabilities with Page Object Model (POM) architecture, multi-database support, and advanced features for enterprise applications.

## ✨ Key Features

- **🔧 TypeScript**: Full TypeScript implementation with strict typing and custom decorators
- **🎭 Playwright**: Latest Playwright test runner with cross-browser support
- **📱 Page Object Model**: Clean POM architecture with self-healing element locators
- **🗄️ Multi-Database**: Support for MSSQL, PostgreSQL, and DynamoDB
- **🔍 Self-Healing**: Multiple selector strategies with automatic fallback
- **📊 Performance Monitoring**: Built-in performance metrics and thresholds
- **📸 Media Capture**: Configurable screenshots and video recording
- **🔐 Security**: Encryption utilities for sensitive data
- **🏭 Data Factories**: Type-safe test data generation with Faker.js
- **🌐 API Testing**: REST and GraphQL testing utilities
- **📈 Reporting**: Allure integration with CI/CD support
- **🐳 Docker**: Complete containerization support
- **⚡ CI/CD**: Jenkins and GitHub Actions pipelines

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Git
- Docker (optional, for containerized execution)

### Installation

```bash
# Clone the repository
git clone https://github.com/dev-alversr/osgt-playwright-automation.git
cd osgt-playwright-automation

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install

# Set up environment configuration
cp .env.example .env.dev
# Edit .env.dev with your configuration
```

### Basic Usage

```bash
# Run all tests
npm test

# Run tests in UI mode
npm run test:ui

# Run smoke tests only
npm run test:smoke

# Run regression tests
npm run test:regression

# Run tests in specific browser
npm run test -- --project=chromium

# Run tests in headed mode
npm run test:headed

# Generate and view reports
npm run test:report
```

## 📁 Project Structure

```
osgt-playwright-automation/
├── src/
│   ├── core/                  # Core framework components
│   │   ├── base/              # Base classes (BasePage, BaseTest, BaseAPI)
│   │   ├── decorators/        # Custom TypeScript decorators
│   │   ├── types/             # TypeScript type definitions
│   │   └── utils/             # Utility classes (Logger, Database, Crypto)
│   ├── pages/                 # Page Object classes
│   │   ├── LoginPage.ts
│   │   ├── DashboardPage.ts
│   │   └── AnalyzerPage.ts
│   ├── tests/                 # Test files
│   │   ├── ui/                # UI tests
│   │   ├── api/               # API tests
│   │   └── integration/       # Integration tests
│   ├── data/                  # Test data and factories
│   │   ├── factories/         # Data generation factories
│   │   ├── fixtures/          # Static test data
│   │   └── seeds/             # Database seed scripts
│   ├── config/                # Configuration files
│   │   └── environments/      # Environment-specific configs
│   └── scripts/               # Utility scripts
├── test-results/              # Test execution results
├── allure-results/            # Allure test results
├── logs/                      # Application logs
├── docker-compose.yml         # Docker Compose configuration
├── Dockerfile                 # Docker image definition
├── playwright.config.ts       # Playwright configuration
└── tsconfig.json             # TypeScript configuration
```

## 🔧 Configuration

### Environment Setup

Create environment-specific configuration files in `src/config/environments/`:

```yaml
# dev.yaml
browser: chromium
headless: false
timeout: 30000
baseURL: https://dev.onesource.thomsonreuters.com
apiBaseURL: https://api-dev.onesource.thomsonreuters.com

database:
  mssql:
    server: ${DB_SERVER}
    database: ${DB_NAME}
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}

logging:
  level: debug
  format: simple
  transports: [console, file]
```

### Environment Variables

Configure your `.env.dev` file:

```bash
# Application URLs
BASE_URL=https://dev.onesource.thomsonreuters.com
API_BASE_URL=https://api-dev.onesource.thomsonreuters.com

# Database Configuration
DB_SERVER=your-db-server
DB_USERNAME=your-username
DB_PASSWORD=your-password

# Security
ENCRYPTION_KEY=your-encryption-key
API_TOKEN=your-api-token
```

## 📝 Writing Tests

### Page Objects

Create page objects using the framework's base classes and decorators:

```typescript
import { Page } from '@playwright/test';
import { BasePage } from '@core/base/BasePage';
import { Page as PageDecorator } from '@core/decorators/PageDecorator';

@PageDecorator('LoginPage', '/login')
export class LoginPage extends BasePage {
  private readonly selectors = {
    usernameField: {
      dataTestId: 'login-username',
      id: 'username',
      css: 'input[name="username"]',
      xpath: '//input[@name="username"]',
      text: '',
      role: 'textbox',
    }
  };

  async login(credentials: LoginCredentials): Promise<void> {
    await this.fillForm(credentials, {
      username: this.selectors.usernameField,
      password: this.selectors.passwordField,
    });
    
    await this.clickElement(this.selectors.loginButton);
  }
}
```

### Test Cases

Write tests with metadata using decorators:

```typescript
import { test, expect } from '@core/base/BaseTest';
import { Test } from '@core/decorators/TestDecorator';

@Test({
  category: 'smoke',
  priority: 'high',
  tags: ['login', 'authentication'],
  author: 'Test Team',
  description: 'Verify successful login with valid credentials',
  requirements: ['REQ-AUTH-001']
})
test('should login successfully', async ({ page, userFactory }) => {
  const loginPage = new LoginPage(page);
  const user = userFactory.generateAdmin();
  
  await loginPage.navigate();
  await loginPage.login({
    username: user.username,
    password: user.password
  });
  
  await expect(page).toHaveURL(/.*dashboard/);
});
```

### API Testing

Test APIs with built-in utilities:

```typescript
import { APIUtils } from '@core/utils/APIUtils';

test('should create user via API', async ({ logger }) => {
  const apiUtils = new APIUtils(process.env.API_BASE_URL!, logger);
  const newUser = userFactory.generateUser();
  
  const response = await apiUtils.request('/users', 'POST', newUser);
  
  expect(response.status).toBe(201);
  expect(response.body).toHaveProperty('id');
});
```

## 🗄️ Database Testing

### Data Seeding

```typescript
import { DatabaseUtils } from '@utils/DatabaseUtils';

test.beforeEach(async ({ databaseUtils, userFactory }) => {
  const testUsers = userFactory.generateUsers(10);
  await databaseUtils.seedMSSQLData('users', testUsers);
});

test.afterEach(async ({ databaseUtils }) => {
  await databaseUtils.cleanupMSSQLTable('users', "email LIKE '%@example.com'");
});
```

### Database Operations

```typescript
// Query data
const users = await databaseUtils.executeMSSQLQuery<User[]>(
  'SELECT * FROM users WHERE role = @role',
  { role: 'admin' }
);

// Execute stored procedures
const results = await databaseUtils.executeMSSQLProcedure('GetUserAnalytics', {
  userId: '12345',
  startDate: '2024-01-01'
});
```

## 🔐 Security Features

### Credential Encryption

```typescript
import { CryptoUtils } from '@utils/CryptoUtils';

const crypto = new CryptoUtils(process.env.ENCRYPTION_KEY!, logger);

// Encrypt sensitive data
const encryptedPassword = crypto.encrypt('sensitive-password');

// Decrypt when needed
const decryptedPassword = crypto.decrypt(encryptedPassword);
```

### Secure Test Data

```typescript
const user = userFactory.generateUser({
  password: await crypto.hashPassword('test-password')
});
```

## 📊 Performance Monitoring

Monitor performance metrics automatically:

```typescript
test('should meet performance thresholds', async ({ page, performanceMonitor }) => {
  await performanceMonitor.startMonitoring();
  
  // Perform actions
  await page.goto('/dashboard');
  
  const metrics = await performanceMonitor.stopMonitoring();
  
  expect(metrics.pageLoadTime).toBeLessThan(5000);
  expect(metrics.memoryUsage.usedJSHeapSize).toBeLessThan(100000000);
});
```

## 🐳 Docker Support

### Run with Docker Compose

```bash
# Start all services (databases, tests, reporting)
docker-compose up

# Run specific test suite
docker-compose run test-automation npm run test:smoke

# Scale browser nodes
docker-compose up --scale selenium-chrome=3

# View services
# - Allure Reports: http://localhost:5050
# - Selenium Hub: http://localhost:4444
# - Grafana Dashboard: http://localhost:3000
```

### Build and Run Docker Image

```bash
# Build image
docker build -t osgt-playwright-automation .

# Run tests in container
docker run --rm \
  -e TEST_ENV=docker \
  -e DB_USERNAME=$DB_USERNAME \
  -e DB_PASSWORD=$DB_PASSWORD \
  -v $(pwd)/test-results:/app/test-results \
  osgt-playwright-automation

# Run with custom environment
docker run --rm \
  -e TEST_ENV=staging \
  osgt-playwright-automation npm run test:regression
```

## 🚀 CI/CD Integration

### GitHub Actions

The framework includes a comprehensive GitHub Actions workflow:

- **Multi-environment support** (dev, staging, prod)
- **Cross-browser testing** (Chromium, Firefox, WebKit)
- **Parallel execution** for faster feedback
- **Automatic report generation** and deployment
- **Slack/Teams notifications**
- **Security scanning** with OWASP ZAP

Trigger manually with custom parameters:

```bash
# Via GitHub UI or API
gh workflow run test-automation.yml \
  -f environment=staging \
  -f test_suite=regression \
  -f browser=all
```

### Jenkins Pipeline

Use the provided Jenkinsfile for Jenkins integration:

```groovy
pipeline {
    agent any
    parameters {
        choice(name: 'ENVIRONMENT', choices: ['dev', 'staging', 'prod'])
        choice(name: 'TEST_SUITE', choices: ['smoke', 'regression', 'full'])
        choice(name: 'BROWSER', choices: ['chromium', 'firefox', 'webkit', 'all'])
    }
    stages {
        stage('Test') {
            steps {
                sh "npm run test:${params.TEST_SUITE}"
            }
        }
    }
}
```

## 📈 Reporting

### Allure Reports

Generate comprehensive test reports:

```bash
# Generate report
npm run allure:generate

# Serve report locally
npm run allure:serve

# Open report in browser
open http://localhost:5050
```

### Custom Reporting

The framework generates multiple report formats:

- **HTML Reports**: Playwright's built-in HTML reporting
- **JSON Results**: Machine-readable test results
- **Allure Reports**: Rich test reporting with trends and analytics
- **Performance Reports**: Detailed performance metrics
- **Coverage Reports**: Code coverage for unit tests

## 🔧 Advanced Configuration

### Custom Decorators

Create custom metadata for tests:

```typescript
@Test({
  category: 'integration',
  priority: 'medium',
  tags: ['api', 'database', 'performance'],
  author: 'John Doe',
  description: 'Verify user creation workflow with database validation',
  requirements: ['REQ-USER-001', 'REQ-DB-002'],
  estimatedDuration: 120000, // 2 minutes
  retryCount: 2
})
test('complex user workflow', async () => {
  // Test implementation
});
```

### Data Providers

Use data providers for parameterized tests:

```typescript
@DataProvider('userRoles', () => [
  { role: 'admin', permissions: ['read', 'write', 'delete'] },
  { role: 'user', permissions: ['read'] },
  { role: 'analyst', permissions: ['read', 'analyze'] }
])
test('role-based access control', async ({ }, testData) => {
  // Test with different user roles
});
```

### Custom Fixtures

Create reusable test fixtures:

```typescript
export const test = base.extend<{
  authenticatedUser: UserData;
  cleanDatabase: void;
}>({
  authenticatedUser: async ({ page, userFactory }, use) => {
    const user = userFactory.generateAdmin();
    const loginPage = new LoginPage(page);
    await loginPage.login(user);
    await use(user);
  },

  cleanDatabase: async ({ databaseUtils }, use) => {
    await use();
    // Cleanup after test
    await databaseUtils.cleanupMSSQLTable('test_data');
  }
});
```

## 🛠️ Development Guide

### Setting Up Development Environment

```bash
# Install dependencies
npm install

# Set up pre-commit hooks
npm run prepare

# Run in watch mode during development
npm run build:watch

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

### Code Quality

The framework enforces code quality through:

- **ESLint**: TypeScript linting with strict rules
- **Prettier**: Code formatting
- **Husky**: Pre-commit hooks
- **TypeScript**: Strict type checking
- **Unit Tests**: Comprehensive test coverage

### Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 🐛 Troubleshooting

### Common Issues

#### Test Timeouts
```bash
# Increase timeout in config
timeout: 60000

# Or per test
test('slow test', async ({ page }) => {
  test.setTimeout(60000);
  // Test implementation
});
```

#### Element Not Found
```typescript
// Use multiple selector strategies
const selectors = {
  button: {
    dataTestId: 'submit-btn',
    id: 'submit',
    css: '.submit-button',
    xpath: '//button[@type="submit"]',
    text: 'Submit',
    role: 'button'
  }
};
```

#### Database Connection Issues
```bash
# Check connection settings
npm run db:test-connection

# Verify environment variables
echo $DB_SERVER $DB_USERNAME
```

#### Performance Issues
```typescript
// Monitor performance
await performanceMonitor.startMonitoring();
// ... test actions
const metrics = await performanceMonitor.stopMonitoring();
console.log('Performance metrics:', metrics);
```

### Debug Mode

Run tests in debug mode:

```bash
# Debug specific test
npm run test:debug -- --grep "login test"

# Debug with browser open
npm run test:headed -- --debug

# Step through with debugger
npm run test -- --debug --timeout=0
```

### Logging

Configure detailed logging:

```typescript
// In test
const logger = new Logger('MyTest', { level: 'debug' });
logger.info('Starting test execution');
logger.debug('Detailed debug information');
```

## 📚 API Reference

### Core Classes

#### BasePage
- `navigate(url?)`: Navigate to page
- `waitForPageLoad()`: Wait for page to load
- `fillForm(data, mappings)`: Fill form fields
- `clickElement(strategies)`: Click element with retry
- `getElementText(strategies)`: Get element text
- `isElementVisible(strategies)`: Check visibility

#### ElementLocator
- `locate(strategies, timeout?)`: Find element with fallback
- `waitForState(strategies, state, timeout?)`: Wait for element state
- `waitForText(strategies, text, timeout?)`: Wait for text content

#### DatabaseUtils
- `executeMSSQLQuery<T>(query, params?)`: Execute MSSQL query
- `seedMSSQLData(table, data)`: Seed test data
- `cleanupMSSQLTable(table, condition?)`: Cleanup data

#### UserDataFactory
- `generateUser(overrides?)`: Generate single user
- `generateUsers(count, overrides?)`: Generate multiple users
- `generateUserWithRole(role)`: Generate user with specific role

### Decorators

#### @Page(name, url?)
Marks a class as a page object:
```typescript
@Page('LoginPage', '/login')
export class LoginPage extends BasePage {}
```

#### @Test(metadata)
Adds metadata to test methods:
```typescript
@Test({
  category: 'smoke',
  priority: 'high',
  tags: ['authentication']
})
test('login test', async () => {});
```

#### @DataProvider(name, factory)
Provides test data:
```typescript
@DataProvider('users', () => userFactory.generateUsers(5))
test('user test', async ({ }, userData) => {});
```

## 🔗 Additional Resources

### Documentation
- [Playwright Documentation](https://playwright.dev/docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Allure Reporting](https://docs.qameta.io/allure/)

### Best Practices
- Use Page Object Model for maintainability
- Implement self-healing selectors
- Leverage data factories for test data
- Monitor performance metrics
- Use proper error handling
- Implement comprehensive logging

### Testing Strategy
- **Smoke Tests**: Critical functionality verification
- **Regression Tests**: Full feature testing
- **Integration Tests**: Component interaction testing
- **API Tests**: Service layer validation
- **Performance Tests**: Load and stress testing

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Support

For support and questions:

- **GitHub Issues**: [Create an issue](https://github.com/dev-alversr/osgt-playwright-automation/issues)
- **Documentation**: [Wiki](https://github.com/dev-alversr/osgt-playwright-automation/wiki)
- **Team Chat**: Slack #test-automation
- **Email**: ronald.alversado@ibm.com

## 🎉 Acknowledgments

- Playwright team for the excellent testing framework
- Open source community for various tools and libraries

---

**Built with ❤️ by the Test Automation Team**