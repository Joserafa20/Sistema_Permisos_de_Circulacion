import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../../../../common/decorators/public.decorator';
import { MotivoBusquedaService } from '../../application/services/motivo-busqueda.service';

@ApiTags('public / motivos')
@Public()
@Controller('public/motivos')
export class MotivosPublicController {
  constructor(private readonly motivoBusquedaService: MotivoBusquedaService) {}

  @Get()
  @ApiOperation({ summary: 'Listar motivos activos (público, sin autenticación)' })
  @ApiResponse({ status: 200, description: 'Lista de motivos activos' })
  async listarActivos() {
    const motivos = await this.motivoBusquedaService.listarActivos();
    return { data: motivos };
  }
}
