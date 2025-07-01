"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getValidationMessage = exports.transformValidationErrors = exports.validateDto = exports.ValidationException = exports.instanceToPlain = exports.plainToInstance = exports.Exclude = exports.Expose = exports.Transform = exports.Type = exports.IsDefined = exports.Matches = exports.IsNotEmpty = exports.MaxLength = exports.MinLength = exports.Length = exports.IsBoolean = exports.IsObject = exports.IsEmail = exports.Min = exports.ValidateNested = exports.IsArray = exports.IsOptional = exports.IsEnum = exports.IsDate = exports.IsUUID = exports.IsNumber = exports.IsString = void 0;
require("reflect-metadata");
// Re-export all types
__exportStar(require("./types/entities"), exports);
__exportStar(require("./types/events"), exports);
__exportStar(require("./types/dto"), exports);
// Re-export class-validator decorators
var class_validator_1 = require("class-validator");
Object.defineProperty(exports, "IsString", { enumerable: true, get: function () { return class_validator_1.IsString; } });
Object.defineProperty(exports, "IsNumber", { enumerable: true, get: function () { return class_validator_1.IsNumber; } });
Object.defineProperty(exports, "IsUUID", { enumerable: true, get: function () { return class_validator_1.IsUUID; } });
Object.defineProperty(exports, "IsDate", { enumerable: true, get: function () { return class_validator_1.IsDate; } });
Object.defineProperty(exports, "IsEnum", { enumerable: true, get: function () { return class_validator_1.IsEnum; } });
Object.defineProperty(exports, "IsOptional", { enumerable: true, get: function () { return class_validator_1.IsOptional; } });
Object.defineProperty(exports, "IsArray", { enumerable: true, get: function () { return class_validator_1.IsArray; } });
Object.defineProperty(exports, "ValidateNested", { enumerable: true, get: function () { return class_validator_1.ValidateNested; } });
Object.defineProperty(exports, "Min", { enumerable: true, get: function () { return class_validator_1.Min; } });
Object.defineProperty(exports, "IsEmail", { enumerable: true, get: function () { return class_validator_1.IsEmail; } });
Object.defineProperty(exports, "IsObject", { enumerable: true, get: function () { return class_validator_1.IsObject; } });
Object.defineProperty(exports, "IsBoolean", { enumerable: true, get: function () { return class_validator_1.IsBoolean; } });
Object.defineProperty(exports, "Length", { enumerable: true, get: function () { return class_validator_1.Length; } });
Object.defineProperty(exports, "MinLength", { enumerable: true, get: function () { return class_validator_1.MinLength; } });
Object.defineProperty(exports, "MaxLength", { enumerable: true, get: function () { return class_validator_1.MaxLength; } });
Object.defineProperty(exports, "IsNotEmpty", { enumerable: true, get: function () { return class_validator_1.IsNotEmpty; } });
Object.defineProperty(exports, "Matches", { enumerable: true, get: function () { return class_validator_1.Matches; } });
Object.defineProperty(exports, "IsDefined", { enumerable: true, get: function () { return class_validator_1.IsDefined; } });
// Re-export class-transformer decorators and functions
var class_transformer_1 = require("class-transformer");
Object.defineProperty(exports, "Type", { enumerable: true, get: function () { return class_transformer_1.Type; } });
Object.defineProperty(exports, "Transform", { enumerable: true, get: function () { return class_transformer_1.Transform; } });
Object.defineProperty(exports, "Expose", { enumerable: true, get: function () { return class_transformer_1.Expose; } });
Object.defineProperty(exports, "Exclude", { enumerable: true, get: function () { return class_transformer_1.Exclude; } });
Object.defineProperty(exports, "plainToInstance", { enumerable: true, get: function () { return class_transformer_1.plainToInstance; } });
Object.defineProperty(exports, "instanceToPlain", { enumerable: true, get: function () { return class_transformer_1.instanceToPlain; } });
// Export validation utilities
var validation_pipe_1 = require("./utils/validation.pipe");
Object.defineProperty(exports, "ValidationException", { enumerable: true, get: function () { return validation_pipe_1.ValidationException; } });
Object.defineProperty(exports, "validateDto", { enumerable: true, get: function () { return validation_pipe_1.validateDto; } });
Object.defineProperty(exports, "transformValidationErrors", { enumerable: true, get: function () { return validation_pipe_1.transformValidationErrors; } });
Object.defineProperty(exports, "getValidationMessage", { enumerable: true, get: function () { return validation_pipe_1.getValidationMessage; } });
