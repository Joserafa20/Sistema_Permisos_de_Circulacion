'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { IScannerControls } from '@zxing/browser';
import { Camera, CameraOff, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QrScannerProps {
  onScan: (code: string) => void;
  onCancel: () => void;
}

type ScannerState = 'requesting' | 'active' | 'error' | 'no-camera';

export function QrScanner({ onScan, onCancel }: QrScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const [state, setState] = useState<ScannerState>('requesting');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const stopScanner = useCallback(() => {
    controlsRef.current?.stop();
    controlsRef.current = null;
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function startScanner() {
      try {
        const { BrowserQRCodeReader, BrowserCodeReader } = await import('@zxing/browser');

        const devices = await BrowserCodeReader.listVideoInputDevices();
        if (devices.length === 0) {
          if (!cancelled) setState('no-camera');
          return;
        }

        if (!videoRef.current || cancelled) return;

        const reader = new BrowserQRCodeReader();
        const controls = await reader.decodeFromVideoDevice(
          undefined,
          videoRef.current,
          (result, err) => {
            if (result && !cancelled) {
              stopScanner();
              onScan(result.getText());
            }
            if (err && err.name !== 'NotFoundException' && !cancelled) {
              // NotFoundException occurs every frame when no QR is visible — ignore it
            }
          },
        );

        if (cancelled) {
          controls.stop();
        } else {
          controlsRef.current = controls;
          setState('active');
        }
      } catch (err) {
        if (!cancelled) {
          const msg =
            err instanceof Error && err.name === 'NotAllowedError'
              ? 'Permiso de cámara denegado. Permítalo en la configuración del navegador.'
              : 'No fue posible iniciar la cámara. Intente ingresando el código manualmente.';
          setErrorMsg(msg);
          setState('error');
        }
      }
    }

    startScanner();

    return () => {
      cancelled = true;
      stopScanner();
    };
  }, [onScan, stopScanner]);

  function handleCancel() {
    stopScanner();
    onCancel();
  }

  if (state === 'no-camera') {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-neutral-200 bg-neutral-50 p-8 text-center">
        <CameraOff className="h-12 w-12 text-neutral-400" aria-hidden="true" />
        <p className="text-sm text-neutral-600">
          No se detectó cámara disponible en este dispositivo.
        </p>
        <Button variant="outline" onClick={onCancel}>
          Ingresar código manualmente
        </Button>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-danger-200 bg-danger-50 p-6 text-center">
        <AlertCircle className="h-10 w-10 text-danger-500" aria-hidden="true" />
        <p className="text-sm text-danger-700">{errorMsg}</p>
        <Button variant="outline" onClick={onCancel}>
          Ingresar código manualmente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div
        className="relative overflow-hidden rounded-xl border-2 border-primary-400 bg-black"
        role="region"
        aria-label="Visor de cámara para escanear código QR"
      >
        {state === 'requesting' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-10">
            <div className="flex flex-col items-center gap-2 text-white text-sm">
              <Camera className="h-8 w-8 animate-pulse" aria-hidden="true" />
              <span>Iniciando cámara...</span>
            </div>
          </div>
        )}
        {/* Guía de encuadre */}
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="h-48 w-48 border-2 border-white/60 rounded-lg" aria-hidden="true" />
        </div>
        <video
          ref={videoRef}
          className="h-64 w-full object-cover"
          aria-label="Vista de cámara"
          playsInline
          muted
        />
      </div>

      {state === 'active' && (
        <p className="text-xs text-center text-neutral-500" aria-live="polite">
          Centre el código QR dentro del recuadro
        </p>
      )}

      <Button variant="outline" className="w-full gap-2" onClick={handleCancel}>
        <CameraOff className="h-4 w-4" />
        Cancelar escaneo
      </Button>
    </div>
  );
}
