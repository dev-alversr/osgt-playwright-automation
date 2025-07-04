"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Page = void 0;
require("reflect-metadata");
/**
 * Page decorator for marking classes as page objects
 */
function Page(name, url) {
    return function (constructor) {
        Reflect.defineMetadata('page:name', name, constructor);
        Reflect.defineMetadata('page:url', url, constructor);
        return constructor;
    };
}
exports.Page = Page;
