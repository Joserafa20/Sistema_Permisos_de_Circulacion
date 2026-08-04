import { EstadoPermiso } from '../../../../common/enums';

export interface SnapshotCiudadano {
  tipoDocumento: string;
  numeroDocumento: string;
  nombre: string;
  apellido: string;
  celular: string | null;
  email: string | null;
}

export interface SnapshotMotocicleta {
  placa: string;
  marca: string | null;
  linea: string | null;
  modelo: number | null;
  color: string | null;
}

export interface SnapshotMotivo {
  nombre: string;
}

export class PermisoDomainEntity {
  id: string;
  codigoPermiso: string;
  solicitudId: string;
  funcionarioId: string;
  codigoQr: string;
  storageKeyPdf: string;
  fechaExpedicion: Date;
  fechaVencimiento: string;
  estado: EstadoPermiso;
  motivoRevocacion: string | null;
  revocadoAt: Date | null;
  revocadoPorId: string | null;
  snapshotCiudadano: SnapshotCiudadano;
  snapshotMotocicleta: SnapshotMotocicleta;
  snapshotMotivo: SnapshotMotivo;
  condicionesRestricciones: string | null;
  hashPdf: string | null;
  createdAt: Date;
  updatedAt: Date | null;

  // Relaciones cargadas opcionales
  funcionarioNombre?: string;
  funcionarioApellido?: string;
  funcionarioDependencia?: string;
  numeroRadicado?: string;
}
