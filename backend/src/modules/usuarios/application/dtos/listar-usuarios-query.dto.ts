import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Max,
  Min,
} from 'class-validator';

const SORT_FIELDS = ['nombre', 'apellido', 'email', 'createdAt', 'ultimoLogin'] as const;

export class ListarUsuariosQueryDto {
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

  @ApiPropertyOptional({ description: 'UUID del rol para filtrar' })
  @IsOptional()
  @IsUUID()
  rolId?: string;

  @ApiPropertyOptional({ description: 'UUID de la dependencia para filtrar' })
  @IsOptional()
  @IsUUID()
  dependenciaId?: string;

  @ApiPropertyOptional({ description: 'Filtrar por estado activo/inactivo' })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  activo?: boolean;

  @ApiPropertyOptional({ description: 'Búsqueda en nombre, apellido o email', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  busqueda?: string;
}
