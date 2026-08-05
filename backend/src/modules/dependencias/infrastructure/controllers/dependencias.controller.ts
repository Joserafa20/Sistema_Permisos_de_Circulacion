import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SWAGGER_BEARER_TOKEN } from '../../../../common/constants/swagger.constants';
import { Roles, UserRole } from '../../../../common/decorators/roles.decorator';
import { DependenciaEntity } from '../../infrastructure/persistence/dependencia.entity';
import { CrearDependenciaDto } from '../../application/dtos/crear-dependencia.dto';
import { ActualizarDependenciaDto } from '../../application/dtos/actualizar-dependencia.dto';

@ApiTags('dependencias')
@Controller('dependencias')
@ApiBearerAuth(SWAGGER_BEARER_TOKEN)
export class DependenciasController {
  constructor(
    @InjectRepository(DependenciaEntity)
    private readonly repo: Repository<DependenciaEntity>,
  ) {}

  @Get()
  @Roles(UserRole.FUNCIONARIO, UserRole.ADMINISTRADOR)
  @ApiOperation({ summary: 'Listar todas las dependencias' })
  @ApiResponse({ status: 200, description: 'Lista de dependencias' })
  async listar() {
    const items = await this.repo.find({ order: { nombre: 'ASC' } });
    return { items };
  }

  @Post()
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({ summary: 'Crear nueva dependencia' })
  @ApiResponse({ status: 201, description: 'Dependencia creada' })
  async crear(@Body() dto: CrearDependenciaDto) {
    const entity = this.repo.create({
      nombre: dto.nombre,
      codigo: dto.codigo,
      descripcion: dto.descripcion ?? null,
      activo: true,
    });
    return this.repo.save(entity);
  }

  @Patch(':id')
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({ summary: 'Actualizar dependencia' })
  @ApiResponse({ status: 200, description: 'Dependencia actualizada' })
  @ApiResponse({ status: 404, description: 'Dependencia no encontrada' })
  async actualizar(@Param('id', ParseUUIDPipe) id: string, @Body() dto: ActualizarDependenciaDto) {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`Dependencia ${id} no encontrada`);
    if (dto.nombre !== undefined) entity.nombre = dto.nombre;
    if (dto.descripcion !== undefined) entity.descripcion = dto.descripcion ?? null;
    return this.repo.save(entity);
  }

  @Patch(':id/toggle-activo')
  @Roles(UserRole.ADMINISTRADOR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activar/desactivar dependencia' })
  @ApiResponse({ status: 200, description: 'Estado actualizado' })
  @ApiResponse({ status: 404, description: 'Dependencia no encontrada' })
  async toggleActivo(@Param('id', ParseUUIDPipe) id: string) {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`Dependencia ${id} no encontrada`);
    entity.activo = !entity.activo;
    return this.repo.save(entity);
  }
}
