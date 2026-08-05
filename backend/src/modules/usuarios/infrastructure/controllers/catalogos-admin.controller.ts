import { Controller, Get } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SWAGGER_BEARER_TOKEN } from '../../../../common/constants/swagger.constants';
import { Roles, UserRole } from '../../../../common/decorators/roles.decorator';
import { RoleEntity } from '../../../roles/infrastructure/persistence/role.entity';
import { DependenciaEntity } from '../../../dependencias/infrastructure/persistence/dependencia.entity';

/** Respuesta mínima de rol para poblado de select en UI. */
class RolCatalogoDto {
  id: string;
  nombre: string;
  descripcion: string | null;
}

/** Respuesta mínima de dependencia para poblado de select en UI. */
class DependenciaCatalogoDto {
  id: string;
  nombre: string;
  codigo: string;
}

/**
 * Endpoints de catálogo de solo-lectura que requieren ADMINISTRADOR.
 * Justificación (ADR-022): sin GET /roles y GET /dependencias el formulario
 * de creación de usuarios es inutilizable, ya que CrearUsuarioDto requiere
 * rolId y dependenciaId como UUIDs pero no existía forma de obtenerlos.
 */
@ApiTags('usuarios')
@Controller()
@Roles(UserRole.ADMINISTRADOR)
@ApiBearerAuth(SWAGGER_BEARER_TOKEN)
export class CatalogosAdminController {
  constructor(
    @InjectRepository(RoleEntity)
    private readonly roleRepo: Repository<RoleEntity>,
    @InjectRepository(DependenciaEntity)
    private readonly depRepo: Repository<DependenciaEntity>,
  ) {}

  @Get('roles')
  @ApiOperation({
    summary: 'Listar roles activos del sistema',
    description:
      'Retorna la lista de roles activos para poblar selectores en la UI de administración. Solo el Administrador puede acceder (ADR-022).',
  })
  @ApiResponse({ status: 200, description: 'Roles obtenidos', type: RolCatalogoDto, isArray: true })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Rol insuficiente' })
  async listarRoles(): Promise<RolCatalogoDto[]> {
    const roles = await this.roleRepo.find({
      where: { activo: true },
      order: { nombre: 'ASC' },
    });
    return roles.map((r) => ({ id: r.id, nombre: r.nombre, descripcion: r.descripcion }));
  }

  @Get('dependencias')
  @ApiOperation({
    summary: 'Listar dependencias activas del sistema',
    description:
      'Retorna la lista de dependencias activas para poblar selectores en la UI de administración. Solo el Administrador puede acceder (ADR-022).',
  })
  @ApiResponse({
    status: 200,
    description: 'Dependencias obtenidas',
    type: DependenciaCatalogoDto,
    isArray: true,
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Rol insuficiente' })
  async listarDependencias(): Promise<DependenciaCatalogoDto[]> {
    const deps = await this.depRepo.find({
      where: { activo: true },
      order: { nombre: 'ASC' },
    });
    return deps.map((d) => ({ id: d.id, nombre: d.nombre, codigo: d.codigo }));
  }
}
