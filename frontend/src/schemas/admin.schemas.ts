import { z } from 'zod';

export const configuracionSchema = z.object({
  nombreAlcaldia: z.string().min(5, 'Mínimo 5 caracteres').max(200, 'Máximo 200 caracteres'),
  nit: z.string().max(20, 'Máximo 20 caracteres'),
  codigoDane: z.string().max(10, 'Máximo 10 caracteres').optional().or(z.literal('')),
  departamento: z.string().max(100, 'Máximo 100 caracteres'),
  municipio: z.string().max(100, 'Máximo 100 caracteres'),
  direccion: z.string().max(255, 'Máximo 255 caracteres'),
  telefono: z
    .string()
    .min(7, 'Mínimo 7 caracteres')
    .max(20, 'Máximo 20 caracteres')
    .regex(/^[\d\s\(\)\-\+]{7,20}$/, 'Formato de teléfono inválido'),
  correoInstitucional: z.string().email('Correo inválido').max(150, 'Máximo 150 caracteres'),
  sitioWeb: z
    .string()
    .url('URL inválida')
    .max(255, 'Máximo 255 caracteres')
    .optional()
    .nullable()
    .or(z.literal('')),
});
export type ConfiguracionFormValues = z.infer<typeof configuracionSchema>;

export const crearUsuarioSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio').max(100, 'Máximo 100 caracteres'),
  apellido: z.string().min(1, 'El apellido es obligatorio').max(100, 'Máximo 100 caracteres'),
  email: z.string().email('Correo inválido').min(5).max(150, 'Máximo 150 caracteres'),
  rolId: z.string().uuid('Seleccione un rol válido'),
  dependenciaId: z.string().uuid('Seleccione una dependencia válida').optional().or(z.literal('')),
});
export type CrearUsuarioFormValues = z.infer<typeof crearUsuarioSchema>;

export const actualizarUsuarioSchema = z.object({
  nombre: z.string().min(1, 'Obligatorio').max(100).optional(),
  apellido: z.string().min(1, 'Obligatorio').max(100).optional(),
  email: z.string().email('Correo inválido').max(150).optional(),
  rolId: z.string().uuid('Seleccione un rol válido').optional(),
  dependenciaId: z
    .string()
    .uuid('Seleccione una dependencia válida')
    .nullable()
    .optional()
    .or(z.literal('')),
  desbloquear: z.boolean().optional(),
});
export type ActualizarUsuarioFormValues = z.infer<typeof actualizarUsuarioSchema>;
