import { z } from 'zod';

export const estadoConsultaSchema = z.object({
  radicado: z
    .string()
    .min(1, 'Ingrese el número de radicado')
    .regex(/^\d{8}-PYP-\d{6}$/, 'Formato: 20260802-PYP-000145'),
  documento: z
    .string()
    .min(4, 'Mínimo 4 dígitos')
    .max(20, 'Máximo 20 dígitos')
    .regex(/^\d+$/, 'Solo números'),
});

export type EstadoConsultaValues = z.infer<typeof estadoConsultaSchema>;
