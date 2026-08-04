import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { DomainException } from '../exceptions/domain.exception';
import { ApiErrorResponse } from '../interfaces/api-response.interface';

type ErrorDetail = { field: string; message: string };

/** Mapeo de status HTTP a código interno según API_FUNCIONAL.md §4 */
const HTTP_STATUS_CODES: Record<number, string> = {
  400: 'VALIDATION_ERROR',
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  409: 'CONFLICT',
  422: 'BUSINESS_RULE_ERROR',
  429: 'RATE_LIMIT_EXCEEDED',
  500: 'INTERNAL_ERROR',
  503: 'SERVICE_UNAVAILABLE',
};

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let body: ApiErrorResponse;

    if (exception instanceof DomainException) {
      status = exception.httpStatus;
      body = {
        success: false,
        message: exception.message,
        code: exception.code,
        timestamp: new Date().toISOString(),
      };
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const { message, code, errors } = this.resolveHttpException(exception, status);
      body = {
        success: false,
        message,
        code,
        timestamp: new Date().toISOString(),
        ...(errors && errors.length > 0 ? { errors } : {}),
      };
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      body = {
        success: false,
        message: 'Ha ocurrido un error interno. Por favor intente más tarde.',
        code: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      };
    }

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `[${request.method}] ${request.url} → ${status}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    } else {
      this.logger.warn(`[${request.method}] ${request.url} → ${status}: ${body.message}`);
    }

    response.status(status).json(body);
  }

  private resolveHttpException(
    exception: HttpException,
    status: number,
  ): { message: string; code: string; errors?: ErrorDetail[] } {
    const res = exception.getResponse();

    if (typeof res === 'object' && res !== null) {
      const payload = res as Record<string, unknown>;

      // Formato personalizado: emitido por ValidationPipe.exceptionFactory o lanzado con {code, message, errors?}
      if ('code' in payload) {
        return {
          message: String(payload.message ?? 'Error desconocido'),
          code: String(payload.code),
          errors: Array.isArray(payload.errors) ? (payload.errors as ErrorDetail[]) : undefined,
        };
      }

      // Formato estándar NestJS: {message: string | string[], error, statusCode}
      if ('message' in payload) {
        const msg = payload.message;
        return {
          message: Array.isArray(msg) ? msg.join('; ') : String(msg),
          code: HTTP_STATUS_CODES[status] ?? `HTTP_${status}`,
        };
      }
    }

    return {
      message: exception.message,
      code: HTTP_STATUS_CODES[status] ?? `HTTP_${status}`,
    };
  }
}
