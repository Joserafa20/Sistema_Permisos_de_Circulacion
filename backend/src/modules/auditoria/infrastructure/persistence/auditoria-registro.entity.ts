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
import { UsuarioEntity } from '../../../usuarios/infrastructure/persistence/usuario.entity';
import { AccionAuditoria } from '../../../../common/enums';

/**
 * Tabla de solo inserción (append-only).
 * Ningún proceso puede ejecutar UPDATE o DELETE sobre esta tabla.
 * Retención mínima: 5 años (Ley 1712/2014).
 */
@Entity({ name: 'auditoria' })
@Index('idx_auditoria_created_at', ['createdAt'])
@Index('idx_auditoria_usuario_id', ['usuario'])
@Index('idx_auditoria_accion', ['accion'])
@Index('idx_auditoria_entidad_id', ['entidad', 'entidadId'])
export class AuditoriaRegistroEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'accion',
    type: 'enum',
    enum: AccionAuditoria,
    enumName: 'accion_auditoria',
  })
  accion: AccionAuditoria;

  @Column({ name: 'entidad', type: 'varchar', length: 50, nullable: true })
  entidad: string | null;

  @Column({ name: 'entidad_id', type: 'uuid', nullable: true })
  entidadId: string | null;

  @Column({ name: 'datos_anteriores', type: 'jsonb', nullable: true })
  datosAnteriores: Record<string, unknown> | null;

  @Column({ name: 'datos_nuevos', type: 'jsonb', nullable: true })
  datosNuevos: Record<string, unknown> | null;

  @Column({ name: 'ip_address', type: 'inet', nullable: true })
  ipAddress: string | null;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  /** NULL en acciones públicas del ciudadano (sin autenticación). */
  @ManyToOne(() => UsuarioEntity, { nullable: true })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Relation<UsuarioEntity> | null;
}
