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
import { CiudadanoEntity } from './ciudadano.entity';

@Entity({ name: 'motocicletas' })
@Index('idx_motocicletas_placa', ['placa'])
@Index('idx_motocicletas_ciudadano_id', ['ciudadano'])
export class MotocicletaEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Formato colombiano: AAA000 o AAA00A. Validado en la capa de aplicación. */
  @Column({ name: 'placa', type: 'varchar', length: 10 })
  placa: string;

  @Column({ name: 'marca', type: 'varchar', length: 50, nullable: true })
  marca: string | null;

  @Column({ name: 'linea', type: 'varchar', length: 50, nullable: true })
  linea: string | null;

  @Column({ name: 'modelo', type: 'integer', nullable: true })
  modelo: number | null;

  @Column({ name: 'cilindraje', type: 'integer', nullable: true })
  cilindraje: number | null;

  @Column({ name: 'color', type: 'varchar', length: 50, nullable: true })
  color: string | null;

  @Column({ name: 'numero_motor', type: 'varchar', length: 50, nullable: true })
  numeroMotor: string | null;

  @Column({ name: 'numero_chasis', type: 'varchar', length: 50, nullable: true })
  numeroChasis: string | null;

  @Column({ name: 'activo', type: 'boolean', default: true })
  activo: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz', nullable: true })
  updatedAt: Date | null;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date | null;

  @ManyToOne(() => CiudadanoEntity, (ciudadano) => ciudadano.motocicletas, { nullable: false })
  @JoinColumn({ name: 'ciudadano_id' })
  ciudadano: Relation<CiudadanoEntity>;
}
