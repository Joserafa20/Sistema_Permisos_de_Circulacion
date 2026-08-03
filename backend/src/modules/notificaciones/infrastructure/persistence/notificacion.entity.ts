import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';
import { SolicitudEntity } from '../../../solicitudes/infrastructure/persistence/solicitud.entity';
import { PermisoEntity } from '../../../permisos/infrastructure/persistence/permiso.entity';
import { TipoNotificacion, EstadoEnvioNotificacion } from '../../../../common/enums';

@Entity({ name: 'notificaciones' })
@Index('idx_notificaciones_estado_envio', ['estadoEnvio'])
@Index('idx_notificaciones_solicitud_id', ['solicitud'])
export class NotificacionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'destinatario', type: 'varchar', length: 150 })
  destinatario: string;

  @Column({ name: 'asunto', type: 'varchar', length: 200 })
  asunto: string;

  @Column({ name: 'tipo', type: 'varchar', length: 50 })
  tipo: TipoNotificacion;

  @Column({
    name: 'estado_envio',
    type: 'varchar',
    length: 20,
    default: EstadoEnvioNotificacion.PENDIENTE,
  })
  estadoEnvio: EstadoEnvioNotificacion;

  @Column({ name: 'intentos', type: 'integer', default: 0 })
  intentos: number;

  @Column({ name: 'ultimo_intento', type: 'timestamptz', nullable: true })
  ultimoIntento: Date | null;

  @Column({ name: 'error_detalle', type: 'text', nullable: true })
  errorDetalle: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz', nullable: true })
  updatedAt: Date | null;

  @ManyToOne(() => SolicitudEntity, { nullable: true })
  @JoinColumn({ name: 'solicitud_id' })
  solicitud: Relation<SolicitudEntity> | null;

  @ManyToOne(() => PermisoEntity, { nullable: true })
  @JoinColumn({ name: 'permiso_id' })
  permiso: Relation<PermisoEntity> | null;
}
