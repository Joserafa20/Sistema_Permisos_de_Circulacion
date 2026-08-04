import { applyDecorators } from '@nestjs/common';
import { IsString, Matches, MinLength } from 'class-validator';

/**
 * Política RN-51: mínimo 10 chars, mayúscula, minúscula, número y carácter especial.
 * Centraliza la regla para evitar duplicación en cada DTO que gestione contraseñas.
 */
export function IsStrongPassword(): PropertyDecorator {
  return applyDecorators(
    IsString(),
    MinLength(10, { message: 'La contraseña debe tener mínimo 10 caracteres' }),
    Matches(/[A-Z]/, { message: 'La contraseña debe contener al menos una mayúscula' }),
    Matches(/[a-z]/, { message: 'La contraseña debe contener al menos una minúscula' }),
    Matches(/[0-9]/, { message: 'La contraseña debe contener al menos un número' }),
    Matches(/[!@#$%^&*]/, {
      message: 'La contraseña debe contener al menos un carácter especial (!@#$%^&*)',
    }),
  );
}
