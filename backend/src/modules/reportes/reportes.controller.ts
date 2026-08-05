import { Controller, Get, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SWAGGER_BEARER_TOKEN } from '../../common/constants/swagger.constants';
import { Roles, UserRole } from '../../common/decorators/roles.decorator';
import { SolicitudEntity } from '../solicitudes/infrastructure/persistence/solicitud.entity';
import { PermisoEntity } from '../permisos/infrastructure/persistence/permiso.entity';
import { EstadoSolicitud, EstadoPermiso } from '../../common/enums';

@ApiTags('reportes')
@Controller('reportes')
@Roles(UserRole.FUNCIONARIO, UserRole.ADMINISTRADOR)
@ApiBearerAuth(SWAGGER_BEARER_TOKEN)
export class ReportesController {
  constructor(
    @InjectRepository(SolicitudEntity)
    private readonly solicitudRepo: Repository<SolicitudEntity>,
    @InjectRepository(PermisoEntity)
    private readonly permisoRepo: Repository<PermisoEntity>,
  ) {}

  @Get('solicitudes')
  @ApiOperation({ summary: 'Reporte agregado de solicitudes por estado' })
  @ApiQuery({ name: 'fechaDesde', required: false, example: '2026-01-01' })
  @ApiQuery({ name: 'fechaHasta', required: false, example: '2026-12-31' })
  @ApiResponse({ status: 200, description: 'Conteos de solicitudes por estado' })
  async solicitudes(
    @Query('fechaDesde') fechaDesde?: string,
    @Query('fechaHasta') fechaHasta?: string,
  ) {
    const qb = this.solicitudRepo.createQueryBuilder('s');

    if (fechaDesde) {
      qb.andWhere('s.createdAt >= :desde', { desde: new Date(`${fechaDesde}T00:00:00Z`) });
    }
    if (fechaHasta) {
      qb.andWhere('s.createdAt <= :hasta', { hasta: new Date(`${fechaHasta}T23:59:59Z`) });
    }

    const total = await qb.clone().getCount();

    const rows = await qb
      .select('s.estado', 'estado')
      .addSelect('COUNT(*)', 'count')
      .groupBy('s.estado')
      .getRawMany<{ estado: string; count: string }>();

    const byEstado: Record<string, number> = Object.fromEntries(
      Object.values(EstadoSolicitud).map((e) => [e, 0]),
    );
    for (const row of rows) {
      byEstado[row.estado] = parseInt(row.count, 10);
    }

    return { total, byEstado, fechaDesde, fechaHasta };
  }

  @Get('permisos')
  @ApiOperation({ summary: 'Reporte agregado de permisos por estado' })
  @ApiQuery({ name: 'fechaDesde', required: false, example: '2026-01-01' })
  @ApiQuery({ name: 'fechaHasta', required: false, example: '2026-12-31' })
  @ApiResponse({ status: 200, description: 'Conteos de permisos por estado' })
  async permisos(
    @Query('fechaDesde') fechaDesde?: string,
    @Query('fechaHasta') fechaHasta?: string,
  ) {
    const qb = this.permisoRepo.createQueryBuilder('p');

    if (fechaDesde) {
      qb.andWhere('p.createdAt >= :desde', { desde: new Date(`${fechaDesde}T00:00:00Z`) });
    }
    if (fechaHasta) {
      qb.andWhere('p.createdAt <= :hasta', { hasta: new Date(`${fechaHasta}T23:59:59Z`) });
    }

    const total = await qb.clone().getCount();

    const rows = await qb
      .select('p.estado', 'estado')
      .addSelect('COUNT(*)', 'count')
      .groupBy('p.estado')
      .getRawMany<{ estado: string; count: string }>();

    const byEstado: Record<string, number> = Object.fromEntries(
      Object.values(EstadoPermiso).map((e) => [e, 0]),
    );
    for (const row of rows) {
      byEstado[row.estado] = parseInt(row.count, 10);
    }

    return { total, byEstado, fechaDesde, fechaHasta };
  }
}
