import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly db: TypeOrmHealthIndicator,
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
        },
        timestamp: '2026-08-02T14:30:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 503, description: 'Uno o más servicios no disponibles' })
  check(): Promise<unknown> {
    return this.health.check([
      () => this.db.pingCheck('database'),
    ]);
  }
}
