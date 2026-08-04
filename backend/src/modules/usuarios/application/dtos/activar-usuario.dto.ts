import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class ActivarUsuarioDto {
  @ApiProperty({
    description:
      'Estado de activación del usuario. Al desactivar (false) se revocan todos sus refresh tokens activos.',
    example: false,
  })
  @IsNotEmpty()
  @IsBoolean()
  activo: boolean;
}
