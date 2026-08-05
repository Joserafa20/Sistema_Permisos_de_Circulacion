# Auditoría de Seguridad — B21 Enterprise Hardening

**Fecha:** 2026-08-04  
**Versión:** B21  
**Clasificación:** INTERNA

---

## Resumen Ejecutivo

Se realizó una auditoría de seguridad completa del sistema de permisos de circulación. Se identificaron y resolvieron **12 hallazgos críticos/altos** durante el bloque B21.

---

## Hallazgos y Estado

### CRÍTICO — Resuelto

| ID | Hallazgo | Archivo | Estado |
|----|----------|---------|--------|
| SEC-01 | AccionAuditoria frontend con valores incorrectos (uppercase vs lowercase) | `frontend/src/types/admin.ts` | ✅ Corregido |
| SEC-02 | Sin MFA para rol ADMINISTRADOR | `auth.module.ts` | ✅ Implementado TOTP |
| SEC-03 | Sin detección de reutilización de refresh token (token theft) | `refresh-token.use-case.ts` | ✅ Implementado con familia UUID |
| SEC-04 | Sin logout global (todas las sesiones) | `auth.controller.ts` | ✅ POST /auth/logout/all |
| SEC-05 | Sin Correlation ID en logs HTTP | `logging.interceptor.ts` | ✅ X-Correlation-Id + X-Request-Id |
| SEC-06 | Sin headers de seguridad en frontend Next.js | `next.config.js` | ✅ CSP, X-Frame-Options, etc. |

### ALTO — Resuelto

| ID | Hallazgo | Archivo | Estado |
|----|----------|---------|--------|
| SEC-07 | Sin límites de recursos en docker-compose.prod.yml | `docker/docker-compose.prod.yml` | ✅ deploy.resources.limits añadidos |
| SEC-08 | Sin Dependabot para actualizaciones automáticas | `.github/dependabot.yml` | ✅ Configurado para npm + docker + actions |
| SEC-09 | Sin análisis CodeQL en CI | `.github/workflows/codeql.yml` | ✅ Workflow creado |
| SEC-10 | Sin escaneo de contenedores (Trivy) | `.github/workflows/security.yml` | ✅ Trivy + SBOM |
| SEC-11 | Refresh token no propagaba familia en rotación | `login.use-case.ts` | ✅ familia UUID asignada en login |
| SEC-12 | Logging interceptor sin contexto (cid, rid, ua, duración) | `logging.interceptor.ts` | ✅ Enriquecido con todos los campos |

---

## Controles Existentes Verificados

| Control | Ubicación | Estado |
|---------|-----------|--------|
| BCrypt 12 rounds mínimo | `configuration.ts` | ✅ Activo |
| Historial últimas 5 contraseñas | `usuario.entity.ts` | ✅ Activo |
| Brute force 5 intentos → 30 min bloqueo | `local.strategy.ts` | ✅ Activo |
| Refresh token rotation | `refresh-token.use-case.ts` | ✅ Activo |
| JWT access token 15 min | `auth.module.ts` | ✅ Activo |
| Helmet (CSP/HSTS producción) | `main.ts` | ✅ Activo |
| ValidationPipe whitelist | `main.ts` | ✅ Activo |
| ThrottlerGuard global (100 req/min/IP) | `app.module.ts` | ✅ Activo |
| Throttles específicos login/recuperar | `auth.controller.ts` | ✅ Activo |
| CORS origen único | `main.ts` | ✅ Activo |
| Trust proxy configurado | `main.ts` | ✅ Activo |
| Audit log en todas las acciones críticas | `auditoria.service.ts` | ✅ Activo |
| Health checks internos | `health.controller.ts` | ✅ Activo |
| Métricas Prometheus | `metrics.service.ts` | ✅ Activo |
| OpenTelemetry / OTLP | `observability/tracing.ts` | ✅ Activo |
| Multi-stage Docker con usuarios no-root | `Dockerfile` (ambos) | ✅ Activo |
| Credenciales NUNCA en código fuente | `.gitignore` | ✅ Verificado |

---

## MFA — Detalles de Implementación

**Estándar:** RFC 6238 (TOTP)  
**Compatibilidad:** Google Authenticator, Microsoft Authenticator, Authy  
**Alcance:** Solo rol ADMINISTRADOR  
**Flujo:**
1. `POST /auth/login` → si ADMIN con MFA activo → `{ mfaRequired: true, mfaPendingToken }`
2. `POST /auth/mfa/verificar` → con código TOTP o código de recuperación → tokens completos
3. mfaPendingToken tiene TTL 5 minutos

**Endpoints de gestión:**
- `POST /auth/mfa/setup` — genera secreto + QR + códigos de recuperación
- `POST /auth/mfa/activar` — confirma activación con primer TOTP
- `DELETE /auth/mfa` — desactiva (requiere TOTP)
- `POST /auth/mfa/verificar` — paso 2 del login

**Códigos de recuperación:** 10 códigos únicos, almacenados como hashes BCrypt, uso único.

---

## Detección de Robo de Refresh Token

Se implementó el patrón **Refresh Token Rotation con familia UUID**:

1. Cada cadena de refresh tokens comparte un `familia` UUID (asignado en login).
2. Si se detecta un refresh token ya revocado siendo usado → revocar TODOS los tokens de esa familia.
3. Esto invalida todas las sesiones del atacante y del usuario legítimo, forzando re-autenticación.

---

## Próximas Mejoras Recomendadas

1. Cifrado en reposo del `mfa_secret` (AES-256-GCM antes de persistir en DB)
2. Alertas en tiempo real cuando se detecta reutilización de refresh token
3. Dashboard de sesiones activas por usuario
4. Política de contraseñas configurable por rol
5. CORS más restrictivo en producción (lista blanca de orígenes)
