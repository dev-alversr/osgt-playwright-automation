import * as sql from 'mssql';
import { Client as PgClient } from 'pg';
import { DynamoDB } from 'aws-sdk';
import { DatabaseConfig } from '../types/global.types';
import { Logger } from './LoggingUtils';
/**
 * Comprehensive database utilities supporting MSSQL, PostgreSQL, and DynamoDB
 */
export declare class DatabaseUtils {
    private config;
    private logger;
    private mssqlPool?;
    private pgClient?;
    private dynamoClient?;
    private dynamoDocumentClient?;
    constructor(config: DatabaseConfig, logger: Logger);
    connectMSSQL(): Promise<sql.ConnectionPool>;
    executeMSSQLQuery<T>(query: string, parameters?: Record<string, any>): Promise<T[]>;
    executeMSSQLProcedure<T>(procedureName: string, parameters?: Record<string, any>): Promise<T[]>;
    seedMSSQLData(tableName: string, data: any[]): Promise<void>;
    cleanupMSSQLTable(tableName: string, condition?: string): Promise<number>;
    connectPostgreSQL(): Promise<PgClient>;
    executePostgreSQLQuery<T>(query: string, parameters?: any[]): Promise<T[]>;
    seedPostgreSQLData(tableName: string, data: any[]): Promise<void>;
    cleanupPostgreSQLTable(tableName: string, condition?: string): Promise<number>;
    connectDynamoDB(): Promise<DynamoDB>;
    scanDynamoDBTable<T>(tableName: string, filters?: Record<string, any>): Promise<T[]>;
    getDynamoDBItem<T>(tableName: string, key: Record<string, any>): Promise<T | null>;
    putDynamoDBItem(tableName: string, item: Record<string, any>): Promise<void>;
    seedDynamoDBData(tableName: string, data: any[]): Promise<void>;
    deleteDynamoDBItem(tableName: string, key: Record<string, any>): Promise<void>;
    testConnections(): Promise<{
        mssql: boolean;
        postgresql: boolean;
        dynamodb: boolean;
    }>;
    getHealthStatus(): Promise<Record<string, {
        status: 'healthy' | 'unhealthy';
        latency?: number;
        error?: string;
    }>>;
    backupMSSQLTable(tableName: string, backupName?: string): Promise<string>;
    restoreMSSQLTable(originalTableName: string, backupTableName: string): Promise<void>;
    disconnect(): Promise<void>;
    getConnectionStatus(): {
        mssql: boolean;
        postgresql: boolean;
        dynamodb: boolean;
    };
}
