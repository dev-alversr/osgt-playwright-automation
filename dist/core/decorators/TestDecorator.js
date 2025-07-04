"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Test = void 0;
require("reflect-metadata");
/**
 * Test decorator for adding metadata to test methods
 */
function Test(metadata) {
    return function (target, propertyKey, descriptor) {
        const existingMetadata = Reflect.getMetadata('test:metadata', target, propertyKey) || {};
        const combinedMetadata = { ...existingMetadata, ...metadata };
        Reflect.defineMetadata('test:metadata', combinedMetadata, target, propertyKey);
    };
}
exports.Test = Test;
