import * as crypto from 'crypto';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

export const CORRELATION_ID_HEADER = 'X-Correlation-Id';
export const REQUEST_ID_HEADER = 'X-Request-Id';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const correlationId =
      (req.headers[CORRELATION_ID_HEADER.toLowerCase()] as string | undefined) ??
      crypto.randomUUID();
    const requestId = crypto.randomUUID();

    (req as Request & { correlationId: string; requestId: string }).correlationId = correlationId;
    (req as Request & { correlationId: string; requestId: string }).requestId = requestId;

    res.setHeader(CORRELATION_ID_HEADER, correlationId);
    res.setHeader(REQUEST_ID_HEADER, requestId);

    next();
  }
}
