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
import { TipoDocumentoAdjunto } from '../../../../common/enums';
import { SolicitudEntity } from './solicitud.entity';

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
   * Ruta interna en MinIO/S3.
   * NUNCA se expone en API — solo se usa para generar URLs firmadas con TTL 5 min.
   */
  @Column({ name: 'storage_key', type: 'varchar', length: 500 })
  storageKey: string;

  @Column({ name: 'mime_type', type: 'varchar', length: 100 })
  mimeType: string;

  @Column({ name: 'tamano_bytes', type: 'integer' })
  tamanoBytes: number;

  /** Hash SHA-256 del archivo para verificar integridad documental. */
  @Column({ name: 'hash_sha256', type: 'varchar', length: 64 })
  hashSha256: string;

  /** false cuando el ciudadano reemplaza el documento en flujo de corrección. */
  @Column({ name: 'activo', type: 'boolean', default: true })
  activo: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @ManyToOne(() => SolicitudEntity, (s) => s.documentos, { nullable: false })
  @JoinColumn({ name: 'solicitud_id' })
  solicitud: Relation<SolicitudEntity>;
}
