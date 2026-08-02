# Backend — Sistema de Permisos de Circulación (Pico y Placa)

API REST construida con NestJS 10 + TypeScript 5 + TypeORM + PostgreSQL 15.

---

## Requisitos

| Herramienta | Versión mínima |
|------------|----------------|
| Node.js | 20 LTS |
| npm | 10+ |
| PostgreSQL | 15 |
| Redis | 7 |

---

## Configuración inicial

```bash
# 1. Instalar dependencias
npm install

# 2. Copiar el archivo de variables de entorno
cp .env.example .env

# 3. Completar los valores en .env (DB_HOST, DB_PASSWORD, JWT_SECRET, etc.)
```

---

## Ejecución

```bash
# Desarrollo (hot reload)
npm run start:dev

# Producción
npm run build
npm run start
```

El servidor arranca en `http://localhost:3001/api/v1`
Swagger UI disponible en `http://localhost:3001/api/docs` (solo en desarrollo)

---

## Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run start:dev` | Desarrollo con hot reload |
| `npm run build` | Compilar TypeScript → dist/ |
| `npm run start` | Ejecutar versión compilada |
| `npm run lint` | Verificar y corregir estilo de código |
| `npm run format` | Formatear con Prettier |
| `npm run test` | Pruebas unitarias |
| `npm run test:cov` | Pruebas con reporte de cobertura |
| `npm run test:e2e` | Pruebas E2E |
| `npm run migration:generate -- --name=Nombre` | Generar migración TypeORM |
| `npm run migration:run` | Ejecutar migraciones pendientes |
| `npm run migration:revert` | Revertir última migración |
| `npm run migration:show` | Ver estado de migraciones |

---

## Estructura de directorios

```
src/
├── config/          → Variables de entorno tipadas y validadas con Joi
├── common/          → Filtros, interceptores, decoradores y tipos compartidos
│   ├── decorators/  → @Roles()
│   ├── filters/     → HttpExceptionFilter (respuesta de error estándar)
│   ├── interceptors/→ LoggingInterceptor, ResponseTransformInterceptor
│   └── interfaces/  → ApiResponse, PaginationMeta
├── modules/
│   └── health/      → GET /api/v1/health
├── app.module.ts    → Módulo raíz
└── main.ts          → Bootstrap: Swagger, Helmet, CORS, pipes, filtros
```

---

## Documentación del proyecto

| Documento | Ruta |
|-----------|------|
| PRD | `docs/PRD_Sistema_Permisos_de_Circulacion.md` |
| Modelo de datos | `docs/MODELO_DATOS.md` |
| API completa | `docs/API_FUNCIONAL.md` |
| Arquitectura | `.claude/ARCHITECTURE.md` |
| Seguridad | `.claude/SECURITY.md` |
| Roadmap | `.claude/ROADMAP.md` |
