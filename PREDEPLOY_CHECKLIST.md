# Checklist Pre-Deploy — Sistema Pico y Placa

**Versión:** B21  
**Fecha:** 2026-08-04  
**Uso:** Ejecutar antes de cada despliegue a producción

---

## 1. Quality Gates

```bash
# Backend
cd backend
npx tsc --noEmit          # ✅ 0 errores TypeScript
npm run lint              # ✅ 0 errores ESLint
npm run test              # ✅ todos los tests pasan
npm run test:cov          # ✅ cobertura >= 10%
npm run build             # ✅ compilación exitosa
npm audit --audit-level=high  # ✅ sin vulnerabilidades críticas/altas

# Frontend
cd frontend
npx tsc --noEmit          # ✅ 0 errores TypeScript
npm run lint              # ✅ 0 errores ESLint
npm run build             # ✅ Next.js build exitoso
npm audit --audit-level=high  # ✅ sin vulnerabilidades críticas/altas
```

## 2. Variables de Entorno

- [ ] `.env.production` actualizado con todos los valores
- [ ] Sin valores de ejemplo (`changeme`, `localhost`, `secret`) en producción
- [ ] `NODE_ENV=production`
- [ ] URLs correctas (`FRONTEND_URL`, `PUBLIC_URL`)

## 3. Migraciones

- [ ] Backup de la base de datos antes de migrar
- [ ] `npm run migration:run` ejecutado y exitoso
- [ ] `npm run migration:show` confirma todas las migraciones aplicadas

## 4. Docker

- [ ] `docker compose -f docker-compose.prod.yml build` sin errores
- [ ] Imágenes taggeadas con versión (`APP_VERSION=B21`)
- [ ] `docker compose -f docker-compose.prod.yml up -d` arranca todos los servicios
- [ ] Health checks verdes para todos los servicios

## 5. Verificación Post-Arranque

- [ ] `GET /api/v1/health` → `{ "status": "ok" }`
- [ ] `GET /api/v1/metrics` → métricas Prometheus
- [ ] Login de prueba exitoso
- [ ] MFA funcional para ADMINISTRADOR

## 6. Rollback

En caso de error crítico:
```bash
docker compose -f docker-compose.prod.yml down
# Restaurar backup BD
npm run migration:revert  # si la migración fue el problema
docker compose -f docker-compose.prod.yml up -d --scale backend=1
```
