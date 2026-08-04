import { z } from 'zod';

export const verificarCodigoSchema = z.object({
  codigo: z.string().min(6, 'Ingrese el código del permiso').max(128, 'Código demasiado largo'),
});

export type VerificarCodigoValues = z.infer<typeof verificarCodigoSchema>;
