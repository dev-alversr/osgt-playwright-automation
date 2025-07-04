import 'reflect-metadata';
/**
 * Page decorator for marking classes as page objects
 */
export declare function Page(name: string, url?: string): <T extends new (...args: any[]) => {}>(constructor: T) => T;
