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

@Entity({ name: 'configuracion_institucional' })
export class ConfiguracionInstitucionalEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'nombre_alcaldia', type: 'varchar', length: 200 })
  nombreAlcaldia: string;

  @Column({ name: 'nit', type: 'varchar', length: 20 })
  nit: string;

  @Column({ name: 'codigo_dane', type: 'varchar', length: 10 })
  codigoDane: string;

  @Column({ name: 'departamento', type: 'varchar', length: 100 })
  departamento: string;

  @Column({ name: 'municipio', type: 'varchar', length: 100 })
  municipio: string;

  @Column({ name: 'direccion', type: 'varchar', length: 255 })
  direccion: string;

  @Column({ name: 'telefono', type: 'varchar', length: 20 })
  telefono: string;

  @Column({ name: 'correo_institucional', type: 'varchar', length: 150 })
  correoInstitucional: string;

  @Column({ name: 'sitio_web', type: 'varchar', length: 255, nullable: true })
  sitioWeb: string | null;

  /** Ruta MinIO. NUNCA exponer directamente — usar URL firmada TTL 5 min (Fase 4). */
  @Column({ name: 'escudo_storage_key', type: 'varchar', length: 500 })
  escudoStorageKey: string;

  /** Ruta MinIO. NUNCA exponer directamente. */
  @Column({ name: 'logo_storage_key', type: 'varchar', length: 500, nullable: true })
  logoStorageKey: string | null;

  @Column({ name: 'escudo_hash', type: 'varchar', length: 64, nullable: true })
  escudoHash: string | null;

  @Column({ name: 'logo_hash', type: 'varchar', length: 64, nullable: true })
  logoHash: string | null;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz', nullable: true })
  updatedAt: Date | null;

  @ManyToOne(() => UsuarioEntity, { nullable: true, eager: false })
  @JoinColumn({ name: 'updated_by' })
  updatedBy: Relation<UsuarioEntity> | null;
}
