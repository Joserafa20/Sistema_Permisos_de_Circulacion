# Análisis Técnico — Sistema de Permisos de Circulación (Pico y Placa)

**Versión:** 2.0  
**Fecha:** 2026-08-02  
**Rol:** Arquitecto de Software Senior  
**Referencia:** `docs/PRD_Sistema_Permisos_de_Circulacion.md` · `docs/MODELO_DATOS.md` · `docs/API_FUNCIONAL.md` · `docs/CASOS_USO.md` · `docs/REGLAS_NEGOCIO.md`

---

## 1. Resumen Ejecutivo

El Sistema de Permisos de Circulación Pico y Placa es una plataforma web empresarial destinada a digitalizar completamente el trámite de solicitud, revisión, aprobación y verificación de permisos de circulación de motocicletas para una alcaldía colombiana. El sistema atiende a tres perfiles de usuario: ciudadanos (acceso público sin autenticación), funcionarios de la alcaldía (autenticación JWT) y administradores del sistema (JWT con rol de alto privilegio). Adicionalmente, las autoridades de tránsito pueden verificar la autenticidad de los permisos mediante escaneo de código QR sin necesidad de autenticarse.

Desde una perspectiva técnica, el proyecto está bien dimensionado para un equipo de 2 a 3 desarrolladores con una duración estimada de 10 semanas. La arquitectura hexagonal propuesta es apropiada para la complejidad del dominio. El modelo de datos cubre los requerimientos funcionales con solidez. Las principales áreas de atención técnica son: la generación asíncrona de PDFs bajo alta concurrencia, la seguridad del almacenamiento de documentos sensibles y el cumplimiento de la legislación colombiana de protección de datos (Ley 1581/2012).

**Valoración General:** Sistema viable, bien documentado y técnicamente coherente. Listo para iniciar el desarrollo con las precisiones y recomendaciones descritas en este documento.

---

## 2. Objetivo del Sistema

### 2.1 Objetivo Principal

Proveer a la alcaldía de una plataforma digital para la gestión integral del ciclo de vida de los permisos de circulación de motocicletas durante las restricciones de Pico y Placa, eliminando la necesidad de trámites presenciales y garantizando la trazabilidad, autenticidad y cumplimiento legal de cada permiso emitido.

### 2.2 Objetivos Específicos

| # | Objetivo | Indicador de Éxito |
|---|---------|-------------------|
| 1 | Digitalizar el 100% del trámite de solicitud de permiso | Cero formularios físicos requeridos |
| 2 | Reducir el tiempo promedio de respuesta a menos de 48 horas | Medido en el dashboard por funcionario |
| 3 | Garantizar la autenticidad de los permisos mediante QR | Tasa de falsos positivos en validación QR = 0% |
| 4 | Cumplir con la Ley 1581/2012 de protección de datos | Auditoría legal superada |
| 5 | Proveer trazabilidad total de cada acción del sistema | Bitácora de auditoría inmutable y consultable |
| 6 | Generar documentos PDF institucionales con validez legal | PDF con firma, sello y código QR verificable |

### 2.3 Alcance del Sistema

**Incluido:**
- Portal web ciudadano: formulario, consulta de estado, descarga de permiso.
- Panel de gestión para funcionarios: cola, revisión, aprobación, rechazo, corrección.
- Panel de administración: usuarios, configuración, reportes, auditoría.
- Generación asíncrona de PDF + QR institucional.
- Verificación pública de permisos por código QR (autoridades de tránsito).
- Notificaciones por correo electrónico.
- API REST documentada con Swagger.

**Excluido del alcance:**
- Integración con el RUNT para validación de vehículos en tiempo real.
- Integración con Secretaría de Tránsito para verificación de antecedentes.
- App móvil nativa para ciudadanos.
- Pasarela de pagos (el trámite es gratuito según PRD).
- Sistema de turnos o citas presenciales.

---

## 3. Análisis del PRD

### 3.1 Consistencia del Documento

El PRD es un documento base sólido que establece correctamente los actores, los flujos principales y los requisitos técnicos del stack. Las brechas identificadas en la versión 1.0 del análisis fueron abordadas en la documentación complementaria:

| Aspecto | Estado en PRD | Estado actual |
|---------|--------------|---------------|
| Mecanismo de identidad del ciudadano | Sin definir | Resuelto: radicado + número de documento |
| Seguridad del almacenamiento de archivos | Sin definir | Resuelto: URLs firmadas TTL 5 min + MinIO privado |
| Cumplimiento Ley 1581 | Mencionado sin implementación | Resuelto: `acepta_tratamiento_datos` + CHECK constraint |
| Formato exacto del código QR | Sin definir | Resuelto: UUID + SHA-256 con salt secreto |
| Flujo de corrección de solicitudes | Ambiguo | Resuelto: estado `pendiente_correccion` + campos editables |
| Proceso asíncrono de generación de PDF | Sin definir | Resuelto: BullMQ + workers con retry |
| Reglas de negocio del sistema | Implícitas | Resuelto: 100 reglas documentadas en REGLAS_NEGOCIO.md |

### 3.2 Actores Derivados del Análisis

El PRD define tres actores principales. El análisis técnico añade:
- **Autoridad de Tránsito:** verifica permisos en campo mediante QR.
- **Sistema (automatizado):** ejecuta jobs programados (vencimientos, colas).

### 3.3 Alineación con el Stack Propuesto

El stack tecnológico propuesto (NestJS + Next.js + PostgreSQL) es apropiado y maduro para el tipo de aplicación. La arquitectura hexagonal añade complejidad inicial pero es la elección correcta para garantizar mantenibilidad institucional a largo plazo.

---

## 4. Fortalezas

### 4.1 Fortalezas de Arquitectura

| Fortaleza | Impacto |
|-----------|---------|
| Arquitectura Hexagonal | Separación clara entre dominio, puertos y adaptadores. Facilita tests unitarios y cambio de infraestructura sin afectar el negocio. |
| Procesamiento Asíncrono con BullMQ | La generación de PDFs y el envío de correos no bloquean los endpoints. Escala con workers adicionales. |
| Snapshots JSONB en `permisos` | Captura del estado de datos al momento de la aprobación. Garantiza inmutabilidad e integridad del permiso emitido, similar a un registro notarial. |
| Soft Delete Universal | Uso consistente de `deleted_at` en tablas transaccionales. Trazabilidad sin pérdida de datos históricos. |
| Auditoría Append-Only | Restricción a nivel de BD (solo INSERT + SELECT en `auditoria`). Cumple con Ley 1712/2014. |
| QR Opaco | Identificador UUID + hash SHA-256 previene enumeración de permisos y no expone datos personales. |
| 17 módulos NestJS | División modular que facilita escalabilidad horizontal y asignación de trabajo en el equipo. |

### 4.2 Fortalezas de Seguridad

| Fortaleza | Impacto |
|-----------|---------|
| JWT con rotación de Refresh Tokens | Access token de 15 min + Refresh token de 7 días con rotación en cada uso. Mitiga el robo de sesión. |
| BCrypt 12 rounds | Costoso computacionalmente. Resistente a ataques de diccionario y rainbow tables. |
| Rate limiting granular por endpoint | Límites específicos con valores apropiados para cada caso de uso. |
| URLs firmadas con TTL | Ningún archivo en storage es accesible directamente. Siempre a través de URLs temporales de 5 minutos. |
| Bloqueo de cuenta progresivo | 5 intentos fallidos → 30 min de bloqueo. Equilibrio entre seguridad y usabilidad. |

### 4.3 Fortalezas de Datos

| Fortaleza | Impacto |
|-----------|---------|
| Modelo normalizado en 17 tablas | FK con ON DELETE RESTRICT. Constraints que garantizan integridad referencial. |
| 25 índices optimizados | 21 regulares + 4 parciales cubren los patrones de consulta más frecuentes. |
| ENUM nativos de PostgreSQL | Solo valores válidos son almacenables en campos de estado. |
| TIMESTAMPTZ en todas las fechas | Consistencia temporal. Evita errores de zona horaria (DST). |
| Secuencia PostgreSQL para números de permiso | Números consecutivos únicos sin condiciones de carrera. |

---

## 5. Debilidades

| ID | Debilidad | Severidad | Recomendación |
|----|-----------|-----------|---------------|
| D-01 | Sin estrategia de caché para consultas públicas del portal | Media | Caché Redis para `GET /public/solicitudes/estado` con TTL de 30 segundos |
| D-02 | Sin paginación en el historial de estados | Baja | Paginación opcional con limit/offset en el endpoint de historial |
| D-03 | Sin interfaz para gestionar la Dead Letter Queue de BullMQ | Media | Vista en el panel admin para monitorear y reintentar jobs fallidos |
| D-04 | Sin validación cruzada de todos los pasos al hacer submit | Media | Validación completa del formulario en el backend al recibir la solicitud |
| D-05 | Sin gestión de festivos colombianos para cálculo de días hábiles | Alta | Tabla `festivos` en BD o librería `date-holidays` |
| D-06 | Sin rollback del consecutivo de permiso tras fallo del PDF job | Baja | Aceptable por diseño; documentar que los números pueden no ser estrictamente consecutivos |
| D-07 | Sin escaneo de antivirus en archivos adjuntos | Alta | Integrar ClamAV en el worker de storage antes de marcar el archivo como disponible |

---

## 6. Riesgos Técnicos

| ID | Riesgo | Prob. | Impacto | Mitigación |
|----|--------|:-----:|:-------:|-----------|
| RT-01 | Saturación de workers de PDF bajo alta concurrencia simultánea | Media | Alto | Escalar workers horizontalmente. Monitorear tamaño de cola con alertas. |
| RT-02 | Corrupción del PDF entre la generación y la subida a MinIO | Baja | Alto | Verificar hash SHA-256 después de la subida. Reintentar si no coincide. |
| RT-03 | Pérdida de mensajes en BullMQ por fallo de Redis | Baja | Alto | Redis con persistencia AOF habilitada. Backup periódico. |
| RT-04 | Degradación de rendimiento de tabla `auditoria` a 5 años | Media | Medio | Particionamiento por fecha desde el inicio (`PARTITION BY RANGE`). |
| RT-05 | Dependencia de disponibilidad de reCAPTCHA de Google | Baja | Medio | Fallback: si CAPTCHA no responde en 5s, permitir envío con flag para revisión manual. |
| RT-06 | Fallo del proveedor de correo electrónico | Media | Medio | Proveedor SMTP alternativo como fallback en la cola de notificaciones. |
| RT-07 | Fuga del JWT secret o del salt del QR | Muy Baja | Crítico | Gestión de secretos (Vault, Secrets Manager). Rotación periódica del JWT secret. |
| RT-08 | Inconsistencia de zona horaria entre servidor y negocio | Media | Alto | Servidor configurado en UTC. Conversión a COT solo en presentación. Job cron en COT. |

---

## 7. Riesgos de Seguridad

| ID | Riesgo | Prob. | Impacto | Mitigación |
|----|--------|:-----:|:-------:|-----------|
| RS-01 | Exposición de `storage_key` a través de logs del servidor | Media | Alto | Sanitizador global de logs. Revisión en code review. |
| RS-02 | Enumeración de radicados para obtener datos de ciudadanos | Media | Alto | Rate limiting 10/min/IP. Respuesta idéntica para radicado inexistente vs. documento incorrecto. |
| RS-03 | Inyección en templates del PDF con caracteres especiales | Media | Alto | Sanitizar todos los campos antes del template. Escape de caracteres especiales. |
| RS-04 | IDOR: un funcionario accede a solicitudes de otra dependencia | Baja | Alto | Filtro por `dependencia_id` del funcionario autenticado. |
| RS-05 | Token de recuperación de contraseña predecible | Muy Baja | Alto | `crypto.randomBytes(32).toString('hex')` para tokens de recuperación. |
| RS-06 | Upload de archivos maliciosos disfrazados de PDF/JPG | Media | Alto | Validar content-type en servidor (no en cliente). Renombrar con UUID. Escanear con ClamAV. |
| RS-07 | XSS en el panel de funcionarios a través de datos del ciudadano | Media | Alto | Sanitizar toda salida en frontend. CSP estricta. |
| RS-08 | Session fixation tras reset de contraseña | Baja | Alto | Revocar todos los refresh tokens del usuario al restablecer la contraseña. |
| RS-09 | Abuso del endpoint de recuperación de contraseña para spam | Media | Bajo | Rate limiting 3 solicitudes/hora/IP. El correo es asíncrono y no bloquea. |

---

## 8. Riesgos Operativos

| ID | Riesgo | Prob. | Impacto | Mitigación |
|----|--------|:-----:|:-------:|-----------|
| RO-01 | Alta demanda estacional en temporadas de festivos | Media | Alto | Escalar workers horizontalmente. Monitoreo de cola BullMQ. |
| RO-02 | Operación del sistema sin personal técnico de TI disponible | Alta | Alto | Documentación exhaustiva. Scripts de mantenimiento automatizados. Alertas proactivas. |
| RO-03 | Cambios en normativa de Pico y Placa por decreto municipal | Media | Medio | Tabla `configuracion` permite ajustes sin modificar código. |
| RO-04 | Pérdida de PDFs almacenados en MinIO | Baja | Crítico | Replicación de MinIO en modo distribuido. Backup diario a storage externo. |
| RO-05 | Fallo del cron de vencimiento automático sin alertas | Media | Medio | Monitoreo del job con alertas de fallo. Log detallado de cada ejecución. |
| RO-06 | Acceso físico no autorizado al servidor | Baja | Crítico | Secrets gestionados externamente. Nunca en el repositorio ni en código fuente. |

---

## 9. Requisitos Ambiguos

| ID | Requisito Ambiguo | Decisión Adoptada |
|----|------------------|------------------|
| RA-01 | ¿Días hábiles o calendario para el plazo de corrección? | **Días hábiles** (excluye sábados, domingos y festivos colombianos). Requiere tabla `festivos`. |
| RA-02 | ¿Quién puede descargar el PDF del permiso? | **Ambos:** ciudadano (portal público) y funcionario (panel interno) por canales separados. |
| RA-03 | ¿Cuántos documentos puede adjuntar un ciudadano? | Máximo **10 documentos** por solicitud, **10 MB** por archivo. |
| RA-04 | ¿El permiso es válido solo en días de Pico y Placa o en todo el rango de fechas? | El sistema valida el rango de fechas. La restricción horaria es responsabilidad de las autoridades según la normativa. |
| RA-05 | ¿Qué documentos requiere cada motivo? | El administrador configura esto en el CRUD de motivos con el campo `requiere_soporte`. |
| RA-06 | ¿Todos los funcionarios ven todas las solicitudes? | Por defecto **sí**. La segmentación por dependencia es una extensión futura. |
| RA-07 | ¿Se notifica al ciudadano cuando se revoca su permiso? | **Sí**, notificación automática en el evento de revocación. |
| RA-08 | ¿Un ciudadano puede tener solicitudes activas para múltiples motos? | **Sí**. La restricción RN-03 aplica por moto, no por ciudadano. |

---

## 10. Requisitos Faltantes

| ID | Requisito Faltante | Prioridad |
|----|-------------------|-----------|
| RF-01 | Gestión de festivos colombianos para cálculo de días hábiles | Alta |
| RF-02 | Mapeo de tipos de documento requeridos por motivo | Alta |
| RF-03 | Proceso de creación de solicitud presencial por funcionario | Media |
| RF-04 | Política de retención y depuración de archivos en MinIO | Media |
| RF-05 | Proceso de primera configuración del sistema (seed inicial) | Alta |
| RF-06 | Accesibilidad WCAG 2.1 AA (Decreto 1413/2022) | Alta |
| RF-07 | Límite máximo de documentos adjuntos por solicitud | Media |
| RF-08 | Validación del horario específico de restricción (no solo el rango de fechas) | Media |
| RF-09 | Vista de monitoreo de la cola BullMQ para el administrador | Media |
| RF-10 | Flujo de renovación de permiso vencido (pre-llenado del formulario) | Baja |

---

## 11. Casos de Uso Faltantes

| ID | Caso de Uso Faltante | Prioridad |
|----|---------------------|-----------|
| CUF-01 | Búsqueda de permiso por código de permiso (`2026-PYP-00145`) | Media |
| CUF-02 | Reenviar correo de notificación al ciudadano | Media |
| CUF-03 | Ver historial de solicitudes de un ciudadano específico | Baja |
| CUF-04 | Asignar solicitud a un funcionario específico de la cola | Baja |
| CUF-05 | Renovar un permiso vencido con pre-llenado de datos | Baja |
| CUF-06 | Dashboard de monitoreo de salud del sistema (TI) | Media |
| CUF-07 | Exportar listado de permisos vigentes con datos de contacto | Media |
| CUF-08 | Crear solicitud en nombre del ciudadano (atención presencial) | Media |

---

## 12. Recomendaciones

### 12.1 Recomendaciones de Arquitectura

| # | Recomendación | Prioridad |
|---|--------------|-----------|
| R-01 | Implementar **particionamiento de `auditoria`** por rango de fecha desde el inicio. A 5 años de retención la tabla puede acumular decenas de millones de registros. | Alta |
| R-02 | Definir la **estrategia de caché en Redis** para parámetros de configuración desde el Sprint 0. TTL de 5 minutos con invalidación por evento. | Alta |
| R-03 | Separar los **buckets de MinIO** por tipo: `bucket-documentos`, `bucket-permisos`, `bucket-reportes`. Políticas de acceso independientes. | Alta |
| R-04 | Implementar **health checks granulares** en `/api/v1/health` para BD, Redis, MinIO, BullMQ y SMTP. | Media |
| R-05 | Usar una **réplica de lectura** de PostgreSQL para las consultas de reportes del administrador, sin afectar la BD transaccional. | Media |
| R-06 | Implementar **circuit breaker** para llamadas a servicios externos: MinIO, Redis, SMTP. | Media |
| R-07 | Usar **RS256 (RSA)** en lugar de HS256 para la firma de JWTs en producción. | Alta |

### 12.2 Recomendaciones de Base de Datos

| # | Recomendación | Prioridad |
|---|--------------|-----------|
| R-08 | Crear tabla **`festivos`** con los festivos colombianos por año. Necesaria para cálculo de días hábiles. | Alta |
| R-09 | Agregar campo **`version`** (optimistic locking) en `solicitudes` para prevenir actualizaciones concurrentes. | Media |
| R-10 | Definir política de **VACUUM y ANALYZE** para tablas de alta escritura. | Media |
| R-11 | Crear tabla **`motivo_documentos`** para mapear qué documentos requiere cada motivo. | Media |

### 12.3 Recomendaciones de Seguridad

| # | Recomendación | Prioridad |
|---|--------------|-----------|
| R-12 | Implementar **CSP estricta** con `script-src 'self'` en Helmet. | Alta |
| R-13 | Integrar **ClamAV** en el worker de storage para escanear archivos adjuntos. | Media |
| R-14 | Implementar **rotación de secrets** mediante un gestor (HashiCorp Vault o AWS Secrets Manager). | Alta |
| R-15 | Sanitizar todos los campos de texto libre **antes** de insertarlos en el template del PDF. | Alta |

### 12.4 Recomendaciones de Experiencia de Usuario

| # | Recomendación | Prioridad |
|---|--------------|-----------|
| R-16 | **Guardado automático** del formulario en localStorage cada 30 segundos. | Alta |
| R-17 | **Indicador de progreso** claro en el formulario de 5 pasos con porcentaje completado. | Media |
| R-18 | **Modo de impresión** optimizado para el permiso en formato A5. | Baja |
| R-19 | **Accesibilidad WCAG 2.1 AA** en el portal ciudadano (obligatorio Decreto 1413/2022). | Alta |

---

## 13. Plan de Implementación Recomendado

Las fases están ordenadas por dependencia técnica y nivel de riesgo. Las capas de mayor riesgo se desarrollan primero para validar las premisas arquitectónicas.

| Fase | Nombre | Semanas | Prioridad |
|------|--------|---------|-----------|
| 0 | Fundamentos de Infraestructura | 1 | Crítica |
| 1 | Modelo de Datos | 1-2 | Crítica |
| 2 | Autenticación y Seguridad | 2-3 | Crítica |
| 3 | Módulo de Solicitudes Backend | 3-4 | Crítica |
| 4 | Generación de Permiso PDF + QR | 4-5 | Crítica |
| 5 | Frontend Portal Ciudadano | 5-6 | Alta |
| 6 | Frontend Panel Funcionario | 6-7 | Alta |
| 7 | Frontend Panel Administrador | 7-8 | Alta |
| 8 | Calidad y Producción | 8-10 | Alta |

**Duración total estimada:** 10 semanas para equipo de 2–3 desarrolladores full-stack con experiencia en el stack.

**Criterios de inicio de la Fase 0:**
1. El equipo de desarrollo está conformado y el repositorio fue creado.
2. El ambiente de desarrollo local está disponible (Docker, Node.js 20+, VS Code).
3. Los accesos a los servicios de producción están gestionados.
4. Este documento fue revisado y aprobado por el Tech Lead del proyecto.

---

## 14. Tabla de Hallazgos Críticos

| Prioridad | Hallazgo | Acción Requerida |
|-----------|---------|-----------------|
| 🔴 Crítico | Gestión de festivos colombianos faltante | Crear tabla `festivos` + lógica de días hábiles antes del Sprint 3 |
| 🔴 Crítico | Sin interfaz de administración de la DLQ | Añadir vista de DLQ en el panel admin (Fase 7) |
| 🔴 Crítico | Accesibilidad WCAG 2.1 AA no planificada | Incluir en todas las tareas de frontend como criterio de aceptación |
| 🟠 Alto | Particionamiento de `auditoria` debe ser desde el inicio | Implementar en el script SQL de Fase 1 |
| 🟠 Alto | Sin caché de configuración definida | Implementar Redis cache con invalidación desde Sprint 2 |
| 🟠 Alto | Sin escaneo de antivirus en archivos adjuntos | Añadir ClamAV en el worker de storage (Fase 3-4) |
| 🟡 Medio | Tipos de documento requeridos por motivo no están mapeados | Añadir tabla `motivo_documentos` o JSONB en la Fase 1 |
| 🟡 Medio | Sin monitoreo de salud del sistema para TI | Añadir dashboard de salud en Fase 7 |

---

*Documento de análisis técnico v2.0. Fuente de referencia para el equipo técnico del proyecto.*  
*Debe consultarse antes de iniciar cada fase de desarrollo.*
