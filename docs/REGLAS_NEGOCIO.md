# Reglas de Negocio — Sistema de Permisos de Circulación (Pico y Placa)

**Versión:** 1.0  
**Fecha:** 2026-08-02  
**Referencia:** `docs/PRD_Sistema_Permisos_de_Circulacion.md` · `.claude/PROJECT_CONTEXT.md` · `docs/CASOS_USO.md`

---

## Índice

- [Clasificación de Reglas](#clasificación-de-reglas)
- [RN-01 a RN-14: Reglas del PRD Original](#reglas-del-prd-original)
- [RN-15 a RN-30: Reglas de Solicitudes](#reglas-de-solicitudes)
- [RN-31 a RN-50: Reglas de Permisos](#reglas-de-permisos)
- [RN-51 a RN-65: Reglas de Seguridad y Acceso](#reglas-de-seguridad-y-acceso)
- [RN-66 a RN-75: Reglas de Auditoría](#reglas-de-auditoría)
- [RN-76 a RN-85: Reglas de Notificaciones](#reglas-de-notificaciones)
- [RN-86 a RN-95: Reglas de Configuración](#reglas-de-configuración)
- [RN-96 a RN-100: Reglas de Datos y Privacidad](#reglas-de-datos-y-privacidad)
- [RN-101 a RN-108: Reglas de Configuración Institucional](#reglas-de-configuración-institucional)
- [Marco Legal Aplicable](#marco-legal-aplicable)
- [Matriz de Impacto](#matriz-de-impacto)

---

## Clasificación de Reglas

| Tipo | Descripción |
|------|-------------|
| **Restricción** | Impide que una acción se lleve a cabo |
| **Cálculo** | Define cómo se obtiene un valor derivado |
| **Acción** | Desencadena un proceso automático |
| **Validación** | Verifica la integridad de los datos |
| **Derivación** | Define el estado resultante de una condición |

---

## Reglas del PRD Original

### RN-01 — Fecha de Inicio del Permiso No Puede Ser Anterior a la Aprobación

| Campo | Valor |
|-------|-------|
| **Tipo** | Restricción |
| **Categoría** | Solicitudes |
| **Prioridad** | Crítica |

**Enunciado:**  
La fecha de inicio solicitada por el ciudadano no puede ser anterior a la fecha actual al momento de crear la solicitud. La fecha de inicio del permiso aprobado no puede ser anterior a la fecha de aprobación.

**Especificación:**
- En el formulario del ciudadano: `fecha_inicio >= CURRENT_DATE (COT)`.
- Al momento de la aprobación: si `fecha_inicio < fecha_aprobacion`, el sistema ajusta `fecha_inicio = fecha_aprobacion`.
- La validación se aplica tanto en el frontend (UX) como en el backend (seguridad).

**Implementación:**  
Validación en DTO: `@IsDateString() + custom validator`. Verificación en el use case de aprobación.

**Excepción:** Ninguna.

---

### RN-02 — Duración Máxima del Permiso es Configurable

| Campo | Valor |
|-------|-------|
| **Tipo** | Restricción + Cálculo |
| **Categoría** | Solicitudes / Permisos |
| **Prioridad** | Alta |

**Enunciado:**  
La diferencia entre `fecha_fin` y `fecha_inicio` no puede superar el valor del parámetro `dias_max_permiso` de la tabla `configuracion`.

**Especificación:**
- `fecha_fin - fecha_inicio <= dias_max_permiso`.
- Valor por defecto del parámetro: **30 días**.
- El administrador puede modificar este parámetro sin intervención técnica.
- El cambio del parámetro aplica a las **nuevas** solicitudes; las solicitudes ya aprobadas no se modifican.

**Implementación:**  
El use case de creación de solicitud consulta la tabla `configuracion` para obtener `dias_max_permiso` y valida el rango de fechas.

**Excepción:** El administrador puede aprobar manualmente un permiso con duración mayor si el campo `fecha_fin` fue ajustado antes de aprobar.

---

### RN-03 — Un Ciudadano No Puede Tener Dos Solicitudes Activas para la Misma Moto

| Campo | Valor |
|-------|-------|
| **Tipo** | Restricción |
| **Categoría** | Solicitudes |
| **Prioridad** | Crítica |

**Enunciado:**  
Un ciudadano no puede crear una nueva solicitud para una motocicleta que ya tiene una solicitud en estado activo (`recibida`, `en_revision`, o `pendiente_correccion`).

**Especificación:**
- Verificación al momento de crear la solicitud: `SELECT COUNT(*) FROM solicitudes WHERE motocicleta_id = ? AND estado IN ('recibida', 'en_revision', 'pendiente_correccion') AND deleted_at IS NULL`.
- Si el resultado es `> 0`, el sistema rechaza la nueva solicitud con el mensaje de error que incluye el número de radicado de la solicitud activa.
- Los estados `aprobada`, `rechazada` y `vencida` no bloquean la creación de una nueva solicitud.

**Implementación:**  
Verificación en el use case `CrearSolicitudUseCase` antes de persistir la solicitud.

**Mensaje al ciudadano:** *"La motocicleta [PLACA] ya tiene una solicitud en proceso con radicado [RADICADO]. No puede crear una nueva hasta que la anterior sea resuelta."*

---

### RN-04 — Motivo Obligatorio para Rechazar o Solicitar Corrección

| Campo | Valor |
|-------|-------|
| **Tipo** | Validación |
| **Categoría** | Solicitudes |
| **Prioridad** | Alta |

**Enunciado:**  
Toda acción de rechazo o solicitud de corrección debe incluir un motivo textual explicativo que supere los 20 caracteres.

**Especificación:**
- `motivo_rechazo` es obligatorio y tiene mínimo 20 caracteres al rechazar.
- `motivo_correccion` es obligatorio y tiene mínimo 20 caracteres al solicitar corrección.
- El motivo queda almacenado en `historial_estados.motivo`.
- El motivo se comunica al ciudadano mediante correo electrónico.
- El sistema no permite enviar el formulario de rechazo o corrección con el campo vacío o con menos de 20 caracteres.

**Razón:** Garantizar que el ciudadano reciba retroalimentación útil y accionable, y que el sistema sea auditable.

---

### RN-05 — El QR es Único e Irrepetible; Revocación Genera Nuevo QR

| Campo | Valor |
|-------|-------|
| **Tipo** | Restricción + Cálculo |
| **Categoría** | Permisos / QR |
| **Prioridad** | Crítica |

**Enunciado:**  
Cada permiso tiene un código QR único en todo el sistema. Al revocar un permiso y generar uno nuevo, el nuevo QR es diferente al anterior. El QR anterior queda permanentemente inválido.

**Especificación:**
- El código QR se genera como: `SHA256(UUID_permiso + SALT_secreto)`.
- Se verifica unicidad con constraint `UNIQUE` en `permisos.codigo_qr`.
- Si se detecta colisión (probabilidad astronómicamente baja), se regenera el hash con un nonce adicional.
- La revocación no implica regeneración automática de un nuevo permiso; el nuevo permiso (si se emite) tiene su propio QR.

**Implementación:**  
`QRModule.generarCodigoOpaco(permiso_uuid, SALT)` con verificación de unicidad contra la tabla.

---

### RN-06 — El PDF Refleja el Snapshot de los Datos en el Momento de la Aprobación

| Campo | Valor |
|-------|-------|
| **Tipo** | Restricción |
| **Categoría** | Permisos / PDF |
| **Prioridad** | Crítica |

**Enunciado:**  
El PDF del permiso contiene los datos del ciudadano, la motocicleta y el motivo tal como estaban en el momento de la aprobación, no los datos actuales del registro.

**Especificación:**
- Al aprobar, el sistema captura:
  - `snapshot_ciudadano JSONB`: nombre, apellido, tipo documento, número documento.
  - `snapshot_motocicleta JSONB`: placa, marca, línea, modelo, cilindraje, color.
  - `snapshot_motivo JSONB`: nombre del motivo, descripción adicional ingresada por el ciudadano.
- El PDF se genera a partir de estos snapshots, no de las tablas de ciudadanos o motocicletas.
- Esto garantiza que si los datos de un ciudadano se actualizan posteriormente, el permiso emitido sigue siendo válido y consistente.

**Razón:** Integridad documental y validez legal del permiso emitido.

---

### RN-07 — El Número de Permiso Nunca se Reutiliza

| Campo | Valor |
|-------|-------|
| **Tipo** | Restricción |
| **Categoría** | Permisos |
| **Prioridad** | Alta |

**Enunciado:**  
El número de permiso es único e irrepetible en todo el sistema, incluso después de revocar o anular un permiso.

**Especificación:**
- El número se genera con una secuencia PostgreSQL: `nextval('seq_permiso_consecutivo')`.
- Formato: `AAAA-PYP-NNNNN` (ejemplo: `2026-PYP-00145`).
- La secuencia nunca se reinicia, nunca se decrementa y no tiene huecos deliberados.
- Si la generación del permiso falla y el consecutivo ya fue consumido, se usa el siguiente consecutivo disponible (no se reutiliza el fallido).

**Implementación:**  
`SELECT nextval('seq_permiso_consecutivo')` antes de crear el registro en `permisos`.

---

### RN-08 — Los Estados de Solicitudes y Permisos se Actualizan Automáticamente por Jobs

| Campo | Valor |
|-------|-------|
| **Tipo** | Acción |
| **Categoría** | Solicitudes / Permisos |
| **Prioridad** | Alta |

**Enunciado:**  
El sistema debe actualizar automáticamente los estados `vencida` (solicitudes) y `vencido` (permisos) sin intervención manual, mediante jobs programados.

**Especificación:**
- **Job 1 — Solicitudes vencidas:** Cron diario a las 00:01 COT. Marca como `vencida` las solicitudes en `recibida` que superaron `plazo_revision_horas` y las solicitudes en `pendiente_correccion` que superaron `plazo_correccion_dias` días.
- **Job 2 — Permisos vencidos:** Cron diario a las 00:01 COT. Marca como `vencido` los permisos en `vigente` con `fecha_vencimiento < CURRENT_DATE`.
- Los cambios de estado automáticos se registran en `historial_estados` con `usuario_id = NULL`.
- Los cambios se registran en `auditoria` con `accion = 'vencimiento_automatico'`.

---

### RN-09 — Los Documentos Adjuntos se Conservan Aunque la Solicitud sea Rechazada

| Campo | Valor |
|-------|-------|
| **Tipo** | Restricción |
| **Categoría** | Documentos |
| **Prioridad** | Media |

**Enunciado:**  
Los archivos adjuntos por el ciudadano no se eliminan del storage cuando una solicitud es rechazada o vencida.

**Especificación:**
- La tabla `documentos` no tiene `ON DELETE CASCADE` con `solicitudes`.
- Un soft delete de la solicitud (`deleted_at`) no elimina los documentos asociados.
- El proceso de eliminación real de archivos del storage solo puede ejecutarse manualmente por el administrador del sistema (fuera del alcance de la aplicación web).
- Los documentos pueden ser consultados por el funcionario incluso después del rechazo para referencias futuras.

**Razón:** Trazabilidad legal y posibilidad de referencia en casos de disputa.

---

### RN-10 — Una Solicitud Rechazada No Puede Reabrirse

| Campo | Valor |
|-------|-------|
| **Tipo** | Restricción |
| **Categoría** | Solicitudes |
| **Prioridad** | Alta |

**Enunciado:**  
El estado `rechazada` es un estado terminal. Una vez rechazada, la solicitud no puede cambiar a ningún otro estado.

**Especificación:**
- La máquina de estados impide cualquier transición desde `rechazada`.
- El ciudadano que quiera intentar de nuevo **debe** crear una nueva solicitud desde cero.
- El sistema, al mostrar el estado `rechazada`, informa claramente que el ciudadano puede crear una nueva solicitud.
- El funcionario no puede "reabrir" una solicitud rechazada; debe indicar al ciudadano que cree una nueva.

---

### RN-11 — El Plazo de Corrección del Ciudadano es Configurable

| Campo | Valor |
|-------|-------|
| **Tipo** | Cálculo + Restricción |
| **Categoría** | Solicitudes |
| **Prioridad** | Alta |

**Enunciado:**  
El ciudadano tiene un número configurable de días hábiles para corregir una solicitud en estado `pendiente_correccion`. Tras vencer este plazo, la solicitud cambia automáticamente a `vencida`.

**Especificación:**
- Parámetro: `plazo_correccion_dias` en tabla `configuracion` (default: **5 días hábiles**).
- El contador inicia desde el momento en que el funcionario cambia el estado a `pendiente_correccion`.
- El cálculo de días hábiles excluye sábados, domingos y festivos colombianos.
- El ciudadano es notificado por correo con la fecha límite explícita.
- El job de vencimiento verifica este plazo diariamente.

---

### RN-12 — El Plazo de Revisión del Funcionario es Configurable

| Campo | Valor |
|-------|-------|
| **Tipo** | Acción |
| **Categoría** | Solicitudes |
| **Prioridad** | Media |

**Enunciado:**  
Una solicitud en estado `recibida` que no ha sido atendida en el plazo configurado es marcada automáticamente como `vencida`.

**Especificación:**
- Parámetro: `plazo_revision_horas` en tabla `configuracion` (default: **48 horas**).
- El contador inicia desde `created_at` de la solicitud.
- Las solicitudes que llevan más de 24 horas son resaltadas en la cola del funcionario con indicador de urgencia.
- Las solicitudes que superan el plazo completo son marcadas como `vencida` por el job diario.

---

### RN-13 — Todas las Fechas se Almacenan en UTC y se Muestran en COT

| Campo | Valor |
|-------|-------|
| **Tipo** | Validación |
| **Categoría** | General |
| **Prioridad** | Alta |

**Enunciado:**  
Todas las fechas y horas en la base de datos se almacenan en UTC. La presentación al usuario (ciudadano, funcionario, administrador) se realiza en hora Colombia (COT = UTC-5).

**Especificación:**
- PostgreSQL: todos los campos de tipo `TIMESTAMPTZ` (con zona horaria).
- Backend: NestJS procesa fechas en UTC internamente.
- Frontend: conversión a COT usando `Intl.DateTimeFormat` con `timeZone: 'America/Bogota'`.
- Logs y `auditoria`: almacenados en UTC, mostrados en COT en la interfaz.
- Al calcular plazos de vencimiento, el job cron se ejecuta a las 00:01 COT (05:01 UTC).

---

### RN-14 — Formato del Número de Radicado

| Campo | Valor |
|-------|-------|
| **Tipo** | Cálculo |
| **Categoría** | Solicitudes |
| **Prioridad** | Alta |

**Enunciado:**  
Cada solicitud recibe un número de radicado único generado por el sistema con un formato estándar.

**Especificación:**
- Formato: `AAAAMMDD-PYP-XXXXXX`
  - `AAAA`: año de creación (4 dígitos).
  - `MM`: mes de creación (2 dígitos, con cero a la izquierda).
  - `DD`: día de creación (2 dígitos, con cero a la izquierda).
  - `PYP`: literal fijo que identifica el sistema Pico y Placa.
  - `XXXXXX`: consecutivo diario de 6 dígitos (reinicia cada día a `000001`).
- Ejemplo: `20260802-PYP-000123`.
- La fecha usada es la fecha de creación en COT (no UTC).
- El consecutivo diario se genera con una secuencia PostgreSQL particionada por fecha o un campo `contador_diario` en la tabla `solicitudes`.

**Unicidad:** La combinación `fecha + consecutivo` garantiza unicidad. Constraint `UNIQUE` en `solicitudes.numero_radicado`.

---

## Reglas de Solicitudes

### RN-15 — Máquina de Estados de Solicitudes

| Campo | Valor |
|-------|-------|
| **Tipo** | Restricción |
| **Categoría** | Solicitudes |
| **Prioridad** | Crítica |

**Enunciado:**  
Los cambios de estado de una solicitud deben seguir la máquina de estados definida. No se permiten transiciones no autorizadas.

**Transiciones Permitidas:**

```
recibida ──────────────────────────────────────────────┐
    │                                                   │ (job: plazo_revision_horas)
    ▼                                                   ▼
en_revision ──────────────────────────────────────► vencida
    │                   │               │
    ▼ (funcionario)     ▼ (funcionario) ▼ (funcionario)
aprobada            rechazada   pendiente_correccion
                                        │
                                        │ (job: plazo_correccion_dias)
                                        │ (funcionario: rechaza)
                                        │ (funcionario: aprueba)
                                        ▼
                                aprobada / rechazada / vencida
```

| Desde \ Hacia | recibida | en_revision | pendiente_correccion | aprobada | rechazada | vencida |
|---------------|----------|-------------|----------------------|----------|-----------|---------|
| `recibida` | — | ✅ Funcionario | ❌ | ❌ | ❌ | ✅ Job |
| `en_revision` | ❌ | — | ✅ Funcionario | ✅ Funcionario | ✅ Funcionario | ✅ Job |
| `pendiente_correccion` | ✅ Ciudadano corrige | ❌ | — | ✅ Funcionario | ✅ Funcionario | ✅ Job |
| `aprobada` | ❌ | ❌ | ❌ | — | ❌ | ❌ |
| `rechazada` | ❌ | ❌ | ❌ | ❌ | — | ❌ |
| `vencida` | ❌ | ❌ | ❌ | ❌ | ❌ | — |

**Implementación:**  
El use case valida la transición antes de persistir. Si la transición no es válida, retorna error 422 con código `TRANSICION_ESTADO_INVALIDA`.

---

### RN-16 — La Corrección Solo Habilita los Campos Señalados

| Campo | Valor |
|-------|-------|
| **Tipo** | Restricción |
| **Categoría** | Solicitudes |
| **Prioridad** | Alta |

**Enunciado:**  
Cuando una solicitud está en `pendiente_correccion`, el ciudadano solo puede modificar los campos que el funcionario identificó como incorrectos. El resto de los datos permanecen bloqueados.

**Especificación:**
- El funcionario selecciona los campos a corregir al enviar la solicitud de corrección. Estos se almacenan en `historial_estados.campos_correccion` como JSONB.
- El formulario de corrección del portal ciudadano habilita únicamente los campos marcados; el resto se muestra en modo de solo lectura.
- El backend valida que el DTO de corrección solo contenga los campos autorizados.

---

### RN-17 — El Rango de Fechas de la Solicitud No Puede Solaparse con Permisos Vigentes de la Misma Moto

| Campo | Valor |
|-------|-------|
| **Tipo** | Restricción |
| **Categoría** | Solicitudes |
| **Prioridad** | Alta |

**Enunciado:**  
No puede existir una nueva solicitud aprobada para una motocicleta que ya tiene un permiso vigente con un rango de fechas que se solapa con el nuevo.

**Especificación:**
- Al aprobar una solicitud, el sistema verifica que no exista un permiso `vigente` para la misma moto con fechas superpuestas.
- Condición de solapamiento: `nueva_fecha_inicio <= permiso_existente.fecha_vencimiento AND nueva_fecha_fin >= permiso_existente.fecha_inicio`.
- Si hay solapamiento, la aprobación es bloqueada con error 422 y descripción del conflicto.

---

### RN-18 — La Placa de la Motocicleta es el Identificador del Vehículo

| Campo | Valor |
|-------|-------|
| **Tipo** | Cálculo |
| **Categoría** | Motocicletas |
| **Prioridad** | Media |

**Enunciado:**  
La placa de la motocicleta, normalizada a mayúsculas, es el identificador único del vehículo en el sistema.

**Especificación:**
- Antes de crear o buscar una motocicleta, la placa se normaliza: `TRIM(UPPER(placa))`.
- Si la motocicleta ya existe en la base de datos (misma placa normalizada), el sistema vincula la solicitud a la moto existente en lugar de crear un duplicado.
- Los datos de la moto (marca, modelo, color, etc.) son actualizables si el ciudadano ingresa datos diferentes en una nueva solicitud. El funcionario puede verificar si hay discrepancias.

---

### RN-19 — Los Documentos Adjuntos son Inmutables Tras su Carga

| Campo | Valor |
|-------|-------|
| **Tipo** | Restricción |
| **Categoría** | Documentos |
| **Prioridad** | Media |

**Enunciado:**  
Un documento adjunto no se puede modificar una vez cargado. Si el ciudadano necesita reemplazarlo (en una corrección), el sistema carga un nuevo documento y marca el anterior como `activo = false`. El documento anterior permanece en el storage.

**Especificación:**
- No existe endpoint de edición de documentos.
- La operación de "reemplazo" consiste en: marcar el documento anterior `activo = false` + crear un nuevo registro + subir el nuevo archivo.
- El hash SHA-256 de cada documento garantiza su integridad desde el momento de la carga.

---

### RN-20 — El Ciudadano Se Identifica Solo con Radicado y Número de Documento

| Campo | Valor |
|-------|-------|
| **Tipo** | Validación |
| **Categoría** | Acceso Ciudadano |
| **Prioridad** | Crítica |

**Enunciado:**  
El ciudadano no necesita crear una cuenta ni recordar una contraseña. Su identidad en el sistema está determinada por la combinación de su número de radicado y su número de documento.

**Especificación:**
- Los endpoints públicos de consulta y corrección verifican: `radicado EXISTS AND solicitud.ciudadano.numero_documento = numero_documento_ingresado`.
- La respuesta es idéntica si el radicado no existe o si el documento no coincide.
- Esta combinación no se puede cambiar; el ciudadano no tiene un "perfil" modificable en el portal público.

---

## Reglas de Permisos

### RN-31 — Máquina de Estados de Permisos

| Campo | Valor |
|-------|-------|
| **Tipo** | Restricción |
| **Categoría** | Permisos |
| **Prioridad** | Crítica |

**Enunciado:**  
Los permisos tienen una máquina de estados propia e independiente de las solicitudes.

**Transiciones Permitidas:**

```
vigente ─────────────────────┬──────────────────► vencido (job automático)
                             │
                             └──────────────────► revocado (Administrador)
```

| Desde \ Hacia | vigente | vencido | revocado |
|---------------|---------|---------|----------|
| `vigente` | — | ✅ Job | ✅ Admin |
| `vencido` | ❌ | — | ❌ |
| `revocado` | ❌ | ❌ | — |

**Implementación:**  
Los estados `vencido` y `revocado` son terminales e irreversibles.

---

### RN-32 — El Permiso Solo Existe Si la Solicitud Fue Aprobada

| Campo | Valor |
|-------|-------|
| **Tipo** | Derivación |
| **Categoría** | Permisos |
| **Prioridad** | Crítica |

**Enunciado:**  
Un permiso de circulación solo puede existir si existe una solicitud aprobada que lo origine. No se puede crear un permiso sin una solicitud aprobada vinculada.

**Especificación:**
- La tabla `permisos` tiene FK `solicitud_id` con `NOT NULL` y `ON DELETE RESTRICT`.
- El registro en `permisos` se crea únicamente desde el job de generación de permiso, disparado por la aprobación.
- El administrador no tiene un endpoint de "crear permiso manual".

---

### RN-33 — El PDF No Se Regenera Tras la Aprobación

| Campo | Valor |
|-------|-------|
| **Tipo** | Restricción |
| **Categoría** | Permisos / PDF |
| **Prioridad** | Alta |

**Enunciado:**  
Una vez generado el PDF del permiso, no se regenera aunque los datos del ciudadano o la motocicleta cambien en la base de datos.

**Especificación:**
- El PDF se genera una sola vez al aprobar la solicitud.
- Los datos provienen del snapshot (RN-06), no de las tablas actuales.
- Si se detecta un error en el PDF (datos incorrectos), el proceso de corrección es la revocación del permiso y la creación de una nueva solicitud.
- El hash SHA-256 del PDF almacenado en `permisos.hash_pdf` permite verificar si el archivo fue alterado.

---

### RN-34 — La Validación del QR Siempre Retorna HTTP 200

| Campo | Valor |
|-------|-------|
| **Tipo** | Restricción |
| **Categoría** | QR / API |
| **Prioridad** | Alta |

**Enunciado:**  
El endpoint de validación pública del QR siempre retorna HTTP 200, independientemente de si el permiso está vigente, vencido, revocado o no existe.

**Especificación:**
- El resultado se comunica en el campo `data.resultado` del cuerpo de la respuesta.
- Valores posibles: `vigente`, `vencido`, `revocado`, `no_encontrado`.
- Esto impide que una autoridad de tránsito o un sistema externo infiera información sobre el sistema a partir de los códigos de estado HTTP.

---

### RN-35 — Los Escaneos del QR se Registran Siempre

| Campo | Valor |
|-------|-------|
| **Tipo** | Acción |
| **Categoría** | QR / Auditoría |
| **Prioridad** | Media |

**Enunciado:**  
Cada consulta al endpoint de validación del QR (incluyendo códigos no encontrados) genera un registro en la tabla `qr_validaciones`.

**Especificación:**
- Campos registrados: `permiso_id` (null si no existe), `codigo_escaneado`, `ip_address`, `user_agent`, `resultado`, `created_at`.
- El registro no requiere autenticación del escáner.
- Un volumen inusualmente alto de escaneos de un mismo QR puede indicar verificación sistemática y debe ser monitoreado.

---

### RN-36 — El Permiso Revocado Informa al Ciudadano

| Campo | Valor |
|-------|-------|
| **Tipo** | Acción |
| **Categoría** | Permisos |
| **Prioridad** | Media |

**Enunciado:**  
Cuando un administrador revoca un permiso, el sistema notifica al ciudadano por correo electrónico.

**Especificación:**
- La notificación se encola en BullMQ tras la revocación.
- El correo informa: número de permiso, fecha de revocación y la recomendación de contactar a la alcaldía para más información.
- El correo **no** incluye el motivo de la revocación si este es de naturaleza sensible (queda a criterio del sistema de notificaciones).

---

### RN-37 — Un Permiso Solo Puede Ser Revocado por un Administrador

| Campo | Valor |
|-------|-------|
| **Tipo** | Restricción |
| **Categoría** | Permisos / Acceso |
| **Prioridad** | Alta |

**Enunciado:**  
Solo los usuarios con rol `administrador` pueden ejecutar la acción de revocar un permiso. El funcionario puede ver los permisos pero no puede revocarlos.

**Implementación:**  
Guard `@Roles('administrador')` en el endpoint `POST /api/v1/permisos/{id}/revocar`.

---

## Reglas de Seguridad y Acceso

### RN-51 — Política de Contraseñas para Usuarios Internos

| Campo | Valor |
|-------|-------|
| **Tipo** | Validación |
| **Categoría** | Seguridad |
| **Prioridad** | Crítica |

**Enunciado:**  
Las contraseñas de funcionarios y administradores deben cumplir los siguientes requisitos mínimos de complejidad.

**Especificación:**

| Requisito | Valor |
|-----------|-------|
| Longitud mínima | 10 caracteres |
| Mayúscula obligatoria | Al menos 1 |
| Minúscula obligatoria | Al menos 1 |
| Dígito obligatorio | Al menos 1 |
| Carácter especial obligatorio | Al menos 1 (`!@#$%^&*()-_=+`) |
| Expiración | 90 días calendario |
| Historial de reutilización | No puede usar ninguna de las últimas 5 contraseñas |
| Bloqueo por intentos | 5 intentos fallidos → bloqueo de 30 minutos |

**Implementación:**  
Regex en DTO + custom validator en NestJS. Historial en `usuarios.historial_contrasenas JSONB` (array de los últimos 5 hashes BCrypt).

---

### RN-52 — Los Access Tokens Tienen Vida Corta y los Refresh Tokens Rotan

| Campo | Valor |
|-------|-------|
| **Tipo** | Restricción |
| **Categoría** | Seguridad / Autenticación |
| **Prioridad** | Crítica |

**Especificación:**
- Access Token TTL: **15 minutos**.
- Refresh Token TTL: **7 días**.
- Cada uso del Refresh Token invalida el anterior y emite uno nuevo (rotación).
- El Refresh Token invalidado se registra en Redis con TTL igual al tiempo restante del token original.
- Si un Refresh Token invalidado es utilizado, puede indicar robo de sesión; el sistema revoca **todos** los refresh tokens del usuario.

---

### RN-53 — Los Archivos Adjuntos Solo Son Accesibles Mediante URL Firmadas

| Campo | Valor |
|-------|-------|
| **Tipo** | Restricción |
| **Categoría** | Seguridad / Almacenamiento |
| **Prioridad** | Crítica |

**Especificación:**
- El bucket de documentos en MinIO es **privado**; no tiene acceso público.
- El acceso a cualquier archivo se hace mediante una URL firmada generada por el sistema.
- TTL de la URL firmada: **5 minutos**.
- La `storage_key` (ruta real en MinIO) nunca aparece en ninguna respuesta de API ni en el DOM del frontend.
- Solo los usuarios autenticados con rol `funcionario` o `administrador` pueden solicitar URLs firmadas de documentos adjuntos.

---

### RN-54 — Rate Limiting por Endpoint

| Campo | Valor |
|-------|-------|
| **Tipo** | Restricción |
| **Categoría** | Seguridad |
| **Prioridad** | Alta |

**Límites por endpoint:**

| Endpoint | Límite | Ventana | Aplica a |
|----------|--------|---------|----------|
| `POST /auth/login` | 5 solicitudes | 15 minutos | IP |
| `POST /auth/recuperar-contrasena` | 3 solicitudes | 1 hora | IP |
| `GET /public/verificar/{qr}` | 30 solicitudes | 1 minuto | IP |
| `GET /public/solicitudes/estado` | 10 solicitudes | 1 minuto | IP |
| `POST /public/solicitudes` | 5 solicitudes | 1 hora | IP |
| Endpoints autenticados globales | 100 solicitudes | 1 minuto | IP + Usuario |

**Implementación:** Módulo `@nestjs/throttler` con almacenamiento en Redis.

---

### RN-55 — El CAPTCHA es Obligatorio en Todos los Formularios Públicos

| Campo | Valor |
|-------|-------|
| **Tipo** | Validación |
| **Categoría** | Seguridad |
| **Prioridad** | Alta |

**Especificación:**
- reCAPTCHA v3 integrado en:
  - `POST /public/solicitudes` (crear solicitud)
  - `GET /public/solicitudes/estado` (consultar estado)
  - `PUT /public/solicitudes/{radicado}/correccion` (enviar corrección)
- El score mínimo aceptable es **0.5**.
- El token de CAPTCHA se valida en el backend; no se confía en la validación del frontend.
- Si el CAPTCHA falla, el sistema retorna error 422 con mensaje genérico (sin revelar el score).

---

### RN-56 — Datos Sensibles No Se Loguean

| Campo | Valor |
|-------|-------|
| **Tipo** | Restricción |
| **Categoría** | Seguridad |
| **Prioridad** | Alta |

**Campos prohibidos en logs del servidor:**
- Contraseñas (`contrasena`, `password`, `currentPassword`, `newPassword`).
- Tokens JWT (access token, refresh token).
- `storage_key` de archivos.
- Número de documento completo (solo últimos 4 dígitos permitidos en logs de debug).
- Tokens de CAPTCHA.
- Claves de API y secrets del servidor.

**Implementación:** Interceptor global en NestJS que sanitiza los body de request/response antes de loguear.

---

### RN-57 — Prevención de IDOR en Endpoints de Solicitudes

| Campo | Valor |
|-------|-------|
| **Tipo** | Restricción |
| **Categoría** | Seguridad |
| **Prioridad** | Crítica |

**Especificación:**
- Un funcionario no puede acceder a una solicitud que no le corresponde por filtro de dependencia (si aplica segmentación).
- Los endpoints públicos de ciudadano validan que `solicitud.numero_radicado + ciudadano.numero_documento` coincidan con los parámetros enviados.
- Un funcionario de municipio A no puede ver solicitudes del municipio B (si el sistema es multimunicipios en el futuro).
- Todos los repositorios filtran por `deleted_at IS NULL` por defecto.

---

### RN-58 — Validación Estricta de Todos los Inputs

| Campo | Valor |
|-------|-------|
| **Tipo** | Validación |
| **Categoría** | Seguridad |
| **Prioridad** | Crítica |

**Especificación:**
- `ValidationPipe` global con `{ whitelist: true, forbidNonWhitelisted: true }`.
- Propiedades no declaradas en el DTO son eliminadas silenciosamente (`whitelist`) o retornan error 400 (`forbidNonWhitelisted`).
- Todos los campos de texto libre se sanitizan antes de ser insertados en el PDF (prevención de inyección).
- Placa de moto: validación con regex específico de Colombia: `/^[A-Z]{3}[0-9]{2}[A-Z0-9]{1}$/`.

---

## Reglas de Auditoría

### RN-66 — La Tabla de Auditoría es de Solo Inserción

| Campo | Valor |
|-------|-------|
| **Tipo** | Restricción |
| **Categoría** | Auditoría |
| **Prioridad** | Crítica |

**Enunciado:**  
La tabla `auditoria` acepta únicamente operaciones `INSERT` y `SELECT`. Las operaciones `UPDATE` y `DELETE` están prohibidas a nivel de base de datos.

**Especificación:**
- El usuario de base de datos de la aplicación tiene permisos `INSERT, SELECT` en la tabla `auditoria`.
- No tiene permisos `UPDATE` ni `DELETE`.
- Ningún endpoint de la API permite modificar o eliminar registros de auditoría.
- La retención de datos de auditoría es mínimo **5 años** según Ley 1712/2014.

---

### RN-67 — Eventos que Deben Auditarse Obligatoriamente

| Campo | Valor |
|-------|-------|
| **Tipo** | Acción |
| **Categoría** | Auditoría |
| **Prioridad** | Alta |

**Eventos obligatorios de auditoría:**

| Evento | `accion` en auditoria | `entidad` |
|--------|----------------------|-----------|
| Login exitoso | `login` | `usuarios` |
| Login fallido | `login_fallido` | `usuarios` |
| Logout | `logout` | `usuarios` |
| Crear solicitud | `crear` | `solicitudes` |
| Cambio de estado de solicitud | `cambiar_estado` | `solicitudes` |
| Aprobar solicitud | `aprobar` | `solicitudes` |
| Rechazar solicitud | `rechazar` | `solicitudes` |
| Solicitar corrección | `solicitar_correccion` | `solicitudes` |
| Generar permiso | `generar_permiso` | `permisos` |
| Revocar permiso | `revocar_permiso` | `permisos` |
| Descargar documento adjunto | `descargar_documento` | `documentos` |
| Descargar PDF del permiso | `descargar_pdf` | `permisos` |
| Crear usuario | `crear` | `usuarios` |
| Editar usuario | `editar` | `usuarios` |
| Activar/desactivar usuario | `cambiar_estado` | `usuarios` |
| Cambiar contraseña | `cambiar_contrasena` | `usuarios` |
| Modificar configuración | `editar` | `configuracion` |
| Exportar reporte | `exportar_reporte` | `reportes` |
| Vencimiento automático (job) | `vencimiento_automatico` | `solicitudes` / `permisos` |

---

### RN-68 — El Registro de Auditoría Incluye Datos Anteriores y Nuevos

| Campo | Valor |
|-------|-------|
| **Tipo** | Cálculo |
| **Categoría** | Auditoría |
| **Prioridad** | Alta |

**Especificación:**
- Para operaciones de edición: `datos_anteriores JSONB` contiene el estado previo; `datos_nuevos JSONB` contiene el estado posterior.
- Los campos sensibles (`contrasena_hash`) se excluyen de `datos_anteriores` y `datos_nuevos` y se reemplazan por `"[OMITIDO]"`.
- La IP del cliente (`ip_address`) y el `user_agent` se capturan en cada registro.
- Para acciones del sistema (jobs), `usuario_id = NULL` y `ip_address = 'SISTEMA'`.

---

### RN-69 — Solo el Administrador Puede Consultar la Auditoría

| Campo | Valor |
|-------|-------|
| **Tipo** | Restricción |
| **Categoría** | Auditoría / Acceso |
| **Prioridad** | Alta |

**Especificación:**
- El endpoint `GET /api/v1/auditoria` está protegido con `@Roles('administrador')`.
- El funcionario no tiene acceso a la bitácora de auditoría completa.
- El funcionario sí puede ver el `historial_estados` de las solicitudes que gestiona.

---

## Reglas de Notificaciones

### RN-76 — Las Notificaciones Son Asíncronas y Con Reintento

| Campo | Valor |
|-------|-------|
| **Tipo** | Acción |
| **Categoría** | Notificaciones |
| **Prioridad** | Alta |

**Especificación:**
- Todas las notificaciones de correo se envían de forma asíncrona mediante BullMQ.
- Los reintentos en caso de fallo: máximo **3 intentos** con backoff exponencial: 1 minuto, 5 minutos, 15 minutos.
- Si fallan los 3 intentos, el job pasa a Dead Letter Queue (DLQ) para intervención manual.
- El estado del envío se registra en la tabla `notificaciones`: `pendiente`, `enviado`, `error`.

---

### RN-77 — Los Eventos que Disparan Notificaciones al Ciudadano

| Campo | Valor |
|-------|-------|
| **Tipo** | Acción |
| **Categoría** | Notificaciones |
| **Prioridad** | Alta |

| Evento | Tipo de notificación | Destinatario |
|--------|---------------------|--------------|
| Solicitud creada | `solicitud_recibida` | Ciudadano |
| Solicitud aprobada | `solicitud_aprobada` | Ciudadano |
| Solicitud rechazada | `solicitud_rechazada` | Ciudadano |
| Corrección solicitada | `correccion_requerida` | Ciudadano |
| Solicitud vencida | `solicitud_vencida` | Ciudadano |
| Permiso revocado | `permiso_revocado` | Ciudadano |
| Corrección enviada | `correccion_enviada` (interno) | Funcionario asignado |

---

### RN-78 — Las Notificaciones No Contienen URLs Directas de Storage

| Campo | Valor |
|-------|-------|
| **Tipo** | Restricción |
| **Categoría** | Notificaciones / Seguridad |
| **Prioridad** | Alta |

**Especificación:**
- Los correos de notificación nunca incluyen URLs firmadas de MinIO directamente.
- Las URLs en los correos apuntan siempre al portal web de la alcaldía (ej: `https://dominio.gov.co/mis-solicitudes`), no al storage.
- El ciudadano descarga el PDF desde el portal, que a su vez genera la URL firmada temporal.

---

### RN-79 — Los Correos Usan Templates HTML Institucionales

| Campo | Valor |
|-------|-------|
| **Tipo** | Restricción |
| **Categoría** | Notificaciones |
| **Prioridad** | Media |

**Especificación:**
- Todos los correos usan un template HTML con la identidad visual de la alcaldía (logo, colores).
- El nombre y los colores provienen de la tabla `configuracion`.
- Los correos incluyen el disclaimer: *"Este es un correo automático. Por favor no responda a este mensaje."*
- Los correos incluyen el pie de página con la dirección de la alcaldía y los canales de atención.

---

## Reglas de Configuración

### RN-86 — Los Parámetros de Configuración Tienen Efecto Inmediato

| Campo | Valor |
|-------|-------|
| **Tipo** | Acción |
| **Categoría** | Configuración |
| **Prioridad** | Media |

**Especificación:**
- Al actualizar un parámetro en la tabla `configuracion`, el sistema invalida inmediatamente el caché en Redis.
- Los nuevos PDFs generados después del cambio usan el nuevo valor.
- Los PDFs ya generados no son afectados (snapshots inmutables).
- Los parámetros numéricos (`dias_max_permiso`, `plazo_revision_horas`, `plazo_correccion_dias`) afectan solo a las **nuevas** solicitudes.

---

### RN-87 — Parámetros de Configuración con Valores Mínimos y Máximos

| Campo | Valor |
|-------|-------|
| **Tipo** | Validación |
| **Categoría** | Configuración |
| **Prioridad** | Media |

**Rangos permitidos:**

| Parámetro | Mínimo | Máximo | Default |
|-----------|--------|--------|---------|
| `dias_max_permiso` | 1 | 365 | 30 |
| `plazo_revision_horas` | 1 | 336 (14 días) | 48 |
| `plazo_correccion_dias` | 1 | 30 | 5 |

---

### RN-88 — El Historial de Configuración es Trazable

| Campo | Valor |
|-------|-------|
| **Tipo** | Acción |
| **Categoría** | Configuración / Auditoría |
| **Prioridad** | Media |

**Especificación:**
- Todo cambio en la tabla `configuracion` genera un registro en `auditoria` con `datos_anteriores` (valor previo) y `datos_nuevos` (valor nuevo).
- Esto permite reconstruir el historial de parámetros para justificar decisiones operativas.

---

## Reglas de Configuración Institucional

### RN-101 — Solo Existe una Configuración Institucional por Instalación

| Campo | Valor |
|-------|-------|
| **Tipo** | Restricción |
| **Categoría** | Configuración Institucional |
| **Prioridad** | Crítica |

**Enunciado:**  
El sistema solo puede tener un registro de configuración institucional. No se permite crear un segundo registro.

**Especificación:**
- Al intentar crear un segundo registro, el sistema retorna error `409 CONFLICT` con código `CONFIGURACION_INSTITUCIONAL_YA_EXISTE`.
- La inicialización se realiza exclusivamente mediante el seed de despliegue.
- A partir del primer registro, solo se permiten operaciones `UPDATE`. El endpoint `POST` no existe en la API pública.
- El use case de actualización verifica `COUNT(*) = 1` antes de proceder.

---

### RN-102 — Solo el Administrador puede Modificar la Configuración Institucional

| Campo | Valor |
|-------|-------|
| **Tipo** | Restricción |
| **Categoría** | Configuración Institucional / Seguridad |
| **Prioridad** | Crítica |

**Enunciado:**  
Únicamente el usuario con rol `administrador` tiene permisos de escritura sobre la configuración institucional. El rol `funcionario` y el acceso público solo pueden leer los datos públicos.

**Especificación:**
- Endpoint `PUT /api/v1/admin/configuracion-institucional` protegido por `RolesGuard('administrador')`.
- Endpoints `PATCH` de imagen protegidos con el mismo guard.
- Todo intento de modificación por un rol no autorizado retorna `403 FORBIDDEN`.
- Todo cambio exitoso genera un registro en `auditoria` con `accion = 'editar'`.

---

### RN-103 — La Configuración Institucional es la Fuente de Identidad para Documentos Oficiales

| Campo | Valor |
|-------|-------|
| **Tipo** | Derivación |
| **Categoría** | Configuración Institucional / PDF / Comunicaciones |
| **Prioridad** | Alta |

**Enunciado:**  
Toda información de identidad institucional utilizada en documentos generados por el sistema (PDF del permiso, correos electrónicos, portal público) debe obtenerse exclusivamente desde la tabla `configuracion_institucional`.

**Especificación:**
- `PDFModule` lee `nombre_alcaldia` y obtiene el escudo via URL firmada del `escudo_storage_key`.
- `NotificacionesModule` usa `nombre_alcaldia`, `direccion` y `correo_institucional` en el footer de los correos.
- El portal ciudadano (Frontend) muestra `nombre_alcaldia` y la URL firmada del escudo en el encabezado.
- Está **prohibido** leer estos datos desde la tabla `configuracion` (las claves deprecadas `nombre_alcaldia`, `municipio`, `logo_url` deberán eliminarse en la migración de Fase 2).

---

### RN-104 — El Escudo Institucional es Obligatorio

| Campo | Valor |
|-------|-------|
| **Tipo** | Validación |
| **Categoría** | Configuración Institucional |
| **Prioridad** | Alta |

**Enunciado:**  
El escudo oficial es un campo requerido. El sistema no permite guardar una configuración institucional sin escudo cargado.

**Especificación:**
- `escudo_storage_key` es `NOT NULL` en la tabla.
- El DTO de actualización valida que el archivo de escudo esté presente y sea de tipo `image/png` o `image/svg+xml` o `image/jpeg`.
- Si el escudo no está disponible al generar un PDF, el sistema lanza excepción `ESCUDO_NO_DISPONIBLE` y aborta la generación del permiso.

---

### RN-105 — Todo Cambio en la Configuración Institucional Queda Auditado

| Campo | Valor |
|-------|-------|
| **Tipo** | Acción |
| **Categoría** | Configuración Institucional / Auditoría |
| **Prioridad** | Alta |

**Enunciado:**  
Toda modificación de la configuración institucional genera un registro en la bitácora de auditoría con los valores anteriores y los nuevos.

**Especificación:**
- Se registra en `auditoria`: `accion = 'editar'`, `entidad = 'configuracion_institucional'`, `entidad_id = [uuid]`, `datos_anteriores = {campo: valor_previo}`, `datos_nuevos = {campo: valor_nuevo}`.
- El campo `updated_by` de `configuracion_institucional` se actualiza con el ID del administrador que realizó el cambio.
- Los `storage_key` de imágenes se incluyen en los datos de auditoría como referencias (no como contenido binario).

---

### RN-106 — La Configuración Institucional No Puede Eliminarse

| Campo | Valor |
|-------|-------|
| **Tipo** | Restricción |
| **Categoría** | Configuración Institucional |
| **Prioridad** | Crítica |

**Enunciado:**  
No existe endpoint de eliminación para la configuración institucional. El registro debe existir en todo momento para garantizar el funcionamiento del sistema.

**Especificación:**
- La tabla no tiene columna `deleted_at`.
- No existe endpoint `DELETE /api/v1/admin/configuracion-institucional`.
- Todo intento de eliminar el registro a nivel de base de datos debe ser rechazado mediante permisos del usuario de aplicación PostgreSQL.

---

### RN-107 — Las Imágenes Institucionales se Almacenan en MinIO con Acceso Privado

| Campo | Valor |
|-------|-------|
| **Tipo** | Restricción |
| **Categoría** | Configuración Institucional / Seguridad |
| **Prioridad** | Alta |

**Enunciado:**  
Los archivos de escudo y logo se almacenan en un bucket privado de MinIO. El acceso se realiza únicamente mediante URLs firmadas con TTL controlado.

**Especificación:**
- Bucket: `institucional/` (privado, no público).
- `storage_key` nunca se expone en la respuesta de la API. La API retorna una URL firmada con TTL de 5 minutos para consulta general y TTL de 60 segundos para inclusión en PDFs (generación inmediata).
- Al reemplazar una imagen, el archivo anterior permanece en MinIO hasta que un job de limpieza lo elimine (retención mínima 30 días para auditoría).
- Formatos permitidos: `image/png`, `image/svg+xml`, `image/jpeg`.
- Tamaño máximo: 5 MB por imagen.

---

### RN-108 — Cambio de Imágenes No Invalida PDFs ya Generados

| Campo | Valor |
|-------|-------|
| **Tipo** | Restricción |
| **Categoría** | Configuración Institucional / Permisos |
| **Prioridad** | Media |

**Enunciado:**  
La actualización del escudo o logo institucional no modifica los permisos PDF ya generados. Los nuevos PDFs usan las imágenes actualizadas.

**Especificación:**
- Los permisos PDF ya emitidos se almacenan íntegramente en MinIO y no se regeneran al cambiar la imagen institucional.
- Los `snapshot_ciudadano`, `snapshot_motocicleta` y `snapshot_motivo` del permiso contienen únicamente datos del ciudadano — la imagen del escudo se embebe en el PDF en el momento de su generación y queda capturada en el archivo almacenado.

---

## Reglas de Datos y Privacidad

### RN-96 — Consentimiento de Tratamiento de Datos es Obligatorio

| Campo | Valor |
|-------|-------|
| **Tipo** | Restricción |
| **Categoría** | Privacidad / Ley 1581 |
| **Prioridad** | Crítica |

**Enunciado:**  
Ninguna solicitud puede ser creada en el sistema sin que el ciudadano haya aceptado explícitamente la política de tratamiento de datos personales.

**Especificación:**
- Campo obligatorio en el DTO: `declaracionJurada: true` + `aceptaTratamientoDatos: true`.
- Constraint en DB: `CHECK (acepta_tratamiento_datos = true)` en la tabla `ciudadanos`.
- La fecha de aceptación se almacena en `fecha_aceptacion_datos`.
- El texto de la política que el ciudadano aceptó se mantiene versionado para referencia futura.

---

### RN-97 — Minimización de Datos Solicitados al Ciudadano

| Campo | Valor |
|-------|-------|
| **Tipo** | Restricción |
| **Categoría** | Privacidad / Ley 1581 |
| **Prioridad** | Alta |

**Especificación:**
- Solo se solicitan al ciudadano los datos estrictamente necesarios para el trámite.
- No se solicita información financiera, antecedentes, estado civil u otros datos no relevantes para el permiso.
- Los campos opcionales están marcados claramente como opcionales en el formulario.

---

### RN-98 — El Sistema Permite Atender Derechos ARCO

| Campo | Valor |
|-------|-------|
| **Tipo** | Acción |
| **Categoría** | Privacidad / Ley 1581 |
| **Prioridad** | Media |

**Enunciado:**  
El sistema debe permitir al administrador atender los derechos de Acceso, Rectificación, Cancelación y Oposición (ARCO) de los ciudadanos.

**Especificación:**
- El administrador puede consultar todos los datos de un ciudadano (Acceso).
- El administrador puede corregir datos del ciudadano (Rectificación) — funcionalidad en el panel admin.
- La eliminación de datos (Cancelación/Supresión) se gestiona mediante soft delete y anonimización fuera del alcance de la aplicación web estándar; requiere proceso manual documentado.
- Los derechos ARCO se atienden dentro de los plazos legales establecidos (10 días hábiles para respuesta inicial).

---

### RN-99 — Los Datos del Ciudadano No se Comparten con Terceros

| Campo | Valor |
|-------|-------|
| **Tipo** | Restricción |
| **Categoría** | Privacidad |
| **Prioridad** | Crítica |

**Especificación:**
- La API no tiene endpoints para exportación masiva de datos de ciudadanos a sistemas externos.
- Los reportes del administrador exportan datos agregados o anonimizados cuando es posible.
- No se integra con APIs de terceros que reciban datos personales de ciudadanos sin un acuerdo de tratamiento de datos.

---

### RN-100 — Las Fechas de Vencimiento se Calculan Incluyendo el Día de Inicio

| Campo | Valor |
|-------|-------|
| **Tipo** | Cálculo |
| **Categoría** | Permisos |
| **Prioridad** | Media |

**Especificación:**
- La vigencia del permiso incluye tanto el `fecha_inicio` como el `fecha_vencimiento`.
- El permiso es válido desde el inicio del día `fecha_inicio` (00:00 COT) hasta el final del día `fecha_vencimiento` (23:59:59 COT).
- El job de vencimiento marca como `vencido` al día siguiente (cuando `fecha_vencimiento < CURRENT_DATE`).
- La página de validación del QR verifica en tiempo real: `permiso.fecha_vencimiento >= CURRENT_DATE (COT)`.

---

## Marco Legal Aplicable

| Norma | Impacto en el Sistema |
|-------|----------------------|
| **Ley 527/1999** | Los mensajes electrónicos y documentos digitales tienen validez legal. El permiso PDF tiene valor jurídico. |
| **Ley 1581/2012** | Protección de datos personales. Requiere consentimiento explícito (RN-96), minimización (RN-97) y derechos ARCO (RN-98). |
| **Decreto 1377/2013** | Reglamenta la Ley 1581. Define cómo recolectar y gestionar la autorización de tratamiento de datos. |
| **Ley 1712/2014** | Transparencia y acceso a información pública. Los registros de auditoría deben conservarse mínimo 5 años (RN-66). |
| **CONPES 3854/2016** | Política nacional de seguridad digital. Guía la implementación de controles de seguridad (RN-51 a RN-58). |
| **Decreto 2693/2012** | Lineamientos para Gobierno en Línea. El sistema debe ser accesible y operable por internet. |
| **NTC 5854** | Norma técnica colombiana de accesibilidad web. El portal ciudadano debe cumplir WCAG 2.1 nivel AA. |
| **Ley 1437/2011** | Código de Procedimiento Administrativo. Los actos administrativos (permisos) deben ser comunicados al interesado. |
| **Resolución 20223040040905** | Normas del RUNT sobre identificación de motocicletas. La placa es el identificador único del vehículo. |

---

## Matriz de Impacto

| Regla | Solicitudes | Permisos | QR/PDF | Auth | Admin | Notificaciones |
|-------|:-----------:|:--------:|:------:|:----:|:-----:|:--------------:|
| RN-01 | ✅ | | | | | |
| RN-02 | ✅ | | | | ✅ | |
| RN-03 | ✅ | | | | | |
| RN-04 | ✅ | | | | | |
| RN-05 | | ✅ | ✅ | | | |
| RN-06 | ✅ | ✅ | ✅ | | | |
| RN-07 | | ✅ | | | | |
| RN-08 | ✅ | ✅ | | | | |
| RN-09 | ✅ | | | | | |
| RN-10 | ✅ | | | | | |
| RN-11 | ✅ | | | | ✅ | ✅ |
| RN-12 | ✅ | | | | ✅ | |
| RN-13 | ✅ | ✅ | | ✅ | ✅ | |
| RN-14 | ✅ | | | | | |
| RN-15 | ✅ | | | | | |
| RN-16 | ✅ | | | | | |
| RN-17 | ✅ | ✅ | | | | |
| RN-18 | ✅ | | | | | |
| RN-19 | ✅ | | | | | |
| RN-20 | ✅ | | | | | |
| RN-31 | | ✅ | | | | |
| RN-32 | ✅ | ✅ | | | | |
| RN-33 | | ✅ | ✅ | | | |
| RN-34 | | | ✅ | | | |
| RN-35 | | | ✅ | | | |
| RN-36 | | ✅ | | | | ✅ |
| RN-37 | | ✅ | | | ✅ | |
| RN-51 | | | | ✅ | | |
| RN-52 | | | | ✅ | | |
| RN-53 | ✅ | ✅ | | | | |
| RN-54 | ✅ | ✅ | ✅ | ✅ | ✅ | |
| RN-55 | ✅ | | | | | |
| RN-56 | ✅ | ✅ | | ✅ | ✅ | |
| RN-57 | ✅ | | | | | |
| RN-58 | ✅ | ✅ | | ✅ | ✅ | |
| RN-66 | | | | | ✅ | |
| RN-67 | ✅ | ✅ | ✅ | ✅ | ✅ | |
| RN-68 | | | | | ✅ | |
| RN-69 | | | | | ✅ | |
| RN-76 | | | | | | ✅ |
| RN-77 | ✅ | ✅ | | | | ✅ |
| RN-78 | | ✅ | | | | ✅ |
| RN-79 | | | | | | ✅ |
| RN-86 | | | ✅ | | ✅ | |
| RN-87 | ✅ | | | | ✅ | |
| RN-88 | | | | | ✅ | |
| RN-96 | ✅ | | | | | |
| RN-97 | ✅ | | | | | |
| RN-98 | | | | | ✅ | |
| RN-99 | | | | | ✅ | |
| RN-100 | | ✅ | ✅ | | | |
| RN-101 | | | ✅ | | | |
| RN-102 | | | | | ✅ | |
| RN-103 | | ✅ | ✅ | | ✅ | |
| RN-104 | ✅ | | | | | |
| RN-105 | | | ✅ | | ✅ | |
| RN-106 | | | | | ✅ | |
| RN-107 | | | ✅ | | | |
| RN-108 | | | | | ✅ | |

---

*Este documento es la fuente de verdad para las reglas de negocio del sistema.*  
*Toda nueva funcionalidad debe validarse contra estas reglas antes de ser implementada.*  
*En caso de conflicto entre una regla de negocio y un requerimiento de usuario, la regla de negocio prevalece.*
