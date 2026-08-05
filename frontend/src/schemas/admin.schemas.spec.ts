import { describe, it, expect } from 'vitest';
import { configuracionSchema, crearUsuarioSchema, actualizarUsuarioSchema } from './admin.schemas';

const VALID_UUID = '123e4567-e89b-12d3-a456-426614174000';

describe('configuracionSchema', () => {
  const base = {
    nombreAlcaldia: 'Alcaldía Municipal de Neiva',
    nit: '800.099.999-9',
    codigoDane: '41001',
    departamento: 'Huila',
    municipio: 'Neiva',
    direccion: 'Calle 10 # 5-20',
    telefono: '6088710000',
    correoInstitucional: 'contacto@alcaldia.gov.co',
    sitioWeb: 'https://www.alcaldia.gov.co',
  };

  it('valida correctamente con todos los campos obligatorios', () => {
    const result = configuracionSchema.safeParse(base);
    expect(result.success).toBe(true);
  });

  it('acepta sitioWeb vacío (campo opcional)', () => {
    const result = configuracionSchema.safeParse({ ...base, sitioWeb: '' });
    expect(result.success).toBe(true);
  });

  it('rechaza nombreAlcaldia menor a 5 caracteres', () => {
    const result = configuracionSchema.safeParse({ ...base, nombreAlcaldia: 'Abc' });
    expect(result.success).toBe(false);
  });

  it('rechaza correoInstitucional con formato inválido', () => {
    const result = configuracionSchema.safeParse({ ...base, correoInstitucional: 'no-es-email' });
    expect(result.success).toBe(false);
  });

  it('rechaza teléfono con menos de 7 caracteres', () => {
    const result = configuracionSchema.safeParse({ ...base, telefono: '123' });
    expect(result.success).toBe(false);
  });

  it('acepta codigoDane vacío (campo opcional)', () => {
    const result = configuracionSchema.safeParse({ ...base, codigoDane: '' });
    expect(result.success).toBe(true);
  });
});

describe('crearUsuarioSchema', () => {
  const base = {
    nombre: 'Juan',
    apellido: 'García',
    email: 'jgarcia@alcaldia.gov.co',
    rolId: VALID_UUID,
    dependenciaId: '',
  };

  it('valida correctamente con campos obligatorios', () => {
    const result = crearUsuarioSchema.safeParse(base);
    expect(result.success).toBe(true);
  });

  it('rechaza email con formato inválido', () => {
    const result = crearUsuarioSchema.safeParse({ ...base, email: 'no-email' });
    expect(result.success).toBe(false);
  });

  it('rechaza rolId que no sea UUID', () => {
    const result = crearUsuarioSchema.safeParse({ ...base, rolId: 'no-es-uuid' });
    expect(result.success).toBe(false);
  });

  it('rechaza nombre vacío', () => {
    const result = crearUsuarioSchema.safeParse({ ...base, nombre: '' });
    expect(result.success).toBe(false);
  });

  it('acepta dependenciaId vacío (campo opcional)', () => {
    const result = crearUsuarioSchema.safeParse({ ...base, dependenciaId: '' });
    expect(result.success).toBe(true);
  });

  it('acepta dependenciaId como UUID válido', () => {
    const result = crearUsuarioSchema.safeParse({ ...base, dependenciaId: VALID_UUID });
    expect(result.success).toBe(true);
  });
});

describe('actualizarUsuarioSchema', () => {
  it('acepta objeto vacío (todos los campos son opcionales)', () => {
    const result = actualizarUsuarioSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('rechaza email inválido si se proporciona', () => {
    const result = actualizarUsuarioSchema.safeParse({ email: 'mal-email' });
    expect(result.success).toBe(false);
  });

  it('acepta desbloquear:true', () => {
    const result = actualizarUsuarioSchema.safeParse({ desbloquear: true });
    expect(result.success).toBe(true);
  });

  it('acepta rolId UUID válido', () => {
    const result = actualizarUsuarioSchema.safeParse({ rolId: VALID_UUID });
    expect(result.success).toBe(true);
  });
});
