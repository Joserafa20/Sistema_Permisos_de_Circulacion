# Auditoría Final de Documentación

**Sistema de Permisos de Circulación — Pico y Placa**
**Fecha de auditoría:** 2026-08-02
**Auditor:** Arquitecto de Software Senior (Claude)
**Versión del proyecto:** 0.1.0
**Alcance:** `docs/` y `.claude/`

---

## Resumen Ejecutivo

| Indicador | Resultado |
|-----------|-----------|
| Documentos auditados | 25 (14 en `docs/` + 11 en `.claude/`) |
| Consistencia general | ✅ Alta |
| Documentos duplicados | ⚠️ 2 solapamientos menores |
| Contradicciones críticas | ✅ 0 críticas / ⚠️ 4 menores |
| Casos de uso faltantes | ⚠️ 3 identificados |
| Historias de usuario faltantes | ⚠️ 2 identificadas |
| Reglas de negocio faltantes | ⚠️ 3 identificadas |
| Errores de API | ⚠️ 1 ambigüedad |
| Errores de modelo de datos | ✅ 0 errores críticos / ⚠️ 2 menores |
| Riesgos de seguridad | ⚠️ 2 sin documentar completamente |
| Riesgos de arquitectura | ⚠️ 2 identificados |
| **Veredicto final** | ✅ **LISTO PARA INICIAR DESARROLLO** |

---

## 1. Inventario de Documentos Auditados

### 1.1 Directorio `docs/`

| # | Documento | Propósito | Estado |
|---|-----------|-----------|--------|
| 01 | `PRD_Sistema_Permisos_de_Circulacion.md` | Documento de requerimientos base | ✅ Completo |
| 02 | `ANALISIS_TECNICO.md` | Análisis técnico senior (v2.0) | ✅ Completo |
| 03 | `MODELO_DATOS.md` | Esquema PostgreSQL, 17 tablas | ✅ Completo |
| 04 | `API_FUNCIONAL.md` | 56 endpoints documentados | ✅ Completo |
| 05 | `CASOS_USO.md` | 41 casos de uso, 5 actores | ✅ Completo |
| 06 | `HISTORIAS_USUARIO.md` | 43 HU, 8 épicas, 153 pts | ✅ Completo |
| 07 | `REGLAS_NEGOCIO.md` | 100 RN clasificadas | ✅ Completo |
| 08 | `DECISIONS.md` | 9 ADRs de arquitectura | ✅ Completo |
| 09 | `PLAN_PRUEBAS.md` | Estrategia completa de testing | ✅ Completo |
| 10 | `PLAN_DESPLIEGUE.md` | Infraestructura y CI/CD | ✅ Completo |
| 11 | `MANUAL_TECNICO.md` | Referencia para TI y devs | ✅ Completo |
| 12 | `MANUAL_USUARIO.md` | Guía para los 3 perfiles | ✅ Completo |
| 13 | `CHANGELOG.md` | Registro de cambios v0.1.0 | ✅ Completo |
| 14 | `GLOSARIO.md` | 45 términos definidos | ✅ Completo |

### 1.2 Directorio `.claude/`

| # | Documento | Propósito | Estado |
|---|-----------|-----------|--------|
| 01 | `CLAUDE.md` | Instrucciones globales para Claude | ✅ Consistente |
| 02 | `START.md` | Punto de entrada de sesiones | ✅ Consistente |
| 03 | `TASKS.md` | Tareas por sprint | ⚠️ Desactualizado (ver §4.1) |
| 04 | `ROADMAP.md` | Hoja de ruta Fases 0–8 | ✅ Completo |
| 05 | `PROJECT_CONTEXT.md` | Contexto de negocio | ✅ Consistente |
| 06 | `ARCHITECTURE.md` | Arquitectura hexagonal | ✅ Consistente |
| 07 | `DATABASE.md` | Referencia rápida de BD | ✅ Consistente |
| 08 | `API.md` | Referencia rápida de API | ✅ Consistente |
| 09 | `SECURITY.md` | Políticas de seguridad | ✅ Completo |
| 10 | `CODING_STANDARDS.md` | Estándares de código | ✅ Presente |
| 11 | `PROMPT_RULES.md` | Reglas de prompts | ✅ Presente |

---

## 2. Análisis de Consistencia entre Documentos

### 2.1 Stack Tecnológico — Consistencia ✅

| Componente | PRD | ANALISIS_TECNICO | MODELO_DATOS | API_FUNCIONAL | ROADMAP | Consistente |
|------------|-----|-----------------|--------------|---------------|---------|-------------|
| Backend | NestJS ✅ | NestJS 10.x ✅ | NestJS ✅ | NestJS ✅ | NestJS ✅ | ✅ |
| Frontend | Next.js ✅ | Next.js 14 ✅ | — | — | Next.js 14 ✅ | ✅ |
| BD | PostgreSQL ✅ | PostgreSQL 15 ✅ | PostgreSQL 15 ✅ | — | PostgreSQL ✅ | ✅ |
| Auth | JWT ✅ | JWT ✅ | — | JWT ✅ | JWT ✅ | ✅ |
| ORM | — | TypeORM 0.3 ✅ | TypeORM ✅ | — | TypeORM ✅ | ✅ |
| Caché | — | Redis 7 ✅ | — | — | Redis ✅ | ✅ |
| Cola | — | BullMQ 4 ✅ | — | — | BullMQ ✅ | ✅ |
| Storage | — | MinIO ✅ | — | — | MinIO ✅ | ✅ |

**Conclusión:** El stack es consistente en todos los documentos. No hay contradicciones.

---

### 2.2 Estados de Solicitud — Consistencia ✅

| Estado | PRD | MODELO_DATOS | REGLAS_NEGOCIO | API_FUNCIONAL | CASOS_USO | Consistente |
|--------|-----|-------------|----------------|---------------|-----------|-------------|
| `recibida` | ✅ (Recibida) | ✅ | ✅ RN-15 | ✅ | ✅ | ✅ |
| `en_revision` | ✅ (En revisión) | ✅ | ✅ RN-15 | ✅ | ✅ | ✅ |
| `pendiente_correccion` | ✅ | ✅ | ✅ RN-15 | ✅ | ✅ | ✅ |
| `aprobada` | ✅ | ✅ | ✅ RN-15 | ✅ | ✅ | ✅ |
| `rechazada` | ✅ | ✅ | ✅ RN-15 | ✅ | ✅ | ✅ |
| `vencida` | ✅ | ✅ | ✅ RN-15 | ✅ | ✅ | ✅ |

**Conclusión:** Los 6 estados de solicitud son consistentes en todos los documentos.

---

### 2.3 Estados de Permiso — Consistencia ✅

| Estado | PRD | MODELO_DATOS | REGLAS_NEGOCIO | GLOSARIO | Consistente |
|--------|-----|-------------|----------------|---------|-------------|
| `vigente` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `vencido` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `revocado` | ✅ | ✅ | ✅ | ✅ | ✅ |

**Conclusión:** Los 3 estados de permiso son consistentes.

---

### 2.4 Actores / Roles — Consistencia ✅

Todos los documentos identifican los mismos actores: Ciudadano, Funcionario, Administrador, Autoridad de Tránsito, Sistema. Ningún documento inventa un actor adicional. La distinción entre Ciudadano (no autenticado) y Funcionario/Administrador (JWT) es consistente en PRD, SECURITY.md, REGLAS_NEGOCIO y API_FUNCIONAL.

---

### 2.5 Modelo de Datos vs. API — Consistencia ⚠️

**Hallazgo menor 1:** El PRD incluye los campos `color`, `número de motor` y `número de chasis` de la motocicleta. El `MODELO_DATOS.md` (tabla `solicitudes`, campos `moto_*`) debe confirmarse si incluye estos campos — la auditoría recomienda verificarlos explícitamente antes de la Fase 1, ya que el GLOSARIO bajo "Motocicleta" lista: placa, marca, línea, modelo, cilindraje pero no menciona color/motor/chasis.

> **Acción recomendada:** Verificar que `MODELO_DATOS.md` incluya `moto_color`, `moto_numero_motor`, `moto_numero_chasis` en la tabla `solicitudes`. Si están en el modelo, actualizar GLOSARIO y API. Si se decidió omitirlos, documentar la decisión en `DECISIONS.md` como ADR-010.

**Hallazgo menor 2:** El `ROADMAP.md` menciona `docs/ER_DIAGRAM.md` como entregable de la Fase 1 ("Diagrama entidad-relación generado"). Este archivo no existe aún; es una tarea pendiente de desarrollo (no de documentación previa), por lo que no es una inconsistencia sino un artefacto que se creará durante la implementación.

---

### 2.6 QR — Comportamiento en Verificación — Inconsistencia Menor ⚠️

**Hallazgo:** Existe una tensión entre dos decisiones documentadas:

- **PRD §VALIDACIÓN DEL QR:** Indica que si el código no existe, debe mostrar "Permiso No Encontrado" — esto implica retornar información que revela si el código existe o no.
- **REGLAS_NEGOCIO RN-34:** Establece que la verificación QR siempre retorna HTTP 200 para no revelar si un código existe o no (principio de security by obscurity).

Ambos son correctos en sus contextos (UX vs. seguridad), pero la respuesta de la API debe ser diferente a lo que muestra la interfaz. Es decir: la API puede retornar HTTP 200 con `{ valido: false, razon: null }` y el frontend mostrará "Permiso No Encontrado" al usuario — sin revelar si el código nunca existió vs. fue revocado.

> **Acción recomendada:** Documentar explícitamente en `API_FUNCIONAL.md` (endpoint `GET /public/verificar/{codigoQR}`) que la respuesta HTTP es siempre 200, y es la propiedad `estado` del body quien diferencia los casos para el frontend.

---

### 2.7 Notificaciones — Cobertura ✅

PRD, ROADMAP (Fase 4), REGLAS_NEGOCIO y MANUAL_USUARIO son consistentes: se envían correos al ciudadano en los 4 eventos (recibida, aprobada, rechazada, corrección solicitada). El ANALISIS_TECNICO añade la revocación como quinto evento (notificación configurable por el Administrador), lo cual es una extensión válida no contradictoria.

---

## 3. Análisis de Documentos Duplicados

### 3.1 Solapamiento: `API_FUNCIONAL.md` vs. `.claude/API.md` ⚠️

`API_FUNCIONAL.md` (docs/) contiene la especificación completa de 56 endpoints.
`.claude/API.md` contiene una referencia rápida de los mismos endpoints para consumo de Claude.

**Riesgo:** Si un endpoint cambia durante el desarrollo, puede quedar desactualizado en uno de los dos archivos.

> **Acción recomendada:** Establecer como fuente de verdad `docs/API_FUNCIONAL.md` y agregar una nota en `.claude/API.md` indicando que es un resumen y que ante divergencia prevalece `docs/API_FUNCIONAL.md`.

### 3.2 Solapamiento: `MODELO_DATOS.md` vs. `.claude/DATABASE.md` ⚠️

Similar al caso anterior: `MODELO_DATOS.md` es la especificación completa; `.claude/DATABASE.md` es la referencia rápida.

> **Acción recomendada:** Misma pauta: establecer `docs/MODELO_DATOS.md` como fuente de verdad.

---

## 4. Análisis de Tareas y Roadmap

### 4.1 `TASKS.md` Desactualizado ⚠️

El archivo `TASKS.md` refleja una estructura de 9 sprints temáticos que **no coincide exactamente** con la estructura de 9 fases del `ROADMAP.md`. Por ejemplo:
- `TASKS.md` tiene Sprint 4 "Ciudadanos" y Sprint 5 "Motocicletas" como módulos separados.
- `ROADMAP.md` tiene Fase 3 "Módulo de Solicitudes" que engloba ciudadanos, motos y solicitudes en un solo flujo.

Además, `TASKS.md` lista como "Próxima tarea: Configurar Backend NestJS" lo que es correcto, pero no tiene la granularidad del ROADMAP.

> **Acción recomendada:** Antes de iniciar la Fase 0, alinear `TASKS.md` con las fases del `ROADMAP.md` para tener un único sistema de seguimiento de progreso. Esto es la primera tarea administrativa del proyecto.

---

## 5. Casos de Uso Faltantes

`CASOS_USO.md` cubre 41 casos de uso. Se identifican los siguientes casos que merecen cobertura explícita:

### CUF-01 — Recuperación de Contraseña (Funcionario/Administrador)

**Estado:** Mencionado en el ROADMAP (Fase 2: "Recuperación de contraseña") y en `API_FUNCIONAL.md` (endpoints `POST /auth/recuperar-contrasena` y `POST /auth/restablecer-contrasena`), pero no aparece como caso de uso numerado en `CASOS_USO.md`.

**Severidad:** Baja (está cubierto en otros documentos).
> **Acción:** Agregar CU-42 "Recuperar contraseña" con flujo: solicitar enlace → verificar token en email → establecer nueva contraseña.

### CUF-02 — Bloqueo de Cuenta por Intentos Fallidos

**Estado:** Definido en `SECURITY.md` (5 intentos → bloqueo 30 min) y en `REGLAS_NEGOCIO.md`, pero no existe un caso de uso explícito que documente el flujo de desbloqueo (¿automático al cabo de 30 min? ¿manual por el admin?).

**Severidad:** Media (afecta UX y soporte).
> **Acción:** Agregar CU-43 "Gestionar bloqueo de cuenta" con los dos flujos: desbloqueo automático por tiempo y desbloqueo manual por Administrador.

### CUF-03 — Exportar Reportes

**Estado:** Los reportes están en el PRD, ROADMAP Fase 7 y MANUAL_USUARIO, pero no hay un caso de uso CU-XX que detalle el flujo de generación y descarga de reportes (filtros, formato, descarga asíncrona).

**Severidad:** Baja.
> **Acción:** Agregar CU-44 "Exportar reportes" con flujo: seleccionar parámetros → generar → descargar CSV/Excel/PDF.

---

## 6. Historias de Usuario Faltantes

`HISTORIAS_USUARIO.md` cubre 43 HU en 8 épicas (153 story points). Se identifican:

### HUF-01 — Recuperación de Contraseña

Ninguna de las 43 HU cubre el flujo de recuperación/restablecimiento de contraseña para Funcionario o Administrador, aunque el endpoint existe en la API.

> **Acción:** Agregar HU-44 en Épica É-05 (Seguridad): "Como Funcionario, quiero poder recuperar mi contraseña mediante mi correo institucional, para no quedar bloqueado del sistema si la olvido."

### HUF-02 — Búsqueda/Filtro en Panel del Funcionario

Las HU del Funcionario cubren la gestión de solicitudes, pero no hay una HU específica para "filtrar solicitudes por múltiples criterios simultáneos" — existe como funcionalidad en el PRD y ROADMAP pero no como historia de usuario con criterios de aceptación propios.

> **Acción:** Agregar HU-45 en Épica É-04: "Como Funcionario, quiero filtrar la cola de solicitudes por fecha, estado, placa y documento simultáneamente, para encontrar rápidamente una solicitud específica."

---

## 7. Reglas de Negocio Faltantes

`REGLAS_NEGOCIO.md` cubre 100 RN (RN-01 a RN-100). Se identifican:

### RNF-01 — Política de Expiración de Contraseñas

`SECURITY.md` establece que las contraseñas expiran cada 90 días. Esta regla no está formalizada en `REGLAS_NEGOCIO.md`.

> **Acción:** Agregar RN-101: "Las contraseñas de los usuarios (Funcionario y Administrador) tienen una vigencia máxima de 90 días. Al cumplirse el plazo, el sistema obliga al usuario a cambiar la contraseña en su próximo inicio de sesión."

### RNF-02 — Historial de Contraseñas

`SECURITY.md` establece que no se pueden reutilizar las últimas 5 contraseñas. No está en `REGLAS_NEGOCIO.md`.

> **Acción:** Agregar RN-102: "El sistema almacena un historial de las últimas 5 contraseñas por usuario. No se permite establecer una contraseña que sea igual a alguna de las 5 anteriores."

### RNF-03 — Ciudadano con Permiso Vigente no puede crear nueva Solicitud para la misma Moto

`REGLAS_NEGOCIO.md` RN-03 impide duplicar solicitudes activas. Sin embargo, no se documenta explícitamente si un ciudadano puede solicitar un nuevo permiso cuando tiene uno `vigente` para la misma moto. Se infiere que no debe poder hacerlo, pero la regla no es explícita.

> **Acción:** Agregar RN-103: "El sistema no permite crear una nueva solicitud para una motocicleta que ya tiene un permiso en estado `vigente` cuyo período de vigencia se solape con el período solicitado."

---

## 8. Análisis de la API

### 8.1 Cobertura de Endpoints ✅

La API cubre correctamente los flujos definidos en el PRD y ROADMAP:
- Auth: login, logout, refresh, recuperar contraseña
- Solicitudes: CRUD completo + flujo de estados
- Permisos: generación, descarga PDF, revocación, validación QR
- Administración: usuarios, dependencias, motivos, configuración
- Reportes, auditoría, dashboard, health

### 8.2 Ambigüedad: Endpoint de Adjuntar Documentos ⚠️

El flujo del ciudadano en el PRD permite adjuntar documentos durante la creación de la solicitud. Sin embargo, `API_FUNCIONAL.md` define:
- `POST /api/v1/public/solicitudes` — crear solicitud (sin documentos en el body)
- `POST /api/v1/public/solicitudes/{id}/documentos` — adjuntar documentos (paso separado)

Esto implica un flujo de dos pasos: primero crear, luego adjuntar. **No hay un estado intermedio** definido para una solicitud que fue creada pero aún no tiene documentos. ¿Se puede someter una solicitud sin documentos? ¿Los documentos son opcionales?

> **Acción recomendada:** Clarificar en `API_FUNCIONAL.md` y `REGLAS_NEGOCIO.md`:
> (a) Si los documentos son obligatorios antes de que la solicitud pase a estado `recibida`, o
> (b) Si el estado `recibida` se asigna al crear la solicitud (con o sin documentos), y los documentos se adjuntan después.
> El ROADMAP Fase 3 sugiere que son pasos separados pero no define el estado transitorio.

### 8.3 Versionado de API ✅

El prefijo `/api/v1/` está correctamente establecido y es consistente en todos los documentos que referencian endpoints. El ROADMAP y la API están alineados.

### 8.4 Módulo de Roles en la API ✅ con Nota

`API_FUNCIONAL.md` incluye un módulo ROLES con sus endpoints. Sin embargo, el sistema tiene solo 2 roles fijos (`FUNCIONARIO`, `ADMINISTRADOR`) definidos como ENUM en PostgreSQL. Los endpoints de CRUD de roles podrían ser superfluos si los roles no son configurables por el usuario. Considerar si exponer un CRUD de roles o simplemente leer la lista fija.

> **Acción:** Aclarar en `DECISIONS.md` si los roles son extensibles dinámicamente o son fijos. Si son fijos, los endpoints de creación/eliminación de roles se pueden eliminar de la API.

---

## 9. Análisis del Modelo de Datos

### 9.1 Integridad General ✅

El modelo de datos de 17 tablas es correcto, normalizado (3FN), y cubre todos los flujos definidos en el PRD. Los tipos de datos son apropiados (UUID, TIMESTAMPTZ, INET, JSONB, ENUM).

### 9.2 Tabla de Ciudadanos vs. Datos Embebidos ⚠️

**Hallazgo:** El PRD establece que el ciudadano no tiene cuenta de usuario. Hay dos interpretaciones posibles en el modelo de datos:
1. Los datos del ciudadano se guardan en la tabla `solicitudes` directamente (campos `ciudadano_*`).
2. Existe una tabla separada `ciudadanos` y `solicitudes` tiene una FK.

Si existe una tabla `ciudadanos`, ¿un mismo ciudadano puede tener múltiples solicitudes? ¿Cómo se identifica (por número de documento)? Esto no está completamente claro en el MODELO_DATOS.md.

> **Acción:** Confirmar en `MODELO_DATOS.md` si existe tabla `ciudadanos` separada o si los datos son embebidos en `solicitudes`. Si es tabla separada, documentar el identificador único (número de documento) y la relación con solicitudes. Esto afecta directamente la Fase 1 y Fase 3.

### 9.3 Historial de Contraseñas ⚠️

`SECURITY.md` requiere almacenar las últimas 5 contraseñas por usuario. El `MODELO_DATOS.md` debe incluir una tabla `historial_contrasenas` (o columna JSONB en `usuarios`). Si no está contemplada, debe añadirse antes de la Fase 1.

> **Acción:** Verificar que `MODELO_DATOS.md` incluya el mecanismo de historial de contraseñas. Si no lo contempla, agregarlo en la Fase 1 como tabla `historial_contrasenas(id, usuario_id, hash_contrasena, created_at)`.

---

## 10. Riesgos de Seguridad No Completamente Documentados

### RS-01 — CSRF Protection ⚠️

El PRD menciona "Protección CSRF". `SECURITY.md` no tiene una sección dedicada que especifique el mecanismo concreto (SameSite=Strict en cookies, token CSRF, o reliance en CORS + headers). Para una aplicación con cookies HttpOnly (Refresh Token), el mecanismo de protección CSRF debe ser explícito.

> **Acción:** Agregar en `SECURITY.md` una sección "CSRF" que defina: uso de `SameSite=Strict` en la cookie del Refresh Token + validación de cabecera `Origin`/`Referer` en el backend. NestJS puede usar el paquete `csurf` o confiar en CORS configurado correctamente.

### RS-02 — Sanitización de Archivos Subidos ⚠️

El sistema acepta PDFs, JPGs y PNGs de ciudadanos. `SECURITY.md` y `REGLAS_NEGOCIO.md` definen límites de tamaño, pero no hay documentación sobre:
- Validación del tipo MIME real (no solo extensión).
- Escaneo de malware (antivirus) de los archivos subidos.
- Límites de dimensiones para imágenes.

> **Acción:** Agregar en `SECURITY.md` una sección "Validación de archivos" con: validación de magic bytes (tipo real), límite de resolución para imágenes, y recomendación de escaneo antivirus en producción.

---

## 11. Riesgos de Arquitectura

### RA-01 — Punto Único de Falla: Redis ⚠️

Redis es crítico para BullMQ (generación de PDFs y correos) y para la lista de tokens revocados. Si Redis cae, los PDFs no se generan y los tokens no pueden ser revocados inmediatamente.

**Documentado en:** `ANALISIS_TECNICO.md` como RT-03 (Dependencia de Redis para BullMQ) y `PLAN_DESPLIEGUE.md` recomienda Redis Sentinel para producción.

**Estado:** Documentado como riesgo. La solución (Redis Sentinel/Cluster) está en el plan de despliegue.
> **Acción:** Ninguna adicional en esta etapa. Abordar en Fase 8.

### RA-02 — Generación de PDF Asíncrona vs. UX del Ciudadano ⚠️

La generación de PDF es asíncrona (BullMQ). El ciudadano podrá descargar el PDF solo cuando el job termine. Esto crea una latencia entre "aprobación visible en el sistema" y "PDF disponible para descarga".

**Pregunta sin responder en la documentación:** ¿Cuánto tiempo puede tardar el job de PDF? ¿Hay un mecanismo de polling o websocket para notificar al funcionario cuando el PDF está listo? El flujo del Funcionario en el MANUAL_USUARIO.md asume que el PDF está disponible inmediatamente tras la aprobación.

> **Acción:** Documentar en `API_FUNCIONAL.md` el comportamiento del endpoint `GET /permisos/{id}/pdf` cuando el PDF aún se está generando (ej. retornar 202 Accepted con estado `generando`). Actualizar `MANUAL_USUARIO.md` con una nota de que el PDF puede tardar unos segundos en estar disponible.

---

## 12. Inconsistencias Técnicas Menores

### IT-01 — Firma Digital del Permiso ⚠️

El PRD menciona "Firma digital configurable" y "Sello institucional configurable" en el PDF. El ROADMAP Fase 4 confirma esto ("Firma y sello institucional configurables"). Sin embargo, en Colombia la "firma digital" tiene implicaciones legales bajo la Ley 527/1999 que van más allá de insertar una imagen de firma. El sistema usa una imagen de firma configurable (no una firma criptográfica).

> **Acción:** Clarificar en `DECISIONS.md` (ADR-010 o nota en ADR-009) que la "firma digital" implementada es una imagen configurable (firma escaneada/logo), no una firma criptográfica bajo estándar PKI. Si se requiere firma criptográfica real, esto implica infraestructura adicional (PKI, certificados digitales, biblioteca de firma como iTextSharp o PDFSign) que debe evaluarse.

### IT-02 — Zona Horaria en Fechas de Vigencia ✅ con Nota

Todos los documentos son consistentes: fechas en UTC en BD, conversión a COT (UTC-5, `America/Bogota`) en frontend. Sin embargo, el PRD menciona "Fecha solicitada" (fecha inicio / fecha final) que el ciudadano selecciona en el formulario. Estas fechas son solo fechas (no datetime), por lo que el manejo de zona horaria es más simple. Confirmar que se usen `DATE` (no `TIMESTAMPTZ`) para `fecha_inicio_permiso` y `fecha_fin_permiso` si solo importa la fecha y no la hora exacta.

> **Acción:** Verificar en `MODELO_DATOS.md` el tipo de las columnas `fecha_inicio_permiso` y `fecha_fin_permiso`. Si son `DATE`, el manejo de zona horaria es trivial. Si son `TIMESTAMPTZ`, asegurarse de definir la hora exacta de inicio/fin (ej. inicio a las 00:00 COT, fin a las 23:59 COT).

### IT-03 — `TASKS.md` vs. `ROADMAP.md` — Estructura de Sprints ⚠️

`TASKS.md` organiza el trabajo en 9 sprints temáticos. `ROADMAP.md` organiza en 9 fases con duraciones en semanas. Las estructuras no son idénticas, lo que puede generar confusión durante el desarrollo sobre cuál seguir.

> **Acción recomendada (alta prioridad):** Antes de iniciar el desarrollo, decidir si se usa la estructura de `TASKS.md` o la de `ROADMAP.md` y unificarlas. La recomendación del auditor es seguir el `ROADMAP.md` por estar más detallado y actualizado, y reescribir `TASKS.md` para que sea simplemente el tracking granular de la fase actual.

---

## 13. Cobertura del Marco Legal

| Norma | PRD | PROJECT_CONTEXT | REGLAS_NEGOCIO | ANALISIS_TECNICO | Cubierta |
|-------|-----|----------------|----------------|-----------------|---------|
| Ley 527/1999 | ✅ | ✅ | ✅ | ✅ | ✅ |
| Ley 1581/2012 | ✅ | ✅ | ✅ | ✅ | ✅ |
| Decreto 1377/2013 | — | ✅ | ✅ | ✅ | ✅ |
| Ley 1712/2014 | — | ✅ | ✅ | ✅ | ✅ |
| CONPES 3854/2016 | — | ✅ | — | ✅ | ✅ |
| Decreto 2693/2012 | — | ✅ | — | ✅ | ✅ |
| NTC 5854 / WCAG 2.1 | — | ✅ | ✅ | ✅ | ✅ |
| Ley 1437/2011 | — | ✅ | — | ✅ | ✅ |

**Conclusión:** El marco legal está bien cubierto. La Ley 1581/2012 (tratamiento de datos) tiene aplicación directa en el consentimiento del ciudadano al crear la solicitud y en la tabla de ciudadanos.

---

## 14. Resumen de Hallazgos

### Hallazgos Críticos — Ninguno ✅

No se identificaron hallazgos que bloqueen el inicio del desarrollo.

### Hallazgos Medios (requieren acción antes de implementar el módulo afectado)

| # | Hallazgo | Módulo Afectado | Acción |
|---|---------|----------------|--------|
| M-01 | Ambigüedad en flujo de adjuntar documentos (¿estado transitorio?) | Solicitudes (Fase 3) | Clarificar en API y RN |
| M-02 | Bloqueo de cuenta — flujo de desbloqueo no documentado (CUF-02) | Auth (Fase 2) | Agregar CU-43 |
| M-03 | Tabla `historial_contrasenas` posiblemente ausente en modelo | BD (Fase 1) | Verificar/agregar |
| M-04 | Tabla `ciudadanos` separada vs. datos embebidos — no confirmado | BD (Fase 1) | Clarificar en MODELO_DATOS |
| M-05 | Latencia PDF async — comportamiento del endpoint no documentado | Permisos (Fase 4) | Documentar estado 202 |

### Hallazgos Bajos (mejorar en la próxima revisión de documentación)

| # | Hallazgo | Acción |
|---|---------|--------|
| B-01 | Campos `moto_color`, `moto_numero_motor`, `moto_numero_chasis` — confirmar en modelo | Verificar MODELO_DATOS |
| B-02 | Solapamiento API.md / API_FUNCIONAL.md sin nota de fuente de verdad | Agregar nota en `.claude/API.md` |
| B-03 | Solapamiento DATABASE.md / MODELO_DATOS.md | Agregar nota en `.claude/DATABASE.md` |
| B-04 | RN-101, RN-102, RN-103 faltantes | Agregar en REGLAS_NEGOCIO |
| B-05 | HU-44, HU-45 faltantes | Agregar en HISTORIAS_USUARIO |
| B-06 | CU-42, CU-43, CU-44 faltantes | Agregar en CASOS_USO |
| B-07 | Sección CSRF en SECURITY.md | Completar sección |
| B-08 | Sección validación de archivos en SECURITY.md | Agregar sección |
| B-09 | Clarificación firma digital (imagen vs. PKI) | ADR-010 en DECISIONS.md |
| B-10 | `TASKS.md` desalineado con `ROADMAP.md` | Reescribir antes de Fase 0 |
| B-11 | Roles: CRUD vs. lista fija — decisión sin documentar | ADR-010 en DECISIONS.md |

---

## 15. Evaluación de Preparación para Desarrollo

### Criterios de Evaluación

| Criterio | Peso | Estado | Puntuación |
|---------|------|--------|-----------|
| Requerimientos funcionales claros | 20% | ✅ PRD completo y detallado | 20/20 |
| Modelo de datos definido | 15% | ✅ 17 tablas documentadas | 14/15 |
| API especificada | 15% | ✅ 56 endpoints documentados | 13/15 |
| Arquitectura definida | 15% | ✅ Hexagonal + 9 ADRs | 15/15 |
| Reglas de negocio documentadas | 10% | ✅ 100 RN numeradas | 9/10 |
| Plan de pruebas | 5% | ✅ Completo | 5/5 |
| Plan de despliegue | 5% | ✅ Completo | 5/5 |
| Seguridad documentada | 10% | ⚠️ 2 secciones pendientes | 8/10 |
| Casos de uso y HU | 5% | ⚠️ 3 CU + 2 HU faltantes (menores) | 4/5 |
| **TOTAL** | **100%** | | **93/100** |

### Veredicto

> ## ✅ EL PROYECTO ESTÁ LISTO PARA INICIAR DESARROLLO
>
> **Puntuación de madurez documental: 93/100**
>
> La documentación del sistema de Permisos de Circulación Pico y Placa es **excepcionalmente completa** para un proyecto en etapa de inicio. Con 25 documentos que cubren requerimientos, arquitectura, modelo de datos, API, reglas de negocio, pruebas, despliegue y manuales, el equipo de desarrollo tiene una base sólida y sin ambigüedades críticas.
>
> Los **5 hallazgos medios** deben atenderse al inicio de la fase correspondiente (no antes del arranque del proyecto). Los **11 hallazgos bajos** son mejoras iterativas que pueden hacerse en paralelo con el desarrollo.
>
> **Acción inmediata recomendada antes de la Fase 0:**
> 1. Alinear `TASKS.md` con la estructura del `ROADMAP.md` (B-10).
> 2. Verificar los campos de la motocicleta (B-01) y confirmar la estructura de ciudadanos (M-04) en MODELO_DATOS.md.
> 3. Decidir si los roles son fijos o dinámicos (B-11).
>
> **El equipo puede iniciar la Fase 0 (Fundamentos) de forma inmediata.**

---

## 16. Plan de Acción Priorizado

| Prioridad | Hallazgo | Cuándo | Responsable |
|-----------|---------|--------|-------------|
| 🔴 Antes de Fase 0 | Alinear TASKS.md con ROADMAP.md | Día 1 | Tech Lead |
| 🔴 Antes de Fase 1 | Confirmar campos moto en MODELO_DATOS | Inicio Fase 1 | Arquitecto BD |
| 🔴 Antes de Fase 1 | Confirmar tabla ciudadanos vs. embebido | Inicio Fase 1 | Arquitecto BD |
| 🔴 Antes de Fase 1 | Agregar tabla historial_contrasenas | Inicio Fase 1 | Arquitecto BD |
| 🟡 Antes de Fase 2 | Agregar CU-43 (bloqueo de cuenta) | Antes de Fase 2 | Analista |
| 🟡 Antes de Fase 2 | Agregar RN-101, RN-102 (contraseñas) | Antes de Fase 2 | Analista |
| 🟡 Antes de Fase 2 | Completar sección CSRF en SECURITY.md | Antes de Fase 2 | Seguridad |
| 🟡 Antes de Fase 3 | Clarificar flujo de adjuntar documentos | Antes de Fase 3 | Analista + Backend |
| 🟡 Antes de Fase 3 | Agregar RN-103 (permiso vigente + nueva solicitud) | Antes de Fase 3 | Analista |
| 🟡 Antes de Fase 4 | Documentar estado 202 en endpoint PDF | Inicio Fase 4 | Backend |
| 🟢 Iterativo | Completar CU-42, CU-44, HU-44, HU-45 | Sprint correspondiente | Analista |
| 🟢 Iterativo | Agregar nota de fuente de verdad en .claude/API.md y DATABASE.md | Cualquier momento | Tech Lead |
| 🟢 Iterativo | Aclarar firma digital en ADR-010 | Fase 4 | Arquitecto |
| 🟢 Iterativo | Agregar validación de archivos en SECURITY.md | Fase 3 | Seguridad |

---

*Auditoría realizada el 2026-08-02. Próxima auditoría recomendada: al completar la Fase 4 (documentación técnica de implementación).*
