import {
  CorrelationIdMiddleware,
  CORRELATION_ID_HEADER,
  REQUEST_ID_HEADER,
} from './correlation-id.middleware';

function makeReqRes(headers: Record<string, string> = {}) {
  const setHeaderCalls: [string, string][] = [];
  const req = { headers } as never;
  const res = {
    setHeader: jest.fn((...args: [string, string]) => setHeaderCalls.push(args)),
  };
  const next = jest.fn();
  return { req, res, next, setHeaderCalls };
}

describe('CorrelationIdMiddleware', () => {
  const middleware = new CorrelationIdMiddleware();

  it('genera correlationId y requestId cuando no vienen en headers', () => {
    const { req, res, next } = makeReqRes();
    middleware.use(req, res as never, next);

    expect(res.setHeader).toHaveBeenCalledWith(CORRELATION_ID_HEADER, expect.any(String));
    expect(res.setHeader).toHaveBeenCalledWith(REQUEST_ID_HEADER, expect.any(String));
    expect(next).toHaveBeenCalled();
  });

  it('reutiliza el X-Correlation-Id del request si ya viene en headers', () => {
    const existingCid = 'my-trace-id-123';
    const { req, res, next } = makeReqRes({ 'x-correlation-id': existingCid });
    middleware.use(req, res as never, next);

    expect(res.setHeader).toHaveBeenCalledWith(CORRELATION_ID_HEADER, existingCid);
  });

  it('asigna correlationId y requestId al objeto request', () => {
    const { req, res, next } = makeReqRes();
    middleware.use(req, res as never, next);

    const r = req as unknown as { correlationId: string; requestId: string };
    expect(r.correlationId).toBeDefined();
    expect(r.requestId).toBeDefined();
    expect(r.correlationId).not.toBe(r.requestId);
  });
});
