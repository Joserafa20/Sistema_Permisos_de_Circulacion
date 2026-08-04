import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RolBriefDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  nombre: string;
}

export class DependenciaBriefDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  nombre: string;
}

export class UsuarioListItemDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  nombre: string;

  @ApiProperty()
  apellido: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ type: RolBriefDto })
  rol: RolBriefDto;

  @ApiPropertyOptional({ type: DependenciaBriefDto, nullable: true })
  dependencia: DependenciaBriefDto | null;

  @ApiProperty()
  activo: boolean;

  @ApiPropertyOptional({ nullable: true })
  ultimoLogin: string | null;

  @ApiProperty()
  createdAt: string;
}
