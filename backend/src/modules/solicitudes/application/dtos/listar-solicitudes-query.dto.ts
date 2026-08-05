import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { EstadoSolicitud } from '../../../../common/enums';

export class ListarSolicitudesQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;

  @ApiPropertyOptional({ default: 'createdAt', description: 'Campo de ordenamiento' })
  @IsOptional()
  @IsString()
  sortBy: string = 'createdAt';

  @ApiPropertyOptional({ enum: ['ASC', 'DESC'], default: 'ASC' })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder: 'ASC' | 'DESC' = 'ASC';

  /** Estados separados por coma. Default: recibida,en_revision,pendiente_correccion */
  @ApiPropertyOptional({
    description: 'Estados separados por coma. Ej: recibida,en_revision',
    enum: EstadoSolicitud,
    isArray: true,
  })
  @IsOptional()
  @Transform(({ value }: { value: string }) =>
    typeof value === 'string' ? value.split(',').map((s) => s.trim()) : value,
  )
  @IsEnum(EstadoSolicitud, { each: true })
  estado?: EstadoSolicitud[];

  /** Filtrar por fecha_inicio >= este valor (YYYY-MM-DD) */
  @ApiPropertyOptional({
    description: 'Filtrar solicitudes con fechaInicio >= este valor (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsString()
  fechaInicio?: string;

  /** Filtrar por fecha_inicio <= este valor (YYYY-MM-DD) */
  @ApiPropertyOptional({
    description: 'Filtrar solicitudes con fechaInicio <= este valor (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsString()
  fechaFin?: string;

  /** Búsqueda parcial sobre ciudadano.numero_documento */
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  documento?: string;

  /** Búsqueda parcial sobre motocicleta.placa (se normaliza a UPPER) */
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  placa?: string;

  /** Búsqueda parcial sobre numero_radicado */
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  radicado?: string;

  @ApiPropertyOptional({ description: 'UUID del motivo' })
  @IsOptional()
  @IsUUID()
  motivoId?: string;
}
