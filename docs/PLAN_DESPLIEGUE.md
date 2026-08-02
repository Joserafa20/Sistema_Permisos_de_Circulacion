# Plan de Despliegue — Sistema de Permisos de Circulación (Pico y Placa)

**Versión:** 1.0  
**Fecha:** 2026-08-02  
**Referencia:** `docs/ANALISIS_TECNICO.md` · `.claude/ARCHITECTURE.md` · `.claude/SECURITY.md`

---

## 1. Arquitectura de Despliegue

### 1.1 Diagrama General

```
Internet
    │
    ▼
[Cloudflare / DNS]
    │ HTTPS 443
    ▼
[Nginx — Reverse Proxy + SSL Termination]
    │                    │
    ▼                    ▼
[Next.js Frontend]   [NestJS Backend :3000]
(Puerto 80 interno)       │
                          ├── [PostgreSQL :5432]
                          ├── [Redis :6379]
                          ├── [MinIO :9000]
                          └── [BullMQ Workers]
```

### 1.2 Componentes por Servicio

| Servicio | Imagen | Puerto Interno | Descripción |
|---------|--------|:--------------:|-------------|
| `nginx` | nginx:alpine | 80, 443 | Reverse proxy, SSL, static files |
| `frontend` | node:20-alpine (Next.js) | 3001 | Portal ciudadano + Panel admin/funcionario |
| `backend` | node:20-alpine (NestJS) | 3000 | API REST |
| `postgres` | postgres:15-alpine | 5432 | Base de datos principal |
| `redis` | redis:7-alpine | 6379 | Caché, sesiones, cola BullMQ |
| `minio` | minio/minio | 9000, 9001 | Almacenamiento de objetos (documentos + PDFs) |
| `worker` | (mismo build que backend) | — | Worker de BullMQ (PDF, correos) |

### 1.3 Ambientes

| Ambiente | Propósito | URL |
|----------|-----------|-----|
| `local` | Desarrollo | `http://localhost:3000` |
| `staging` | QA y pruebas de aceptación | `https://staging.dominio.gov.co` |
| `production` | Producción real | `https://dominio.gov.co` |

---

## 2. Requisitos del Servidor

### 2.1 Servidor de Producción (Recomendado)

| Recurso | Mínimo | Recomendado |
|---------|:------:|:-----------:|
| CPU | 4 vCPU | 8 vCPU |
| RAM | 8 GB | 16 GB |
| Disco (sistema) | 50 GB SSD | 100 GB SSD |
| Disco (datos + storage) | 200 GB | 500 GB |
| Ancho de banda | 100 Mbps | 1 Gbps |
| SO | Ubuntu 22.04 LTS | Ubuntu 22.04 LTS |

### 2.2 Software Requerido en el Host

| Software | Versión Mínima |
|---------|:-------------:|
| Docker Engine | 24.0+ |
| Docker Compose | 2.20+ |
| Certbot (Let's Encrypt) | Último |
| Git | 2.40+ |
| curl, wget | Disponibles |

### 2.3 Puertos que Deben Estar Abiertos en el Firewall

| Puerto | Protocolo | Descripción |
|--------|:---------:|-------------|
| 22 | TCP | SSH (restringir a IPs de administración) |
| 80 | TCP | HTTP (redirige a HTTPS) |
| 443 | TCP | HTTPS (tráfico web) |
| 9001 | TCP | MinIO Console (solo IPs internas) |

---

## 3. Docker — Configuración por Servicio

### 3.1 Estructura de Archivos Docker

```
/docker
  ├── nginx/
  │   ├── nginx.conf           # Configuración del reverse proxy
  │   └── ssl/                 # Certificados SSL (generados por Certbot)
  ├── postgres/
  │   └── init.sql             # Script de inicialización (crea extensiones uuid-ossp)
  └── minio/
      └── entrypoint.sh        # Crea los buckets iniciales
docker-compose.yml              # Desarrollo local
docker-compose.prod.yml         # Producción
```

### 3.2 Imagen de Producción — Backend

El Dockerfile del backend usa **multi-stage build**:

```
Stage 1 (builder):
  - FROM node:20-alpine
  - Instala dependencias de producción y compilación
  - Compila TypeScript a JavaScript (dist/)
  - Genera Swagger JSON

Stage 2 (production):
  - FROM node:20-alpine (imagen limpia)
  - Copia solo dist/ y node_modules de producción
  - Sin herramientas de compilación
  - Usuario no-root (UID 1001)
  - Healthcheck incluido
```

### 3.3 Imagen de Producción — Frontend

```
Stage 1 (builder):
  - FROM node:20-alpine
  - Instala dependencias
  - next build (genera .next/standalone)

Stage 2 (production):
  - FROM node:20-alpine
  - Copia .next/standalone
  - Usuario no-root
  - Expone puerto 3001
```

---

## 4. Docker Compose — Estructura

### 4.1 `docker-compose.yml` (Desarrollo)

Servicios: `postgres`, `redis`, `minio`.  
El backend y el frontend corren localmente con hot-reload (`npm run start:dev`).  
No incluye Nginx ni SSL.  
Red: `pypnet` bridge.

### 4.2 `docker-compose.prod.yml` (Producción)

Servicios completos: `nginx`, `frontend`, `backend`, `worker`, `postgres`, `redis`, `minio`.

**Políticas de restart:** `restart: unless-stopped` en todos los servicios.

**Healthchecks:**
- `postgres`: `pg_isready`
- `redis`: `redis-cli ping`
- `minio`: `curl -f http://localhost:9000/minio/health/live`
- `backend`: `curl -f http://localhost:3000/api/v1/health`
- `frontend`: `curl -f http://localhost:3001/api/health`

**Dependencias con `condition: service_healthy`:**
- `backend` espera a `postgres` y `redis` sanos antes de iniciar.
- `worker` espera a `backend` sano.
- `frontend` espera a `backend` sano.

---

## 5. Variables de Entorno

### 5.1 `.env.example` — Plantilla Completa

```
# ─── APLICACIÓN ───────────────────────────────────────────
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://dominio.gov.co

# ─── BASE DE DATOS ────────────────────────────────────────
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_NAME=pyp_db
DATABASE_USER=pyp_user
DATABASE_PASSWORD=CAMBIAR_EN_PRODUCCION
DATABASE_SCHEMA=public
DATABASE_SSL=true

# ─── REDIS ────────────────────────────────────────────────
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=CAMBIAR_EN_PRODUCCION

# ─── JWT ──────────────────────────────────────────────────
JWT_SECRET=CAMBIAR_EN_PRODUCCION_MIN_64_CHARS
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
JWT_ALGORITHM=RS256

# ─── MINIO (STORAGE) ──────────────────────────────────────
MINIO_ENDPOINT=minio
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=CAMBIAR_EN_PRODUCCION
MINIO_SECRET_KEY=CAMBIAR_EN_PRODUCCION
MINIO_BUCKET_DOCUMENTOS=pyp-documentos
MINIO_BUCKET_PERMISOS=pyp-permisos
MINIO_BUCKET_REPORTES=pyp-reportes
MINIO_SIGNED_URL_EXPIRES=300

# ─── CORREO ELECTRÓNICO ───────────────────────────────────
SMTP_HOST=smtp.proveedor.com
SMTP_PORT=587
SMTP_USER=noreply@alcaldia.gov.co
SMTP_PASSWORD=CAMBIAR_EN_PRODUCCION
SMTP_FROM_NAME=Alcaldía Municipal
SMTP_FROM_EMAIL=noreply@alcaldia.gov.co

# ─── RECAPTCHA ────────────────────────────────────────────
RECAPTCHA_SECRET_KEY=CAMBIAR_EN_PRODUCCION
RECAPTCHA_MIN_SCORE=0.5

# ─── QR ───────────────────────────────────────────────────
QR_SALT=CAMBIAR_EN_PRODUCCION_MIN_32_CHARS
QR_BASE_URL=https://dominio.gov.co/verificar

# ─── BULLMQ ───────────────────────────────────────────────
QUEUE_PDF_CONCURRENCY=3
QUEUE_EMAIL_CONCURRENCY=5
QUEUE_MAX_RETRIES=3

# ─── LOGS ─────────────────────────────────────────────────
LOG_LEVEL=info
LOG_FORMAT=json
```

### 5.2 Gestión de Secrets en Producción

**NO** almacenar valores reales de producción en archivos `.env` del repositorio.

Opciones por prioridad:

| Opción | Cuando usar |
|--------|------------|
| Variables de entorno del SO (export en `.bashrc` del sistema) | Servidor dedicado sin orquestación |
| Docker Secrets | Docker Swarm |
| HashiCorp Vault | Alta seguridad, multiple servicios |
| AWS Secrets Manager / GCP Secret Manager | Despliegue en nube pública |

En todos los casos: el archivo `.env.production` nunca se versiona en Git (está en `.gitignore`).

---

## 6. PostgreSQL — Configuración y Operación

### 6.1 Configuración de Producción

**`postgresql.conf` ajustes recomendados:**

| Parámetro | Valor Recomendado | Descripción |
|-----------|:-----------------:|-------------|
| `max_connections` | 100 | Ajustar según carga |
| `shared_buffers` | 25% de la RAM | Ej: 4 GB si el servidor tiene 16 GB |
| `effective_cache_size` | 75% de la RAM | Estimación para el planificador |
| `work_mem` | 64 MB | Memoria por operación de ordenación |
| `wal_level` | `replica` | Para habilitar replicación |
| `autovacuum` | `on` | Mantener el catálogo limpio |
| `log_slow_queries` | 1000ms | Loguear queries lentos |
| `timezone` | `UTC` | Zona horaria del servidor |

### 6.2 Extensiones Requeridas

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "unaccent";
```

### 6.3 Usuario de Base de Datos — Principio de Mínimo Privilegio

| Usuario | Permisos | Uso |
|---------|---------|-----|
| `pyp_app` | SELECT, INSERT, UPDATE, DELETE en todas las tablas excepto `auditoria` | Aplicación principal |
| `pyp_app` | SELECT, INSERT en `auditoria` (NO UPDATE, NO DELETE) | Bitácora inmutable |
| `pyp_readonly` | SELECT en todas las tablas | Reportes y análisis |
| `postgres` | Superusuario | Administración de BD (solo acceso local) |

### 6.4 Particionamiento de la Tabla `auditoria`

La tabla `auditoria` debe crearse con particionamiento por rango desde el inicio:

```sql
CREATE TABLE auditoria (
  -- columnas...
) PARTITION BY RANGE (created_at);

-- Crear particiones para cada año
CREATE TABLE auditoria_2026 PARTITION OF auditoria
  FOR VALUES FROM ('2026-01-01') TO ('2027-01-01');

CREATE TABLE auditoria_2027 PARTITION OF auditoria
  FOR VALUES FROM ('2027-01-01') TO ('2028-01-01');
-- etc.
```

---

## 7. Backups

### 7.1 Estrategia de Backups

| Componente | Herramienta | Frecuencia | Retención |
|-----------|------------|:----------:|:---------:|
| PostgreSQL | `pg_dump` | Diaria (03:00 COT) | 30 días |
| PostgreSQL WAL | `pg_basebackup` + WAL archiving | Continuo | 7 días |
| MinIO (documentos + PDFs) | `mc mirror` a S3/GCS externo | Diaria (04:00 COT) | 90 días |
| Redis | RDB snapshot | Cada 6 horas | 3 días |
| Configuración del servidor | Script de backup + Git | Por cambio | Indefinida |

### 7.2 Procedimiento de Backup PostgreSQL

```
1. Ejecutar: pg_dump -Fc -h localhost -U pyp_app pyp_db > backup_YYYYMMDD.dump
2. Comprimir: gzip backup_YYYYMMDD.dump
3. Transferir a storage externo (rsync/mc/aws s3 cp)
4. Verificar integridad: pg_restore --list backup_YYYYMMDD.dump.gz | wc -l (debe ser > 0)
5. Registrar en bitácora de backups
```

### 7.3 Prueba de Restauración (Obligatoria cada 30 días)

```
1. Crear ambiente efímero de restauración
2. Restaurar el backup más reciente
3. Ejecutar queries de verificación (contar registros, verificar última solicitud)
4. Documentar el tiempo de restauración (RTO objetivo: < 2 horas)
5. Destruir el ambiente efímero
```

### 7.4 Objetivos de Recuperación

| Métrica | Objetivo |
|---------|---------|
| **RPO** (Recovery Point Objective) | Máximo 24 horas de pérdida de datos |
| **RTO** (Recovery Time Objective) | Máximo 4 horas de tiempo de inactividad |

---

## 8. SSL / HTTPS

### 8.1 Certificados SSL con Let's Encrypt

```
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obtener certificado
sudo certbot --nginx -d dominio.gov.co -d www.dominio.gov.co

# Renovación automática (ya configurada por Certbot)
# Verificar: sudo certbot renew --dry-run
```

### 8.2 Configuración Nginx para HTTPS

- Forzar redirect HTTP → HTTPS (301 permanente).
- TLS 1.2 y 1.3 únicamente. Deshabilitar TLS 1.0 y 1.1.
- Cipher suites modernos (ECDHE-RSA-AES256-GCM-SHA384, etc.).
- HSTS habilitado: `Strict-Transport-Security: max-age=31536000; includeSubDomains`.
- OCSP Stapling habilitado.

### 8.3 Configuración de Nginx como Reverse Proxy

```
Requests a /api/* → backend:3000
Requests a /*    → frontend:3001
```

Headers añadidos por Nginx al backend:
- `X-Real-IP`: IP real del cliente.
- `X-Forwarded-For`: Cadena de proxies.
- `X-Forwarded-Proto`: `https`.

El backend debe confiar en estos headers (`app.set('trust proxy', 1)` en NestJS).

---

## 9. Monitoreo

### 9.1 Métricas Clave a Monitorear

| Categoría | Métrica | Alerta |
|-----------|---------|--------|
| **Infraestructura** | CPU del servidor > 80% por 5 min | Alerta media |
| | RAM disponible < 1 GB | Alerta alta |
| | Disco disponible < 20% | Alerta alta |
| **Aplicación** | Error rate del backend > 5% | Alerta alta |
| | Latencia P95 > 2s | Alerta media |
| | Endpoint `/health` no responde | Alerta crítica |
| **Base de Datos** | Conexiones activas > 80 | Alerta media |
| | Query lento > 1s frecuente | Alerta media |
| | Tamaño de tabla `auditoria` > 50 GB | Alerta media |
| **Cola BullMQ** | Jobs en espera > 100 | Alerta media |
| | Jobs en DLQ > 0 | Alerta alta |
| | Workers caídos | Alerta crítica |
| **Storage** | Disco MinIO > 80% | Alerta alta |
| | Fallo de backup nocturno | Alerta alta |
| **SSL** | Certificado vence en < 30 días | Alerta media |

### 9.2 Stack de Monitoreo

| Herramienta | Propósito |
|-------------|---------|
| **Prometheus** | Recolección de métricas de la API y la BD |
| **Grafana** | Dashboards y visualización de métricas |
| **Loki** | Agregación y consulta de logs |
| **Uptime Robot** | Monitoreo de disponibilidad del portal (externo) |
| **BullMQ Board** | Dashboard visual de la cola de jobs |
| **pg_stat_statements** | Análisis de queries PostgreSQL |

### 9.3 Alertas

Canales de alerta por severidad:

| Severidad | Canal |
|-----------|-------|
| Crítica | Llamada/SMS + correo al responsable técnico |
| Alta | Correo al responsable técnico |
| Media | Correo al equipo de TI |

---

## 10. Logs

### 10.1 Estrategia de Logs

- **Backend NestJS:** Logs en formato JSON usando Pino. Nivel `info` en producción, `debug` en desarrollo.
- **Nginx:** Logs de acceso en formato combinado.
- **PostgreSQL:** Queries lentos (> 1000ms) y errores.
- **Workers BullMQ:** Log de cada job: inicio, resultado, tiempo de procesamiento.

### 10.2 Campos Estándar en Logs JSON

```json
{
  "timestamp": "2026-08-02T14:30:00.000Z",
  "level": "info",
  "context": "SolicitudesController",
  "message": "Solicitud creada",
  "requestId": "uuid-v4",
  "userId": "uuid-v4-o-null",
  "ip": "192.168.1.1",
  "method": "POST",
  "path": "/api/v1/public/solicitudes",
  "statusCode": 201,
  "durationMs": 245
}
```

### 10.3 Campos Prohibidos en Logs

Nunca incluir en logs:
- `contrasena`, `password`, `hash`
- `access_token`, `refresh_token`
- `storage_key`
- `captchaToken`
- `JWT_SECRET`, `QR_SALT`
- Número de documento completo (solo últimos 4 dígitos)

### 10.4 Rotación y Retención de Logs

| Fuente | Retención | Rotación |
|--------|:---------:|:--------:|
| Logs de la aplicación (Loki) | 90 días | Diaria |
| Logs de Nginx | 30 días | Diaria |
| Logs de PostgreSQL | 30 días | Semanal |
| Tabla `auditoria` (BD) | 5 años | Por partición anual |

---

## 11. CI/CD con GitHub Actions

### 11.1 Flujo de CI/CD

```
Push a feature/* o develop
    │
    ▼
[Workflow: CI]
  ├── lint (ESLint + Prettier check)
  ├── type-check (tsc --noEmit)
  ├── test:unit (Jest)
  ├── test:integration (Jest + PostgreSQL efímero)
  └── build (tsc) — verifica que compila

Pull Request a develop/main
    │
    ▼
[Workflow: CI + Code Review Gates]
  ├── Todos los checks de CI
  └── Revisión de código obligatoria (1 aprobador)

Push a main (o tag v*)
    │
    ▼
[Workflow: CD]
  ├── Build Docker images (multi-stage)
  ├── Push a Container Registry (GitHub CR / Docker Hub)
  ├── Deploy a staging (automático)
  ├── Run smoke tests en staging
  └── Deploy a producción (manual — requiere aprobación)
```

### 11.2 Herramientas del Pipeline

| Herramienta | Uso |
|-------------|-----|
| GitHub Actions | Orquestación del pipeline |
| Docker BuildKit | Build optimizado de imágenes |
| GitHub Container Registry | Almacenamiento de imágenes |
| Trivy | Escaneo de vulnerabilidades en imágenes |
| Semgrep | SAST (análisis estático de seguridad) |

### 11.3 Secrets del Pipeline (GitHub Actions)

Configurar en Settings → Secrets and Variables → Actions:
- `REGISTRY_TOKEN`: Token de acceso al container registry.
- `STAGING_HOST`, `STAGING_USER`, `STAGING_SSH_KEY`: Acceso SSH al servidor de staging.
- `PROD_HOST`, `PROD_USER`, `PROD_SSH_KEY`: Acceso SSH al servidor de producción.

---

## 12. Procedimiento de Despliegue

### 12.1 Primer Despliegue (Fresh Install)

```
Tiempo estimado: 2-3 horas

PASO 1 — Preparación del servidor
  1.1 Conectar al servidor por SSH
  1.2 Instalar Docker Engine y Docker Compose
  1.3 Configurar el firewall (ufw allow 22, 80, 443)
  1.4 Crear usuario no-root para la aplicación: useradd -m -s /bin/bash pyp
  1.5 Agregar usuario al grupo docker: usermod -aG docker pyp

PASO 2 — Clonar el repositorio
  2.1 ssh pyp@servidor
  2.2 git clone https://github.com/alcaldia/pyp-sistema.git /app
  2.3 cd /app

PASO 3 — Configurar variables de entorno
  3.1 cp .env.example .env.production
  3.2 Editar .env.production con los valores reales de producción
  3.3 chmod 600 .env.production (solo el owner puede leerlo)

PASO 4 — Obtener certificado SSL
  4.1 Instalar Certbot: apt install certbot python3-certbot-nginx
  4.2 Obtener certificado: certbot certonly --standalone -d dominio.gov.co
  4.3 Copiar rutas del certificado a docker/nginx/ssl/

PASO 5 — Ejecutar el sistema
  5.1 docker compose -f docker-compose.prod.yml pull
  5.2 docker compose -f docker-compose.prod.yml up -d
  5.3 Verificar que todos los servicios están healthy:
      docker compose -f docker-compose.prod.yml ps

PASO 6 — Inicializar la base de datos
  6.1 docker compose -f docker-compose.prod.yml exec backend npm run migration:run
  6.2 docker compose -f docker-compose.prod.yml exec backend npm run seed:run

PASO 7 — Verificar el despliegue
  7.1 curl -f https://dominio.gov.co/api/v1/health
  7.2 Abrir https://dominio.gov.co en el navegador
  7.3 Verificar acceso a https://dominio.gov.co/api/docs (Swagger)
  7.4 Hacer login con el usuario admin inicial
  7.5 Ejecutar pruebas de humo (smoke tests)
```

### 12.2 Despliegue de Actualización (Update)

```
Tiempo estimado: 5-15 minutos

PASO 1 — Preparación
  1.1 Notificar a los usuarios el mantenimiento programado (si aplica)
  1.2 Verificar que el backup nocturno de la BD fue exitoso
  1.3 Pull la nueva versión: git pull origin main

PASO 2 — Verificar cambios
  2.1 git log --oneline DEPLOYED_SHA..HEAD (ver qué cambió)
  2.2 Verificar si hay nuevas migraciones: ls database/migrations/ | tail -10
  2.3 Verificar si hay nuevas variables de entorno: diff .env.example .env.production

PASO 3 — Actualizar variables de entorno (si hay nuevas)
  3.1 Agregar las nuevas variables a .env.production

PASO 4 — Reconstruir y desplegar
  4.1 docker compose -f docker-compose.prod.yml build --no-cache backend frontend worker
  4.2 docker compose -f docker-compose.prod.yml up -d --no-deps backend frontend worker

PASO 5 — Ejecutar migraciones (si las hay)
  5.1 docker compose -f docker-compose.prod.yml exec backend npm run migration:run

PASO 6 — Verificar
  6.1 curl -f https://dominio.gov.co/api/v1/health
  6.2 Verificar logs: docker compose -f docker-compose.prod.yml logs --tail=50 backend
  6.3 Ejecutar smoke tests
  6.4 Registrar la versión desplegada: echo "DEPLOYED_SHA=$(git rev-parse HEAD)" >> deploys.log
```

---

## 13. Procedimiento de Rollback

### 13.1 Rollback de la Aplicación (Sin Cambios de BD)

```
Tiempo estimado: 3-5 minutos

PASO 1 — Identificar la versión anterior
  1.1 cat deploys.log | tail -5
  1.2 git log --oneline | head -10

PASO 2 — Revertir al commit anterior
  2.1 git checkout PREVIOUS_SHA

PASO 3 — Reconstruir y desplegar la versión anterior
  3.1 docker compose -f docker-compose.prod.yml build --no-cache backend frontend worker
  3.2 docker compose -f docker-compose.prod.yml up -d --no-deps backend frontend worker

PASO 4 — Verificar
  4.1 curl -f https://dominio.gov.co/api/v1/health
  4.2 Confirmar que el sistema funciona con la versión anterior
```

### 13.2 Rollback con Reversión de Migraciones de BD

```
⚠️ ADVERTENCIA: Este procedimiento implica posible pérdida de datos.
   Requiere aprobación del Tech Lead antes de ejecutar.

PASO 1 — Hacer un snapshot de la BD actual
  1.1 pg_dump -Fc pyp_db > rollback_snapshot_$(date +%Y%m%d_%H%M%S).dump

PASO 2 — Ejecutar migración de reversión
  2.1 docker compose exec backend npm run migration:revert
  (Repetir hasta estar en la versión de esquema deseada)

PASO 3 — Revertir el código
  3.1 git checkout PREVIOUS_SHA
  3.2 docker compose build && docker compose up -d

PASO 4 — Verificar integridad de los datos
  4.1 Ejecutar queries de verificación sobre las tablas afectadas
  4.2 Confirmar que los registros críticos son consistentes

PASO 5 — Documentar el incidente
  5.1 Registrar: fecha, causa, duración, impacto, acciones tomadas
```

---

## 14. Procedimiento de Actualización de Certificado SSL

```
Frecuencia: Automática cada 90 días (Certbot cron)
Verificar: sudo certbot renew --dry-run

Manual (si el automático falla):
  1. sudo certbot renew
  2. docker compose -f docker-compose.prod.yml restart nginx
  3. Verificar: curl -I https://dominio.gov.co | grep "HTTP/"
```

---

## 15. Checklist Pre-Despliegue a Producción

Antes de cada despliegue a producción verificar:

- [ ] El pipeline de CI pasó completamente (lint, tests, build).
- [ ] Las pruebas de integración del ambiente de staging pasaron.
- [ ] El backup nocturno de la BD de producción fue exitoso.
- [ ] Las migraciones fueron probadas en staging.
- [ ] Las nuevas variables de entorno están configuradas en producción.
- [ ] El CHANGELOG.md fue actualizado.
- [ ] El Tech Lead revisó y aprobó el despliegue.
- [ ] El equipo está disponible durante el despliegue para responder incidentes.
- [ ] Se notificó a los usuarios si se requiere ventana de mantenimiento.

---

*Toda acción de despliegue debe registrarse en `deploys.log` con fecha, versión y responsable.*
