import { ApiProperty } from '@nestjs/swagger';

export class UsuarioAuthDto {
  @ApiProperty() id: string;
  @ApiProperty() nombre: string;
  @ApiProperty() apellido: string;
  @ApiProperty() email: string;
  @ApiProperty() rol: string;
  @ApiProperty({ nullable: true, type: String }) dependencia: string | null;
  @ApiProperty() contrasenaExpirada: boolean;
}

export class AuthResponseDto {
  @ApiProperty() accessToken: string;
  @ApiProperty() refreshToken: string;
  @ApiProperty({ example: 900 }) expiresIn: number;
  @ApiProperty({ type: UsuarioAuthDto }) usuario: UsuarioAuthDto;
}

export class RefreshResponseDto {
  @ApiProperty() accessToken: string;
  @ApiProperty() refreshToken: string;
  @ApiProperty({ example: 900 }) expiresIn: number;
}

export class MfaRequiredResponseDto {
  @ApiProperty({ example: true }) mfaRequired: boolean;
  @ApiProperty({ description: 'Token temporal (5 min) para verificar MFA' })
  mfaPendingToken: string;
}
