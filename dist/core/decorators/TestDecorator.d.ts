import 'reflect-metadata';
import { TestMetadata } from '@core/types/global.types';
/**
 * Test decorator for adding metadata to test methods
 */
export declare function Test(metadata: Partial<TestMetadata>): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
