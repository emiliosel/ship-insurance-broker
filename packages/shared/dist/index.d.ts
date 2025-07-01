import 'reflect-metadata';
export * from './types/entities';
export * from './types/events';
export * from './types/dto';
export { IsString, IsNumber, IsUUID, IsDate, IsEnum, IsOptional, IsArray, ValidateNested, Min, IsEmail, IsObject, IsBoolean, Length, MinLength, MaxLength, IsNotEmpty, Matches, IsDefined } from 'class-validator';
export { Type, Transform, Expose, Exclude, plainToInstance, instanceToPlain, ClassTransformOptions } from 'class-transformer';
export { ValidationException, validateDto, transformValidationErrors, getValidationMessage } from './utils/validation.pipe';
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: Record<string, any>;
    };
}
