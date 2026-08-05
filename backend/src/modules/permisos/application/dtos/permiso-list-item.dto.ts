import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EstadoPermiso } from '../../../../common/enums';

export class PermisoCiudadanoResumenDto {
  @ApiProperty() nombre: string;
  @ApiProperty() numeroDocumento: string;
}

export class PermisoMotoResumenDto {
  @ApiProperty() placa: string;
}

export class PermisoFuncionarioResumenDto {
  @ApiProperty() nombre: string;
  @ApiProperty() apellido: string;
}

export class PermisoListItemDto {
  @ApiProperty() id: string;
  @ApiProperty() codigoPermiso: string;
  @ApiProperty({ enum: EstadoPermiso }) estado: EstadoPermiso;
  @ApiProperty() ciudadano: PermisoCiudadanoResumenDto;
  @ApiProperty() motocicleta: PermisoMotoResumenDto;
  @ApiProperty() motivo: string;
  @ApiProperty() fechaExpedicion: string;
  @ApiProperty() fechaVencimiento: string;
  @ApiProperty() funcionario: PermisoFuncionarioResumenDto;
}

export class PaginatedPermisosDto {
  @ApiProperty({ type: [PermisoListItemDto] }) items: PermisoListItemDto[];
  @ApiProperty() total: number;
  @ApiProperty() page: number;
  @ApiProperty() limit: number;
  @ApiProperty() totalPages: number;
  @ApiProperty() hasNext: boolean;
  @ApiProperty() hasPrev: boolean;
}

export class PermisoDetalleSnapshotCiudadanoDto {
  @ApiProperty() tipoDocumento: string;
  @ApiProperty() numeroDocumento: string;
  @ApiProperty() nombre: string;
  @ApiProperty() apellido: string;
  @ApiPropertyOptional({ nullable: true }) celular: string | null;
  @ApiPropertyOptional({ nullable: true }) email: string | null;
}

export class PermisoDetalleSnapshotMotoDto {
  @ApiProperty() placa: string;
  @ApiPropertyOptional({ nullable: true }) marca: string | null;
  @ApiPropertyOptional({ nullable: true }) linea: string | null;
  @ApiPropertyOptional({ nullable: true }) modelo: number | null;
  @ApiPropertyOptional({ nullable: true }) color: string | null;
}

export class PermisoDetalleSnapshotMotivoDto {
  @ApiProperty() nombre: string;
}

export class PermisoDetalleFuncionarioDto {
  @ApiProperty() id: string;
  @ApiProperty() nombre: string;
  @ApiProperty() apellido: string;
  @ApiPropertyOptional({ nullable: true }) dependencia: string | null;
}

export class PermisoDetalleDto {
  @ApiProperty() id: string;
  @ApiProperty() codigoPermiso: string;
  @ApiProperty({ enum: EstadoPermiso }) estado: EstadoPermiso;
  @ApiProperty() snapshotCiudadano: PermisoDetalleSnapshotCiudadanoDto;
  @ApiProperty() snapshotMotocicleta: PermisoDetalleSnapshotMotoDto;
  @ApiProperty() snapshotMotivo: PermisoDetalleSnapshotMotivoDto;
  @ApiProperty() fechaExpedicion: string;
  @ApiProperty() fechaVencimiento: string;
  @ApiProperty() funcionario: PermisoDetalleFuncionarioDto;
  @ApiProperty() solicitudId: string;
  @ApiPropertyOptional({ nullable: true }) numeroRadicado: string | null;
  @ApiPropertyOptional({ nullable: true }) condicionesRestricciones: string | null;
  @ApiPropertyOptional({ nullable: true }) motivoRevocacion: string | null;
  @ApiPropertyOptional({ nullable: true }) revocadoAt: string | null;
  @ApiProperty() createdAt: string;
}

export class PermisoPdfUrlDto {
  @ApiProperty() url: string;
  @ApiProperty() expiraEn: string;
  @ApiProperty() codigoPermiso: string;
  @ApiProperty() nombreArchivo: string;
}

export class PermisoGeneradoDto {
  @ApiProperty() id: string;
  @ApiProperty() codigoPermiso: string;
  @ApiProperty({ enum: EstadoPermiso }) estado: EstadoPermiso;
  @ApiProperty() fechaVencimiento: string;
  @ApiProperty() mensaje: string;
}
