import { z } from 'zod';

export const rechazarSchema = z.object({
  motivo: z
    .string()
    .min(20, 'El motivo debe tener al menos 20 caracteres')
    .max(1000, 'El motivo no puede superar 1000 caracteres'),
});
export type RechazarFormValues = z.infer<typeof rechazarSchema>;

const campoCorreccionSchema = z.object({
  campo: z.string().min(1).max(100),
  descripcion: z
    .string()
    .min(10, 'La descripción debe tener al menos 10 caracteres')
    .max(500, 'Máximo 500 caracteres'),
});

export const correccionSchema = z.object({
  motivo: z
    .string()
    .min(20, 'El motivo debe tener al menos 20 caracteres')
    .max(500, 'El motivo no puede superar 500 caracteres'),
  camposCorreccion: z
    .array(campoCorreccionSchema)
    .min(1, 'Seleccione al menos un campo a corregir'),
});
export type CorreccionFormValues = z.infer<typeof correccionSchema>;
