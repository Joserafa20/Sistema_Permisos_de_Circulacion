import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

/** Query params para identificar al ciudadano sin login en POST /documentos (API_FUNCIONAL §13). */
export class AdjuntarDocumentoQueryDto {
  @ApiProperty({
    description: 'Número de radicado de la solicitud',
    example: '20260804-PYP-000001',
  })
  @IsString()
  @IsNotEmpty()
  radicado: string;

  @ApiProperty({ description: 'Número de documento del solicitante', example: '12345678' })
  @IsString()
  @IsNotEmpty()
  @Length(4, 20)
  documento: string;
}
