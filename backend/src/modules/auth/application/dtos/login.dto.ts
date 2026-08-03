import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'funcionario@alcaldia.gov.co' })
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  email: string;

  @ApiProperty({ example: 'ContraseñaSegura123!' })
  @IsString()
  @MinLength(1, { message: 'La contraseña es requerida' })
  contrasena: string;
}
