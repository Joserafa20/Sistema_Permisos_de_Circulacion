import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID, Matches } from 'class-validator';
import { Type } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';
import { AccionAuditoria } from '../../../../common/enums/accion-auditoria.enum';

export class ListarAuditoriaQueryDto {
  @ApiPropertyOptional({ description: 'Página (desde 1)', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Registros por página', default: 20, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Filtrar por acción', enum: AccionAuditoria })
  @IsOptional()
  @IsEnum(AccionAuditoria)
  accion?: AccionAuditoria;

  @ApiPropertyOptional({ description: 'Filtrar por entidad (ej: solicitudes, permisos)' })
  @IsOptional()
  @IsString()
  entidad?: string;

  @ApiPropertyOptional({ description: 'Filtrar por UUID de usuario' })
  @IsOptional()
  @IsUUID()
  usuarioId?: string;

  @ApiPropertyOptional({ description: 'Fecha desde (ISO 8601, ej: 2026-01-01)' })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'fechaDesde debe tener formato YYYY-MM-DD' })
  fechaDesde?: string;

  @ApiPropertyOptional({ description: 'Fecha hasta (ISO 8601, ej: 2026-12-31)' })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'fechaHasta debe tener formato YYYY-MM-DD' })
  fechaHasta?: string;
}
