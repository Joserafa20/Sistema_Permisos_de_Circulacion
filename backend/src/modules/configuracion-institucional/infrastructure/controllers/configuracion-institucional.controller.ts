import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SWAGGER_BEARER_TOKEN } from '../../../../common/constants/swagger.constants';
import { Public } from '../../../../common/decorators/public.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { Roles, UserRole } from '../../../../common/decorators/roles.decorator';
import { ObtenerConfiguracionInstitucionalUseCase } from '../../application/use-cases/obtener-configuracion-institucional/obtener-configuracion-institucional.use-case';
import { ActualizarConfiguracionInstitucionalUseCase } from '../../application/use-cases/actualizar-configuracion-institucional/actualizar-configuracion-institucional.use-case';
import { ObtenerConfiguracionPublicaUseCase } from '../../application/use-cases/obtener-configuracion-publica/obtener-configuracion-publica.use-case';
import { SubirImagenInstitucionalUseCase } from '../../application/use-cases/subir-imagen-institucional/subir-imagen-institucional.use-case';
import { ActualizarConfiguracionInstitucionalDto } from '../../application/use-cases/actualizar-configuracion-institucional/actualizar-configuracion-institucional.dto';
import { ConfiguracionInstitucionalResponseDto } from '../../application/use-cases/obtener-configuracion-institucional/configuracion-institucional-response.dto';
import { ConfiguracionPublicaResponseDto } from '../../application/use-cases/obtener-configuracion-publica/configuracion-publica-response.dto';
import { AuthUser } from '../../../auth/infrastructure/strategies/jwt.strategy';

@ApiTags('configuracion-institucional')
@Controller('configuracion-institucional')
export class ConfiguracionInstitucionalController {
  constructor(
    private readonly obtenerUseCase: ObtenerConfiguracionInstitucionalUseCase,
    private readonly actualizarUseCase: ActualizarConfiguracionInstitucionalUseCase,
    private readonly subirImagenUseCase: SubirImagenInstitucionalUseCase,
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
    @CurrentUser() user: AuthUser,
  ): Promise<ConfiguracionInstitucionalResponseDto> {
    return this.actualizarUseCase.execute({ ...dto, usuarioId: user.id });
  }

  @Post(':tipo/imagen')
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.ADMINISTRADOR)
  @ApiBearerAuth(SWAGGER_BEARER_TOKEN)
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Subir logo o escudo institucional (tipo: logo | escudo)' })
  @ApiResponse({ status: 200, description: 'Imagen subida correctamente' })
  async subirImagen(
    @Param('tipo') tipo: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: AuthUser,
  ): Promise<{ message: string }> {
    if (tipo !== 'logo' && tipo !== 'escudo') {
      throw new Error('Tipo inválido. Use logo o escudo.');
    }
    await this.subirImagenUseCase.execute(tipo, file, user.id);
    return { message: `${tipo} actualizado correctamente` };
  }

  @Get(':tipo/imagen/url')
  @Roles(UserRole.ADMINISTRADOR, UserRole.FUNCIONARIO)
  @ApiBearerAuth(SWAGGER_BEARER_TOKEN)
  @ApiOperation({ summary: 'Obtener URL firmada (TTL 5 min) para logo o escudo' })
  @ApiResponse({ status: 200, description: 'URL firmada generada' })
  async getImagenUrl(@Param('tipo') tipo: string): Promise<{ url: string | null }> {
    if (tipo !== 'logo' && tipo !== 'escudo') return { url: null };
    const url = await this.subirImagenUseCase.getSignedUrl(tipo);
    return { url };
  }
}

@ApiTags('public')
@Controller('public/configuracion-institucional')
@Public()
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
