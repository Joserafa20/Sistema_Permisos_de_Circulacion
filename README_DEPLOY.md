# Guía de Despliegue — Sistema de Permisos de Circulación (PYP)

## Índice

1. [Prerequisitos](#1-prerequisitos)
2. [Variables de Entorno](#2-variables-de-entorno)
3. [Certificados SSL](#3-certificados-ssl)
4. [Primer Despliegue](#4-primer-despliegue)
5. [Migraciones](#5-migraciones)
6. [Verificación de Salud](#6-verificación-de-salud)
7. [Comandos de Operación](#7-comandos-de-operación)
8. [Actualización de la Aplicación](#8-actualización-de-la-aplicación)
9. [Rollback](#9-rollback)
10. [Backup y Restore](#10-backup-y-restore)
11. [Resolución de Problemas](#11-resolución-de-problemas)
12. [Checklist Pre-Producción](#12-checklist-pre-producción)
13. [Checklist Post-Despliegue](#13-checklist-post-despliegue)

---

## 1. Prerequisitos

| Herramienta | Versión mínima | Verificar |
|---|---|---|
| Docker Engine | 24.x | `docker --version` |
| Docker Compose | 2.20.x | `docker compose version` |
| Git | 2.x | `git --version` |
| Acceso SMTP | — | Credenciales del servidor de correo institucional |
| Dominio con SSL | — | Certificado en `docker/nginx/ssl/` |

El servidor debe tener al menos **2 GB RAM** y **20 GB** de disco.

---

## 2. Variables de Entorno

```bash
# Desde el directorio /docker/
cp .env.production.example .env.production
```

Editar `.env.production` y completar **todos** los valores marcados con `CAMBIAR_`.

### Generar secretos seguros

```bash
# JWT_SECRET y JWT_REFRESH_SECRET (64 bytes = 128 chars hex)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# QR_SECRET_SALT (48 bytes = 96 chars hex)
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"

# Contraseñas de servicios (24 bytes = 48 chars hex)
node -e "console.log(require('crypto').randomBytes(24).toString('hex'))"
```

> **CRÍTICO:** `QR_SECRET_SALT` no debe cambiar una vez que hay permisos en producción.
> Si cambia, todos los códigos QR emitidos dejan de ser verificables.

---

## 3. Certificados SSL

### Opción A — Let's Encrypt (recomendada, gratuita)

```bash
# Instalar Certbot en el servidor host
apt-get install -y certbot

# Obtener certificado (el dominio debe apuntar a la IP del servidor)
certbot certonly --standalone -d permisos.municipio.gov.co

# Copiar certificados al directorio de Nginx
mkdir -p docker/nginx/ssl
cp /etc/letsencrypt/live/permisos.municipio.gov.co/fullchain.pem docker/nginx/ssl/cert.pem
cp /etc/letsencrypt/live/permisos.municipio.gov.co/privkey.pem   docker/nginx/ssl/key.pem
chmod 600 docker/nginx/ssl/*.pem
```

**Renovación automática** (agregar a cron del servidor):

```bash
# /etc/cron.d/certbot-renewal
0 3 1 * * root certbot renew --quiet && \
  cp /etc/letsencrypt/live/permisos.municipio.gov.co/fullchain.pem /ruta/docker/nginx/ssl/cert.pem && \
  cp /etc/letsencrypt/live/permisos.municipio.gov.co/privkey.pem   /ruta/docker/nginx/ssl/key.pem && \
  docker restart pyp-nginx-prod
```

### Opción B — Certificado institucional existente

```bash
mkdir -p docker/nginx/ssl
cp /ruta/al/certificado.crt docker/nginx/ssl/cert.pem
cp /ruta/a/la/clave.key     docker/nginx/ssl/key.pem
chmod 600 docker/nginx/ssl/*.pem
```

> **ADVERTENCIA:** `docker/nginx/ssl/*.pem` y `*.key` están en `.gitignore` y NUNCA deben subirse al repositorio.

---

## 4. Primer Despliegue

```bash
# 1. Clonar el repositorio
git clone https://github.com/Joserafa20/Sistema_Permisos_de_Circulacion.git
cd Sistema_Permisos_de_Circulacion

# 2. Construir las imágenes
docker compose -f docker/docker-compose.prod.yml --env-file docker/.env.production build --no-cache

# 3. Levantar los servicios de infraestructura primero
docker compose -f docker/docker-compose.prod.yml --env-file docker/.env.production up -d postgres redis minio createbuckets

# 4. Esperar a que PostgreSQL esté listo
docker compose -f docker/docker-compose.prod.yml --env-file docker/.env.production logs -f postgres

# 5. Ejecutar migraciones (ver sección 4)
# ...

# 6. Levantar el backend y Nginx
docker compose -f docker/docker-compose.prod.yml --env-file docker/.env.production up -d backend nginx

# 7. Verificar estado
docker compose -f docker/docker-compose.prod.yml --env-file docker/.env.production ps
```

---

## 4. Migraciones

Las migraciones deben ejecutarse **antes** de iniciar el backend por primera vez y **antes** de cada actualización que incluya cambios de esquema.

```bash
# Ejecutar migraciones pendientes
docker compose -f docker/docker-compose.prod.yml --env-file docker/.env.production \
  exec backend node dist/config/typeorm-cli.config migration:run

# Ver migraciones aplicadas
docker compose -f docker/docker-compose.prod.yml --env-file docker/.env.production \
  exec backend node dist/config/typeorm-cli.config migration:show

# Revertir la última migración (usar con cuidado)
docker compose -f docker/docker-compose.prod.yml --env-file docker/.env.production \
  exec backend node dist/config/typeorm-cli.config migration:revert
```

### Orden de migraciones incluidas

| # | Migración | Descripción |
|---|---|---|
| 1 | `CreateTablesBase` | Tablas principales del sistema |
| 2 | `CreateConfiguracionInstitucional` | Datos de la alcaldía |
| 3 | `AddContextoToNotificaciones` | Columna JSONB para email context |
| ... | ... | Ver `database/migrations/` |

---

## 5. Verificación de Salud

```bash
# Health check completo (PostgreSQL + Redis + MinIO + SMTP)
curl -s https://permisos.municipio.gov.co/api/v1/health | jq .
```

Respuesta esperada:
```json
{
  "status": "ok",
  "info": {
    "database": { "status": "up" },
    "redis": { "status": "up" },
    "minio": { "status": "up" },
    "smtp": { "status": "up" }
  }
}
```

Si algún servicio muestra `"status": "down"`, revisar logs:

```bash
docker compose -f docker/docker-compose.prod.yml --env-file docker/.env.production logs [servicio]
```

---

## 6. Comandos de Operación

```bash
# Ver estado de todos los contenedores
docker compose -f docker/docker-compose.prod.yml --env-file docker/.env.production ps

# Ver logs en tiempo real
docker compose -f docker/docker-compose.prod.yml --env-file docker/.env.production logs -f backend

# Reiniciar un servicio específico
docker compose -f docker/docker-compose.prod.yml --env-file docker/.env.production restart backend

# Detener sin eliminar datos
docker compose -f docker/docker-compose.prod.yml --env-file docker/.env.production stop

# Iniciar (después de stop)
docker compose -f docker/docker-compose.prod.yml --env-file docker/.env.production start

# Ver uso de recursos
docker stats pyp-backend-prod pyp-postgres-prod pyp-redis-prod pyp-minio-prod
```

---

## 7. Actualización de la Aplicación

```bash
# 1. Obtener últimos cambios
git pull origin main

# 2. Reconstruir imagen del backend
docker compose -f docker/docker-compose.prod.yml --env-file docker/.env.production \
  build --no-cache backend

# 3. Ejecutar migraciones nuevas (si las hay)
docker compose -f docker/docker-compose.prod.yml --env-file docker/.env.production \
  run --rm backend node dist/config/typeorm-cli.config migration:run

# 4. Reemplazar contenedor (zero-downtime con un solo nodo)
docker compose -f docker/docker-compose.prod.yml --env-file docker/.env.production \
  up -d --no-deps backend

# 5. Verificar salud
curl -s https://permisos.municipio.gov.co/api/v1/health | jq .status
```

---

## 8. Rollback

### Rollback de aplicación

```bash
# Identificar el commit anterior
git log --oneline -10

# Volver al commit anterior
git checkout <commit-hash>

# Reconstruir imagen con la versión anterior
docker compose -f docker/docker-compose.prod.yml --env-file docker/.env.production \
  build --no-cache backend

# Revertir migraciones si es necesario
docker compose -f docker/docker-compose.prod.yml --env-file docker/.env.production \
  exec backend node dist/config/typeorm-cli.config migration:revert

# Redeployar
docker compose -f docker/docker-compose.prod.yml --env-file docker/.env.production \
  up -d --no-deps backend
```

### Rollback de base de datos

```bash
# Revertir la última migración
docker compose -f docker/docker-compose.prod.yml --env-file docker/.env.production \
  exec backend npx typeorm migration:revert --dataSource dist/config/typeorm-cli.config.js
```

---

## 9. Backup y Restore

### Backup de PostgreSQL

```bash
# Backup completo
docker exec pyp-postgres-prod pg_dump \
  -U ${POSTGRES_USER} \
  -d ${POSTGRES_DB} \
  --no-password \
  --format=custom \
  --compress=9 \
  > backup_$(date +%Y%m%d_%H%M%S).dump

# Automatizar con cron (diario a las 02:00)
# 0 2 * * * /ruta/al/script/backup.sh >> /var/log/pyp_backup.log 2>&1
```

### Restore de PostgreSQL

```bash
# ADVERTENCIA: Esto sobreescribe la base de datos existente
docker exec -i pyp-postgres-prod pg_restore \
  -U ${POSTGRES_USER} \
  -d ${POSTGRES_DB} \
  --clean \
  --if-exists \
  < backup_YYYYMMDD_HHMMSS.dump
```

### Backup de MinIO

```bash
# Usar MinIO Client (mc)
docker run --rm --network pyp-prod_internal \
  minio/mc:latest \
  mirror local/${MINIO_BUCKET_PDFS} /backup/pdfs/

# O usar mc directamente si está instalado en el host:
mc mirror pyp-prod/${MINIO_BUCKET_PDFS} /backup/pdfs/
```

### Backup de Redis

Redis persiste datos con AOF (`appendonly yes`). El volumen `redis_data` contiene el archivo `appendonly.aof`. Para un backup en caliente:

```bash
docker exec pyp-redis-prod redis-cli -a "${REDIS_PASSWORD}" BGSAVE
# Luego copiar /data/dump.rdb del volumen
```

---

## 10. Resolución de Problemas

### Backend no inicia

```bash
docker logs pyp-backend-prod --tail 50
```

Causas comunes:
- Variables de entorno faltantes o incorrectas → verificar `.env.production`
- PostgreSQL no disponible → `docker logs pyp-postgres-prod`
- Puerto 3001 ocupado → verificar con `lsof -i :3001`

### Correos no se envían

1. Verificar salud del SMTP: `curl .../api/v1/health`
2. Revisar logs del processor: `docker logs pyp-backend-prod | grep EmailProcessor`
3. Verificar la cola BullMQ en Redis: `docker exec pyp-redis-prod redis-cli -a "$REDIS_PASSWORD" KEYS "bull:*"`

### Error de certificado SSL

```bash
# Verificar vencimiento del certificado
openssl x509 -enddate -noout -in docker/nginx/ssl/cert.pem

# Renovar con Certbot (si se usa Let's Encrypt)
certbot renew --nginx
docker compose -f docker/docker-compose.prod.yml --env-file docker/.env.production restart nginx
```

### Base de datos llena de conexiones

```bash
docker exec pyp-postgres-prod psql -U $POSTGRES_USER -d $POSTGRES_DB \
  -c "SELECT count(*), state FROM pg_stat_activity GROUP BY state;"
```

El pool de TypeORM está configurado en `max: 10, min: 2`. Si hay más de 10 conexiones activas, revisar si hay conexiones zombi.

---

---

## 12. Checklist Pre-Producción

Ejecutar antes de cada despliegue a producción:

- [ ] `.env.production` creado y sin valores `CAMBIAR_`
- [ ] `QR_SECRET_SALT` generado con 48+ bytes aleatorios y guardado en lugar seguro
- [ ] `JWT_SECRET` y `JWT_REFRESH_SECRET` son distintos entre sí y tienen 64+ bytes
- [ ] Certificados SSL en `docker/nginx/ssl/cert.pem` y `docker/nginx/ssl/key.pem`
- [ ] El dominio resuelve a la IP del servidor (`dig permisos.municipio.gov.co`)
- [ ] Firewall permite tráfico en 80 y 443 únicamente
- [ ] Servidor tiene ≥ 2 GB RAM y ≥ 20 GB disco libre
- [ ] Acceso SMTP verificado manualmente (`telnet smtp.municipio.gov.co 587`)
- [ ] Migraciones revisadas y respaldadas antes de aplicar
- [ ] Backup de PostgreSQL si es actualización (no primer despliegue)
- [ ] Variables `SEED_CI_*` correctas para el municipio (solo se leen si la tabla está vacía)
- [ ] `docker-compose.prod.yml` validado: `docker compose -f docker/docker-compose.prod.yml config`

---

## 13. Checklist Post-Despliegue

Verificar después de cada despliegue:

- [ ] `GET /api/v1/health` responde `{"status":"ok"}` con los 4 servicios `up`
- [ ] Redireccionamiento HTTP → HTTPS funciona: `curl -I http://permisos.municipio.gov.co`
- [ ] Login de funcionario funciona con usuario admin inicial
- [ ] Creación de solicitud de prueba completa el flujo
- [ ] Email de prueba llega correctamente (verificar bandeja del ciudadano)
- [ ] Generación de PDF no falla (aprobar una solicitud de prueba)
- [ ] QR del permiso verifica correctamente en `GET /api/v1/public/verificar/:codigo`
- [ ] Logs del backend no muestran errores de conexión: `docker logs pyp-backend-prod --tail 50`
- [ ] MinIO consola accesible internamente (no debe estar expuesta al exterior)
- [ ] HSTS header presente en respuesta HTTPS (activar en `nginx.conf` después de confirmar SSL)

---

*Última actualización: 2026-08-04 — Bloque B11.1*
