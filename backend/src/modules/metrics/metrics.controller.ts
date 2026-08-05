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
    // Rechaza si no viene de red interna. Solo se usa remoteAddress (no x-forwarded-for)
    // para evitar que el cliente falsifique la IP origen con un header HTTP.
    const ip = req.socket?.remoteAddress ?? '';

    const isInternal =
      ip === '::1' ||
      ip.startsWith('127.') ||
      ip.startsWith('10.') ||
      ip.startsWith('172.16.') ||
      ip.startsWith('172.17.') ||
      ip.startsWith('172.18.') ||
      ip.startsWith('172.19.') ||
      ip.startsWith('172.20.') ||
      ip.startsWith('172.21.') ||
      ip.startsWith('172.22.') ||
      ip.startsWith('172.23.') ||
      ip.startsWith('172.24.') ||
      ip.startsWith('172.25.') ||
      ip.startsWith('172.26.') ||
      ip.startsWith('172.27.') ||
      ip.startsWith('172.28.') ||
      ip.startsWith('172.29.') ||
      ip.startsWith('172.30.') ||
      ip.startsWith('172.31.') ||
      ip.startsWith('192.168.');

    if (process.env.NODE_ENV === 'production' && !isInternal) {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }

    const metrics = await this.metricsService.getMetrics();
    res.status(200).setHeader('Content-Type', this.metricsService.getContentType()).send(metrics);
  }
}
