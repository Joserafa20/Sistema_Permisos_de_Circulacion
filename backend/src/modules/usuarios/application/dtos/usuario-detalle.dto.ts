import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RolBriefDto, DependenciaBriefDto } from './usuario-list-item.dto';

export class UsuarioDetalleDto {
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
  intentosFallidos: number;

  @ApiPropertyOptional({
    nullable: true,
    description: 'Fecha de expiración de contraseña (YYYY-MM-DD)',
  })
  contrasenaExpiraAt: string | null;

  @ApiProperty()
  createdAt: string;

  @ApiPropertyOptional({ nullable: true })
  updatedAt: string | null;
}
