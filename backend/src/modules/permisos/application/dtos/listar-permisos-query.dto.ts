import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { EstadoPermiso } from '../../../../common/enums';

export class ListarPermisosQueryDto {
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

  @ApiPropertyOptional({
    default: 'fechaExpedicion',
    enum: ['fechaExpedicion', 'fechaVencimiento', 'codigoPermiso', 'estado'],
  })
  @IsOptional()
  @IsIn(['fechaExpedicion', 'fechaVencimiento', 'codigoPermiso', 'estado'])
  sortBy: string = 'fechaExpedicion';

  @ApiPropertyOptional({ default: 'DESC', enum: ['ASC', 'DESC'] })
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sortOrder: 'ASC' | 'DESC' = 'DESC';

  @ApiPropertyOptional({ enum: EstadoPermiso })
  @IsOptional()
  @IsEnum(EstadoPermiso)
  estado?: EstadoPermiso;

  @ApiPropertyOptional({ description: 'Fecha expedición desde (YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  fechaInicio?: string;

  @ApiPropertyOptional({ description: 'Fecha expedición hasta (YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  fechaFin?: string;

  @ApiPropertyOptional({ description: 'Búsqueda parcial por placa' })
  @IsOptional()
  @IsString()
  placa?: string;

  @ApiPropertyOptional({ description: 'Búsqueda parcial por número de documento' })
  @IsOptional()
  @IsString()
  documento?: string;
}
