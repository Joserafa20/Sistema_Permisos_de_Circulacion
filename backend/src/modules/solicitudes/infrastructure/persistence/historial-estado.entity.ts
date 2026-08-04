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
import { SolicitudEntity } from './solicitud.entity';
import { UsuarioEntity } from '../../../usuarios/infrastructure/persistence/usuario.entity';
import { EstadoSolicitud } from '../../../../common/enums';

@Entity({ name: 'historial_estados' })
@Index('idx_historial_solicitud_created', ['solicitud', 'createdAt'])
export class HistorialEstadoEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'estado_anterior',
    type: 'enum',
    enum: EstadoSolicitud,
    enumName: 'estado_solicitud',
    nullable: true,
  })
  estadoAnterior: EstadoSolicitud | null;

  @Column({
    name: 'estado_nuevo',
    type: 'enum',
    enum: EstadoSolicitud,
    enumName: 'estado_solicitud',
  })
  estadoNuevo: EstadoSolicitud;

  /** Obligatorio en rechazos y solicitudes de corrección. */
  @Column({ name: 'motivo', type: 'text', nullable: true })
  motivo: string | null;

  /** Campos específicos que el ciudadano debe corregir. */
  @Column({ name: 'campos_correccion', type: 'jsonb', nullable: true })
  camposCorreccion: Record<string, unknown> | null;

  @Column({ name: 'ip_address', type: 'inet', nullable: true })
  ipAddress: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @ManyToOne(() => SolicitudEntity, (s) => s.historial, { nullable: false })
  @JoinColumn({ name: 'solicitud_id' })
  solicitud: Relation<SolicitudEntity>;

  /** NULL cuando el cambio es automático (job programado). */
  @ManyToOne(() => UsuarioEntity, { nullable: true })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Relation<UsuarioEntity> | null;
}
