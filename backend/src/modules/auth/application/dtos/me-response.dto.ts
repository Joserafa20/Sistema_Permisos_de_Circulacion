import { ApiProperty } from '@nestjs/swagger';

export class MeResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() nombre: string;
  @ApiProperty() apellido: string;
  @ApiProperty() email: string;
  @ApiProperty() rol: string;
  @ApiProperty({ nullable: true, type: String }) dependencia: string | null;
  @ApiProperty() activo: boolean;
  @ApiProperty({ nullable: true, type: String }) ultimoLogin: Date | null;
}
