import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, MaxLength, Min, MinLength } from 'class-validator';

export class ActualizarMotivoDto {
  @ApiPropertyOptional({ minLength: 3, maxLength: 100 })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  nombre?: string;

  @ApiPropertyOptional({ maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  descripcion?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  requiereSoporte?: boolean;

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  orden?: number;
}
