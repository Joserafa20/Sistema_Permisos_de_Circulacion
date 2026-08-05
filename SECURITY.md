# Checklist de Seguridad — Sistema Pico y Placa

## Autenticación y Sesiones

- [x] JWT firmado con HS256, secret >= 32 caracteres (configurable por env)
- [x] Refresh tokens almacenados en hash BCrypt, rotados en cada uso
- [x] Tokens de acceso TTL: 15 min (producción)
- [x] `@Public()` decorador explícito — todo lo demás requiere JWT por defecto
- [x] `POST /auth/login` protegido con `@Throttle` (5 req/min por IP)
- [x] `POST /auth/restablecer-contrasena` protegido con `@Throttle` (10 req/hora por IP)
- [x] Contraseñas hasheadas con BCrypt (saltRounds >= 10)
- [x] Contraseñas y tokens NUNCA aparecen en logs (redact en Pino)

## Autorización

- [x] `RolesGuard` global — `@Roles()` obligatorio en cada endpoint
- [x] Tres roles: `CIUDADANO`, `FUNCIONARIO`, `ADMINISTRADOR`
- [x] Separación de portales: ciudadano vs funcionario/admin

## Datos Sensibles

- [x] `storage_key` NUNCA expuesta en respuestas de API — solo signed URLs con TTL 5 min
- [x] `codigo_qr` y `storage_key_pdf` en `PermisoDetalleDto` excluidos de respuestas públicas
- [x] `DocumentoItemDto` nunca expone `storage_key`
- [x] Emails contienen ÚNICAMENTE enlaces al portal web (RN-78), nunca URLs directas de MinIO
- [x] Templates de email en carpeta física `/templates` — sin HTML embebido en código
- [x] `process.env` NO usado directamente en use-cases — solo `ConfigService`

## Transporte y Headers

- [x] Helmet configurado (CSP, HSTS, X-Frame-Options, etc.)
- [x] CORS restringido a dominios permitidos (configurable por env)
- [x] Compresión habilitada (gzip)
- [x] Rate limiting global: 100 req/min por IP (ThrottlerGuard como APP_GUARD)

## Base de Datos

- [x] Parámetros con `QueryBuilder` o TypeORM ORM (sin SQL raw con interpolación)
- [x] Schema separado por ambiente (`pyp_dev`, `pyp_test`, `pyp_prod`)
- [x] `synchronize: false` en producción — solo migraciones explícitas
- [x] Credenciales de BD únicamente en variables de entorno (nunca en código)

## Auditoría

- [x] Tabla `auditoria_registros` append-only — retención mínima 5 años (Ley 1712/2014)
- [x] `AuditoriaService` registra: acción, entidad, entidadId, usuario, ip
- [x] `GET /auditoria` accesible solo por `ADMINISTRADOR`

## CI/CD

- [x] `npm audit --audit-level=high` en pipeline CI (backend y frontend)
- [x] Secretos de GitHub Actions nunca impresos en logs
- [x] `.env` en `.gitignore` — nunca comprometido en el repositorio
- [x] Imágenes Docker con usuario no-root

## QR y Documentos

- [x] Código QR: UUID v4 + hash SHA-256 con salt secreto (opaco)
- [x] Verificación QR pública (`GET /permisos/verificar/:codigo`) retorna solo datos mínimos
- [x] PDF generado en servidor, descargado via signed URL temporal

## Implementado en B21+

- [x] MFA (TOTP) para administradores (speakeasy, RFC 6238)
- [x] Códigos de recuperación MFA (bcrypt-hashed, single-use)

## Mejoras Futuras (POST-v1.0.0)

- [ ] Rotación automática de JWT secret en producción
- [ ] Integración con WAF (ej. Cloudflare) para DDoS avanzado
- [ ] Escaneo de contenedores Docker (Trivy/Snyk) en CI
- [ ] SAST automático (SonarCloud o CodeQL)
- [ ] Revisión de dependencias con Dependabot
