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
import { PermisoEntity } from './permiso.entity';
import { ResultadoQrValidacion } from '../../../../common/enums';

@Entity({ name: 'qr_validaciones' })
@Index('idx_qr_validaciones_permiso_id', ['permiso', 'createdAt'])
@Index('idx_qr_validaciones_created_at', ['createdAt'])
export class QrValidacionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** El código escaneado tal como llegó — puede no existir en la BD. */
  @Column({ name: 'codigo_qr', type: 'varchar', length: 100 })
  codigoQr: string;

  @Column({ name: 'ip_address', type: 'inet', nullable: true })
  ipAddress: string | null;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent: string | null;

  @Column({ name: 'resultado', type: 'varchar', length: 20 })
  resultado: ResultadoQrValidacion;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  /** NULL cuando el código escaneado no existe en la base de datos. */
  @ManyToOne(() => PermisoEntity, { nullable: true })
  @JoinColumn({ name: 'permiso_id' })
  permiso: Relation<PermisoEntity> | null;
}
