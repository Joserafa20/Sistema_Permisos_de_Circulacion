import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, Matches } from 'class-validator';

export class MfaSetupResponseDto {
  @ApiProperty({ description: 'URI otpauth para generar QR' })
  otpauthUrl: string;

  @ApiProperty({ description: 'Secreto TOTP en base32 (para entrada manual)' })
  secret: string;

  @ApiProperty({ type: [String], description: 'Códigos de recuperación de un solo uso' })
  recoveryCodes: string[];
}

export class MfaVerifyDto {
  @ApiProperty({ description: 'Código TOTP de 6 dígitos' })
  @IsString()
  @Matches(/^\d{6}$/, { message: 'El código TOTP debe tener 6 dígitos' })
  code: string;
}

export class MfaActivateDto {
  @ApiProperty({ description: 'Código TOTP para confirmar la activación' })
  @IsString()
  @Matches(/^\d{6}$/, { message: 'El código TOTP debe tener 6 dígitos' })
  code: string;
}

export class MfaLoginVerifyDto {
  @ApiProperty({ description: 'Token temporal obtenido en el primer paso del login' })
  @IsString()
  @Length(1, 2048)
  mfaPendingToken: string;

  @ApiProperty({ description: 'Código TOTP de 6 dígitos o código de recuperación' })
  @IsString()
  @Length(6, 20)
  code: string;
}

export class MfaRecoveryDto {
  @ApiProperty({ description: 'Código de recuperación de un solo uso' })
  @IsString()
  @Length(8, 40)
  recoveryCode: string;
}
