import { ValidationError } from 'class-validator';
export declare class ValidationException extends Error {
    errors: ValidationError[];
    constructor(errors: ValidationError[]);
}
export declare function validateDto<T extends object>(dto: T, metatype: new () => T): Promise<T>;
export declare function transformValidationErrors(errors: ValidationError[]): Record<string, string[]>;
export declare function getValidationMessage(error: ValidationError): string;
