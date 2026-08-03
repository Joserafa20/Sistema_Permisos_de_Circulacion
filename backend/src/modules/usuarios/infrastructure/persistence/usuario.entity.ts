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
import { RoleEntity } from '../../../roles/infrastructure/persistence/role.entity';
import { DependenciaEntity } from '../../../dependencias/infrastructure/persistence/dependencia.entity';

@Entity({ name: 'usuarios' })
@Index('idx_usuarios_rol_id', ['rol'])
export class UsuarioEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'nombre', type: 'varchar', length: 100 })
  nombre: string;

  @Column({ name: 'apellido', type: 'varchar', length: 100 })
  apellido: string;

  @Column({ name: 'email', type: 'varchar', length: 150, unique: true })
  email: string;

  /** Hash BCrypt con mínimo 12 rounds. Nunca almacenar en texto plano. */
  @Column({ name: 'contrasena_hash', type: 'varchar', length: 255 })
  contrasenaHash: string;

  @Column({ name: 'activo', type: 'boolean', default: true })
  activo: boolean;

  @Column({ name: 'ultimo_login', type: 'timestamptz', nullable: true })
  ultimoLogin: Date | null;

  @Column({ name: 'intentos_fallidos', type: 'integer', default: 0 })
  intentosFallidos: number;

  /** Fecha hasta la que el usuario está bloqueado por intentos fallidos. */
  @Column({ name: 'bloqueado_hasta', type: 'timestamptz', nullable: true })
  bloqueadoHasta: Date | null;

  @Column({ name: 'contrasena_expira_at', type: 'date', nullable: true })
  contrasenaExpiraAt: string | null;

  /**
   * Array JSONB con los últimos 5 hashes de contraseñas anteriores.
   * Resolución M-03: se almacena en la tabla usuarios (no en tabla separada).
   * Impide la reutilización de las últimas 5 contraseñas (ver SECURITY.md).
   */
  @Column({ name: 'historial_contrasenas', type: 'jsonb', default: [] })
  historialContrasenas: string[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz', nullable: true })
  updatedAt: Date | null;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date | null;

  @ManyToOne(() => RoleEntity, { nullable: false, eager: false })
  @JoinColumn({ name: 'rol_id' })
  rol: Relation<RoleEntity>;

  @ManyToOne(() => DependenciaEntity, { nullable: true, eager: false })
  @JoinColumn({ name: 'dependencia_id' })
  dependencia: Relation<DependenciaEntity> | null;

  @ManyToOne(() => UsuarioEntity, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  createdBy: Relation<UsuarioEntity> | null;

  @ManyToOne(() => UsuarioEntity, { nullable: true })
  @JoinColumn({ name: 'updated_by' })
  updatedBy: Relation<UsuarioEntity> | null;
}
