import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { IsStrongPassword } from '../../../../common/decorators/is-strong-password.decorator';
import { MatchesField } from '../../../../common/decorators/matches-field.decorator';

export class RestablecerContrasenaDto {
  @ApiProperty({ description: 'Token recibido por correo (64 caracteres hex)' })
  @IsString()
  @IsNotEmpty({ message: 'El token es requerido' })
  token: string;

  @ApiProperty({
    description:
      'Nueva contraseña: mínimo 10 caracteres, una mayúscula, una minúscula, un número y un carácter especial (!@#$%^&*)',
    example: 'NuevaContrasena1!',
  })
  @IsStrongPassword()
  nuevaContrasena: string;

  @ApiProperty({
    description: 'Confirmación de la nueva contraseña — debe coincidir exactamente',
    example: 'NuevaContrasena1!',
  })
  @IsString()
  @MatchesField('nuevaContrasena', { message: 'Las contraseñas no coinciden' })
  confirmarContrasena: string;
}
