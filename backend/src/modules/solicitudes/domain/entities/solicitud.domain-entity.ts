import { EstadoSolicitud, TipoDocumentoIdentidad } from '../../../../common/enums';
import { HistorialEstadoDomainEntity } from './historial-estado.domain-entity';
import { DocumentoDomainEntity } from './documento.domain-entity';

export class SolicitudDomainEntity {
  id: string;
  numeroRadicado: string;
  estado: EstadoSolicitud;
  fechaInicio: string;
  fechaFin: string;
  descripcionAdicional: string | null;
  declaracionJurada: boolean;
  ipSolicitante: string | null;
  recaptchaScore: number | null;
  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;

  // ─── Ciudadano (aplanado) ──────────────────────────────────────────────────
  ciudadanoId: string;
  ciudadanoTipoDocumento: TipoDocumentoIdentidad;
  ciudadanoNumeroDocumento: string;
  ciudadanoNombre: string;
  ciudadanoApellido: string;
  ciudadanoFechaNacimiento: string | null;
  ciudadanoDireccion: string | null;
  ciudadanoBarrio: string | null;
  ciudadanoMunicipio: string | null; // "Nombre, Departamento"
  ciudadanoCelular: string | null;
  ciudadanoEmail: string | null;

  // ─── Motocicleta (aplanada) ────────────────────────────────────────────────
  motocicletaId: string;
  motocicletaPlaca: string;
  motocicletaMarca: string | null;
  motocicletaLinea: string | null;
  motocicletaModelo: number | null;
  motocicletaCilindraje: number | null;
  motocicletaColor: string | null;
  motocicletaNumeroMotor: string | null;
  motocicletaNumeroChasis: string | null;

  // ─── Motivo (aplanado) ─────────────────────────────────────────────────────
  motivoId: string;
  motivoNombre: string;
  motivoRequiereSoporte: boolean;

  // ─── Relaciones cargadas bajo demanda ─────────────────────────────────────
  historial?: HistorialEstadoDomainEntity[];
  documentos?: DocumentoDomainEntity[];

  /** Computed: tiempo desde creación ("2 horas", "3 días"). Solo en listados. */
  tiempoEspera?: string;
}
