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
import { UsuarioEntity } from '../../../usuarios/infrastructure/persistence/usuario.entity';

@Entity({ name: 'dependencias' })
export class DependenciaEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'nombre', type: 'varchar', length: 100 })
  nombre: string;

  @Column({ name: 'codigo', type: 'varchar', length: 20, unique: true })
  codigo: string;

  @Column({ name: 'descripcion', type: 'text', nullable: true })
  descripcion: string | null;

  @Column({ name: 'activo', type: 'boolean', default: true })
  activo: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz', nullable: true })
  updatedAt: Date | null;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date | null;

  @ManyToOne(() => UsuarioEntity, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  @Index('idx_dependencias_created_by')
  createdBy: Relation<UsuarioEntity> | null;

  @ManyToOne(() => UsuarioEntity, { nullable: true })
  @JoinColumn({ name: 'updated_by' })
  updatedBy: Relation<UsuarioEntity> | null;
}
