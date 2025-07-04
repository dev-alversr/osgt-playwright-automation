# ============================================================================
# Test Automation Framework
# Production-ready Docker image for test execution
# ============================================================================

FROM mcr.microsoft.com/playwright:v1.40.0-focal

# Set working directory
WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
ENV TEST_ENV=docker
ENV DEBIAN_FRONTEND=noninteractive

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    git \
    unzip \
    jq \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Install Allure command line tool
RUN curl -o allure-2.24.0.tgz -Ls https://github.com/allure-framework/allure2/releases/download/2.24.0/allure-2.24.0.tgz \
    && tar -zxf allure-2.24.0.tgz -C /opt/ \
    && ln -s /opt/allure-2.24.0/bin/allure /usr/bin/allure \
    && rm allure-2.24.0.tgz

# Copy package files first for better Docker layer caching
COPY package*.json ./
COPY tsconfig.json ./

# Install Node.js dependencies
RUN npm ci --only=production --silent \
    && npm cache clean --force

# Install development dependencies for build
RUN npm ci --silent

# Copy source code
COPY . .

# Create necessary directories with proper permissions
RUN mkdir -p /app/logs \
    /app/test-results \
    /app/allure-results \
    /app/allure-report \
    /app/screenshots \
    /app/videos \
    /app/downloads \
    /app/uploads \
    /app/temp

# Build TypeScript
RUN npm run build

# Remove development dependencies to reduce image size
RUN npm prune --production

# Create non-root user for security
RUN useradd -m -s /bin/bash testuser \
    && chown -R testuser:testuser /app

# Switch to non-root user
USER testuser

# Set up proper permissions for Playwright
RUN npx playwright install --with-deps chromium firefox webkit

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD npm run health-check || exit 1

# Expose ports for debugging and reporting
EXPOSE 9229 5050

# Default command - can be overridden
CMD ["npm", "test"]

# ============================================================================
# Build and run instructions:
# 
# Build the image:
# docker build -t tr-onesource-automation .
# 
# Run tests:
# docker run --rm \
#   -e TEST_ENV=docker \
#   -e DB_USERNAME=$DB_USERNAME \
#   -e DB_PASSWORD=$DB_PASSWORD \
#   -v $(pwd)/test-results:/app/test-results \
#   -v $(pwd)/allure-results:/app/allure-results \
#   tr-onesource-automation
# 
# Run with custom command:
# docker run --rm tr-onesource-automation npm run test:smoke
# 
# Run in debug mode:
# docker run --rm -p 9229:9229 \
#   tr-onesource-automation npm run test:debug
# 
# Run Allure report server:
# docker run --rm -p 5050:5050 \
#   tr-onesource-automation npm run allure:serve
# ============================================================================