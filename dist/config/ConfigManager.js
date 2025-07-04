"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigManager = void 0;
const yaml = __importStar(require("yaml"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const CustomErrors_1 = require("../core/utils/CustomErrors");
/**
 * Configuration manager for handling environment-specific configurations
 */
class ConfigManager {
    logger;
    config = null;
    static instance = null;
    constructor(logger) {
        this.logger = logger;
    }
    /**
     * Get singleton instance
     */
    static getInstance(logger) {
        if (!ConfigManager.instance) {
            if (!logger) {
                throw new Error('Logger is required for first initialization');
            }
            ConfigManager.instance = new ConfigManager(logger);
        }
        return ConfigManager.instance;
    }
    /**
     * Load configuration from YAML file
     */
    loadConfig(environment = 'dev') {
        try {
            const configPath = path.join(__dirname, 'environments', `${environment}.yaml`);
            if (!fs.existsSync(configPath)) {
                throw new CustomErrors_1.ConfigurationError(`Configuration file not found: ${configPath}`);
            }
            const configContent = fs.readFileSync(configPath, 'utf8');
            const parsedConfig = yaml.parse(configContent);
            // Load and merge environment variables
            this.loadEnvironmentVariables(environment);
            // Substitute environment variables in config
            const substitutedConfig = this.substituteEnvironmentVariables(parsedConfig);
            // Validate configuration
            this.validateConfig(substitutedConfig);
            // Assign to instance property after validation
            this.config = substitutedConfig;
            this.logger.info(`Configuration loaded for environment: ${environment}`, {
                environment,
                configPath,
                baseURL: substitutedConfig.baseURL,
                browser: substitutedConfig.browser,
            });
            return substitutedConfig;
        }
        catch (error) {
            this.logger.error('Failed to load configuration', {
                environment,
                error: error.message
            });
            throw new CustomErrors_1.ConfigurationError(`Failed to load configuration: ${error.message}`, { environment });
        }
    }
    /**
     * Load environment variables from .env file
     */
    loadEnvironmentVariables(environment) {
        const envFiles = [
            `.env.${environment}`,
            '.env.local',
            '.env',
        ];
        for (const envFile of envFiles) {
            const envPath = path.join(process.cwd(), envFile);
            if (fs.existsSync(envPath)) {
                try {
                    const envContent = fs.readFileSync(envPath, 'utf8');
                    const envVars = this.parseEnvFile(envContent);
                    Object.entries(envVars).forEach(([key, value]) => {
                        if (!process.env[key]) {
                            process.env[key] = value;
                        }
                    });
                    this.logger.debug(`Environment variables loaded from ${envFile}`, {
                        envFile,
                        variableCount: Object.keys(envVars).length,
                    });
                }
                catch (error) {
                    this.logger.warn(`Failed to load environment file: ${envFile}`, {
                        error: error.message,
                    });
                }
            }
        }
    }
    /**
     * Parse .env file content
     */
    parseEnvFile(content) {
        const envVars = {};
        content.split('\n').forEach((line, lineNumber) => {
            const trimmedLine = line.trim();
            // Skip empty lines and comments
            if (!trimmedLine || trimmedLine.startsWith('#')) {
                return;
            }
            const equalIndex = trimmedLine.indexOf('=');
            if (equalIndex === -1) {
                this.logger.warn(`Invalid environment variable format at line ${lineNumber + 1}: ${trimmedLine}`);
                return;
            }
            const key = trimmedLine.substring(0, equalIndex).trim();
            let value = trimmedLine.substring(equalIndex + 1).trim();
            // Remove quotes if present
            if ((value.startsWith('"') && value.endsWith('"')) ||
                (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1);
            }
            if (key) {
                envVars[key] = value;
            }
        });
        return envVars;
    }
    /**
     * Substitute environment variables in configuration
     */
    substituteEnvironmentVariables(config) {
        if (typeof config === 'string') {
            // Replace ${VAR_NAME} patterns with environment variables
            return config.replace(/\$\{([^}]+)\}/g, (match, varName) => {
                const envValue = process.env[varName];
                if (envValue === undefined) {
                    this.logger.warn(`Environment variable not found: ${varName}`);
                    return match; // Keep original placeholder if not found
                }
                return envValue;
            });
        }
        if (Array.isArray(config)) {
            return config.map(item => this.substituteEnvironmentVariables(item));
        }
        if (typeof config === 'object' && config !== null) {
            const result = {};
            for (const [key, value] of Object.entries(config)) {
                result[key] = this.substituteEnvironmentVariables(value);
            }
            return result;
        }
        return config;
    }
    /**
     * Get current configuration
     */
    getConfig() {
        if (!this.config) {
            throw new CustomErrors_1.ConfigurationError('Configuration not loaded. Call loadConfig() first.');
        }
        return this.config;
    }
    /**
     * Validate configuration
     */
    validateConfig(config) {
        const requiredFields = [
            'browser',
            'baseURL',
            'apiBaseURL',
            'timeout',
            'retries',
        ];
        const missingFields = [];
        const validationErrors = [];
        // Check required fields
        for (const field of requiredFields) {
            if (!(field in config) || config[field] === undefined) {
                missingFields.push(field);
            }
        }
        if (missingFields.length > 0) {
            validationErrors.push(`Missing required fields: ${missingFields.join(', ')}`);
        }
        // Validate browser
        if (config.browser && !['chromium', 'firefox', 'webkit'].includes(config.browser)) {
            validationErrors.push(`Invalid browser: ${config.browser}. Must be one of: chromium, firefox, webkit`);
        }
        if (validationErrors.length > 0) {
            const errorMessage = `Configuration validation failed: ${validationErrors.join('; ')}`;
            this.logger.error('Configuration validation failed', {
                validationErrors,
            });
            throw new CustomErrors_1.ConfigurationError(errorMessage, { validationErrors });
        }
        this.logger.info('Configuration validation passed');
    }
}
exports.ConfigManager = ConfigManager;
