export class UsuarioDomainEntity {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  activo: boolean;
  ultimoLogin: Date | null;
  createdAt: Date;
  rolId: string;
  rolNombre: string;
  dependenciaId: string | null;
  dependenciaNombre: string | null;
  // Campos adicionales presentes en la vista de detalle
  intentosFallidos: number;
  contrasenaExpiraAt: string | null;
  updatedAt: Date | null;
}
