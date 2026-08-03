import { ApiProperty } from '@nestjs/swagger';
import { UsuarioDetalleDto } from './usuario-detalle.dto';

export class UsuarioCreadoDto extends UsuarioDetalleDto {
  @ApiProperty({
    description:
      'Contraseña temporal generada por el sistema. Se muestra solo en esta respuesta y nunca se almacena en texto plano. El usuario deberá cambiarla en el primer inicio de sesión.',
    example: 'Xk7!mNq2Rp',
  })
  contrasenaTemp: string;
}
