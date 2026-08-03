import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Matches, MinLength } from 'class-validator';

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
  @IsString()
  @MinLength(10, { message: 'La contraseña debe tener mínimo 10 caracteres' })
  @Matches(/[A-Z]/, { message: 'La contraseña debe contener al menos una mayúscula' })
  @Matches(/[a-z]/, { message: 'La contraseña debe contener al menos una minúscula' })
  @Matches(/[0-9]/, { message: 'La contraseña debe contener al menos un número' })
  @Matches(/[!@#$%^&*]/, {
    message: 'La contraseña debe contener al menos un carácter especial (!@#$%^&*)',
  })
  nuevaContrasena: string;
}
