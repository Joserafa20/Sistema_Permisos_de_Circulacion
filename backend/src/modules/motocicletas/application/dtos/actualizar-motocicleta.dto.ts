import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, MaxLength, Min, ValidateIf } from 'class-validator';

export class ActualizarMotocicletaDto {
  @ApiPropertyOptional({ nullable: true, maxLength: 50 })
  @IsOptional()
  @ValidateIf((_, v) => v !== null)
  @IsString()
  @MaxLength(50)
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  marca?: string | null;

  @ApiPropertyOptional({ nullable: true, maxLength: 50 })
  @IsOptional()
  @ValidateIf((_, v) => v !== null)
  @IsString()
  @MaxLength(50)
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  linea?: string | null;

  @ApiPropertyOptional({ nullable: true, minimum: 1900, maximum: 2100 })
  @IsOptional()
  @ValidateIf((_, v) => v !== null)
  @IsInt()
  @Min(1900)
  @Max(2100)
  modelo?: number | null;

  @ApiPropertyOptional({ nullable: true, minimum: 1, maximum: 9999 })
  @IsOptional()
  @ValidateIf((_, v) => v !== null)
  @IsInt()
  @Min(1)
  @Max(9999)
  cilindraje?: number | null;

  @ApiPropertyOptional({ nullable: true, maxLength: 50 })
  @IsOptional()
  @ValidateIf((_, v) => v !== null)
  @IsString()
  @MaxLength(50)
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  color?: string | null;

  @ApiPropertyOptional({ nullable: true, maxLength: 50 })
  @IsOptional()
  @ValidateIf((_, v) => v !== null)
  @IsString()
  @MaxLength(50)
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  numeroMotor?: string | null;

  @ApiPropertyOptional({ nullable: true, maxLength: 50 })
  @IsOptional()
  @ValidateIf((_, v) => v !== null)
  @IsString()
  @MaxLength(50)
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  numeroChasis?: string | null;
}
