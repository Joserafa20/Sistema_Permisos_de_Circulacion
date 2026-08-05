import { z } from 'zod';

export const loginSchema = z.object({
  correoElectronico: z
    .string()
    .min(1, 'El correo es obligatorio')
    .email('Ingrese un correo electrónico válido')
    .max(255),
  contrasena: z.string().min(1, 'La contraseña es obligatoria').max(128),
  recordarme: z.boolean().optional(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
