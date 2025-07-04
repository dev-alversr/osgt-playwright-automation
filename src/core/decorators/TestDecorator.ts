import 'reflect-metadata';
import { TestMetadata } from '@core/types/global.types';

/**
 * Test decorator for adding metadata to test methods
 */
export function Test(metadata: Partial<TestMetadata>) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const existingMetadata = Reflect.getMetadata('test:metadata', target, propertyKey) || {};
    const combinedMetadata = { ...existingMetadata, ...metadata };
    Reflect.defineMetadata('test:metadata', combinedMetadata, target, propertyKey);
  };
}