import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { TipoDocumentoIdentidad } from '../../../../common/enums';

const SORT_FIELDS = ['nombre', 'apellido', 'numeroDocumento', 'createdAt'] as const;

export class ListarCiudadanosQueryDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;

  @ApiPropertyOptional({ default: 'apellido', enum: SORT_FIELDS })
  @IsOptional()
  @IsIn(SORT_FIELDS)
  sortBy: string = 'apellido';

  @ApiPropertyOptional({ default: 'ASC', enum: ['ASC', 'DESC'] })
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sortOrder: 'ASC' | 'DESC' = 'ASC';

  @ApiPropertyOptional({
    description: 'Búsqueda en nombre, apellido o número de documento',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  busqueda?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por tipo de documento',
    enum: TipoDocumentoIdentidad,
  })
  @IsOptional()
  @IsEnum(TipoDocumentoIdentidad)
  tipoDocumento?: TipoDocumentoIdentidad;

  @ApiPropertyOptional({ description: 'UUID del municipio para filtrar' })
  @IsOptional()
  @IsUUID()
  municipioId?: string;
}
