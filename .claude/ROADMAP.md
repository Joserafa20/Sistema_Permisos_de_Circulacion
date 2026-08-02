# ROADMAP

## Estado General

**Proyecto:** Sistema Web de Permisos de Circulación de Motocicletas (Pico y Placa)  
**Versión:** 0.1.0  
**Progreso Total:** Calculado automáticamente desde TASKS.md  
**Última actualización:** 2026-08-02
**Auditoría documental:** `docs/AUDITORIA_DOCUMENTACION.md` (2026-08-02 — 93/100 ✅)  
**Análisis técnico:** `docs/ANALISIS_TECNICO.md`

---

## Fase 0 — Fundamentos
**Objetivo:** Entorno de desarrollo listo y uniforme para todo el equipo.  
**Duración estimada:** Semana 1  
**Dependencia:** Ninguna. Es el punto de partida.
**Estado:** 🟡 En progreso — 10 / 12 tareas completadas

- [x] Repositorio Git + GitFlow (main, develop, feature/*, hotfix/*) ✅ 2026-08-02
- [x] `.gitignore` completo (Node, env, build) ✅ 2026-08-02
- [x] Docker Compose: PostgreSQL + Redis + MinIO ✅ 2026-08-02
- [x] Backend NestJS: scaffolding base con ConfigModule tipado ✅ 2026-08-02
- [ ] Frontend Next.js: scaffolding base con App Router y TailwindCSS
- [x] Archivo `.env.example` completo con todas las variables ✅ 2026-08-02
- [x] ESLint + Prettier configurados ✅ 2026-08-02
- [ ] Husky (pre-commit hooks)
- [x] Swagger configurado y accesible en `/api/docs` ✅ 2026-08-02
- [x] Endpoint `/api/v1/health` operativo ✅ 2026-08-02
- [x] Logger estructurado (Pino) configurado ✅ 2026-08-02
- [x] README.md con instrucciones de setup local ✅ 2026-08-02

---

## Fase 1 — Base de Datos
**Objetivo:** Modelo de datos completo, normalizado y versionado antes de escribir lógica de negocio.  
**Duración estimada:** Semanas 1–2  
**Dependencia:** Fase 0 completada.

- [ ] Tipos ENUM de PostgreSQL definidos
- [ ] Script SQL completo (`database/schema.sql`)
- [ ] Migraciones TypeORM para todas las tablas
- [ ] Índices de rendimiento aplicados desde el inicio
- [ ] Seeds: roles, motivos, configuración inicial, municipio, usuario admin temporal
- [ ] Entidades TypeORM con relaciones
- [ ] Diagrama entidad-relación generado (`docs/ER_DIAGRAM.md`)

### Pendientes de Diseño — Fase 1

- [~] **[M-04]** Confirmar estructura de ciudadanos: tabla separada `ciudadanos` vs. campos
  embebidos `ciudadano_*` en `solicitudes`. Afecta esquema SQL, migraciones y Fase 3.
  _Ver `docs/AUDITORIA_DOCUMENTACION.md` §9.2_

- [~] **[M-03]** Confirmar existencia de tabla `historial_contrasenas` en `MODELO_DATOS.md`.
  Requerida por `SECURITY.md` (no reutilizar últimas 5 contraseñas). Agregar antes de migraciones.
  _Ver `docs/AUDITORIA_DOCUMENTACION.md` §9.3_

---

## Fase 2 — Autenticación y Seguridad
**Objetivo:** Sistema de identidad blindado antes de cualquier módulo funcional.  
**Duración estimada:** Semanas 2–3  
**Dependencia:** Fase 1 completada.

- [ ] `POST /api/v1/auth/login` con JWT Access + Refresh Token
- [ ] `POST /api/v1/auth/logout` (revocación de refresh token)
- [ ] `POST /api/v1/auth/refresh` (rotación de refresh token)
- [ ] `POST /api/v1/auth/recuperar-contrasena`
- [ ] `POST /api/v1/auth/restablecer-contrasena`
- [ ] `POST /api/v1/auth/cambiar-contrasena`
- [ ] `GET  /api/v1/auth/me`
- [ ] JwtAuthGuard y RolesGuard globales
- [ ] Rate limiting en `/auth/login` (5 intentos / 15 min por IP)
- [ ] Bloqueo temporal de cuenta por intentos fallidos
- [ ] Política de contraseñas aplicada en DTOs
- [ ] Registro de auditoría: login, logout, login fallido, cambio de contraseña
- [ ] Global Exception Filter (sin exposición de internos)
- [ ] Helmet + CORS configurados
- [ ] CRUD Usuarios (Admin): crear, listar, activar/desactivar, soft delete

### Pendientes de Diseño — Fase 2

- [~] **[M-02]** Definir flujo de desbloqueo de cuenta tras 5 intentos fallidos: ¿automático
  a los 30 min, manual por Admin, o ambos? Afecta modelo (`bloqueado_hasta`), endpoint admin
  y CU-43 pendiente en `CASOS_USO.md`.
  _Ver `docs/AUDITORIA_DOCUMENTACION.md` §5 (CUF-02)_

---

## Fase 3 — Módulo de Solicitudes (Backend)
**Objetivo:** Núcleo del negocio implementado y probado.  
**Duración estimada:** Semanas 3–4  
**Dependencia:** Fase 2 completada.

- [ ] `POST /api/v1/public/solicitudes` — Crear solicitud con ciudadano y moto embebidos
- [ ] `GET  /api/v1/public/solicitudes/estado` — Consulta por radicado + documento
- [ ] `POST /api/v1/solicitudes/{id}/documentos` — Adjuntar documentos (URLs firmadas)
- [ ] `GET  /api/v1/solicitudes` — Listar con filtros y paginación (Funcionario)
- [ ] `GET  /api/v1/solicitudes/{id}` — Detalle completo (Funcionario)
- [ ] `GET  /api/v1/solicitudes/{id}/documentos/{docId}` — URL firmada descarga
- [ ] `POST /api/v1/solicitudes/{id}/aprobar` — Aprobación con generación de permiso en cola
- [ ] `POST /api/v1/solicitudes/{id}/rechazar` — Rechazo con motivo obligatorio
- [ ] `POST /api/v1/solicitudes/{id}/correccion` — Solicitar corrección con campos específicos
- [ ] `GET  /api/v1/solicitudes/{id}/historial` — Historial de estados
- [ ] Validación: no duplicar solicitudes activas para la misma moto
- [ ] Número de radicado con formato `AAAAMMDD-PYP-XXXXXX`
- [ ] Job automático: marcar solicitudes en `VENCIDA` al superar plazo
- [ ] Registro en `historial_estados` en cada cambio
- [ ] Registro en `auditoria` en cada cambio
- [ ] StorageModule con MinIO: subida y URLs firmadas

### Pendientes de Diseño — Fase 3

- [~] **[M-01]** Clarificar estado transitorio en flujo de adjuntar documentos. ¿La solicitud
  pasa a `recibida` al crearla (documentos opcionales/posteriores) o solo al confirmar el envío
  con documentos? Afecta el ENUM `estado_solicitud`, RN-01 y el stepper del ciudadano (Fase 5).
  _Ver `docs/AUDITORIA_DOCUMENTACION.md` §8.2_

---

## Fase 4 — Generación de Permiso (PDF + QR)
**Objetivo:** El documento oficial generado automáticamente con verificación pública.  
**Duración estimada:** Semanas 4–5  
**Dependencia:** Fase 3 completada (al menos el endpoint de aprobación).

- [ ] PDFModule: generación de PDF institucional con template
  - [ ] Encabezado con logo/escudo desde configuración
  - [ ] Número consecutivo formato `2026-PYP-00145`
  - [ ] Snapshot de datos del ciudadano y moto
  - [ ] Imagen del QR embebida en el PDF
  - [ ] Firma y sello institucional configurables
  - [ ] Pie de página institucional
- [ ] QRModule: generación de código QR con identificador UUID+hash opaco
- [ ] Almacenamiento seguro del PDF en MinIO (bucket privado)
- [ ] `GET /api/v1/permisos/{id}/pdf` — URL firmada para descarga
- [ ] `GET /api/v1/public/verificar/{codigoQR}` — Validación pública del QR
- [ ] Registro de cada escaneo en `qr_validaciones`
- [ ] `POST /api/v1/permisos/{id}/revocar` — Revocación con motivo (Admin)
- [ ] Job automático: marcar permisos en `VENCIDO` al superar `fecha_vencimiento`
- [ ] NotificacionesModule: cola de correos con BullMQ
  - [ ] Correo: solicitud recibida (con número de radicado)
  - [ ] Correo: solicitud aprobada (con enlace de descarga)
  - [ ] Correo: solicitud rechazada (con motivo)
  - [ ] Correo: solicitud requiere corrección (con campos específicos)

### Pendientes de Diseño — Fase 4

- [~] **[M-05]** Definir comportamiento de `GET /api/v1/permisos/{id}/pdf` cuando el job de
  generación aún está en cola. Opciones: 202 Accepted con `retry_after`, o 200 con
  `{ pdf_url: null, estado: "generando" }`. Afecta contrato en `API_FUNCIONAL.md` y lógica
  de polling en Fase 6.
  _Ver `docs/AUDITORIA_DOCUMENTACION.md` §11 (RA-02)_

---

## Fase 5 — Frontend Portal Ciudadano
**Objetivo:** Interfaz pública accesible para el trámite del ciudadano.  
**Duración estimada:** Semanas 5–6  
**Dependencia:** Fases 3 y 4 completadas.

- [ ] Página de inicio del portal con información del trámite
- [ ] Formulario de solicitud en pasos (stepper):
  - [ ] Paso 1: Datos personales del ciudadano
  - [ ] Paso 2: Datos de la motocicleta
  - [ ] Paso 3: Motivo y fechas
  - [ ] Paso 4: Carga de documentos adjuntos
  - [ ] Paso 5: Declaración y confirmación
- [ ] Guardado automático en localStorage (prevenir pérdida de datos)
- [ ] Validación en tiempo real (placa, documento, correo, fechas)
- [ ] reCAPTCHA v3 integrado
- [ ] Pantalla de confirmación con número de radicado prominente
- [ ] Página de consulta de estado (radicado + documento)
- [ ] Página de descarga del permiso aprobado
- [ ] Página pública de validación QR (optimizada para móvil)
  - [ ] Estado visual claro: verde (Vigente), rojo (Vencido/Revocado), gris (No encontrado)
- [ ] Aviso de privacidad y autorización Ley 1581
- [ ] Accesibilidad WCAG 2.1 nivel AA
- [ ] Responsive: móvil, tablet y escritorio

---

## Fase 6 — Frontend Panel Funcionario
**Objetivo:** Herramienta operativa para la gestión diaria de solicitudes.  
**Duración estimada:** Semanas 6–7  
**Dependencia:** Fases 3 y 4 completadas.

- [ ] Pantalla de login con manejo de sesión JWT
- [ ] Dashboard: KPIs del día (recibidas, pendientes, aprobadas, rechazadas, vencidas)
- [ ] Cola de solicitudes ordenada por antigüedad con indicadores de urgencia
- [ ] Filtros: estado, fecha, documento, placa, radicado
- [ ] Vista de detalle de solicitud:
  - [ ] Todos los datos personales y de la moto
  - [ ] Previsualización de documentos adjuntos (PDF e imagen inline)
  - [ ] Historial de estados
- [ ] Modal de aprobación con resumen y confirmación
- [ ] Modal de rechazo con motivo obligatorio
- [ ] Modal de corrección con selección de campos a corregir
- [ ] Visualización y descarga del permiso generado
- [ ] Botón de impresión del PDF

---

## Fase 7 — Frontend Panel Administrador
**Objetivo:** Control total del sistema desde la interfaz.  
**Duración estimada:** Semanas 7–8  
**Dependencia:** Fase 6 completada.

- [ ] Dashboard administrativo con KPIs globales
- [ ] CRUD de Usuarios (crear funcionarios, activar/desactivar)
- [ ] CRUD de Roles
- [ ] CRUD de Dependencias
- [ ] CRUD de Motivos (con activación/desactivación sin borrar)
- [ ] Configuración del sistema:
  - [ ] Nombre de la alcaldía, municipio
  - [ ] Logo / escudo (upload de imagen)
  - [ ] Firma digital configurable (upload de imagen)
  - [ ] Sello institucional (upload de imagen)
  - [ ] Parámetros: días máximos permiso, plazos, color institucional
- [ ] Vista de auditoría filtrable (usuario, acción, fecha, entidad)
- [ ] Gestión de permisos: listar, revocar con motivo
- [ ] Reportes:
  - [ ] Solicitudes por fecha, estado, funcionario
  - [ ] Motivos más frecuentes
  - [ ] Permisos vigentes y vencidos
  - [ ] Exportar: Excel, PDF, CSV

---

## Fase 8 — Calidad y Producción
**Objetivo:** Sistema listo para operar en producción con garantías de calidad.  
**Duración estimada:** Semanas 8–10  
**Dependencia:** Fases 5, 6 y 7 completadas.

- [ ] Pruebas unitarias backend (cobertura ≥ 80%)
  - [ ] Use cases críticos
  - [ ] Guards y validaciones
  - [ ] Servicios de dominio
- [ ] Pruebas de integración (flujos críticos end-to-end en backend)
  - [ ] Flujo completo: crear solicitud → aprobar → generar PDF → validar QR
  - [ ] Flujo de rechazo y notificación
  - [ ] Flujo de corrección y reenvío
- [ ] Pruebas E2E del portal ciudadano (Playwright o Cypress)
- [ ] Optimización de consultas BD (EXPLAIN ANALYZE en queries críticos)
- [ ] Docker para producción (multi-stage builds)
- [ ] `docker-compose.prod.yml` con Nginx + SSL
- [ ] Configuración de CI/CD (GitHub Actions)
- [ ] Manual Técnico (`docs/MANUAL_TECNICO.md`)
- [ ] Manual de Usuario (`docs/MANUAL_USUARIO.md`)
- [ ] Guía de despliegue en producción (`docs/GUIA_DESPLIEGUE.md`)
- [ ] Datos de prueba para entorno de demo
- [ ] Revisión de seguridad final (checklist `SECURITY.md`)

---

## Progreso por Fase

> El progreso se calcula automáticamente contando tareas `[x]` completadas
> sobre el total de tareas de cada fase en `TASKS.md`. Sin porcentajes fijos.

| Fase | Descripción | Completadas | Total | Estado |
|------|-------------|:-----------:|:-----:|--------|
| Fase 0 | Fundamentos | 10 | 12 | 🟡 En progreso ← |
| Fase 1 | Base de Datos | 0 | 7 | ⬜ No iniciada |
| Fase 2 | Auth y Seguridad | 0 | 15 | ⬜ No iniciada |
| Fase 3 | Solicitudes Backend | 0 | 16 | ⬜ No iniciada |
| Fase 4 | Permisos PDF/QR | 0 | 14 | ⬜ No iniciada |
| Fase 5 | Frontend Ciudadano | 0 | 13 | ⬜ No iniciada |
| Fase 6 | Frontend Funcionario | 0 | 10 | ⬜ No iniciada |
| Fase 7 | Panel Admin | 0 | 12 | ⬜ No iniciada |
| Fase 8 | Calidad y Producción | 0 | 15 | ⬜ No iniciada |

**Duración total estimada:** 10 semanas para un equipo de 2–3 desarrolladores.

---

## Criterios de Completitud por Fase

Una fase se marca como completa cuando:
1. Todas las tareas de la fase están marcadas `[x]`.
2. Los tests correspondientes pasan.
3. `TASKS.md` está actualizado.
4. El código fue revisado (pull request aprobado).
5. Swagger refleja los endpoints nuevos.
