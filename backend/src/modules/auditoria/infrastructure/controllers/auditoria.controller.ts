import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SWAGGER_BEARER_TOKEN } from '../../../../common/constants/swagger.constants';
import { Roles, UserRole } from '../../../../common/decorators/roles.decorator';
import { AuditoriaService } from '../../application/auditoria.service';
import { ListarAuditoriaQueryDto } from '../../application/dtos/listar-auditoria-query.dto';

@ApiTags('auditoria')
@Controller('auditoria')
@Roles(UserRole.ADMINISTRADOR)
@ApiBearerAuth(SWAGGER_BEARER_TOKEN)
export class AuditoriaController {
  constructor(private readonly auditoriaService: AuditoriaService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar registros de auditoría con filtros y paginación',
    description:
      'Tabla append-only. Solo lectura. Retención mínima 5 años (Ley 1712/2014). ' +
      'Filtros disponibles: accion, entidad, usuarioId, fechaDesde, fechaHasta.',
  })
  @ApiResponse({ status: 200, description: 'Registros de auditoría paginados' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Se requiere rol Administrador' })
  async listar(@Query() query: ListarAuditoriaQueryDto) {
    const { items, total } = await this.auditoriaService.listarPaginado(query);

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const totalPages = Math.ceil(total / limit);

    return {
      items: items.map((r) => ({
        id: r.id,
        accion: r.accion,
        entidad: r.entidad,
        entidadId: r.entidadId,
        usuario: r.usuario
          ? {
              id: r.usuario.id,
              nombre: r.usuario.nombre,
              apellido: r.usuario.apellido,
              correo: r.usuario.email,
            }
          : null,
        ipAddress: r.ipAddress,
        createdAt: r.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }
}
