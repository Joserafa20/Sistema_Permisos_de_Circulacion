import { z } from 'zod';

/* ── Paso 1 — Datos del ciudadano ─────────────────────── */
export const ciudadanoSchema = z.object({
  nombres: z
    .string()
    .min(2, 'Ingrese al menos 2 caracteres')
    .max(100, 'Máximo 100 caracteres')
    .regex(/^[A-Za-záéíóúÁÉÍÓÚüÜñÑ\s]+$/, 'Solo se permiten letras'),
  apellidos: z
    .string()
    .min(2, 'Ingrese al menos 2 caracteres')
    .max(100, 'Máximo 100 caracteres')
    .regex(/^[A-Za-záéíóúÁÉÍÓÚüÜñÑ\s]+$/, 'Solo se permiten letras'),
  tipoDocumento: z.enum(['CC', 'CE', 'PA', 'TI'], {
    required_error: 'Seleccione el tipo de documento',
  }),
  numeroDocumento: z
    .string()
    .min(4, 'Mínimo 4 caracteres')
    .max(20, 'Máximo 20 caracteres')
    .regex(/^\d+$/, 'Solo números'),
  correoElectronico: z.string().email('Correo electrónico inválido'),
  telefono: z
    .string()
    .regex(/^3\d{9}$/, 'Celular colombiano: debe iniciar en 3 y tener 10 dígitos'),
  direccion: z.string().min(5, 'Ingrese una dirección válida').max(200, 'Máximo 200 caracteres'),
  municipio: z.string().min(2, 'Ingrese el municipio').max(100, 'Máximo 100 caracteres'),
  departamento: z.string().min(2, 'Ingrese el departamento').max(100, 'Máximo 100 caracteres'),
});

/* ── Paso 2 — Motocicleta ─────────────────────────────── */
export const motocicletaSchema = z.object({
  placa: z
    .string()
    .toUpperCase()
    .regex(
      /^[A-Z]{3}\d{2}[A-Z]$/,
      'Placa colombiana: formato ABC12D (3 letras, 2 números, 1 letra)',
    ),
  marca: z.string().min(2, 'Ingrese la marca').max(50, 'Máximo 50 caracteres'),
  modelo: z.string().min(2, 'Ingrese el modelo').max(100, 'Máximo 100 caracteres'),
  anio: z.coerce
    .number({ invalid_type_error: 'Ingrese el año' })
    .min(1990, 'Año mínimo: 1990')
    .max(new Date().getFullYear() + 1, `Año máximo: ${new Date().getFullYear() + 1}`),
  color: z.string().min(2, 'Ingrese el color').max(50, 'Máximo 50 caracteres'),
  cilindraje: z.coerce
    .number({ invalid_type_error: 'Ingrese el cilindraje' })
    .positive('El cilindraje debe ser mayor a 0')
    .max(1500, 'Máximo 1500 cc'),
  tipoServicio: z.enum(['particular', 'publico'], {
    required_error: 'Seleccione el tipo de servicio',
  }),
});

/* ── Paso 3 — Motivo y fechas (base, sin refine cross-field) ── */
export const motivoBaseSchema = z.object({
  motivoId: z.string().min(1, 'Seleccione un motivo'),
  fechaInicio: z
    .string()
    .min(1, 'Seleccione la fecha de inicio')
    .refine((val) => !isNaN(Date.parse(val)), 'Fecha de inicio inválida'),
  fechaFin: z
    .string()
    .min(1, 'Seleccione la fecha fin')
    .refine((val) => !isNaN(Date.parse(val)), 'Fecha fin inválida'),
  justificacion: z.string().max(500, 'Máximo 500 caracteres').optional(),
});

/* ── Paso 5 — Confirmación ────────────────────────────── */
export const confirmacionSchema = z.object({
  declaracionJurada: z
    .boolean()
    .refine((v) => v === true, 'Debe aceptar la declaración jurada para continuar'),
});

/* ── Schema combinado (RHF) — refine cross-field al final ── */
export const solicitudFormSchema = ciudadanoSchema
  .merge(motocicletaSchema)
  .merge(motivoBaseSchema)
  .merge(confirmacionSchema)
  .refine(
    (data) =>
      !data.fechaInicio || !data.fechaFin || new Date(data.fechaFin) >= new Date(data.fechaInicio),
    {
      message: 'La fecha fin debe ser igual o posterior a la fecha de inicio',
      path: ['fechaFin'],
    },
  );

export type SolicitudFormValues = z.infer<typeof solicitudFormSchema>;

/* ── Campos por paso para trigger parcial ─────────────── */
export const PASO_FIELDS: Record<number, Array<keyof SolicitudFormValues>> = {
  1: [
    'nombres',
    'apellidos',
    'tipoDocumento',
    'numeroDocumento',
    'correoElectronico',
    'telefono',
    'direccion',
    'municipio',
    'departamento',
  ],
  2: ['placa', 'marca', 'modelo', 'anio', 'color', 'cilindraje', 'tipoServicio'],
  3: ['motivoId', 'fechaInicio', 'fechaFin'],
  4: [],
  5: ['declaracionJurada'],
};

export const DEFAULT_VALUES: SolicitudFormValues = {
  nombres: '',
  apellidos: '',
  tipoDocumento: 'CC',
  numeroDocumento: '',
  correoElectronico: '',
  telefono: '',
  direccion: '',
  municipio: '',
  departamento: '',
  placa: '',
  marca: '',
  modelo: '',
  anio: new Date().getFullYear(),
  color: '',
  cilindraje: 0,
  tipoServicio: 'particular',
  motivoId: '',
  fechaInicio: '',
  fechaFin: '',
  justificacion: '',
  declaracionJurada: false,
};
