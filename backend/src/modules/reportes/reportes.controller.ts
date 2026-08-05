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

    const total = await qb.getCount();

    const byEstado: Record<string, number> = {};
    for (const estado of Object.values(EstadoSolicitud)) {
      const count = await this.solicitudRepo
        .createQueryBuilder('s')
        .where('s.estado = :estado', { estado })
        .andWhere(fechaDesde ? 's.createdAt >= :desde' : '1=1', {
          desde: fechaDesde ? new Date(`${fechaDesde}T00:00:00Z`) : undefined,
        })
        .andWhere(fechaHasta ? 's.createdAt <= :hasta' : '1=1', {
          hasta: fechaHasta ? new Date(`${fechaHasta}T23:59:59Z`) : undefined,
        })
        .getCount();
      byEstado[estado] = count;
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

    const total = await qb.getCount();

    const byEstado: Record<string, number> = {};
    for (const estado of Object.values(EstadoPermiso)) {
      const count = await this.permisoRepo
        .createQueryBuilder('p')
        .where('p.estado = :estado', { estado })
        .andWhere(fechaDesde ? 'p.createdAt >= :desde' : '1=1', {
          desde: fechaDesde ? new Date(`${fechaDesde}T00:00:00Z`) : undefined,
        })
        .andWhere(fechaHasta ? 'p.createdAt <= :hasta' : '1=1', {
          hasta: fechaHasta ? new Date(`${fechaHasta}T23:59:59Z`) : undefined,
        })
        .getCount();
      byEstado[estado] = count;
    }

    return { total, byEstado, fechaDesde, fechaHasta };
  }
}
