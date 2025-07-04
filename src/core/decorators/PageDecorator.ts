import 'reflect-metadata';

/**
 * Page decorator for marking classes as page objects
 */
export function Page(name: string, url?: string) {
  return function <T extends { new (...args: any[]): {} }>(constructor: T) {
    Reflect.defineMetadata('page:name', name, constructor);
    Reflect.defineMetadata('page:url', url, constructor);
    return constructor;
  };
}