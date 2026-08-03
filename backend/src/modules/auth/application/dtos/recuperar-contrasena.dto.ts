import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class RecuperarContrasenaDto {
  @ApiProperty({ example: 'funcionario@alcaldia.gov.co' })
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  email: string;
}
