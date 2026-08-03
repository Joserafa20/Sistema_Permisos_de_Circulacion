import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiErrorResponse } from '../interfaces/api-response.interface';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const { code, message } = this.resolveError(exception, status);

    // Loguear el error sin exponer datos sensibles del stack en producción
    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `[${request.method}] ${request.url} → ${status}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    } else {
      this.logger.warn(`[${request.method}] ${request.url} → ${status}: ${message}`);
    }

    const body: ApiErrorResponse = {
      success: false,
      error: { code, message },
      timestamp: new Date().toISOString(),
    };

    response.status(status).json(body);
  }

  private resolveError(exception: unknown, status: number): { code: string; message: string } {
    if (exception instanceof HttpException) {
      const res = exception.getResponse();
      if (typeof res === 'object' && res !== null && 'message' in res) {
        const msg = (res as { message: unknown }).message;
        return {
          code: `HTTP_${status}`,
          message: Array.isArray(msg) ? msg.join('; ') : String(msg),
        };
      }
      return { code: `HTTP_${status}`, message: exception.message };
    }

    // Error inesperado: nunca exponer el stack al cliente
    return {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Ha ocurrido un error interno. Por favor intente más tarde.',
    };
  }
}
