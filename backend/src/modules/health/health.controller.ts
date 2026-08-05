import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HealthCheck, HealthCheckService, TypeOrmHealthIndicator } from '@nestjs/terminus';
import { Public } from '../../common/decorators/public.decorator';
import { RedisHealthIndicator } from './indicators/redis.health-indicator';
import { MinioHealthIndicator } from './indicators/minio.health-indicator';
import { SmtpHealthIndicator } from './indicators/smtp.health-indicator';

@ApiTags('health')
@Controller('health')
@Public()
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly db: TypeOrmHealthIndicator,
    private readonly redisIndicator: RedisHealthIndicator,
    private readonly minioIndicator: MinioHealthIndicator,
    private readonly smtpIndicator: SmtpHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Verifica el estado del sistema y sus dependencias' })
  @ApiResponse({
    status: 200,
    description: 'Todos los servicios operativos',
    schema: {
      example: {
        status: 'ok',
        info: {
          database: { status: 'up' },
          redis: { status: 'up' },
          minio: { status: 'up' },
          smtp: { status: 'up' },
        },
        timestamp: '2026-08-04T14:30:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 503, description: 'Uno o más servicios no disponibles' })
  check(): Promise<unknown> {
    return this.health.check([
      (): Promise<import('@nestjs/terminus').HealthIndicatorResult> =>
        this.db.pingCheck('database'),
      (): Promise<import('@nestjs/terminus').HealthIndicatorResult> =>
        this.redisIndicator.isHealthy('redis'),
      (): Promise<import('@nestjs/terminus').HealthIndicatorResult> =>
        this.minioIndicator.isHealthy('minio'),
      (): Promise<import('@nestjs/terminus').HealthIndicatorResult> =>
        this.smtpIndicator.isHealthy('smtp'),
    ]);
  }
}
