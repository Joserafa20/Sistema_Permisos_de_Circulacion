# Checklist de Pre-Producción — Sistema Pico y Placa

**Versión:** B21  
**Fecha:** 2026-08-04

---

## Infraestructura

- [ ] Servidor Linux (Ubuntu 22.04 LTS recomendado), 4 vCPU, 8 GB RAM mínimo
- [ ] Docker Engine >= 25.x instalado
- [ ] Docker Compose >= 2.x instalado
- [ ] Puertos 80/443 abiertos en firewall
- [ ] Puertos internos (5432, 6379, 9000) cerrados al exterior
- [ ] SSL/TLS configurado (Let's Encrypt o certificado institucional)
- [ ] Dominio DNS apuntando al servidor

## Configuración

- [ ] `.env.production` creado a partir de `.env.production.example`
- [ ] Todos los secretos generados con valores seguros (mínimo 32 bytes)
  - [ ] `JWT_SECRET` (openssl rand -base64 48)
  - [ ] `JWT_REFRESH_SECRET` (openssl rand -base64 48)
  - [ ] `QR_SECRET_SALT` (openssl rand -base64 32)
  - [ ] `POSTGRES_PASSWORD` (contraseña fuerte)
  - [ ] `REDIS_PASSWORD` (contraseña fuerte)
  - [ ] `MINIO_ROOT_PASSWORD` (contraseña fuerte)
- [ ] `BCRYPT_ROUNDS=12` en producción
- [ ] `NODE_ENV=production`
- [ ] `FRONTEND_URL` apunta al dominio real
- [ ] Credenciales SMTP configuradas y probadas

## Base de Datos

- [ ] Migraciones ejecutadas en orden cronológico
  - [ ] `1785628800000-InitialSchema`
  - [ ] `1785628900000-ConfiguracionInstitucional`
  - [ ] `1785984000000-AddCondicionesRestriccionesPermiso`
  - [ ] `1786060800000-AddContextoToNotificaciones`
  - [ ] `1786233600000-AddMfaAndTokenFamilia`
- [ ] Seed de roles ejecutado
- [ ] Usuario ADMINISTRADOR inicial creado
- [ ] Backup inicial verificado

## Seguridad

- [ ] MFA activado para el usuario ADMINISTRADOR
- [ ] Códigos de recuperación MFA guardados en lugar seguro (no en el servidor)
- [ ] Certificado SSL válido (HSTS habilitado en nginx.conf)
- [ ] Headers de seguridad verificados con securityheaders.com
- [ ] CORS configurado con el dominio correcto
- [ ] Rate limiting verificado en endpoints críticos
- [ ] `.env.production` con permisos restrictivos (chmod 600)

## Observabilidad

- [ ] Health check responde OK: `GET /api/v1/health`
- [ ] Métricas Prometheus disponibles: `GET /api/v1/metrics`
- [ ] Logs estructurados en formato JSON en producción
- [ ] Alertas configuradas (Prometheus + Alertmanager recomendado)

## Quality Gates

- [ ] `npm run build` backend sin errores
- [ ] `npm run test:cov` backend ≥ 10% cobertura
- [ ] `npm run build` frontend sin errores
- [ ] Imágenes Docker construidas y testeadas localmente
- [ ] `npm audit --audit-level=high` backend y frontend sin vulnerabilidades críticas

## Post-Deploy

- [ ] Smoke test: login de funcionario exitoso
- [ ] Smoke test: login de ADMINISTRADOR con MFA
- [ ] Smoke test: crear solicitud ciudadana
- [ ] Smoke test: aprobar solicitud
- [ ] Smoke test: verificar QR del permiso
- [ ] Monitorear logs primeros 30 minutos
- [ ] Verificar que los emails llegan correctamente
