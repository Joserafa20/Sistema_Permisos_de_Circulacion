export default (): Record<string, unknown> => ({
  app: {
    nodeEnv: process.env.NODE_ENV ?? 'development',
    port: parseInt(process.env.PORT ?? '3001', 10),
    frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    publicUrl: process.env.PUBLIC_URL ?? 'http://localhost:3000',
  },
  database: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    schema: process.env.DB_SCHEMA ?? 'public',
  },
  redis: {
    url: process.env.REDIS_URL || undefined,
    host: process.env.REDIS_HOST ?? 'localhost',
    port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
    password: process.env.REDIS_PASSWORD ?? '',
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN ?? '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  },
  storage: {
    endpoint: process.env.STORAGE_ENDPOINT ?? 'localhost',
    port: process.env.STORAGE_PORT ? parseInt(process.env.STORAGE_PORT, 10) : undefined,
    accessKey: process.env.STORAGE_ACCESS_KEY,
    secretKey: process.env.STORAGE_SECRET_KEY,
    region: process.env.STORAGE_REGION ?? 'auto',
    bucketDocs: process.env.STORAGE_BUCKET_DOCS ?? 'pyp-documentos',
    bucketPdfs: process.env.STORAGE_BUCKET_PDFS ?? 'pyp-permisos',
    bucketReports: process.env.STORAGE_BUCKET_REPORTS ?? 'pyp-reportes',
    useSsl: process.env.STORAGE_USE_SSL !== 'false',
  },
  mail: {
    host: process.env.MAIL_HOST,
    port: parseInt(process.env.MAIL_PORT ?? '587', 10),
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
    from: process.env.MAIL_FROM,
  },
  recaptcha: {
    secretKey: process.env.RECAPTCHA_SECRET_KEY,
    minScore: parseFloat(process.env.RECAPTCHA_MIN_SCORE ?? '0.5'),
  },
  qr: {
    secretSalt: process.env.QR_SECRET_SALT,
  },
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS ?? '12', 10),
  },
  seed: {
    ci: {
      nombreAlcaldia: process.env.SEED_CI_NOMBRE_ALCALDIA,
      municipio: process.env.SEED_CI_MUNICIPIO,
      departamento: process.env.SEED_CI_DEPARTAMENTO,
      direccion: process.env.SEED_CI_DIRECCION,
      telefono: process.env.SEED_CI_TELEFONO,
      correo: process.env.SEED_CI_CORREO,
      sitioWeb: process.env.SEED_CI_SITIO_WEB,
      nit: process.env.SEED_CI_NIT,
      codigoDane: process.env.SEED_CI_CODIGO_DANE,
    },
  },
});
