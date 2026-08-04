import { Controller, Get, Param, Req } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { Throttle } from '@nestjs/throttler';
import { Public } from '../../../../common/decorators/public.decorator';
import { VerificarQrUseCase } from '../../application/use-cases/verificar-qr.use-case';
import { VerificarQrResponseDto } from '../../application/dtos/verificar-qr-response.dto';

/**
 * Endpoints públicos del módulo de permisos (sin autenticación).
 * Rate limiting específico según API_FUNCIONAL §5 / RN-54.
 */
@ApiTags('public / verificar QR')
@Public()
@Controller('public/verificar')
export class PermisosPublicController {
  constructor(private readonly verificarQrUseCase: VerificarQrUseCase) {}

  @Get(':codigoQR')
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @ApiOperation({
    summary: 'Verificar autenticidad de un permiso mediante su código QR',
    description:
      'Endpoint público optimizado para móvil. ' +
      'Siempre retorna HTTP 200 — el resultado se comunica en data.resultado (RN-34). ' +
      'Cada escaneo se registra en qr_validaciones (RN-35). ' +
      'Rate limit: 30 consultas/min por IP.',
  })
  @ApiParam({ name: 'codigoQR', description: 'Identificador opaco del QR (SHA256 hex)' })
  @ApiResponse({
    status: 200,
    description: 'Siempre 200. data.resultado: vigente | vencido | revocado | no_encontrado',
    type: VerificarQrResponseDto,
  })
  verificar(
    @Param('codigoQR') codigoQr: string,
    @Req() req: Request,
  ): Promise<VerificarQrResponseDto> {
    const ipAddress = (req.ip ?? req.socket?.remoteAddress ?? null) as string | null;
    const userAgent = req.headers['user-agent'] ?? null;
    return this.verificarQrUseCase.ejecutar(codigoQr, ipAddress, userAgent as string | null);
  }
}
