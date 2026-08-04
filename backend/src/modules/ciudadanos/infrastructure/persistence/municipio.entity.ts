import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'municipios' })
export class MunicipioEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'nombre', type: 'varchar', length: 100 })
  nombre: string;

  @Column({ name: 'departamento', type: 'varchar', length: 100 })
  departamento: string;

  @Column({ name: 'codigo_dane', type: 'varchar', length: 10, unique: true })
  codigoDane: string;

  @Column({ name: 'activo', type: 'boolean', default: true })
  activo: boolean;
}
