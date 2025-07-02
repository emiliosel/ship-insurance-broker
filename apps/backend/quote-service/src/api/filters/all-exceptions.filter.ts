import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { isDomainException } from './domain-exceptions.filter';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'Internal Server Error';

    // Handle specific NestJS exceptions
    if (exception instanceof ForbiddenException) {
      status = HttpStatus.FORBIDDEN;
      const responseBody = exception.getResponse();
      if (typeof responseBody === 'object') {
        message = (responseBody as { message: string }).message || 'Forbidden';
        error = (responseBody as { error: string }).error || 'Forbidden';
      } else {
        message = responseBody;
      }
      this.logger.warn(`Forbidden access: ${message}`);
    } else if (exception instanceof UnauthorizedException) {
      status = HttpStatus.UNAUTHORIZED;
      const responseBody = exception.getResponse();
      if (typeof responseBody === 'object') {
        message =
          (responseBody as { message: string }).message || 'Unauthorized';
        error = (responseBody as { error: string }).error || 'Unauthorized';
      } else {
        message = responseBody;
      }
      this.logger.warn(`Unauthorized access: ${message}`);
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const responseBody = exception.getResponse();
      if (typeof responseBody === 'object') {
        message = (responseBody as { message: string }).message || message;
        error = (responseBody as { error: string }).error || error;
      } else {
        message = responseBody;
      }
    } else if (exception instanceof Error && isDomainException(exception)) {
      // Let the domain exceptions filter handle domain-specific errors
      throw exception;
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // Log the error with relevant details
    this.logger.error(
      `${request.method} ${request.url}`,
      exception instanceof Error ? exception.stack : 'No stack trace',
      'ExceptionFilter',
    );

    // Structure the error response
    const errorResponse = {
      error,
      message: Array.isArray(message) ? message : [message],
      stack: undefined,
    };

    response.status(status).json({
      ...errorResponse,
      // Add additional debug information in development
      stack:
        process.env.NODE_ENV !== 'production' && exception instanceof Error
          ? exception.stack
          : undefined,
    });
  }
}
