import { ApiProperty } from '@nestjs/swagger';

export class RevocadoPorDto {
  @ApiProperty() nombre: string;
  @ApiProperty() apellido: string;
  @ApiProperty() rol: string;
}

export class RevocarPermisoResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() codigoPermiso: string;
  @ApiProperty() estado: string;
  @ApiProperty() motivoRevocacion: string;
  @ApiProperty() revocadoAt: string;
  @ApiProperty() revocadoPor: RevocadoPorDto;
}
