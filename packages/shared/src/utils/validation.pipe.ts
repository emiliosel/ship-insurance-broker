import { validate, ValidationError } from "class-validator";
import { plainToInstance } from "class-transformer";

export class ValidationException extends Error {
  constructor(public errors: ValidationError[]) {
    super("Validation failed");
    this.name = "ValidationException";
  }
}

export async function validateDto<T extends object>(
  dto: T,
  metatype: new () => T,
): Promise<T> {
  const object = plainToInstance(metatype, dto);
  const errors = await validate(object, {
    whitelist: true,
    forbidNonWhitelisted: true,
  });

  if (errors.length > 0) {
    throw new ValidationException(errors);
  }

  return object;
}

export function transformValidationErrors(
  errors: ValidationError[],
): Record<string, string[]> {
  return errors.reduce(
    (acc, error) => {
      const constraints = error.constraints || {};
      acc[error.property] = Object.values(constraints);
      if (error.children?.length) {
        const childErrors = transformValidationErrors(error.children);
        Object.keys(childErrors).forEach((key) => {
          acc[`${error.property}.${key}`] = childErrors[key];
        });
      }
      return acc;
    },
    {} as Record<string, string[]>,
  );
}

export function getValidationMessage(error: ValidationError): string {
  if (!error.constraints) {
    return "Validation failed";
  }

  return Object.values(error.constraints)[0] || "Validation failed";
}
