import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';
import { CiudadanoEntity } from '../../../ciudadanos/infrastructure/persistence/ciudadano.entity';
import { MotocicletaEntity } from '../../../ciudadanos/infrastructure/persistence/motocicleta.entity';
import { MotivoEntity } from '../../../motivos/infrastructure/persistence/motivo.entity';
import { EstadoSolicitud } from '../../../../common/enums';

@Entity({ name: 'solicitudes' })
@Index('idx_solicitudes_estado', ['estado'])
@Index('idx_solicitudes_created_at', ['createdAt'])
@Index('idx_solicitudes_ciudadano_id', ['ciudadano'])
@Index('idx_solicitudes_motocicleta_id', ['motocicleta'])
export class SolicitudEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Formato: 20260802-PYP-001234. Generado en la capa de aplicación. */
  @Column({ name: 'numero_radicado', type: 'varchar', length: 25, unique: true })
  numeroRadicado: string;

  @Column({
    name: 'estado',
    type: 'enum',
    enum: EstadoSolicitud,
    enumName: 'estado_solicitud',
    default: EstadoSolicitud.RECIBIDA,
  })
  estado: EstadoSolicitud;

  @Column({ name: 'fecha_inicio', type: 'date' })
  fechaInicio: string;

  @Column({ name: 'fecha_fin', type: 'date' })
  fechaFin: string;

  @Column({ name: 'descripcion_adicional', type: 'text', nullable: true })
  descripcionAdicional: string | null;

  @Column({ name: 'declaracion_jurada', type: 'boolean', default: false })
  declaracionJurada: boolean;

  @Column({ name: 'ip_solicitante', type: 'inet', nullable: true })
  ipSolicitante: string | null;

  @Column({ name: 'recaptcha_score', type: 'decimal', precision: 3, scale: 2, nullable: true })
  recaptchaScore: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz', nullable: true })
  updatedAt: Date | null;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date | null;

  @ManyToOne(() => CiudadanoEntity, { nullable: false })
  @JoinColumn({ name: 'ciudadano_id' })
  ciudadano: Relation<CiudadanoEntity>;

  @ManyToOne(() => MotocicletaEntity, { nullable: false })
  @JoinColumn({ name: 'motocicleta_id' })
  motocicleta: Relation<MotocicletaEntity>;

  @ManyToOne(() => MotivoEntity, { nullable: false })
  @JoinColumn({ name: 'motivo_id' })
  motivo: Relation<MotivoEntity>;
}
