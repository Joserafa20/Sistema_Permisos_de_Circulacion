import { describe, it, expect } from 'vitest';
import { cn, formatDate, formatDateLong, truncate, formatFileSize } from './utils';

describe('cn', () => {
  it('combina clases simples', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('resuelve conflictos de Tailwind (última clase gana)', () => {
    const result = cn('p-2', 'p-4');
    expect(result).toBe('p-4');
  });

  it('ignora valores falsy', () => {
    expect(cn('foo', undefined, false, null, 'bar')).toBe('foo bar');
  });

  it('acepta objetos con condiciones', () => {
    expect(cn({ active: true, disabled: false })).toBe('active');
  });
});

describe('truncate', () => {
  it('devuelve el texto intacto si es más corto que maxLength', () => {
    expect(truncate('hola', 10)).toBe('hola');
  });

  it('devuelve el texto intacto si tiene exactamente maxLength', () => {
    expect(truncate('hola', 4)).toBe('hola');
  });

  it('trunca y añade "…" cuando supera maxLength', () => {
    const result = truncate('texto muy largo', 8);
    expect(result).toHaveLength(8);
    expect(result.endsWith('…')).toBe(true);
  });

  it('funciona con strings de 1 carácter y maxLength 1', () => {
    expect(truncate('A', 1)).toBe('A');
  });
});

describe('formatFileSize', () => {
  it('muestra "0 B" para 0 bytes', () => {
    expect(formatFileSize(0)).toBe('0 B');
  });

  it('muestra bytes directamente si es menor a 1 KB', () => {
    expect(formatFileSize(512)).toBe('512 B');
  });

  it('muestra KB para valores entre 1 KB y 1 MB', () => {
    expect(formatFileSize(1024)).toBe('1.0 KB');
  });

  it('muestra MB para valores mayores a 1 MB', () => {
    expect(formatFileSize(1_048_576)).toBe('1.0 MB');
  });

  it('redondea con 1 decimal', () => {
    expect(formatFileSize(1536)).toBe('1.5 KB');
  });
});

describe('formatDate', () => {
  it('formatea una fecha ISO válida sin lanzar error', () => {
    // Usamos una fecha fija para que sea determinista independiente de TZ
    const result = formatDate('2026-01-15T00:00:00.000Z');
    expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
  });
});

describe('formatDateLong', () => {
  it('devuelve un string no vacío para una fecha ISO válida', () => {
    const result = formatDateLong('2026-08-04T12:00:00.000Z');
    expect(result.length).toBeGreaterThan(0);
    // Debe contener el año
    expect(result).toContain('2026');
  });
});
