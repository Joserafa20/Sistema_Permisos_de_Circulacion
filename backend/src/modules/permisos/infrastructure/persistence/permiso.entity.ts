import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';
import { SolicitudEntity } from '../../../solicitudes/infrastructure/persistence/solicitud.entity';
import { UsuarioEntity } from '../../../usuarios/infrastructure/persistence/usuario.entity';
import { EstadoPermiso } from '../../../../common/enums';

@Entity({ name: 'permisos' })
@Index('idx_permisos_estado', ['estado'])
@Index('idx_permisos_fecha_vencimiento', ['fechaVencimiento'])
export class PermisoEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Formato: 2026-PYP-00145. Generado secuencialmente en la capa de aplicación. */
  @Column({ name: 'codigo_permiso', type: 'varchar', length: 20, unique: true })
  codigoPermiso: string;

  /**
   * Identificador opaco: UUID v4 + hash SHA-256 del ID concatenado con salt secreto.
   * Nunca contiene datos personales del ciudadano (ver SECURITY.md y ADR-006).
   */
  @Index('idx_permisos_codigo_qr', { unique: true })
  @Column({ name: 'codigo_qr', type: 'varchar', length: 100, unique: true })
  codigoQr: string;

  /** Ruta interna en MinIO. Nunca se expone en API — solo URLs firmadas. */
  @Column({ name: 'storage_key_pdf', type: 'varchar', length: 500 })
  storageKeyPdf: string;

  @Column({ name: 'fecha_expedicion', type: 'timestamptz' })
  fechaExpedicion: Date;

  @Column({ name: 'fecha_vencimiento', type: 'date' })
  fechaVencimiento: string;

  @Column({
    name: 'estado',
    type: 'enum',
    enum: EstadoPermiso,
    enumName: 'estado_permiso',
    default: EstadoPermiso.VIGENTE,
  })
  estado: EstadoPermiso;

  @Column({ name: 'motivo_revocacion', type: 'text', nullable: true })
  motivoRevocacion: string | null;

  @Column({ name: 'revocado_at', type: 'timestamptz', nullable: true })
  revocadoAt: Date | null;

  /**
   * Snapshot inmutable de datos del ciudadano al momento de la aprobación.
   * Garantiza que el permiso refleje los datos exactos con los que fue generado.
   */
  @Column({ name: 'snapshot_ciudadano', type: 'jsonb' })
  snapshotCiudadano: Record<string, unknown>;

  /** Snapshot inmutable de datos de la motocicleta al momento de la aprobación. */
  @Column({ name: 'snapshot_motocicleta', type: 'jsonb' })
  snapshotMotocicleta: Record<string, unknown>;

  /** Snapshot inmutable del motivo al momento de la aprobación. */
  @Column({ name: 'snapshot_motivo', type: 'jsonb' })
  snapshotMotivo: Record<string, unknown>;

  /** Hash SHA-256 del PDF para verificación de integridad documental. */
  @Column({ name: 'hash_pdf', type: 'varchar', length: 64, nullable: true })
  hashPdf: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz', nullable: true })
  updatedAt: Date | null;

  @OneToOne(() => SolicitudEntity, { nullable: false })
  @JoinColumn({ name: 'solicitud_id' })
  solicitud: Relation<SolicitudEntity>;

  @ManyToOne(() => UsuarioEntity, { nullable: false })
  @JoinColumn({ name: 'funcionario_id' })
  funcionario: Relation<UsuarioEntity>;

  @ManyToOne(() => UsuarioEntity, { nullable: true })
  @JoinColumn({ name: 'revocado_por' })
  revocadoPor: Relation<UsuarioEntity> | null;
}
