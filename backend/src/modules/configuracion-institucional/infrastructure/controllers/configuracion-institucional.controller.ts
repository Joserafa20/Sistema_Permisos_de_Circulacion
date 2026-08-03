import { Body, Controller, Get, HttpCode, HttpStatus, Patch, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { SWAGGER_BEARER_TOKEN } from '../../../../common/constants/swagger.constants';
import { Roles, UserRole } from '../../../../common/decorators/roles.decorator';
import { ObtenerConfiguracionInstitucionalUseCase } from '../../application/use-cases/obtener-configuracion-institucional/obtener-configuracion-institucional.use-case';
import { ActualizarConfiguracionInstitucionalUseCase } from '../../application/use-cases/actualizar-configuracion-institucional/actualizar-configuracion-institucional.use-case';
import { ObtenerConfiguracionPublicaUseCase } from '../../application/use-cases/obtener-configuracion-publica/obtener-configuracion-publica.use-case';
import { ActualizarConfiguracionInstitucionalDto } from '../../application/use-cases/actualizar-configuracion-institucional/actualizar-configuracion-institucional.dto';
import { ConfiguracionInstitucionalResponseDto } from '../../application/use-cases/obtener-configuracion-institucional/configuracion-institucional-response.dto';
import { ConfiguracionPublicaResponseDto } from '../../application/use-cases/obtener-configuracion-publica/configuracion-publica-response.dto';

@ApiTags('configuracion-institucional')
@Controller('configuracion-institucional')
export class ConfiguracionInstitucionalController {
  constructor(
    private readonly obtenerUseCase: ObtenerConfiguracionInstitucionalUseCase,
    private readonly actualizarUseCase: ActualizarConfiguracionInstitucionalUseCase,
  ) {}

  @Get()
  @Roles(UserRole.ADMINISTRADOR, UserRole.FUNCIONARIO)
  @ApiBearerAuth(SWAGGER_BEARER_TOKEN)
  @ApiOperation({
    summary: 'Obtener configuración institucional',
    description:
      'Retorna los datos de identidad de la Alcaldía. Los storage keys de escudo y logo nunca se exponen — se indica únicamente si el archivo está configurado.',
  })
  @ApiResponse({
    status: 200,
    description: 'Configuración institucional obtenida correctamente',
    type: ConfiguracionInstitucionalResponseDto,
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Rol insuficiente' })
  @ApiResponse({ status: 404, description: 'Configuración no encontrada' })
  async obtener(): Promise<ConfiguracionInstitucionalResponseDto> {
    return this.obtenerUseCase.execute();
  }

  @Patch()
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMINISTRADOR)
  @ApiBearerAuth(SWAGGER_BEARER_TOKEN)
  @ApiOperation({
    summary: 'Actualizar configuración institucional',
    description:
      'Actualiza los datos textuales de la configuración institucional. Solo el Administrador puede ejecutar esta acción. Genera registro en auditoría.',
  })
  @ApiResponse({
    status: 200,
    description: 'Configuración actualizada correctamente',
    type: ConfiguracionInstitucionalResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({
    status: 403,
    description: 'Solo el Administrador puede modificar esta configuración',
  })
  @ApiResponse({ status: 404, description: 'Configuración no encontrada' })
  async actualizar(
    @Body() dto: ActualizarConfiguracionInstitucionalDto,
    @Req() req: Request & { user?: { id?: string } },
  ): Promise<ConfiguracionInstitucionalResponseDto> {
    const usuarioId = req.user?.id ?? null;
    return this.actualizarUseCase.execute({ ...dto, usuarioId: usuarioId ?? '' });
  }
}

@ApiTags('public')
@Controller('public/configuracion-institucional')
export class ConfiguracionInstitucionalPublicController {
  constructor(private readonly obtenerPublicaUseCase: ObtenerConfiguracionPublicaUseCase) {}

  @Get()
  @ApiOperation({
    summary: 'Obtener datos públicos de la Alcaldía',
    description:
      'Retorna únicamente la información pública de la Alcaldía necesaria para el portal ciudadano. Sin datos sensibles ni storage keys.',
  })
  @ApiResponse({
    status: 200,
    description: 'Configuración pública obtenida correctamente',
    type: ConfiguracionPublicaResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Configuración no disponible' })
  async obtenerPublica(): Promise<ConfiguracionPublicaResponseDto> {
    return this.obtenerPublicaUseCase.execute();
  }
}
