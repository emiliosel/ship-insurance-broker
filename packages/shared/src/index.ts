import "reflect-metadata";

// Re-export all types
export * from "./types/entities";
export * from "./types/events";
export * from "./types/dto";

// Export auth module
export * from "./auth";

// Re-export class-validator decorators
export {
  IsString,
  IsNumber,
  IsUUID,
  IsDate,
  IsEnum,
  IsOptional,
  IsArray,
  ValidateNested,
  Min,
  IsEmail,
  IsObject,
  IsBoolean,
  Length,
  MinLength,
  MaxLength,
  IsNotEmpty,
  Matches,
  IsDefined,
} from "class-validator";

// Re-export class-transformer decorators and functions
export {
  Type,
  Transform,
  Expose,
  Exclude,
  plainToInstance,
  instanceToPlain,
  ClassTransformOptions,
} from "class-transformer";

// Export validation utilities
export {
  ValidationException,
  validateDto,
  transformValidationErrors,
  getValidationMessage,
} from "./utils/validation.pipe";

// Utility type for API responses
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
}
