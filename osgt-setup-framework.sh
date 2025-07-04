#!/bin/bash

# Test Automation Framework Setup Script
# This script creates the complete directory structure and placeholder files

set -e

echo "🚀 Setting up Playwirght JS/TS Test Automation Framework..."

# Create main project directory
PROJECT_NAME="osgt-playwright-automation"
mkdir -p $PROJECT_NAME
cd $PROJECT_NAME

echo "📁 Creating directory structure..."

# Create main directories
mkdir -p src/{core/{base,decorators,types,utils},pages,tests/{ui,api,integration},data/{factories,fixtures,seeds},config/environments,scripts}
mkdir -p test-results allure-results logs screenshots videos downloads uploads temp
mkdir -p .github/workflows
mkdir -p monitoring mocks certs

echo "📄 Creating configuration files..."

# Create .gitignore
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*

# Build outputs
dist/
*.tsbuildinfo

# Test results
test-results/
allure-results/
allure-report/
playwright-report/
coverage/

# Logs
logs/
*.log

# Environment files
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Media captures
screenshots/
videos/
downloads/
uploads/
temp/

# Certificates
certs/*.key
certs/*.crt

# Docker
.dockerignore
EOF

# Create basic project structure info
cat > PROJECT_STRUCTURE.md << 'EOF'
# Project Structure

```
osgt-playwright-automation/
├── src/
│   ├── core/                  # Core framework components
│   │   ├── base/              # Base classes
│   │   ├── decorators/        # Custom TypeScript decorators
│   │   ├── types/             # Type definitions
│   │   └── utils/             # Utility classes
│   ├── pages/                 # Page Object classes
│   ├── tests/                 # Test files
│   ├── data/                  # Test data and factories
│   ├── config/                # Configuration files
│   └── scripts/               # Utility scripts
├── test-results/              # Test execution results
├── allure-results/            # Allure test results
├── logs/                      # Application logs
├── .github/workflows/         # CI/CD workflows
├── monitoring/                # Monitoring configurations
├── mocks/                     # API mocks
├── docker-compose.yml         # Docker services
├── Dockerfile                 # Docker image
├── playwright.config.ts       # Playwright config
└── package.json              # Dependencies
```
EOF

# Create README for next steps
cat > SETUP_INSTRUCTIONS.md << 'EOF'
# Setup Instructions

## Next Steps:

1. **Copy Framework Files**: 
   - Copy all the provided TypeScript files into their respective directories
   - Use the file paths shown in the artifacts as your guide

2. **Install Dependencies**:
   ```bash
   npm install
   npx playwright install
   ```

3. **Configure Environment**:
   ```bash
   cp .env.example .env.dev
   # Edit .env.dev with your configuration
   ```

4. **Run Tests**:
   ```bash
   npm test
   ```

## File Locations:

- `package.json` → Root directory
- `tsconfig.json` → Root directory  
- `playwright.config.ts` → Root directory
- `src/core/types/global.types.ts` → Core types
- `src/core/base/BasePage.ts` → Base page class
- `src/core/utils/ElementLocator.ts` → Element locator
- `src/core/utils/CustomErrors.ts` → Error classes
- `src/core/utils/LoggingUtils.ts` → Logging utilities
- `src/core/utils/DatabaseUtils.ts` → Database utilities
- `src/data/factories/UserDataFactory.ts` → Data factories
- `src/config/ConfigManager.ts` → Configuration manager
- `src/config/environments/dev.yaml` → Dev configuration
- `src/pages/LoginPage.ts` → Example page object
- `.env.example` → Environment template
- `Dockerfile` → Docker image
- `docker-compose.yml` → Docker services
- `.github/workflows/test-automation.yml` → CI/CD pipeline
- `README.md` → Documentation

EOF

echo "✅ Framework structure created successfully!"
echo "📍 Location: $(pwd)"
echo ""
echo "📋 Next steps:"
echo "1. Copy all the provided files from the artifacts into their respective locations"
echo "2. Run: npm install"
echo "3. Run: npx playwright install"
echo "4. Configure your .env.dev file"
echo "5. Start testing with: npm test"
echo ""
echo "📖 See SETUP_INSTRUCTIONS.md for detailed file locations"