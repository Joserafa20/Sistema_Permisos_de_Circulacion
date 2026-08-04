export class MotivoDomainEntity {
  id: string;
  nombre: string;
  descripcion: string | null;
  requiereSoporte: boolean;
  activo: boolean;
  orden: number;
  createdAt: Date;
  updatedAt: Date | null;
}
