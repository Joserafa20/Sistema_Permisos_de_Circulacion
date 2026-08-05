import { of } from 'rxjs';
import { ResponseTransformInterceptor } from './response-transform.interceptor';
import { ApiListResponse } from '../interfaces/api-response.interface';

function buildCallHandler<T>(data: T) {
  return { handle: () => of(data) };
}

const mockContext = {} as import('@nestjs/common').ExecutionContext;

describe('ResponseTransformInterceptor', () => {
  let interceptor: ResponseTransformInterceptor<unknown>;

  beforeEach(() => {
    interceptor = new ResponseTransformInterceptor();
  });

  it('envuelve datos simples con success:true y timestamp', (done) => {
    const handler = buildCallHandler({ id: 1, nombre: 'Test' });
    interceptor.intercept(mockContext, handler).subscribe((result) => {
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ id: 1, nombre: 'Test' });
      expect(typeof result.timestamp).toBe('string');
      done();
    });
  });

  it('detecta payload paginado y añade propiedad pagination', (done) => {
    const paginatedData = {
      items: [{ id: '1' }, { id: '2' }],
      pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
    };
    const handler = buildCallHandler(paginatedData);
    interceptor.intercept(mockContext, handler).subscribe((result) => {
      const listResult = result as unknown as ApiListResponse<unknown>;
      expect(listResult.success).toBe(true);
      expect(listResult.pagination).toBeDefined();
      expect(listResult.pagination).toEqual(paginatedData.pagination);
      done();
    });
  });

  it('coloca items del payload paginado directamente en data', (done) => {
    const paginatedData = {
      items: [{ id: 'abc' }],
      pagination: { page: 1, limit: 5, total: 1, totalPages: 1 },
    };
    const handler = buildCallHandler(paginatedData);
    interceptor.intercept(mockContext, handler).subscribe((result) => {
      expect(result.data).toEqual(paginatedData.items);
      done();
    });
  });

  it('no confunde un array simple con payload paginado', (done) => {
    const simpleArray = [{ id: '1' }, { id: '2' }];
    const handler = buildCallHandler(simpleArray);
    interceptor.intercept(mockContext, handler).subscribe((result) => {
      expect(result.data).toEqual(simpleArray);
      expect((result as unknown as Record<string, unknown>).pagination).toBeUndefined();
      done();
    });
  });

  it('maneja null correctamente', (done) => {
    const handler = buildCallHandler(null);
    interceptor.intercept(mockContext, handler).subscribe((result) => {
      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
      done();
    });
  });
});
