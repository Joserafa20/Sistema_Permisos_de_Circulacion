'use client';

/**
 * Variables de entorno tipadas del frontend.
 * Solo se exponen las variables NEXT_PUBLIC_* al navegador.
 * Las variables sin prefijo solo existen en el servidor (SSR / API Routes).
 */
export const env = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  recaptchaSiteKey: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? '',
} as const;
