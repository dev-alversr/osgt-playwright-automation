import { TestConfig } from '../core/types/global.types';
import { Logger } from '../core/utils/LoggingUtils';
/**
 * Configuration manager for handling environment-specific configurations
 */
export declare class ConfigManager {
    private logger;
    private config;
    private static instance;
    constructor(logger: Logger);
    /**
     * Get singleton instance
     */
    static getInstance(logger?: Logger): ConfigManager;
    /**
     * Load configuration from YAML file
     */
    loadConfig(environment?: string): TestConfig;
    /**
     * Load environment variables from .env file
     */
    private loadEnvironmentVariables;
    /**
     * Parse .env file content
     */
    private parseEnvFile;
    /**
     * Substitute environment variables in configuration
     */
    private substituteEnvironmentVariables;
    /**
     * Get current configuration
     */
    getConfig(): TestConfig;
    /**
     * Validate configuration
     */
    private validateConfig;
}
