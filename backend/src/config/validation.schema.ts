import * as Joi from 'joi';

/**
 * Schema Joi que valida las variables de entorno al arrancar la aplicación.
 * Si alguna variable requerida falta o tiene un tipo incorrecto,
 * NestJS lanza un error y el proceso no inicia.
 */
export const validationSchema = Joi.object({
  // Aplicación
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(3001),
  FRONTEND_URL: Joi.string().uri().required(),
  PUBLIC_URL: Joi.string().uri().required(),

  // Base de datos
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(5432),
  DB_NAME: Joi.string().required(),
  DB_USER: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_SCHEMA: Joi.string().default('public'),

  // Redis
  REDIS_HOST: Joi.string().required(),
  REDIS_PORT: Joi.number().default(6379),
  REDIS_PASSWORD: Joi.string().allow('').default(''),

  // JWT
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRES_IN: Joi.string().default('15m'),
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),

  // Storage MinIO
  STORAGE_ENDPOINT: Joi.string().required(),
  STORAGE_PORT: Joi.number().default(9000),
  STORAGE_ACCESS_KEY: Joi.string().required(),
  STORAGE_SECRET_KEY: Joi.string().required(),
  STORAGE_BUCKET_DOCS: Joi.string().default('pyp-documentos'),
  STORAGE_BUCKET_PDFS: Joi.string().default('pyp-permisos'),
  STORAGE_BUCKET_REPORTS: Joi.string().default('pyp-reportes'),
  STORAGE_USE_SSL: Joi.boolean().default(false),

  // Email
  MAIL_HOST: Joi.string().required(),
  MAIL_PORT: Joi.number().default(587),
  MAIL_USER: Joi.string().required(),
  MAIL_PASS: Joi.string().allow('').required(),
  MAIL_FROM: Joi.string().required(),

  // reCAPTCHA
  RECAPTCHA_SECRET_KEY: Joi.string().required(),
  RECAPTCHA_MIN_SCORE: Joi.number().min(0).max(1).default(0.5),

  // QR
  QR_SECRET_SALT: Joi.string().min(32).required(),

  // Seguridad
  BCRYPT_ROUNDS: Joi.number().min(10).max(14).default(12),

  // Seed de configuración institucional (opcionales — se usan si la tabla está vacía)
  SEED_CI_NOMBRE_ALCALDIA: Joi.string().optional(),
  SEED_CI_MUNICIPIO: Joi.string().optional(),
  SEED_CI_DEPARTAMENTO: Joi.string().optional(),
  SEED_CI_DIRECCION: Joi.string().optional(),
  SEED_CI_TELEFONO: Joi.string().optional(),
  SEED_CI_CORREO: Joi.string().email().optional(),
  SEED_CI_SITIO_WEB: Joi.string().uri().optional().allow(''),
  SEED_CI_NIT: Joi.string().optional(),
  SEED_CI_CODIGO_DANE: Joi.string().optional(),
});
