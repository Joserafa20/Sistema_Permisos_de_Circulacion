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
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SWAGGER_BEARER_TOKEN } from '../../../../common/constants/swagger.constants';
import { Roles, UserRole } from '../../../../common/decorators/roles.decorator';
import { CrearMotivoDto } from '../../application/dtos/crear-motivo.dto';
import { ActualizarMotivoDto } from '../../application/dtos/actualizar-motivo.dto';
import {
  IMotivoRepository,
  MOTIVO_REPOSITORY_TOKEN,
} from '../../domain/ports/motivo-repository.interface';
import { Inject } from '@nestjs/common';

@ApiTags('motivos')
@Controller('motivos')
@ApiBearerAuth(SWAGGER_BEARER_TOKEN)
export class MotivosController {
  constructor(
    @Inject(MOTIVO_REPOSITORY_TOKEN)
    private readonly motivoRepo: IMotivoRepository,
  ) {}

  @Get()
  @Roles(UserRole.FUNCIONARIO, UserRole.ADMINISTRADOR)
  @ApiOperation({ summary: 'Listar todos los motivos (admin ve inactivos también)' })
  @ApiResponse({ status: 200, description: 'Lista de motivos' })
  async listar() {
    const motivos = await this.motivoRepo.findAll();
    return { items: motivos };
  }

  @Post()
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({ summary: 'Crear nuevo motivo de permiso' })
  @ApiResponse({ status: 201, description: 'Motivo creado' })
  async crear(@Body() dto: CrearMotivoDto) {
    const motivo = await this.motivoRepo.create({
      nombre: dto.nombre,
      descripcion: dto.descripcion,
      requiereSoporte: dto.requiereSoporte,
      orden: dto.orden,
    });
    return motivo;
  }

  @Patch(':id')
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({ summary: 'Actualizar motivo existente' })
  @ApiResponse({ status: 200, description: 'Motivo actualizado' })
  @ApiResponse({ status: 404, description: 'Motivo no encontrado' })
  async actualizar(@Param('id', ParseUUIDPipe) id: string, @Body() dto: ActualizarMotivoDto) {
    const motivo = await this.motivoRepo.update(id, {
      nombre: dto.nombre,
      descripcion: dto.descripcion,
      requiereSoporte: dto.requiereSoporte,
      orden: dto.orden,
    });
    if (!motivo) throw new NotFoundException(`Motivo ${id} no encontrado`);
    return motivo;
  }

  @Patch(':id/toggle-activo')
  @Roles(UserRole.ADMINISTRADOR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activar/desactivar motivo' })
  @ApiResponse({ status: 200, description: 'Estado actualizado' })
  @ApiResponse({ status: 404, description: 'Motivo no encontrado' })
  async toggleActivo(@Param('id', ParseUUIDPipe) id: string) {
    const motivo = await this.motivoRepo.toggleActivo(id);
    if (!motivo) throw new NotFoundException(`Motivo ${id} no encontrado`);
    return motivo;
  }
}
