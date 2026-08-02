import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';
import { UsuarioEntity } from '../../../usuarios/infrastructure/persistence/usuario.entity';
import { TipoConfig } from '../../../../common/enums';

@Entity({ name: 'configuracion' })
export class ConfiguracionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'clave', type: 'varchar', length: 100, unique: true })
  clave: string;

  @Column({ name: 'valor', type: 'text', nullable: true })
  valor: string | null;

  @Column({
    name: 'tipo',
    type: 'enum',
    enum: TipoConfig,
    enumName: 'tipo_config',
    default: TipoConfig.TEXTO,
  })
  tipo: TipoConfig;

  @Column({ name: 'descripcion', type: 'text', nullable: true })
  descripcion: string | null;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz', nullable: true })
  updatedAt: Date | null;

  @ManyToOne(() => UsuarioEntity, { nullable: true })
  @JoinColumn({ name: 'updated_by' })
  updatedBy: Relation<UsuarioEntity> | null;
}
