"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataProvider = void 0;
require("reflect-metadata");
/**
 * Data provider decorator for parameterized tests
 */
function DataProvider(name, factory) {
    return function (target, propertyKey, descriptor) {
        Reflect.defineMetadata('data:provider', { name, factory }, target, propertyKey);
    };
}
exports.DataProvider = DataProvider;
