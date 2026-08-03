import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import { SolicitudEntity } from '../../../solicitudes/infrastructure/persistence/solicitud.entity';
import { TipoDocumentoAdjunto } from '../../../../common/enums';

@Entity({ name: 'documentos' })
@Index('idx_documentos_solicitud_id', ['solicitud'])
export class DocumentoEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'tipo_documento',
    type: 'enum',
    enum: TipoDocumentoAdjunto,
    enumName: 'tipo_documento_adjunto',
  })
  tipoDocumento: TipoDocumentoAdjunto;

  @Column({ name: 'nombre_original', type: 'varchar', length: 255 })
  nombreOriginal: string;

  @Column({ name: 'nombre_almacenado', type: 'varchar', length: 255 })
  nombreAlmacenado: string;

  /**
   * Ruta interna en MinIO/S3. NUNCA se expone en respuestas de API.
   * El acceso se hace exclusivamente mediante URLs firmadas (TTL 5 min).
   */
  @Column({ name: 'storage_key', type: 'varchar', length: 500 })
  storageKey: string;

  @Column({ name: 'mime_type', type: 'varchar', length: 50 })
  mimeType: string;

  @Column({ name: 'tamano_bytes', type: 'integer' })
  tamanoBytes: number;

  /** Hash SHA-256 para verificar integridad del archivo. */
  @Column({ name: 'hash_sha256', type: 'varchar', length: 64 })
  hashSha256: string;

  @Column({ name: 'activo', type: 'boolean', default: true })
  activo: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @ManyToOne(() => SolicitudEntity, { nullable: false })
  @JoinColumn({ name: 'solicitud_id' })
  solicitud: Relation<SolicitudEntity>;
}
