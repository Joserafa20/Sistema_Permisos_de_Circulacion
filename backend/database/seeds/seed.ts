/**
 * Seeds iniciales del sistema.
 *
 * Ejecutar con: npm run seed (desde /backend)
 *
 * Idempotente: puede ejecutarse múltiples veces sin duplicar datos.
 * Estrategia: INSERT ... ON CONFLICT (...) DO NOTHING
 *
 * Orden obligatorio:
 *   1. roles
 *   2. municipios
 *   3. dependencias
 *   4. motivos
 *   5. configuracion
 *   6. usuario administrador (requiere rol + dependencia creados)
 */

import 'reflect-metadata';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as bcryptjs from 'bcryptjs';
import { DataSource, QueryRunner } from 'typeorm';

// Carga variables desde backend/.env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// ─────────────────────────────────────────────────────────────────────────────
// DataSource (mismo config que migraciones)
// ─────────────────────────────────────────────────────────────────────────────

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  database: process.env.DB_NAME ?? 'pyp_db',
  username: process.env.DB_USER ?? 'pyp_user',
  password: process.env.DB_PASSWORD ?? '',
  schema: process.env.DB_SCHEMA ?? 'public',
  synchronize: false,
  logging: false,
  entities: [],
  migrations: [],
});

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function env(key: string, fallback: string): string {
  return process.env[key]?.trim() || fallback;
}

function log(msg: string): void {
  process.stdout.write(`  ${msg}\n`);
}

// ─────────────────────────────────────────────────────────────────────────────
// SECCIÓN 1 — Roles
// ─────────────────────────────────────────────────────────────────────────────

async function seedRoles(qr: QueryRunner): Promise<void> {
  log('Roles...');

  const roles = [
    {
      nombre: 'administrador',
      descripcion: 'Control total del sistema: usuarios, configuración, auditoría y permisos.',
    },
    {
      nombre: 'funcionario',
      descripcion: 'Gestión operativa de solicitudes y generación de permisos de circulación.',
    },
  ];

  for (const role of roles) {
    await qr.query(
      `INSERT INTO roles (id, nombre, descripcion, activo, created_at)
       VALUES (gen_random_uuid(), $1, $2, true, NOW())
       ON CONFLICT (nombre) DO NOTHING`,
      [role.nombre, role.descripcion],
    );
  }

  log('  ✓ administrador, funcionario');
}

// ─────────────────────────────────────────────────────────────────────────────
// SECCIÓN 2 — Municipios
// ─────────────────────────────────────────────────────────────────────────────

async function seedMunicipios(qr: QueryRunner): Promise<void> {
  log('Municipios...');

  const nombre = env('SEED_MUNICIPIO_NOMBRE', 'Municipio Sede');
  const departamento = env('SEED_MUNICIPIO_DEPARTAMENTO', 'Departamento');
  const codigoDane = env('SEED_MUNICIPIO_CODIGO_DANE', '00000');

  await qr.query(
    `INSERT INTO municipios (id, nombre, departamento, codigo_dane, activo)
     VALUES (gen_random_uuid(), $1, $2, $3, true)
     ON CONFLICT (codigo_dane) DO NOTHING`,
    [nombre, departamento, codigoDane],
  );

  log(`  ✓ ${nombre} (DANE: ${codigoDane})`);
}

// ─────────────────────────────────────────────────────────────────────────────
// SECCIÓN 3 — Dependencias
// ─────────────────────────────────────────────────────────────────────────────

async function seedDependencias(qr: QueryRunner): Promise<void> {
  log('Dependencias...');

  const dependencias = [
    {
      nombre: env('SEED_DEP_MOVILIDAD_NOMBRE', 'Secretaría de Movilidad'),
      codigo: 'SEC-MOV',
      descripcion:
        'Dependencia responsable de la gestión del tránsito y la movilidad del municipio.',
    },
    {
      nombre: 'Secretaría General',
      codigo: 'SEC-GEN',
      descripcion: 'Dependencia de administración interna y coordinación institucional.',
    },
  ];

  for (const dep of dependencias) {
    await qr.query(
      `INSERT INTO dependencias (id, nombre, codigo, descripcion, activo, created_at)
       VALUES (gen_random_uuid(), $1, $2, $3, true, NOW())
       ON CONFLICT (codigo) DO NOTHING`,
      [dep.nombre, dep.codigo, dep.descripcion],
    );
  }

  log('  ✓ Secretaría de Movilidad, Secretaría General');
}

// ─────────────────────────────────────────────────────────────────────────────
// SECCIÓN 4 — Motivos
// Ref: MODELO_DATOS.md §15 — Seeds de Motivos
// ─────────────────────────────────────────────────────────────────────────────

async function seedMotivos(qr: QueryRunner): Promise<void> {
  log('Motivos...');

  const motivos: Array<{ nombre: string; requiereSoporte: boolean; orden: number }> = [
    { nombre: 'Trabajo', requiereSoporte: true, orden: 1 },
    { nombre: 'Emergencia médica', requiereSoporte: false, orden: 2 },
    { nombre: 'Prestación de servicios', requiereSoporte: true, orden: 3 },
    { nombre: 'Domicilios', requiereSoporte: true, orden: 4 },
    { nombre: 'Contratista', requiereSoporte: true, orden: 5 },
    { nombre: 'Empresa pública', requiereSoporte: true, orden: 6 },
    { nombre: 'Empresa privada', requiereSoporte: true, orden: 7 },
    { nombre: 'Fuerza mayor', requiereSoporte: false, orden: 8 },
    { nombre: 'Otro', requiereSoporte: false, orden: 9 },
  ];

  for (const motivo of motivos) {
    await qr.query(
      `INSERT INTO motivos (id, nombre, requiere_soporte, activo, orden, created_at)
       VALUES (gen_random_uuid(), $1, $2, true, $3, NOW())
       ON CONFLICT (nombre) DO NOTHING`,
      [motivo.nombre, motivo.requiereSoporte, motivo.orden],
    );
  }

  log(`  ✓ ${motivos.map((m) => m.nombre).join(', ')}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// SECCIÓN 5 — Configuración del sistema
// Ref: MODELO_DATOS.md §15 — Seeds de Configuración
// ─────────────────────────────────────────────────────────────────────────────

async function seedConfiguracion(qr: QueryRunner): Promise<void> {
  log('Configuración...');

  const alcaldiaNombre = env('SEED_ALCALDIA_NOMBRE', 'Alcaldía Municipal');
  const municipioNombre = env('SEED_MUNICIPIO_NOMBRE', 'Municipio Sede');

  const params: Array<{ clave: string; valor: string; tipo: string; descripcion: string }> = [
    {
      clave: 'nombre_alcaldia',
      valor: alcaldiaNombre,
      tipo: 'texto',
      descripcion: 'Nombre oficial de la alcaldía. Aparece en el encabezado del PDF del permiso.',
    },
    {
      clave: 'municipio',
      valor: municipioNombre,
      tipo: 'texto',
      descripcion: 'Nombre del municipio sede de la alcaldía.',
    },
    {
      clave: 'logo_url',
      valor: '',
      tipo: 'texto',
      descripcion:
        'URL o ruta del logo institucional. Puede ser una URL pública o clave en storage.',
    },
    {
      clave: 'firma_url',
      valor: '',
      tipo: 'imagen_base64',
      descripcion: 'Firma digital del alcalde o secretario. Imagen en Base64 para el PDF.',
    },
    {
      clave: 'sello_url',
      valor: '',
      tipo: 'imagen_base64',
      descripcion: 'Sello institucional de la alcaldía. Imagen en Base64 para el PDF.',
    },
    {
      clave: 'dias_max_permiso',
      valor: '30',
      tipo: 'numero',
      descripcion: 'Número máximo de días que puede cubrir un permiso de circulación.',
    },
    {
      clave: 'plazo_revision_horas',
      valor: '48',
      tipo: 'numero',
      descripcion: 'Horas máximas para que el funcionario revise una solicitud recibida.',
    },
    {
      clave: 'plazo_correccion_dias',
      valor: '5',
      tipo: 'numero',
      descripcion:
        'Días que tiene el ciudadano para corregir y reenviar una solicitud con observaciones.',
    },
    {
      clave: 'color_institucional',
      valor: '#1a56db',
      tipo: 'texto',
      descripcion: 'Color institucional principal en formato hexadecimal. Usado en el PDF y portal.',
    },
  ];

  for (const param of params) {
    await qr.query(
      `INSERT INTO configuracion (id, clave, valor, tipo, descripcion)
       VALUES (gen_random_uuid(), $1, $2, $3::tipo_config, $4)
       ON CONFLICT (clave) DO NOTHING`,
      [param.clave, param.valor, param.tipo, param.descripcion],
    );
  }

  log(`  ✓ ${params.map((p) => p.clave).join(', ')}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// SECCIÓN 6 — Usuario administrador inicial
// Ref: MODELO_DATOS.md §15 — Seed de Usuario Administrador Inicial
// ─────────────────────────────────────────────────────────────────────────────

async function seedUsuarioAdmin(qr: QueryRunner): Promise<void> {
  log('Usuario administrador...');

  const email = env('SEED_ADMIN_EMAIL', 'admin@alcaldia.gov.co');
  const nombre = env('SEED_ADMIN_NOMBRE', 'Administrador');
  const apellido = env('SEED_ADMIN_APELLIDO', 'Sistema');
  const password = env('SEED_ADMIN_PASSWORD', 'Admin@Temporal2026!');
  const bcryptRounds = parseInt(env('BCRYPT_ROUNDS', '12'), 10);

  // Verificar que el email no existe ya
  const existing = await qr.query(`SELECT id FROM usuarios WHERE email = $1`, [email]);
  if (existing.length > 0) {
    log(`  ⚠ Usuario ${email} ya existe — omitido (DO NOTHING)`);
    return;
  }

  // Obtener ID del rol administrador
  const roles = await qr.query(`SELECT id FROM roles WHERE nombre = 'administrador'`);
  if (roles.length === 0) {
    throw new Error('Rol administrador no encontrado. Verifique que seedRoles se ejecutó.');
  }
  const rolId: string = roles[0].id as string;

  // Obtener ID de la Secretaría de Movilidad
  const deps = await qr.query(`SELECT id FROM dependencias WHERE codigo = 'SEC-MOV'`);
  if (deps.length === 0) {
    throw new Error('Dependencia SEC-MOV no encontrada. Verifique que seedDependencias se ejecutó.');
  }
  const dependenciaId: string = deps[0].id as string;

  // Hashear contraseña con BCrypt (mínimo 12 rounds — ver DATABASE.md)
  const contrasenaHash = await bcryptjs.hash(password, bcryptRounds);

  // contrasena_expira_at = hoy — obliga al admin a cambiar la contraseña en el primer ingreso
  await qr.query(
    `INSERT INTO usuarios (
       id, nombre, apellido, email, contrasena_hash,
       rol_id, dependencia_id, activo,
       intentos_fallidos, historial_contrasenas,
       contrasena_expira_at, created_at
     )
     VALUES (
       gen_random_uuid(), $1, $2, $3, $4,
       $5, $6, true,
       0, '[]',
       CURRENT_DATE, NOW()
     )
     ON CONFLICT (email) DO NOTHING`,
    [nombre, apellido, email, contrasenaHash, rolId, dependenciaId],
  );

  log(`  ✓ ${email} (rol: administrador, dependencia: SEC-MOV)`);
  log(`  ⚠ Contraseña temporal activa. OBLIGATORIO cambiarla en el primer ingreso.`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Orquestador principal
// ─────────────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  process.stdout.write('\n═══════════════════════════════════════════════════\n');
  process.stdout.write('  Seeds — Sistema de Permisos de Circulación (PYP)\n');
  process.stdout.write('═══════════════════════════════════════════════════\n\n');

  await AppDataSource.initialize();
  const qr = AppDataSource.createQueryRunner();

  try {
    await qr.connect();
    await qr.startTransaction();

    await seedRoles(qr);
    await seedMunicipios(qr);
    await seedDependencias(qr);
    await seedMotivos(qr);
    await seedConfiguracion(qr);
    await seedUsuarioAdmin(qr);

    await qr.commitTransaction();

    process.stdout.write('\n✅  Seeds completados exitosamente.\n\n');
  } catch (err) {
    await qr.rollbackTransaction();
    process.stderr.write(`\n❌  Error durante seeds. Rollback aplicado.\n${String(err)}\n\n`);
    process.exit(1);
  } finally {
    await qr.release();
    await AppDataSource.destroy();
  }
}

main().catch((err: unknown) => {
  process.stderr.write(`\n❌  Error inesperado: ${String(err)}\n`);
  process.exit(1);
});
