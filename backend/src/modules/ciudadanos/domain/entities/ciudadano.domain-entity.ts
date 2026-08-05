import { TipoDocumentoIdentidad } from '../../../../common/enums';

export interface MotocicletaBrief {
  id: string;
  placa: string;
  marca: string | null;
  modelo: number | null;
  activo: boolean;
}

export class CiudadanoDomainEntity {
  id: string;
  tipoDocumento: TipoDocumentoIdentidad;
  numeroDocumento: string;
  nombre: string;
  apellido: string;
  fechaNacimiento: string | null;
  direccion: string | null;
  barrio: string | null;
  celular: string | null;
  email: string | null;
  aceptaTratamientoDatos: boolean;
  fechaAceptacionDatos: Date | null;
  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
  municipioId: string | null;
  municipioNombre: string | null;
  municipioDepartamento: string | null;
  /** Solo presente en el resultado de findById */
  motocicletas?: MotocicletaBrief[];
  /** Solo presente en el resultado de findById */
  totalSolicitudes?: number;
}
