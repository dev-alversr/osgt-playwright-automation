import 'reflect-metadata';

/**
 * Data provider decorator for parameterized tests
 */
export function DataProvider(name: string, factory: () => any[]) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    Reflect.defineMetadata('data:provider', { name, factory }, target, propertyKey);
  };
}