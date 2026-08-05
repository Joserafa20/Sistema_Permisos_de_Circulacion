import { Controller, Get, Header, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiExcludeController } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { MetricsService } from './metrics.service';

/**
 * Endpoint Prometheus — /metrics
 * No se expone en Swagger. Proteger con firewall en producción
 * (solo accesible desde la red interna / scraper de Prometheus).
 */
@ApiExcludeController()
@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get()
  @Public()
  @Header('Cache-Control', 'no-store')
  async getMetrics(@Req() req: Request, @Res() res: Response): Promise<void> {
    // Rechaza si no viene de localhost o red interna (defensa en profundidad)
    const ip =
      (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim() ??
      req.socket?.remoteAddress ??
      '';

    const isInternal =
      ip.startsWith('127.') ||
      ip.startsWith('::1') ||
      ip.startsWith('10.') ||
      ip.startsWith('172.') ||
      ip.startsWith('192.168.');

    if (process.env.NODE_ENV === 'production' && !isInternal) {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }

    const metrics = await this.metricsService.getMetrics();
    res.status(200).setHeader('Content-Type', this.metricsService.getContentType()).send(metrics);
  }
}
