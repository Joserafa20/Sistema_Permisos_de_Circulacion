export class MotocicletaDomainEntity {
  id: string;
  placa: string;
  marca: string | null;
  linea: string | null;
  modelo: number | null;
  cilindraje: number | null;
  color: string | null;
  numeroMotor: string | null;
  numeroChasis: string | null;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date | null;
  deletedAt: Date | null;
  ciudadanoId: string;
  ciudadanoNombre: string;
  ciudadanoApellido: string;
  ciudadanoNumeroDocumento: string;
}
