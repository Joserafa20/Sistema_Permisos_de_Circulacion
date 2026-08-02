import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';
import { MunicipioEntity } from './municipio.entity';
import { MotocicletaEntity } from './motocicleta.entity';
import { TipoDocumentoIdentidad } from '../../../../common/enums';

/**
 * Resolución M-04: los datos del ciudadano se almacenan en tabla separada `ciudadanos`
 * con FK en `solicitudes`. Un ciudadano puede tener múltiples motos y solicitudes.
 */
@Entity({ name: 'ciudadanos' })
@Index('idx_ciudadanos_numero_doc', ['numeroDocumento'])
@Index('idx_ciudadanos_email', ['email'])
export class CiudadanoEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tipo_documento', type: 'varchar', length: 20 })
  tipoDocumento: TipoDocumentoIdentidad;

  @Column({ name: 'numero_documento', type: 'varchar', length: 20, unique: true })
  numeroDocumento: string;

  @Column({ name: 'nombre', type: 'varchar', length: 100 })
  nombre: string;

  @Column({ name: 'apellido', type: 'varchar', length: 100 })
  apellido: string;

  @Column({ name: 'fecha_nacimiento', type: 'date', nullable: true })
  fechaNacimiento: string | null;

  @Column({ name: 'direccion', type: 'varchar', length: 200, nullable: true })
  direccion: string | null;

  @Column({ name: 'barrio', type: 'varchar', length: 100, nullable: true })
  barrio: string | null;

  @Column({ name: 'celular', type: 'varchar', length: 20, nullable: true })
  celular: string | null;

  @Column({ name: 'email', type: 'varchar', length: 150, nullable: true })
  email: string | null;

  /** Consentimiento Ley 1581/2012 — obligatorio para tratar datos personales. */
  @Column({ name: 'acepta_tratamiento_datos', type: 'boolean', default: false })
  aceptaTratamientoDatos: boolean;

  @Column({ name: 'fecha_aceptacion_datos', type: 'timestamptz', nullable: true })
  fechaAceptacionDatos: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz', nullable: true })
  updatedAt: Date | null;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date | null;

  @ManyToOne(() => MunicipioEntity, { nullable: true })
  @JoinColumn({ name: 'municipio_id' })
  municipio: Relation<MunicipioEntity> | null;

  @OneToMany(() => MotocicletaEntity, (moto) => moto.ciudadano)
  motocicletas: Relation<MotocicletaEntity[]>;
}
