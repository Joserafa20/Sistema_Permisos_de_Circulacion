'use client';

import { useState } from 'react';
import { FileText, Download, Eye, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDocumentoUrl } from '@/hooks/use-documento-url';
import type { DocumentoItem } from '@/types/funcionario';
import { cn } from '@/lib/utils';

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function tipoDocumentoLabel(tipo: string): string {
  const map: Record<string, string> = {
    cedula: 'Cédula',
    tarjeta_propiedad: 'Tarjeta de Propiedad',
    soat: 'SOAT',
    tecnomecanica: 'Revisión Técnico-Mecánica',
    licencia_conduccion: 'Licencia de Conducción',
    otro: 'Otro Documento',
  };
  return map[tipo] ?? tipo;
}

interface Props {
  solicitudId: string;
  documento: DocumentoItem;
}

export function DocumentoViewer({ solicitudId, documento }: Props) {
  const [wantsUrl, setWantsUrl] = useState(false);
  const {
    data: urlData,
    isLoading,
    isError,
  } = useDocumentoUrl(solicitudId, documento.id, wantsUrl);

  const isPdf = documento.mimeType === 'application/pdf';
  const isImage = documento.mimeType.startsWith('image/');

  return (
    <div className="rounded-lg border border-neutral-200 bg-white overflow-hidden">
      {/* Header del documento */}
      <div className="flex items-start gap-3 p-4">
        <div className="h-9 w-9 rounded-md bg-primary-50 flex items-center justify-center shrink-0">
          <FileText className="h-5 w-5 text-primary-500" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-neutral-800 truncate">
            {tipoDocumentoLabel(documento.tipoDocumento)}
          </p>
          <p className="text-xs text-neutral-400 truncate">{documento.nombreOriginal}</p>
          <p className="text-xs text-neutral-300">{formatBytes(documento.tamanoBytes)}</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Preview inline solo para imágenes y PDFs */}
          {(isPdf || isImage) && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs"
              disabled={isLoading}
              onClick={() => setWantsUrl(true)}
              aria-label={`Vista previa de ${documento.nombreOriginal}`}
            >
              {isLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Eye className="h-3.5 w-3.5" />
              )}
              <span className="ml-1">Ver</span>
            </Button>
          )}

          {/* Descarga siempre disponible */}
          {urlData ? (
            <a
              href={urlData.url}
              download={urlData.nombreOriginal}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Descargar ${documento.nombreOriginal}`}
              className="inline-flex items-center gap-1 h-8 px-2.5 rounded-md text-xs font-medium text-primary-600 hover:bg-primary-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
            >
              <Download className="h-3.5 w-3.5" />
              Descargar
            </a>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs"
              disabled={isLoading}
              onClick={() => setWantsUrl(true)}
              aria-label={`Descargar ${documento.nombreOriginal}`}
            >
              {isLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Download className="h-3.5 w-3.5" />
              )}
              <span className="ml-1">Descargar</span>
            </Button>
          )}
        </div>
      </div>

      {/* Error */}
      {isError && (
        <div className="px-4 pb-3 flex items-center gap-2 text-xs text-danger-600">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          No se pudo obtener el enlace. Intente nuevamente.
        </div>
      )}

      {/* Preview inline */}
      {urlData && (
        <div className={cn('border-t border-neutral-100', isPdf ? 'h-80' : '')}>
          {isPdf ? (
            <iframe
              src={urlData.url}
              title={`Vista previa de ${documento.nombreOriginal}`}
              className="w-full h-full"
              aria-label={`Documento ${documento.nombreOriginal}`}
            />
          ) : isImage ? (
            <div className="p-3 flex items-center justify-center bg-neutral-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={urlData.url}
                alt={documento.nombreOriginal}
                className="max-h-64 max-w-full rounded object-contain"
              />
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
