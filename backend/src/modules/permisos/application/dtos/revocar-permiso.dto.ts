import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class RevocarPermisoDto {
  @ApiProperty({
    description: 'Motivo de la revocación. Mín. 20 chars, máx. 1000 chars (RN-37).',
    minLength: 20,
    maxLength: 1000,
    example: 'El ciudadano presentó documentos falsos. Se inicia proceso sancionatorio.',
  })
  @IsString()
  @MinLength(20)
  @MaxLength(1000)
  motivoRevocacion: string;
}
