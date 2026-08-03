import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { ApiResponse, PaginationMeta } from '../interfaces/api-response.interface';

interface PaginatedPayload<T> {
  items: T[];
  pagination: PaginationMeta;
}

function isPaginatedPayload<T>(data: unknown): data is PaginatedPayload<T> {
  return (
    data !== null &&
    typeof data === 'object' &&
    'items' in data &&
    Array.isArray((data as Record<string, unknown>)['items']) &&
    'pagination' in data
  );
}

@Injectable()
export class ResponseTransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(_context: ExecutionContext, next: CallHandler<T>): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        if (isPaginatedPayload(data)) {
          return {
            success: true,
            data: data.items as unknown as T,
            message: 'Listado obtenido correctamente',
            pagination: data.pagination,
            timestamp: new Date().toISOString(),
          } as ApiResponse<T>;
        }
        return {
          success: true,
          data,
          message: 'Operación exitosa',
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
