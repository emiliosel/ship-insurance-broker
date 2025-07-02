import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import {
  QuoteRequestNotFoundException,
  ResponderNotFoundException,
  InvalidQuoteRequestStateException,
  InvalidResponderStateException,
  QuoteRequestAlreadyFinalizedException,
  InvalidResponderAssignmentException,
  DuplicateResponderException,
  NoResponseSubmittedException,
  QuoteResponseAlreadySubmittedException,
} from '../../domain/exceptions';

@Catch(Error)
export class DomainExceptionsFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = exception.message;

    // Map domain exceptions to HTTP status codes
    switch (exception.constructor) {
      case QuoteRequestNotFoundException:
      case ResponderNotFoundException:
        status = HttpStatus.NOT_FOUND;
        break;

      case InvalidQuoteRequestStateException:
      case InvalidResponderStateException:
      case QuoteRequestAlreadyFinalizedException:
      case InvalidResponderAssignmentException:
      case NoResponseSubmittedException:
      case QuoteResponseAlreadySubmittedException:
        status = HttpStatus.BAD_REQUEST;
        break;

      case DuplicateResponderException:
        status = HttpStatus.CONFLICT;
        break;

      default:
        // For unexpected errors, hide the internal error message in production
        if (process.env.NODE_ENV === 'production') {
          message = 'Internal server error';
        }
    }

    response.status(status).json({
      statusCode: status,
      message,
      error: exception.name,
      timestamp: new Date().toISOString(),
    });
  }
}

// Type guard function to check if an error is a known domain exception
export function isDomainException(error: Error): boolean {
  return [
    QuoteRequestNotFoundException,
    ResponderNotFoundException,
    InvalidQuoteRequestStateException,
    InvalidResponderStateException,
    QuoteRequestAlreadyFinalizedException,
    InvalidResponderAssignmentException,
    DuplicateResponderException,
    NoResponseSubmittedException,
    QuoteResponseAlreadySubmittedException,
  ].some(errorType => error instanceof errorType);
}
