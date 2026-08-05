# Informe de Performance — Sistema Pico y Placa

**Versión:** B21  
**Fecha:** 2026-08-04

---

## Backend

### Configuración de Conexiones DB

- Pool TypeORM: `max: 10`, `min: 2`, `idleTimeoutMillis: 30000`
- Timeouts de conexión: 5 segundos
- **Acción recomendada:** Aumentar pool a `max: 20` en servidores con >= 4 vCPU

### Índices en Base de Datos

| Tabla | Índice | Propósito |
|-------|--------|-----------|
| `tokens` | `idx_tokens_token_hash` | Búsqueda O(log n) por hash |
| `tokens` | `idx_tokens_usuario_tipo_revocado` | Composite para logout/refresh |
| `tokens` | `idx_tokens_familia` | Revocación por familia (B21) |
| `usuarios` | `idx_usuarios_rol_id` | JOIN con roles |
| `solicitudes` | `idx_solicitudes_ciudadano_id` | Filtro por ciudadano |
| `permisos` | `idx_permisos_placa` | Búsqueda por placa |

### Observabilidad

- Métricas HTTP: histograma de latencia por ruta y método (`http_request_duration_seconds`)
- Métricas BullMQ: jobs completados/fallidos/duración
- Tracing OpenTelemetry: spans por use-case con OTLP exporter
- Health checks: PostgreSQL, Redis, MinIO, SMTP

### Compresión

- `compression` middleware activo (gzip/brotli para respuestas > 1 KB)

---

## Frontend (Next.js 15)

### Bundle

- Output: `standalone` (imagen Docker mínima ~300 MB)
- `optimizePackageImports`: lucide-react, @radix-ui
- Formatos de imagen: `avif`, `webp`

### Cargas Lentas Identificadas

| Ruta | Causa probable | Recomendación |
|------|---------------|---------------|
| `/funcionario/dashboard` | 6 llamadas paralelas a API | Ya en paralelo con Promise.all |
| `/funcionario/solicitudes/:id` | Carga de documentos eager | Lazy load en tab de documentos |
| `/funcionario/reportes` | Dos queries de reporte sin caché | `staleTime: 5min` en hooks |

### Seguridad de Headers (Next.js)

Añadido en B21 via `next.config.js`:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Content-Security-Policy` (restrictiva)
- `Permissions-Policy`

---

## Límites Docker Producción

| Servicio | CPU | RAM |
|----------|-----|-----|
| postgres | 1.0 vCPU | 512 MB |
| redis | 0.5 vCPU | 384 MB |
| minio | 0.5 vCPU | 256 MB |
| backend | 2.0 vCPU | 1 GB |
| nginx | 0.5 vCPU | 128 MB |

---

## Recomendaciones Prioritarias

1. Agregar caché Redis para listados de catálogos (motivos, roles, dependencias) — TTL 60s
2. Paginar respuestas de reportes cuando el volumen supere 10,000 registros
3. Implementar CDN para activos estáticos del frontend
4. Considerar read replica de PostgreSQL para queries de reporte
5. Establecer alertas en Prometheus cuando latencia P99 supere 2 segundos
