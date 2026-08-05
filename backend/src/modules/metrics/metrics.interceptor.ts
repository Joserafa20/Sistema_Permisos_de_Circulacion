import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Request, Response } from 'express';
import { MetricsService } from './metrics.service';

/**
 * Interceptor que registra duración y resultado de cada petición HTTP
 * en los contadores Prometheus.
 */
@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private readonly metricsService: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    const method = req.method;
    // Normaliza la ruta para evitar cardinalidad alta (/solicitudes/uuid → /solicitudes/:id)
    const route = this.normalizeRoute(req.route?.path ?? req.path);
    const startTime = Date.now();

    const endTimer = this.metricsService.httpRequestDurationSeconds.startTimer({
      method,
      route,
    });

    return next.handle().pipe(
      tap(() => {
        const statusCode = String(res.statusCode);
        endTimer({ status_code: statusCode });
        this.metricsService.httpRequestsTotal.inc({ method, route, status_code: statusCode });
        void startTime;
      }),
      catchError((err: unknown) => {
        const statusCode = res.statusCode >= 400 ? String(res.statusCode) : '500';
        endTimer({ status_code: statusCode });
        this.metricsService.httpRequestsTotal.inc({ method, route, status_code: statusCode });
        return throwError(() => err);
      }),
    );
  }

  private normalizeRoute(path: string): string {
    // Reemplaza UUIDs y segmentos numéricos por parámetros genéricos
    return path
      .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, ':id')
      .replace(/\/\d+/g, '/:id');
  }
}
