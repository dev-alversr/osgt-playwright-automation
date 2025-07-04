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
exports.DatabaseUtils = void 0;
const sql = __importStar(require("mssql"));
const pg_1 = require("pg");
const aws_sdk_1 = require("aws-sdk");
const CustomErrors_1 = require("./CustomErrors");
/**
 * Comprehensive database utilities supporting MSSQL, PostgreSQL, and DynamoDB
 */
class DatabaseUtils {
    config;
    logger;
    mssqlPool;
    pgClient;
    dynamoClient;
    dynamoDocumentClient;
    constructor(config, logger) {
        this.config = config;
        this.logger = logger;
    }
    // ============================================================================
    // MSSQL Operations
    // ============================================================================
    async connectMSSQL() {
        if (!this.mssqlPool) {
            try {
                const poolConfig = {
                    server: this.config.mssql.server,
                    database: this.config.mssql.database,
                    user: this.config.mssql.username,
                    password: this.config.mssql.password,
                    options: this.config.mssql.options,
                    pool: {
                        max: 10,
                        min: 0,
                        idleTimeoutMillis: 30000,
                    },
                    requestTimeout: 30000,
                    connectionTimeout: 30000,
                };
                this.mssqlPool = new sql.ConnectionPool(poolConfig);
                await this.mssqlPool.connect();
                this.logger.info('Connected to MSSQL database', {
                    server: this.config.mssql.server,
                    database: this.config.mssql.database
                });
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                this.logger.error('Failed to connect to MSSQL database', { error: errorMessage });
                throw new CustomErrors_1.DatabaseConnectionError('MSSQL', { error: errorMessage });
            }
        }
        return this.mssqlPool;
    }
    async executeMSSQLQuery(query, parameters) {
        const timer = this.logger.startTimer('MSSQL Query Execution');
        try {
            const pool = await this.connectMSSQL();
            const request = pool.request();
            if (parameters) {
                Object.entries(parameters).forEach(([key, value]) => {
                    request.input(key, value);
                });
            }
            const result = await request.query(query);
            timer.end();
            this.logger.database('SELECT', 'MSSQL', result.recordset.length);
            return result.recordset;
        }
        catch (error) {
            timer.end();
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error('MSSQL query execution failed', { query, parameters, error: errorMessage });
            throw new CustomErrors_1.DatabaseOperationError('QUERY', 'MSSQL', { query, parameters, error: errorMessage });
        }
    }
    async executeMSSQLProcedure(procedureName, parameters) {
        const timer = this.logger.startTimer('MSSQL Procedure Execution');
        try {
            const pool = await this.connectMSSQL();
            const request = pool.request();
            if (parameters) {
                Object.entries(parameters).forEach(([key, value]) => {
                    request.input(key, value);
                });
            }
            const result = await request.execute(procedureName);
            timer.end();
            this.logger.database('EXEC', procedureName, result.recordset.length);
            return result.recordset;
        }
        catch (error) {
            timer.end();
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error('MSSQL procedure execution failed', { procedureName, parameters, error: errorMessage });
            throw new CustomErrors_1.DatabaseOperationError('PROCEDURE', procedureName, { parameters, error: errorMessage });
        }
    }
    async seedMSSQLData(tableName, data) {
        if (!data || data.length === 0) {
            this.logger.warn('No data provided for seeding', { tableName });
            return;
        }
        const timer = this.logger.startTimer('MSSQL Data Seeding');
        const pool = await this.connectMSSQL();
        const transaction = new sql.Transaction(pool);
        try {
            await transaction.begin();
            for (const record of data) {
                const columns = Object.keys(record);
                const columnNames = columns.join(', ');
                const parameterNames = columns.map(col => `@${col}`).join(', ');
                const query = `INSERT INTO ${tableName} (${columnNames}) VALUES (${parameterNames})`;
                const request = new sql.Request(transaction);
                columns.forEach(column => {
                    request.input(column, record[column]);
                });
                await request.query(query);
            }
            await transaction.commit();
            timer.end();
            this.logger.database('INSERT', tableName, data.length);
            this.logger.info(`Seeded ${data.length} records into ${tableName}`);
        }
        catch (error) {
            await transaction.rollback();
            timer.end();
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error('MSSQL data seeding failed', { tableName, recordCount: data.length, error: errorMessage });
            throw new CustomErrors_1.DatabaseOperationError('SEED', tableName, { recordCount: data.length, error: errorMessage });
        }
    }
    async cleanupMSSQLTable(tableName, condition) {
        const timer = this.logger.startTimer('MSSQL Table Cleanup');
        try {
            const query = condition
                ? `DELETE FROM ${tableName} WHERE ${condition}; SELECT @@ROWCOUNT as DeletedCount`
                : `DELETE FROM ${tableName}; SELECT @@ROWCOUNT as DeletedCount`;
            const result = await this.executeMSSQLQuery(query);
            const deletedCount = result[0]?.DeletedCount || 0;
            timer.end();
            this.logger.database('DELETE', tableName, deletedCount);
            this.logger.info(`Cleaned up ${deletedCount} records from ${tableName}`);
            return deletedCount;
        }
        catch (error) {
            timer.end();
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error('MSSQL table cleanup failed', { tableName, condition, error: errorMessage });
            throw new CustomErrors_1.DatabaseOperationError('CLEANUP', tableName, { condition, error: errorMessage });
        }
    }
    // ============================================================================
    // PostgreSQL Operations
    // ============================================================================
    async connectPostgreSQL() {
        if (!this.pgClient) {
            try {
                this.pgClient = new pg_1.Client({
                    host: this.config.postgresql.host,
                    port: this.config.postgresql.port,
                    database: this.config.postgresql.database,
                    user: this.config.postgresql.username,
                    password: this.config.postgresql.password,
                    connectionTimeoutMillis: 30000,
                    query_timeout: 30000,
                });
                await this.pgClient.connect();
                this.logger.info('Connected to PostgreSQL database', {
                    host: this.config.postgresql.host,
                    database: this.config.postgresql.database
                });
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                this.logger.error('Failed to connect to PostgreSQL database', { error: errorMessage });
                throw new CustomErrors_1.DatabaseConnectionError('PostgreSQL', { error: errorMessage });
            }
        }
        return this.pgClient;
    }
    async executePostgreSQLQuery(query, parameters) {
        const timer = this.logger.startTimer('PostgreSQL Query Execution');
        try {
            const client = await this.connectPostgreSQL();
            const result = await client.query(query, parameters);
            timer.end();
            this.logger.database('SELECT', 'PostgreSQL', result.rows.length);
            return result.rows;
        }
        catch (error) {
            timer.end();
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error('PostgreSQL query execution failed', { query, parameters, error: errorMessage });
            throw new CustomErrors_1.DatabaseOperationError('QUERY', 'PostgreSQL', { query, parameters, error: errorMessage });
        }
    }
    async seedPostgreSQLData(tableName, data) {
        if (!data || data.length === 0) {
            this.logger.warn('No data provided for seeding', { tableName });
            return;
        }
        const timer = this.logger.startTimer('PostgreSQL Data Seeding');
        const client = await this.connectPostgreSQL();
        try {
            await client.query('BEGIN');
            for (const record of data) {
                const columns = Object.keys(record);
                const columnNames = columns.join(', ');
                const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');
                const values = columns.map(column => record[column]);
                const query = `INSERT INTO ${tableName} (${columnNames}) VALUES (${placeholders})`;
                await client.query(query, values);
            }
            await client.query('COMMIT');
            timer.end();
            this.logger.database('INSERT', tableName, data.length);
            this.logger.info(`Seeded ${data.length} records into ${tableName}`);
        }
        catch (error) {
            await client.query('ROLLBACK');
            timer.end();
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error('PostgreSQL data seeding failed', { tableName, recordCount: data.length, error: errorMessage });
            throw new CustomErrors_1.DatabaseOperationError('SEED', tableName, { recordCount: data.length, error: errorMessage });
        }
    }
    async cleanupPostgreSQLTable(tableName, condition) {
        const timer = this.logger.startTimer('PostgreSQL Table Cleanup');
        try {
            const query = condition
                ? `DELETE FROM ${tableName} WHERE ${condition}`
                : `DELETE FROM ${tableName}`;
            const result = await this.executePostgreSQLQuery(query);
            const deletedCount = result.length;
            timer.end();
            this.logger.database('DELETE', tableName, deletedCount);
            this.logger.info(`Cleaned up ${deletedCount} records from ${tableName}`);
            return deletedCount;
        }
        catch (error) {
            timer.end();
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error('PostgreSQL table cleanup failed', { tableName, condition, error: errorMessage });
            throw new CustomErrors_1.DatabaseOperationError('CLEANUP', tableName, { condition, error: errorMessage });
        }
    }
    // ============================================================================
    // DynamoDB Operations
    // ============================================================================
    async connectDynamoDB() {
        if (!this.dynamoClient) {
            try {
                const config = {
                    region: this.config.dynamodb.region,
                    accessKeyId: this.config.dynamodb.accessKeyId,
                    secretAccessKey: this.config.dynamodb.secretAccessKey,
                };
                if (this.config.dynamodb.endpoint) {
                    config.endpoint = this.config.dynamodb.endpoint;
                }
                this.dynamoClient = new aws_sdk_1.DynamoDB(config);
                this.dynamoDocumentClient = new aws_sdk_1.DynamoDB.DocumentClient({ service: this.dynamoClient });
                this.logger.info('Connected to DynamoDB', {
                    region: this.config.dynamodb.region,
                    endpoint: this.config.dynamodb.endpoint
                });
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                this.logger.error('Failed to connect to DynamoDB', { error: errorMessage });
                throw new CustomErrors_1.DatabaseConnectionError('DynamoDB', { error: errorMessage });
            }
        }
        return this.dynamoClient;
    }
    async scanDynamoDBTable(tableName, filters) {
        const timer = this.logger.startTimer('DynamoDB Scan');
        try {
            await this.connectDynamoDB();
            const params = {
                TableName: tableName,
            };
            if (filters) {
                params.FilterExpression = Object.keys(filters).map(key => `#${key} = :${key}`).join(' AND ');
                params.ExpressionAttributeNames = Object.keys(filters).reduce((acc, key) => {
                    acc[`#${key}`] = key;
                    return acc;
                }, {});
                params.ExpressionAttributeValues = Object.keys(filters).reduce((acc, key) => {
                    acc[`:${key}`] = filters[key];
                    return acc;
                }, {});
            }
            const result = await this.dynamoDocumentClient.scan(params).promise();
            timer.end();
            this.logger.database('SCAN', tableName, result.Items?.length || 0);
            return result.Items || [];
        }
        catch (error) {
            timer.end();
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error('DynamoDB scan failed', { tableName, filters, error: errorMessage });
            throw new CustomErrors_1.DatabaseOperationError('SCAN', tableName, { filters, error: errorMessage });
        }
    }
    async getDynamoDBItem(tableName, key) {
        const timer = this.logger.startTimer('DynamoDB Get Item');
        try {
            await this.connectDynamoDB();
            const params = {
                TableName: tableName,
                Key: key,
            };
            const result = await this.dynamoDocumentClient.get(params).promise();
            timer.end();
            this.logger.database('GET', tableName, result.Item ? 1 : 0);
            return result.Item || null;
        }
        catch (error) {
            timer.end();
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error('DynamoDB get item failed', { tableName, key, error: errorMessage });
            throw new CustomErrors_1.DatabaseOperationError('GET', tableName, { key, error: errorMessage });
        }
    }
    async putDynamoDBItem(tableName, item) {
        const timer = this.logger.startTimer('DynamoDB Put Item');
        try {
            await this.connectDynamoDB();
            const params = {
                TableName: tableName,
                Item: item,
            };
            await this.dynamoDocumentClient.put(params).promise();
            timer.end();
            this.logger.database('PUT', tableName, 1);
        }
        catch (error) {
            timer.end();
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error('DynamoDB put item failed', { tableName, item, error: errorMessage });
            throw new CustomErrors_1.DatabaseOperationError('PUT', tableName, { item, error: errorMessage });
        }
    }
    async seedDynamoDBData(tableName, data) {
        if (!data || data.length === 0) {
            this.logger.warn('No data provided for seeding', { tableName });
            return;
        }
        const timer = this.logger.startTimer('DynamoDB Data Seeding');
        try {
            await this.connectDynamoDB();
            const batchSize = 25;
            const batches = [];
            for (let i = 0; i < data.length; i += batchSize) {
                batches.push(data.slice(i, i + batchSize));
            }
            for (const batch of batches) {
                const params = {
                    RequestItems: {
                        [tableName]: batch.map(item => ({
                            PutRequest: {
                                Item: item,
                            },
                        })),
                    },
                };
                await this.dynamoDocumentClient.batchWrite(params).promise();
            }
            timer.end();
            this.logger.database('BATCH_WRITE', tableName, data.length);
            this.logger.info(`Seeded ${data.length} records into ${tableName}`);
        }
        catch (error) {
            timer.end();
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error('DynamoDB data seeding failed', { tableName, recordCount: data.length, error: errorMessage });
            throw new CustomErrors_1.DatabaseOperationError('SEED', tableName, { recordCount: data.length, error: errorMessage });
        }
    }
    async deleteDynamoDBItem(tableName, key) {
        const timer = this.logger.startTimer('DynamoDB Delete Item');
        try {
            await this.connectDynamoDB();
            const params = {
                TableName: tableName,
                Key: key,
            };
            await this.dynamoDocumentClient.delete(params).promise();
            timer.end();
            this.logger.database('DELETE', tableName, 1);
        }
        catch (error) {
            timer.end();
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error('DynamoDB delete item failed', { tableName, key, error: errorMessage });
            throw new CustomErrors_1.DatabaseOperationError('DELETE', tableName, { key, error: errorMessage });
        }
    }
    // ============================================================================
    // Utility Methods
    // ============================================================================
    async testConnections() {
        const results = {
            mssql: false,
            postgresql: false,
            dynamodb: false,
        };
        try {
            await this.connectMSSQL();
            await this.executeMSSQLQuery('SELECT 1 as test');
            results.mssql = true;
            this.logger.info('MSSQL connection test passed');
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error('MSSQL connection test failed', { error: errorMessage });
        }
        try {
            await this.connectPostgreSQL();
            await this.executePostgreSQLQuery('SELECT 1 as test');
            results.postgresql = true;
            this.logger.info('PostgreSQL connection test passed');
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error('PostgreSQL connection test failed', { error: errorMessage });
        }
        try {
            await this.connectDynamoDB();
            await this.dynamoClient.listTables().promise();
            results.dynamodb = true;
            this.logger.info('DynamoDB connection test passed');
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error('DynamoDB connection test failed', { error: errorMessage });
        }
        return results;
    }
    async getHealthStatus() {
        const health = {};
        const mssqlStart = Date.now();
        try {
            await this.executeMSSQLQuery('SELECT GETDATE() as current_time');
            health.mssql = {
                status: 'healthy',
                latency: Date.now() - mssqlStart,
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            health.mssql = {
                status: 'unhealthy',
                latency: Date.now() - mssqlStart,
                error: errorMessage,
            };
        }
        const pgStart = Date.now();
        try {
            await this.executePostgreSQLQuery('SELECT NOW() as current_time');
            health.postgresql = {
                status: 'healthy',
                latency: Date.now() - pgStart,
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            health.postgresql = {
                status: 'unhealthy',
                latency: Date.now() - pgStart,
                error: errorMessage,
            };
        }
        const dynamoStart = Date.now();
        try {
            await this.dynamoClient.describeEndpoints().promise();
            health.dynamodb = {
                status: 'healthy',
                latency: Date.now() - dynamoStart,
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            health.dynamodb = {
                status: 'unhealthy',
                latency: Date.now() - dynamoStart,
                error: errorMessage,
            };
        }
        return health;
    }
    async backupMSSQLTable(tableName, backupName) {
        const backupTableName = backupName || `${tableName}_backup_${Date.now()}`;
        try {
            const query = `SELECT * INTO ${backupTableName} FROM ${tableName}`;
            await this.executeMSSQLQuery(query);
            this.logger.info(`Table backed up successfully`, { tableName, backupTableName });
            return backupTableName;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error('Table backup failed', { tableName, backupTableName, error: errorMessage });
            throw new CustomErrors_1.DatabaseOperationError('BACKUP', tableName, { backupTableName, error: errorMessage });
        }
    }
    async restoreMSSQLTable(originalTableName, backupTableName) {
        try {
            await this.cleanupMSSQLTable(originalTableName);
            const query = `INSERT INTO ${originalTableName} SELECT * FROM ${backupTableName}`;
            await this.executeMSSQLQuery(query);
            this.logger.info(`Table restored successfully`, { originalTableName, backupTableName });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error('Table restore failed', { originalTableName, backupTableName, error: errorMessage });
            throw new CustomErrors_1.DatabaseOperationError('RESTORE', originalTableName, { backupTableName, error: errorMessage });
        }
    }
    async disconnect() {
        const promises = [];
        if (this.mssqlPool) {
            promises.push(this.mssqlPool.close().then(() => {
                this.logger.info('MSSQL connection closed');
                this.mssqlPool = undefined;
            }));
        }
        if (this.pgClient) {
            promises.push(this.pgClient.end().then(() => {
                this.logger.info('PostgreSQL connection closed');
                this.pgClient = undefined;
            }));
        }
        if (this.dynamoClient) {
            this.logger.info('DynamoDB connection released');
            this.dynamoClient = undefined;
            this.dynamoDocumentClient = undefined;
        }
        await Promise.all(promises);
        this.logger.info('All database connections closed');
    }
    getConnectionStatus() {
        return {
            mssql: !!this.mssqlPool,
            postgresql: !!this.pgClient,
            dynamodb: !!this.dynamoClient,
        };
    }
}
exports.DatabaseUtils = DatabaseUtils;
