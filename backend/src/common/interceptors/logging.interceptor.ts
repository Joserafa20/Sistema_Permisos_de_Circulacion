import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Request } from 'express';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { correlationId?: string; requestId?: string }>();
    const { method, url } = request;
    const correlationId = request.correlationId ?? '-';
    const requestId = request.requestId ?? '-';
    const userAgent = request.headers['user-agent'] ?? '-';
    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        const status = context.switchToHttp().getResponse<{ statusCode: number }>().statusCode;
        const ms = Date.now() - start;
        this.logger.log(
          `${method} ${url} ${status} — ${ms}ms | cid=${correlationId} rid=${requestId} ua="${String(userAgent).slice(0, 80)}"`,
        );
      }),
    );
  }
}
