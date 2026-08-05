import { describe, it, expect } from 'vitest';
import { rechazarSchema, correccionSchema } from './solicitudes-acciones.schemas';

describe('rechazarSchema', () => {
  it('valida correctamente un motivo de 20 caracteres (mínimo exacto)', () => {
    const result = rechazarSchema.safeParse({ motivo: 'A'.repeat(20) });
    expect(result.success).toBe(true);
  });

  it('rechaza un motivo de 19 caracteres (por debajo del mínimo)', () => {
    const result = rechazarSchema.safeParse({ motivo: 'A'.repeat(19) });
    expect(result.success).toBe(false);
  });

  it('valida correctamente un motivo de 1000 caracteres (máximo exacto)', () => {
    const result = rechazarSchema.safeParse({ motivo: 'B'.repeat(1000) });
    expect(result.success).toBe(true);
  });

  it('rechaza un motivo de 1001 caracteres (supera el máximo)', () => {
    const result = rechazarSchema.safeParse({ motivo: 'B'.repeat(1001) });
    expect(result.success).toBe(false);
  });

  it('rechaza motivo vacío', () => {
    const result = rechazarSchema.safeParse({ motivo: '' });
    expect(result.success).toBe(false);
  });
});

describe('correccionSchema', () => {
  const validField = { campo: 'documentos', descripcion: 'Falta el SOAT vigente' };

  it('valida correctamente con motivo y al menos un campo', () => {
    const result = correccionSchema.safeParse({
      motivo: 'C'.repeat(20),
      camposCorreccion: [validField],
    });
    expect(result.success).toBe(true);
  });

  it('rechaza camposCorreccion vacío (mínimo 1 campo)', () => {
    const result = correccionSchema.safeParse({
      motivo: 'C'.repeat(20),
      camposCorreccion: [],
    });
    expect(result.success).toBe(false);
  });

  it('rechaza motivo de 19 caracteres en el schema corrección', () => {
    const result = correccionSchema.safeParse({
      motivo: 'D'.repeat(19),
      camposCorreccion: [validField],
    });
    expect(result.success).toBe(false);
  });

  it('rechaza motivo mayor a 500 caracteres', () => {
    const result = correccionSchema.safeParse({
      motivo: 'E'.repeat(501),
      camposCorreccion: [validField],
    });
    expect(result.success).toBe(false);
  });

  it('valida correctamente múltiples campos de corrección', () => {
    const result = correccionSchema.safeParse({
      motivo: 'Motivo suficientemente largo para validar',
      camposCorreccion: [
        { campo: 'documentos', descripcion: 'Falta el SOAT' },
        { campo: 'datos_ciudadano', descripcion: 'Número de documento incorrecto' },
      ],
    });
    expect(result.success).toBe(true);
  });
});
