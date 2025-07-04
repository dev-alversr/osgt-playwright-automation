import * as yaml from 'yaml';
import * as fs from 'fs';
import * as path from 'path';
import { TestConfig } from '../core/types/global.types';
import { Logger } from '../core/utils/LoggingUtils';
import { ConfigurationError } from '../core/utils/CustomErrors';

/**
 * Configuration manager for handling environment-specific configurations
 */
export class ConfigManager {
  private logger: Logger;
  private config: TestConfig | null = null;
  private static instance: ConfigManager | null = null;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * Get singleton instance
   */
  static getInstance(logger?: Logger): ConfigManager {
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
  loadConfig(environment: string = 'dev'): TestConfig {
    try {
      const configPath = path.join(__dirname, 'environments', `${environment}.yaml`);
      
      if (!fs.existsSync(configPath)) {
        throw new ConfigurationError(`Configuration file not found: ${configPath}`);
      }

      const configContent = fs.readFileSync(configPath, 'utf8');
      const parsedConfig = yaml.parse(configContent) as TestConfig;
      
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
    } catch (error: any) {
      this.logger.error('Failed to load configuration', { 
        environment, 
        error: error.message 
      });
      throw new ConfigurationError(`Failed to load configuration: ${error.message}`, { environment });
    }
  }

  /**
   * Load environment variables from .env file
   */
  private loadEnvironmentVariables(environment: string): void {
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
        } catch (error: any) {
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
  private parseEnvFile(content: string): Record<string, string> {
    const envVars: Record<string, string> = {};
    
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
  private substituteEnvironmentVariables(config: any): any {
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
      const result: any = {};
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
  getConfig(): TestConfig {
    if (!this.config) {
      throw new ConfigurationError('Configuration not loaded. Call loadConfig() first.');
    }
    return this.config;
  }

  /**
   * Validate configuration
   */
  private validateConfig(config: TestConfig): void {
    const requiredFields = [
      'browser',
      'baseURL',
      'apiBaseURL',
      'timeout',
      'retries',
    ];

    const missingFields: string[] = [];
    const validationErrors: string[] = [];

    // Check required fields
    for (const field of requiredFields) {
      if (!(field in config) || config[field as keyof TestConfig] === undefined) {
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
      throw new ConfigurationError(errorMessage, { validationErrors });
    }
    
    this.logger.info('Configuration validation passed');
  }
}