'use client';

import { useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import { Upload, X, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatFileSize } from '@/lib/utils';
import { MAX_FILE_SIZE_BYTES } from '@/lib/constants';

interface FileUploaderProps {
  id?: string;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSizeBytes?: number;
  onChange?: (files: File[]) => void;
  error?: string;
  hint?: string;
  disabled?: boolean;
  label?: string;
}

function FileUploader({
  id,
  accept = '.pdf,.jpg,.jpeg,.png',
  multiple = true,
  maxFiles = 5,
  maxSizeBytes = MAX_FILE_SIZE_BYTES,
  onChange,
  error,
  hint,
  disabled = false,
  label = 'Arrastra archivos aquí o haz clic para seleccionar',
}: FileUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const errorId = id && (error || localError) ? `${id}-error` : undefined;
  const hintId = id && hint ? `${id}-hint` : undefined;

  function validateAndAdd(incoming: File[]): void {
    const oversized = incoming.filter((f) => f.size > maxSizeBytes);
    if (oversized.length > 0) {
      setLocalError(`El archivo excede el tamaño máximo de ${formatFileSize(maxSizeBytes)}.`);
      return;
    }
    const next = [...files, ...incoming].slice(0, maxFiles);
    setLocalError(null);
    setFiles(next);
    onChange?.(next);
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>): void {
    if (e.target.files) validateAndAdd(Array.from(e.target.files));
  }

  function handleDrop(e: DragEvent<HTMLDivElement>): void {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) validateAndAdd(Array.from(e.dataTransfer.files));
  }

  function removeFile(index: number): void {
    const next = files.filter((_, i) => i !== index);
    setFiles(next);
    onChange?.(next);
  }

  const displayError = error ?? localError ?? undefined;

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Drop zone */}
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={label}
        aria-describedby={[hintId, errorId].filter(Boolean).join(' ') || undefined}
        aria-disabled={disabled}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click();
        }}
        onClick={() => !disabled && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          !disabled && setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={!disabled ? handleDrop : undefined}
        className={cn(
          'flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-8 transition-colors cursor-pointer',
          dragOver
            ? 'border-primary-500 bg-primary-50'
            : 'border-neutral-300 bg-neutral-50 hover:border-primary-400 hover:bg-primary-50',
          disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
          displayError && 'border-danger-400 bg-danger-50',
        )}
      >
        <Upload className="h-8 w-8 text-neutral-400" aria-hidden="true" />
        <div className="text-center">
          <p className="text-sm text-neutral-600">{label}</p>
          <p className="text-xs text-neutral-400 mt-1">
            {accept.toUpperCase().replace(/\./g, '').replace(/,/g, ', ')} — máx.{' '}
            {formatFileSize(maxSizeBytes)} por archivo
          </p>
        </div>
      </div>

      <input
        ref={inputRef}
        id={id}
        type="file"
        className="sr-only"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        onChange={handleChange}
        tabIndex={-1}
        aria-label={label}
      />

      {/* File list */}
      {files.length > 0 && (
        <ul className="flex flex-col gap-1.5" aria-label="Archivos seleccionados">
          {files.map((file, idx) => (
            <li
              key={`${file.name}-${idx}`}
              className="flex items-center gap-2 rounded-md border border-neutral-200 bg-white px-3 py-2"
            >
              <FileText className="h-4 w-4 text-primary-600 shrink-0" aria-hidden="true" />
              <span className="flex-1 min-w-0 text-sm text-neutral-700 truncate">{file.name}</span>
              <span className="text-xs text-neutral-400 shrink-0">{formatFileSize(file.size)}</span>
              <button
                type="button"
                onClick={() => removeFile(idx)}
                aria-label={`Eliminar ${file.name}`}
                className="shrink-0 p-0.5 rounded text-neutral-400 hover:text-danger-600 focus-visible:ring-2 focus-visible:ring-primary-600"
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {hint && !displayError && (
        <p id={hintId} className="text-xs text-neutral-500">
          {hint}
        </p>
      )}
      {displayError && (
        <p id={errorId} role="alert" className="text-xs text-danger-600 flex items-center gap-1">
          <span aria-hidden="true">⚠</span>
          {displayError}
        </p>
      )}
    </div>
  );
}

export { FileUploader };
