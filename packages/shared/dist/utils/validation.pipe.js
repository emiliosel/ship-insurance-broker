"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getValidationMessage = exports.transformValidationErrors = exports.validateDto = exports.ValidationException = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class ValidationException extends Error {
    constructor(errors) {
        super('Validation failed');
        this.errors = errors;
        this.name = 'ValidationException';
    }
}
exports.ValidationException = ValidationException;
async function validateDto(dto, metatype) {
    const object = (0, class_transformer_1.plainToInstance)(metatype, dto);
    const errors = await (0, class_validator_1.validate)(object, {
        whitelist: true,
        forbidNonWhitelisted: true
    });
    if (errors.length > 0) {
        throw new ValidationException(errors);
    }
    return object;
}
exports.validateDto = validateDto;
function transformValidationErrors(errors) {
    return errors.reduce((acc, error) => {
        const constraints = error.constraints || {};
        acc[error.property] = Object.values(constraints);
        if (error.children?.length) {
            const childErrors = transformValidationErrors(error.children);
            Object.keys(childErrors).forEach(key => {
                acc[`${error.property}.${key}`] = childErrors[key];
            });
        }
        return acc;
    }, {});
}
exports.transformValidationErrors = transformValidationErrors;
function getValidationMessage(error) {
    if (!error.constraints) {
        return 'Validation failed';
    }
    return Object.values(error.constraints)[0] || 'Validation failed';
}
exports.getValidationMessage = getValidationMessage;
