import 'reflect-metadata';
/**
 * Data provider decorator for parameterized tests
 */
export declare function DataProvider(name: string, factory: () => any[]): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
