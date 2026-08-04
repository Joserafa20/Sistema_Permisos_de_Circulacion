'use client';

import { useEffect, useRef, useCallback } from 'react';

declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? '';

export function useRecaptchaV3() {
  const loaded = useRef(false);

  useEffect(() => {
    if (!SITE_KEY) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(
          '[reCAPTCHA] NEXT_PUBLIC_RECAPTCHA_SITE_KEY no está configurada. ' +
            'El token de reCAPTCHA será vacío en desarrollo.',
        );
      }
      return;
    }
    if (loaded.current) return;
    loaded.current = true;

    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`;
    script.async = true;
    document.head.appendChild(script);
  }, []);

  const getToken = useCallback(async (action: string): Promise<string> => {
    if (!SITE_KEY) return '';
    return new Promise<string>((resolve) => {
      window.grecaptcha?.ready(async () => {
        try {
          const token = await window.grecaptcha!.execute(SITE_KEY, { action });
          resolve(token);
        } catch {
          resolve('');
        }
      });
    });
  }, []);

  return { getToken, configured: Boolean(SITE_KEY) };
}
