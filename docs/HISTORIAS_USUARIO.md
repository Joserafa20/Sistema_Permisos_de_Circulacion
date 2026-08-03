# Historias de Usuario — Sistema de Permisos de Circulación (Pico y Placa)

**Versión:** 1.0  
**Fecha:** 2026-08-02  
**Referencia:** `docs/CASOS_USO.md` · `docs/PRD_Sistema_Permisos_de_Circulacion.md` · `docs/API_FUNCIONAL.md`  
**Metodología:** INVEST (Independiente, Negociable, Valiosa, Estimable, Small, Testeable)

---

## Índice

### Épicas
- [É-01 Portal del Ciudadano](#é-01-portal-del-ciudadano)
- [É-02 Gestión de Solicitudes por Funcionario](#é-02-gestión-de-solicitudes-por-funcionario)
- [É-03 Generación y Distribución del Permiso](#é-03-generación-y-distribución-del-permiso)
- [É-04 Verificación Pública del Permiso](#é-04-verificación-pública-del-permiso)
- [É-05 Autenticación y Seguridad](#é-05-autenticación-y-seguridad)
- [É-06 Panel Administrativo](#é-06-panel-administrativo)
- [É-07 Automatización del Sistema](#é-07-automatización-del-sistema)
- [É-08 Notificaciones](#é-08-notificaciones)
- [É-09 Configuración Institucional](#é-09-configuración-institucional)

### Tabla de Historias por Épica

| ID | Historia | Épica | Sprint |
|----|----------|-------|--------|
| HU-01 | Solicitar permiso de circulación | É-01 | 3 |
| HU-02 | Aceptar política de tratamiento de datos | É-01 | 3 |
| HU-03 | Adjuntar documentos de soporte | É-01 | 3 |
| HU-04 | Consultar estado de mi solicitud | É-01 | 3 |
| HU-05 | Corregir datos de mi solicitud | É-01 | 3 |
| HU-06 | Descargar mi permiso aprobado | É-01 | 4 |
| HU-07 | Recuperar datos del formulario sin perderlos | É-01 | 5 |
| HU-08 | Recibir confirmación visual al enviar solicitud | É-01 | 5 |
| HU-09 | Ver lista de solicitudes pendientes | É-02 | 3 |
| HU-10 | Revisar el detalle completo de una solicitud | É-02 | 3 |
| HU-11 | Previsualizar documentos adjuntos | É-02 | 3 |
| HU-12 | Aprobar una solicitud | É-02 | 3 |
| HU-13 | Rechazar una solicitud con motivo | É-02 | 3 |
| HU-14 | Solicitar corrección de datos al ciudadano | É-02 | 3 |
| HU-15 | Ver el historial de estados de una solicitud | É-02 | 3 |
| HU-16 | Filtrar y buscar solicitudes | É-02 | 3 |
| HU-17 | Ver indicadores del día en mi dashboard | É-02 | 6 |
| HU-18 | Generar automáticamente el PDF del permiso | É-03 | 4 |
| HU-19 | Generar el código QR único del permiso | É-03 | 4 |
| HU-20 | Descargar el PDF desde el panel de funcionario | É-03 | 4 |
| HU-21 | Revocar un permiso vigente | É-03 | 4 |
| HU-22 | Validar un permiso escaneando el código QR | É-04 | 4 |
| HU-23 | Ver información clara al escanear el QR | É-04 | 4 |
| HU-24 | Iniciar sesión en el sistema | É-05 | 2 |
| HU-25 | Cerrar sesión de forma segura | É-05 | 2 |
| HU-26 | Recuperar mi contraseña olvidada | É-05 | 2 |
| HU-27 | Cambiar mi contraseña desde mi perfil | É-05 | 2 |
| HU-28 | Bloquear cuenta por intentos fallidos | É-05 | 2 |
| HU-29 | Renovar sesión sin interrumpir el trabajo | É-05 | 2 |
| HU-30 | Gestionar usuarios funcionarios | É-06 | 7 |
| HU-31 | Activar y desactivar cuentas de usuario | É-06 | 7 |
| HU-32 | Gestionar motivos del formulario | É-06 | 7 |
| HU-33 | Gestionar dependencias de la alcaldía | É-06 | 7 |
| HU-34 | Configurar parámetros del sistema | É-06 | 7 |
| HU-35 | Ver la bitácora de auditoría | É-06 | 7 |
| HU-36 | Generar y exportar reportes estadísticos | É-06 | 7 |
| HU-37 | Ver dashboard administrativo global | É-06 | 7 |
| HU-38 | Marcar solicitudes vencidas automáticamente | É-07 | 3 |
| HU-39 | Marcar permisos vencidos automáticamente | É-07 | 4 |
| HU-40 | Recibir correo de confirmación de solicitud | É-08 | 3 |
| HU-41 | Recibir correo cuando mi permiso es aprobado | É-08 | 4 |
| HU-42 | Recibir correo cuando mi solicitud es rechazada | É-08 | 3 |
| HU-43 | Recibir correo con instrucciones de corrección | É-08 | 3 |
| HU-44 | Consultar la configuración institucional actual | É-09 | 7 |
| HU-45 | Editar los datos institucionales de la alcaldía | É-09 | 7 |
| HU-46 | Cargar o reemplazar el escudo oficial | É-09 | 7 |
| HU-47 | Cargar o reemplazar el logo institucional | É-09 | 7 |
| HU-48 | Registrar condiciones y restricciones de un permiso | É-02 | 4 |

---

## É-01 Portal del Ciudadano

**Descripción:** Como ciudadano necesito realizar todo el trámite de permiso de Pico y Placa de forma digital, sin necesidad de desplazarme a la alcaldía y sin crear una cuenta.

---

### HU-01 — Solicitar Permiso de Circulación

> **Como** ciudadano que necesita circular en horario de Pico y Placa con mi motocicleta,  
> **quiero** diligenciar un formulario en línea con mis datos personales, los datos de mi moto y el motivo de mi necesidad,  
> **para** obtener un permiso de circulación oficial expedido por la alcaldía.

**Criterios de Aceptación:**

- [ ] **CA-01-1:** El formulario se presenta en 5 pasos secuenciales (stepper): Datos personales → Datos de la moto → Motivo y fechas → Documentos → Confirmación.
- [ ] **CA-01-2:** El sistema valida el formato de la placa (colombiano: `AAA000` o `AAA00A`) en tiempo real mientras el ciudadano escribe.
- [ ] **CA-01-3:** El campo tipo de documento acepta únicamente: CC, CE, PAS, TI, NIT.
- [ ] **CA-01-4:** La fecha de inicio del permiso no puede ser anterior a la fecha actual.
- [ ] **CA-01-5:** La fecha de fin no puede superar la duración máxima configurada (`dias_max_permiso`, por defecto 30 días).
- [ ] **CA-01-6:** Si la motocicleta ya tiene una solicitud activa, el sistema muestra el mensaje: *"La motocicleta [PLACA] ya tiene una solicitud en proceso con radicado [RADICADO]."* e impide continuar.
- [ ] **CA-01-7:** El sistema integra reCAPTCHA v3. Si el score es inferior a 0.5, la solicitud es rechazada.
- [ ] **CA-01-8:** Al enviarse exitosamente, el sistema muestra el número de radicado de forma prominente con formato `AAAAMMDD-PYP-XXXXXX`.
- [ ] **CA-01-9:** El ciudadano no necesita crear una cuenta para realizar el trámite.
- [ ] **CA-01-10:** El formulario es responsive y funciona correctamente en móvil, tablet y escritorio.

**Reglas de Negocio:** RN-01, RN-02, RN-03, RN-13, RN-14, Ley 1581.

**Escenarios de Prueba:**

| Escenario | Entrada | Resultado esperado |
|-----------|---------|-------------------|
| Solicitud válida completa | Todos los campos correctos, moto sin solicitud activa | Radicado generado, estado `recibida`, correo enviado |
| Placa con formato inválido | Placa: `AB123` | Error en tiempo real: "Formato de placa inválido" |
| Fecha de inicio en el pasado | Fecha de inicio: ayer | Error: "La fecha de inicio no puede ser anterior a hoy" |
| Moto con solicitud activa | Placa de moto con radicado activo | Error: muestra el radicado existente |
| CAPTCHA sospechoso | Score reCAPTCHA 0.3 | Error genérico. Solicitud no registrada |
| Solicitud sin aceptar Ley 1581 | `declaracionJurada = false` | El botón "Enviar" permanece deshabilitado |

**Sprint:** 3 · **Prioridad:** Crítica · **Puntos de historia:** 13  
**Referencia:** CU-01, `POST /api/v1/public/solicitudes`

---

### HU-02 — Aceptar Política de Tratamiento de Datos

> **Como** ciudadano,  
> **quiero** ver claramente la política de privacidad de la alcaldía y poder aceptarla explícitamente antes de enviar mi solicitud,  
> **para** que mis datos sean tratados con el cumplimiento de la Ley 1581 de 2012.

**Criterios de Aceptación:**

- [ ] **CA-02-1:** En el paso 5 del formulario se presenta una casilla de verificación con el texto: *"Autorizo el tratamiento de mis datos personales conforme a la política de privacidad de la alcaldía y la Ley 1581 de 2012."*
- [ ] **CA-02-2:** La casilla incluye un enlace a la política de privacidad completa que abre en una nueva pestaña.
- [ ] **CA-02-3:** El botón "Enviar Solicitud" está deshabilitado si la casilla no está marcada.
- [ ] **CA-02-4:** El campo `acepta_tratamiento_datos = true` y `fecha_aceptacion_datos = timestamp_actual` quedan registrados en la base de datos.
- [ ] **CA-02-5:** No es posible crear una solicitud vía API sin `declaracionJurada: true` (validación en DTO).

**Reglas de Negocio:** Ley 1581/2012, Decreto 1377/2013.

**Sprint:** 3 · **Prioridad:** Crítica · **Puntos de historia:** 2  
**Referencia:** CU-01, campo `acepta_tratamiento_datos`

---

### HU-03 — Adjuntar Documentos de Soporte

> **Como** ciudadano que está creando o corrigiendo una solicitud,  
> **quiero** adjuntar los documentos de soporte requeridos (cédula, licencia, SOAT, etc.) desde mi dispositivo,  
> **para** que el funcionario pueda verificar mi información y aprobar mi solicitud.

**Criterios de Aceptación:**

- [ ] **CA-03-1:** El sistema acepta archivos en formato PDF, JPG y PNG únicamente.
- [ ] **CA-03-2:** El tamaño máximo por archivo es 10 MB. Si se supera, muestra: *"El archivo supera el tamaño máximo permitido de 10 MB."*
- [ ] **CA-03-3:** El sistema permite cargar múltiples documentos en el mismo paso.
- [ ] **CA-03-4:** Al cargar cada archivo, el sistema muestra el nombre del archivo y un ícono de confirmación.
- [ ] **CA-03-5:** El sistema calcula y almacena el hash SHA-256 del archivo para verificación de integridad.
- [ ] **CA-03-6:** La ruta interna del archivo (`storage_key`) nunca aparece en ninguna respuesta de API.
- [ ] **CA-03-7:** Los documentos se conservan en el sistema incluso si la solicitud es rechazada.
- [ ] **CA-03-8:** Si el motivo seleccionado requiere documentos específicos, el sistema los resalta como obligatorios.

**Sprint:** 3 · **Prioridad:** Alta · **Puntos de historia:** 5  
**Referencia:** CU-02, CU-03, `POST /api/v1/solicitudes/{id}/documentos`

---

### HU-04 — Consultar Estado de Mi Solicitud

> **Como** ciudadano que ya envió una solicitud,  
> **quiero** consultar el estado actual de mi trámite usando mi número de radicado y número de documento,  
> **para** saber si debo realizar alguna acción o esperar la resolución.

**Criterios de Aceptación:**

- [ ] **CA-04-1:** La página de consulta solicita únicamente el número de radicado y el número de documento.
- [ ] **CA-04-2:** El sistema muestra el estado con lenguaje ciudadano (no técnico):
  - `recibida` → *"Su solicitud fue recibida y está en espera de revisión."*
  - `en_revision` → *"Su solicitud está siendo revisada por un funcionario."*
  - `pendiente_correccion` → *"El funcionario requiere que corrija algunos datos."*
  - `aprobada` → *"¡Su solicitud fue aprobada! Puede descargar su permiso."*
  - `rechazada` → *"Su solicitud fue rechazada."* + motivo del rechazo.
  - `vencida` → *"Su solicitud venció. Puede crear una nueva solicitud."*
- [ ] **CA-04-3:** Si el estado es `pendiente_correccion`, se muestran los campos específicos a corregir.
- [ ] **CA-04-4:** Si el estado es `aprobada` y el permiso está vigente, se muestra el botón "Descargar Permiso".
- [ ] **CA-04-5:** La respuesta es idéntica si el radicado no existe o si el documento no coincide (prevención de enumeración).
- [ ] **CA-04-6:** Rate limiting: máximo 10 consultas por IP por minuto.

**Sprint:** 3 · **Prioridad:** Alta · **Puntos de historia:** 3  
**Referencia:** CU-03, `GET /api/v1/public/solicitudes/estado`

---

### HU-05 — Corregir Datos de Mi Solicitud

> **Como** ciudadano cuya solicitud fue devuelta para corrección,  
> **quiero** ver exactamente qué datos debo corregir y poder enviar la versión corregida,  
> **para** que el funcionario pueda aprobar mi solicitud sin necesidad de crearla de nuevo.

**Criterios de Aceptación:**

- [ ] **CA-05-1:** El ciudadano accede con radicado + número de documento.
- [ ] **CA-05-2:** El sistema muestra la lista de correcciones solicitadas por el funcionario con la descripción específica de cada una.
- [ ] **CA-05-3:** Solo los campos señalados por el funcionario son editables; el resto están bloqueados.
- [ ] **CA-05-4:** Si la corrección involucra documentos, el ciudadano puede reemplazar el archivo específico.
- [ ] **CA-05-5:** Al enviar las correcciones, la solicitud vuelve al estado `recibida`.
- [ ] **CA-05-6:** Si el plazo de corrección venció, el sistema muestra: *"El plazo para corregir ha vencido. Debe crear una nueva solicitud."* y no permite enviar.
- [ ] **CA-05-7:** El sistema envía una notificación al funcionario indicando que la corrección fue enviada.

**Reglas de Negocio:** RN-11 (plazo corrección configurable, default 5 días hábiles).

**Sprint:** 3 · **Prioridad:** Alta · **Puntos de historia:** 5  
**Referencia:** CU-04, `PUT /api/v1/public/solicitudes/{radicado}/correccion`

---

### HU-06 — Descargar Mi Permiso Aprobado

> **Como** ciudadano cuya solicitud fue aprobada,  
> **quiero** descargar el PDF oficial de mi permiso de circulación,  
> **para** presentarlo ante las autoridades de tránsito cuando sea requerido.

**Criterios de Aceptación:**

- [ ] **CA-06-1:** El botón de descarga aparece en la página de consulta de estado solo cuando el estado es `aprobada` y el permiso está `vigente`.
- [ ] **CA-06-2:** Al hacer clic, el sistema verifica la identidad del solicitante (radicado + documento).
- [ ] **CA-06-3:** El sistema genera una URL firmada temporal con TTL de 5 minutos para acceder al PDF.
- [ ] **CA-06-4:** El PDF descargado contiene: nombre del titular, documento, placa, motivo, fechas, número de permiso, código QR, firma y sello institucional.
- [ ] **CA-06-5:** Si el permiso está `vencido`, el sistema muestra: *"Su permiso venció el [fecha]."* sin botón de descarga.
- [ ] **CA-06-6:** Si el permiso está `revocado`, el sistema muestra: *"Su permiso fue revocado por la autoridad competente."*
- [ ] **CA-06-7:** La ruta interna del archivo (`storage_key`) nunca aparece en la URL de descarga.

**Sprint:** 4 · **Prioridad:** Alta · **Puntos de historia:** 3  
**Referencia:** CU-05, `GET /api/v1/public/permisos/{radicado}/descargar`

---

### HU-07 — Recuperar Datos del Formulario Sin Perderlos

> **Como** ciudadano que está diligenciando el formulario,  
> **quiero** que mis datos se conserven si cierro el navegador o cambio de pestaña accidentalmente,  
> **para** no tener que comenzar el formulario desde cero.

**Criterios de Aceptación:**

- [ ] **CA-07-1:** El formulario guarda automáticamente el progreso en `localStorage` cada vez que el ciudadano avanza un paso o modifica un campo.
- [ ] **CA-07-2:** Al regresar a la página del formulario, el sistema detecta datos guardados y los restaura automáticamente.
- [ ] **CA-07-3:** El sistema muestra un aviso: *"Encontramos datos de un formulario anterior. ¿Desea continuar desde donde lo dejó?"* con opciones: Continuar / Empezar de nuevo.
- [ ] **CA-07-4:** Los datos guardados se eliminan del `localStorage` después de que la solicitud se envía exitosamente.
- [ ] **CA-07-5:** Ningún dato sensible (como el número de documento) se almacena en el servidor sin que el ciudadano haya enviado el formulario completo.

**Sprint:** 5 · **Prioridad:** Media · **Puntos de historia:** 3  
**Referencia:** CU-01, comportamiento de frontend

---

### HU-08 — Recibir Confirmación Visual al Enviar la Solicitud

> **Como** ciudadano que acaba de enviar su solicitud,  
> **quiero** ver una pantalla de confirmación clara con mi número de radicado y las instrucciones de seguimiento,  
> **para** saber qué debo hacer a continuación y cómo consultar el estado de mi trámite.

**Criterios de Aceptación:**

- [ ] **CA-08-1:** La pantalla de confirmación muestra el número de radicado de forma prominente (tipografía grande, resaltado).
- [ ] **CA-08-2:** La pantalla explica en lenguaje ciudadano los pasos siguientes del proceso.
- [ ] **CA-08-3:** La pantalla incluye un enlace directo a la página de consulta de estado precargada con el radicado.
- [ ] **CA-08-4:** La pantalla informa que se enviará un correo de confirmación con el radicado.
- [ ] **CA-08-5:** El botón de "Volver al inicio" regresa a la página principal del portal.
- [ ] **CA-08-6:** Si el ciudadano recarga la página de confirmación, el sistema muestra el mismo radicado (no genera uno nuevo).

**Sprint:** 5 · **Prioridad:** Media · **Puntos de historia:** 2  
**Referencia:** CU-01

---

## É-02 Gestión de Solicitudes por Funcionario

**Descripción:** Como funcionario de la alcaldía necesito herramientas eficientes para revisar, aprobar, rechazar o corregir las solicitudes de permiso de Pico y Placa recibidas diariamente.

---

### HU-09 — Ver Lista de Solicitudes Pendientes

> **Como** funcionario de la alcaldía,  
> **quiero** ver una cola organizada de solicitudes pendientes de revisión,  
> **para** atenderlas de forma ordenada y sin perder ninguna.

**Criterios de Aceptación:**

- [ ] **CA-09-1:** La cola muestra solicitudes en estado `recibida`, `en_revision` y `pendiente_correccion`.
- [ ] **CA-09-2:** Las solicitudes están ordenadas por `created_at ASC` (más antiguas primero — FIFO).
- [ ] **CA-09-3:** Cada tarjeta de solicitud muestra: número de radicado, nombre del ciudadano, placa, motivo, fecha de solicitud y tiempo de espera.
- [ ] **CA-09-4:** Las solicitudes que llevan más de 24 horas sin atención se resaltan con un indicador visual de urgencia (color rojo o etiqueta "⚠ Urgente").
- [ ] **CA-09-5:** La cola se actualiza automáticamente cada 60 segundos sin recargar la página.
- [ ] **CA-09-6:** El sistema muestra el total de solicitudes en cada estado en la cabecera de la cola.

**Sprint:** 3 · **Prioridad:** Alta · **Puntos de historia:** 5  
**Referencia:** CU-13, `GET /api/v1/solicitudes`

---

### HU-10 — Revisar el Detalle Completo de una Solicitud

> **Como** funcionario,  
> **quiero** ver todos los datos de una solicitud en una sola vista: datos del ciudadano, de la moto, el motivo, las fechas y los documentos adjuntos,  
> **para** tomar una decisión fundamentada sobre la aprobación o rechazo.

**Criterios de Aceptación:**

- [ ] **CA-10-1:** Al abrir una solicitud, si está en estado `recibida`, el sistema la cambia automáticamente a `en_revision` y registra el cambio en `historial_estados`.
- [ ] **CA-10-2:** La vista muestra todos los datos del ciudadano (nombre, documento, contacto) y de la motocicleta (placa, marca, modelo, cilindraje).
- [ ] **CA-10-3:** La vista muestra el motivo, la descripción adicional y el rango de fechas solicitado.
- [ ] **CA-10-4:** La vista lista todos los documentos adjuntos con su tipo y fecha de carga.
- [ ] **CA-10-5:** Los botones de acción (Aprobar, Rechazar, Solicitar Corrección) están visibles y accesibles en la vista de detalle.
- [ ] **CA-10-6:** La vista incluye la pestaña de "Historial" con los cambios de estado previos.

**Sprint:** 3 · **Prioridad:** Alta · **Puntos de historia:** 5  
**Referencia:** CU-14, `GET /api/v1/solicitudes/{id}`

---

### HU-11 — Previsualizar Documentos Adjuntos

> **Como** funcionario revisando una solicitud,  
> **quiero** ver el contenido de los documentos adjuntos directamente en el navegador sin descargarlos,  
> **para** revisar más rápidamente la documentación sin abrir programas externos.

**Criterios de Aceptación:**

- [ ] **CA-11-1:** Al hacer clic en un documento PDF, el sistema lo abre en un panel lateral o pestaña del navegador (inline).
- [ ] **CA-11-2:** Las imágenes (JPG, PNG) se previsualizan inline sin descarga.
- [ ] **CA-11-3:** El sistema genera una URL firmada temporal con TTL de 5 minutos para acceder al archivo.
- [ ] **CA-11-4:** La `storage_key` nunca aparece en la URL ni en ningún elemento del DOM.
- [ ] **CA-11-5:** El sistema registra en `auditoria` cada acceso a un documento adjunto.
- [ ] **CA-11-6:** Si la URL firmada expira, el sistema genera automáticamente una nueva al hacer clic de nuevo.

**Sprint:** 3 · **Prioridad:** Alta · **Puntos de historia:** 3  
**Referencia:** CU-18, `GET /api/v1/solicitudes/{id}/documentos/{docId}/url`

---

### HU-12 — Aprobar una Solicitud

> **Como** funcionario que verificó que una solicitud cumple con todos los requisitos,  
> **quiero** aprobarla con un solo clic de confirmación,  
> **para** que el sistema genere automáticamente el permiso y el ciudadano sea notificado.

**Criterios de Aceptación:**

- [ ] **CA-12-1:** El botón "Aprobar" está disponible solo cuando la solicitud está en estado `en_revision`.
- [ ] **CA-12-2:** Al hacer clic, el sistema muestra un modal de confirmación con un resumen: nombre del ciudadano, placa, motivo y fechas del permiso.
- [ ] **CA-12-3:** Al confirmar, el sistema cambia el estado a `aprobada` y retorna respuesta 202 (procesamiento asíncrono).
- [ ] **CA-12-4:** El sistema encola la generación del PDF y el QR en BullMQ.
- [ ] **CA-12-5:** El sistema registra la aprobación en `historial_estados` y `auditoria` con el ID del funcionario.
- [ ] **CA-12-6:** El funcionario ve una confirmación: *"Solicitud aprobada. El permiso está siendo generado."*
- [ ] **CA-12-7:** Una vez aprobada, la solicitud desaparece de la cola de pendientes.

**Sprint:** 3 · **Prioridad:** Crítica · **Puntos de historia:** 5  
**Referencia:** CU-15, `POST /api/v1/solicitudes/{id}/aprobar`

---

### HU-48 — Registrar Condiciones y Restricciones de un Permiso

> **Como** funcionario autorizado de la Secretaría de Movilidad,  
> **quiero** poder registrar condiciones o restricciones específicas al aprobar o después de aprobar un permiso,  
> **para** comunicarle al ciudadano y a las autoridades de tránsito limitaciones particulares de circulación que el permiso general no cubre.

**Criterios de Aceptación:**

- [ ] **CA-48-1:** El modal de confirmación de aprobación (CU-15) incluye un campo de texto opcional etiquetado "Condiciones y Restricciones" con placeholder *"Ej: Válido únicamente entre 06:00 y 18:00. Portar cédula de ciudadanía en todo momento."*
- [ ] **CA-48-2:** El campo tiene un contador de caracteres visible y no permite superar 500 caracteres (validado en frontend y backend).
- [ ] **CA-48-3:** El campo es de llenado opcional: si el funcionario no escribe nada, el permiso se aprueba normalmente sin condiciones.
- [ ] **CA-48-4:** Una vez aprobado el permiso, el funcionario puede editar el campo desde el detalle del permiso mediante el botón "Editar Condiciones", disponible solo para roles `funcionario` y `administrador`.
- [ ] **CA-48-5:** Cada edición queda registrada en `auditoria` con el valor anterior y el valor nuevo.
- [ ] **CA-48-6:** Al escanear el QR del permiso, si hay condiciones registradas, se muestran en una sección destacada "⚠️ Condiciones y Restricciones" con el valor actual (no el valor del PDF).
- [ ] **CA-48-7:** El PDF generado incluye la sección "Condiciones y Restricciones" solo si el campo tenía valor al momento de generación; las ediciones posteriores no regeneran el PDF (RN-33).
- [ ] **CA-48-8:** El campo `condicionesRestricciones` no está incluido en el DTO público del ciudadano (RN-38).

**Reglas de Negocio:** RN-38, RN-39, RN-33.

**Sprint:** 4 · **Prioridad:** Media · **Puntos de historia:** 3  
**Referencia:** CU-15, `PATCH /api/v1/permisos/{id}/condiciones`

---

### HU-13 — Rechazar una Solicitud con Motivo

> **Como** funcionario que determina que una solicitud no cumple los requisitos,  
> **quiero** rechazarla indicando el motivo específico,  
> **para** que el ciudadano entienda por qué fue rechazada y pueda crear una nueva solicitud si aplica.

**Criterios de Aceptación:**

- [ ] **CA-13-1:** El botón "Rechazar" está disponible cuando la solicitud está en estado `en_revision` o `pendiente_correccion`.
- [ ] **CA-13-2:** El sistema muestra un modal con un campo de texto libre obligatorio para el motivo del rechazo (mínimo 20 caracteres).
- [ ] **CA-13-3:** El botón "Confirmar Rechazo" está deshabilitado si el campo de motivo está vacío o tiene menos de 20 caracteres.
- [ ] **CA-13-4:** Al confirmar, el estado cambia a `rechazada`.
- [ ] **CA-13-5:** El sistema registra el rechazo con el motivo en `historial_estados` y `auditoria`.
- [ ] **CA-13-6:** El sistema encola una notificación de correo al ciudadano con el motivo del rechazo.
- [ ] **CA-13-7:** Una solicitud rechazada no puede volver a ser abierta para revisión (estado terminal).

**Reglas de Negocio:** RN-10 (solicitud rechazada no puede reabrirse).

**Sprint:** 3 · **Prioridad:** Alta · **Puntos de historia:** 3  
**Referencia:** CU-16, `POST /api/v1/solicitudes/{id}/rechazar`

---

### HU-14 — Solicitar Corrección de Datos al Ciudadano

> **Como** funcionario que identifica datos insuficientes o documentos incorrectos,  
> **quiero** indicar exactamente qué debe corregir el ciudadano,  
> **para** darle la oportunidad de subsanar su solicitud sin rechazarla definitivamente.

**Criterios de Aceptación:**

- [ ] **CA-14-1:** El botón "Solicitar Corrección" está disponible cuando la solicitud está en `en_revision`.
- [ ] **CA-14-2:** El sistema presenta un formulario donde el funcionario escribe el motivo general (obligatorio, mínimo 20 caracteres).
- [ ] **CA-14-3:** El formulario permite al funcionario seleccionar los campos o documentos específicos a corregir y escribir una instrucción clara para cada uno.
- [ ] **CA-14-4:** Al confirmar, el estado cambia a `pendiente_correccion`.
- [ ] **CA-14-5:** Los campos y las instrucciones se guardan en `historial_estados.campos_correccion` como JSONB.
- [ ] **CA-14-6:** El sistema activa el contador del plazo de corrección (`plazo_correccion_dias`).
- [ ] **CA-14-7:** El sistema encola correo al ciudadano con la lista detallada de correcciones requeridas.

**Reglas de Negocio:** RN-11 (plazo configurable, default 5 días hábiles).

**Sprint:** 3 · **Prioridad:** Alta · **Puntos de historia:** 5  
**Referencia:** CU-17, `POST /api/v1/solicitudes/{id}/correccion`

---

### HU-15 — Ver el Historial de Estados de una Solicitud

> **Como** funcionario revisando una solicitud,  
> **quiero** ver una línea de tiempo de todos los cambios de estado que ha tenido,  
> **para** entender el contexto completo de la solicitud antes de tomar una decisión.

**Criterios de Aceptación:**

- [ ] **CA-15-1:** La pestaña "Historial" muestra todos los registros de `historial_estados` ordenados cronológicamente de más antiguo a más reciente.
- [ ] **CA-15-2:** Cada entrada del historial muestra: estado anterior, estado nuevo, usuario responsable (o "Sistema automático"), fecha y hora, y motivo (si aplica).
- [ ] **CA-15-3:** Las horas se muestran en zona horaria COT (UTC-5).
- [ ] **CA-15-4:** El historial incluye los cambios automáticos del sistema (jobs de vencimiento).
- [ ] **CA-15-5:** El historial es de solo lectura para el funcionario.

**Sprint:** 3 · **Prioridad:** Media · **Puntos de historia:** 2  
**Referencia:** CU-19, `GET /api/v1/solicitudes/{id}/historial`

---

### HU-16 — Filtrar y Buscar Solicitudes

> **Como** funcionario,  
> **quiero** buscar solicitudes por radicado, número de documento, placa o filtrar por estado y fecha,  
> **para** encontrar rápidamente una solicitud específica sin necesidad de desplazarme por toda la cola.

**Criterios de Aceptación:**

- [ ] **CA-16-1:** El panel de solicitudes incluye una barra de búsqueda que acepta: número de radicado, número de documento del ciudadano o placa de la moto.
- [ ] **CA-16-2:** Se pueden aplicar filtros adicionales: estado (uno o varios), rango de fechas de creación.
- [ ] **CA-16-3:** Los filtros y la búsqueda son combinables (búsqueda + filtro de estado al mismo tiempo).
- [ ] **CA-16-4:** Los resultados se actualizan en tiempo real conforme el funcionario escribe en la barra de búsqueda (debounce de 300ms).
- [ ] **CA-16-5:** Cuando no hay resultados, el sistema muestra: *"No se encontraron solicitudes con los criterios seleccionados."*
- [ ] **CA-16-6:** Los filtros aplicados pueden borrarse individualmente o todos a la vez con un botón "Limpiar filtros".

**Sprint:** 3 · **Prioridad:** Media · **Puntos de historia:** 3  
**Referencia:** CU-16, parámetros de query en `GET /api/v1/solicitudes`

---

### HU-17 — Ver Indicadores del Día en Mi Dashboard

> **Como** funcionario,  
> **quiero** ver un resumen de los indicadores de trabajo del día actual al ingresar al sistema,  
> **para** tener una visión rápida de la carga de trabajo y priorizar mis acciones.

**Criterios de Aceptación:**

- [ ] **CA-17-1:** El dashboard muestra los siguientes KPIs calculados para el día actual: solicitudes recibidas, en revisión, pendientes de corrección, aprobadas, rechazadas.
- [ ] **CA-17-2:** El dashboard muestra el total de permisos vigentes en el sistema.
- [ ] **CA-17-3:** Se muestra una alerta destacada si hay solicitudes que llevan más de 24 horas sin atención.
- [ ] **CA-17-4:** Los indicadores son clickeables y llevan al listado filtrado correspondiente.
- [ ] **CA-17-5:** Los datos se actualizan al recargar la página.

**Sprint:** 6 · **Prioridad:** Media · **Puntos de historia:** 3  
**Referencia:** CU-21, `GET /api/v1/dashboard/funcionario`

---

## É-03 Generación y Distribución del Permiso

**Descripción:** Como sistema, debo generar automáticamente los documentos oficiales del permiso con garantías de integridad, unicidad y trazabilidad.

---

### HU-18 — Generar Automáticamente el PDF del Permiso

> **Como** sistema, tras la aprobación de una solicitud,  
> **quiero** generar automáticamente el documento PDF institucional del permiso de circulación,  
> **para** que el ciudadano tenga un documento oficial descargable con toda la información relevante.

**Criterios de Aceptación:**

- [ ] **CA-18-1:** La generación del PDF ocurre de forma asíncrona vía job de BullMQ, sin bloquear la respuesta al funcionario.
- [ ] **CA-18-2:** El PDF incluye: encabezado con logo y nombre de la alcaldía, título, número de permiso (`AAAA-PYP-NNNNN`), número de radicado, datos del titular, datos de la moto, motivo, fechas de vigencia, imagen del QR, nombre del funcionario autorizante, firma y sello institucional, pie de página.
- [ ] **CA-18-3:** Los datos del PDF reflejan el snapshot capturado al momento de la aprobación (no datos actuales del ciudadano o moto) (RN-06).
- [ ] **CA-18-4:** El sistema calcula el hash SHA-256 del PDF generado y lo almacena en la tabla `permisos`.
- [ ] **CA-18-5:** El PDF se almacena en el bucket privado de MinIO con nombre basado en el código del permiso.
- [ ] **CA-18-6:** Si la generación falla, el job se reintenta hasta 3 veces con backoff exponencial (1 min, 5 min, 15 min).
- [ ] **CA-18-7:** Si el job falla definitivamente, pasa a Dead Letter Queue y se alerta al administrador.
- [ ] **CA-18-8:** El logo, firma y sello se cargan desde la configuración del sistema (tabla `configuracion`).

**Reglas de Negocio:** RN-06, RN-07.

**Sprint:** 4 · **Prioridad:** Crítica · **Puntos de historia:** 8  
**Referencia:** CU-24, `PDFModule`

---

### HU-19 — Generar el Código QR Único del Permiso

> **Como** sistema, al generar el permiso,  
> **quiero** crear un código QR único e irrepetible que identifique el permiso de forma opaca,  
> **para** permitir la verificación en campo sin exponer datos personales del ciudadano.

**Criterios de Aceptación:**

- [ ] **CA-19-1:** El código QR es un identificador opaco generado con UUID v4 + hash SHA-256 del ID del permiso concatenado con un salt secreto del servidor.
- [ ] **CA-19-2:** El código QR nunca contiene datos personales directamente legibles.
- [ ] **CA-19-3:** La URL embebida en el QR tiene el formato: `https://dominio.gov.co/verificar/{codigoOpaco}`.
- [ ] **CA-19-4:** El código QR es verificado como único antes de ser almacenado (constraint UNIQUE en base de datos).
- [ ] **CA-19-5:** La imagen del QR se embebe directamente dentro del PDF (no es una URL externa).
- [ ] **CA-19-6:** Si el permiso es revocado y se emite uno nuevo, el nuevo QR es diferente al anterior. El QR anterior queda permanentemente inválido.

**Reglas de Negocio:** RN-05.

**Sprint:** 4 · **Prioridad:** Crítica · **Puntos de historia:** 5  
**Referencia:** CU-25, `QRModule`

---

### HU-20 — Descargar el PDF del Permiso desde el Panel de Funcionario

> **Como** funcionario,  
> **quiero** poder descargar o imprimir el PDF del permiso de una solicitud aprobada,  
> **para** entregarlo físicamente al ciudadano si lo solicita en la alcaldía.

**Criterios de Aceptación:**

- [ ] **CA-20-1:** En el detalle de una solicitud aprobada, el botón "Descargar Permiso" está disponible.
- [ ] **CA-20-2:** El sistema genera una URL firmada temporal (TTL 5 min) y el PDF se abre en el navegador o se descarga.
- [ ] **CA-20-3:** La descarga queda registrada en `auditoria` con el ID del funcionario.
- [ ] **CA-20-4:** El botón también está disponible en el listado de permisos del panel administrativo.

**Sprint:** 4 · **Prioridad:** Media · **Puntos de historia:** 2  
**Referencia:** CU-20, `GET /api/v1/permisos/{id}/pdf`

---

### HU-21 — Revocar un Permiso Vigente

> **Como** administrador,  
> **quiero** poder revocar un permiso vigente indicando el motivo,  
> **para** que el código QR del permiso deje de ser válido de inmediato en caso de irregularidades.

**Criterios de Aceptación:**

- [ ] **CA-21-1:** Solo los usuarios con rol `administrador` pueden revocar permisos.
- [ ] **CA-21-2:** El botón "Revocar Permiso" solo aparece cuando el permiso está en estado `vigente`.
- [ ] **CA-21-3:** El sistema solicita un motivo obligatorio de revocación (mínimo 20 caracteres).
- [ ] **CA-21-4:** Al confirmar, el estado cambia a `revocado` y el campo `revocado_at` queda registrado.
- [ ] **CA-21-5:** Inmediatamente después de la revocación, el escaneo del QR retorna pantalla de "PERMISO REVOCADO".
- [ ] **CA-21-6:** La revocación queda registrada en `auditoria` con el ID del administrador y el motivo.
- [ ] **CA-21-7:** Un permiso ya `vencido` no puede ser revocado (retorna error 422).

**Reglas de Negocio:** RN-05.

**Sprint:** 4 · **Prioridad:** Alta · **Puntos de historia:** 3  
**Referencia:** CU-36, `POST /api/v1/permisos/{id}/revocar`

---

## É-04 Verificación Pública del Permiso

**Descripción:** Como autoridad de tránsito necesito verificar de forma rápida y confiable si un permiso es auténtico y está vigente usando solo mi teléfono celular.

---

### HU-22 — Validar un Permiso Escaneando el Código QR

> **Como** agente de tránsito en campo,  
> **quiero** escanear el código QR del permiso con mi celular,  
> **para** verificar en tiempo real si el permiso es auténtico y está vigente.

**Criterios de Aceptación:**

- [ ] **CA-22-1:** La URL de verificación es accesible públicamente sin requerir autenticación.
- [ ] **CA-22-2:** La página carga en menos de 2 segundos en conexión 4G.
- [ ] **CA-22-3:** El sistema siempre retorna HTTP 200. El resultado se comunica en el cuerpo de la respuesta (no por código de estado HTTP).
- [ ] **CA-22-4:** El sistema registra cada escaneo en `qr_validaciones` con IP, user-agent y resultado.
- [ ] **CA-22-5:** Rate limiting: máximo 30 consultas por IP por minuto.
- [ ] **CA-22-6:** Un QR que no existe en el sistema retorna respuesta en menos de 500ms.

**Sprint:** 4 · **Prioridad:** Crítica · **Puntos de historia:** 5  
**Referencia:** CU-06, `GET /api/v1/public/verificar/{codigoQR}`

---

### HU-23 — Ver Información Clara al Escanear el QR

> **Como** agente de tránsito en campo,  
> **quiero** ver una pantalla clara y de rápida lectura que indique el estado del permiso,  
> **para** tomar una decisión en segundos sin necesidad de interpretar datos técnicos.

**Criterios de Aceptación:**

- [ ] **CA-23-1:** La pantalla usa colores de semáforo:
  - **Verde** con ✅ para permiso `vigente`.
  - **Rojo** con ❌ para permiso `vencido` o `revocado`.
  - **Gris** con ⚠️ para QR no encontrado.
- [ ] **CA-23-2:** Si el permiso está vigente, muestra: nombre completo del titular, tipo y número de documento, placa de la moto, marca y modelo, motivo del permiso, fecha de vencimiento.
- [ ] **CA-23-3:** Si el permiso está vencido, muestra: *"PERMISO VENCIDO — Este permiso venció el [fecha] y ya no es válido."*
- [ ] **CA-23-4:** Si el permiso está revocado, muestra: *"PERMISO REVOCADO — Este permiso fue anulado por la autoridad competente."*
- [ ] **CA-23-5:** La página está optimizada para visualización en móvil (sin necesidad de hacer zoom).
- [ ] **CA-23-6:** La página no requiere instalación de ninguna aplicación.

**Sprint:** 4 · **Prioridad:** Alta · **Puntos de historia:** 3  
**Referencia:** CU-23, página `/verificar/{codigoQR}`

---

## É-05 Autenticación y Seguridad

**Descripción:** Como funcionario y administrador necesito acceder al sistema de forma segura, con mecanismos que protejan la información institucional y cumplan las políticas de seguridad de la alcaldía.

---

### HU-24 — Iniciar Sesión en el Sistema

> **Como** funcionario o administrador,  
> **quiero** iniciar sesión con mi correo institucional y contraseña,  
> **para** acceder al panel de gestión de solicitudes o administración según mi rol.

**Criterios de Aceptación:**

- [ ] **CA-24-1:** El formulario de login tiene campos para correo electrónico y contraseña con el botón "Ingresar".
- [ ] **CA-24-2:** Al autenticarse exitosamente, el sistema emite un access token (TTL: 15 min) y un refresh token (TTL: 7 días).
- [ ] **CA-24-3:** El sistema redirige al usuario según su rol: funcionario → panel de solicitudes; administrador → panel administrativo.
- [ ] **CA-24-4:** Si las credenciales son incorrectas, el sistema muestra: *"Correo o contraseña incorrectos."* sin indicar cuál de los dos falló.
- [ ] **CA-24-5:** El sistema registra el evento `login` o `login_fallido` en `auditoria` con la IP del cliente.
- [ ] **CA-24-6:** Rate limiting: máximo 5 intentos por IP en 15 minutos.
- [ ] **CA-24-7:** Si la contraseña venció (90 días), el sistema redirige a la pantalla de cambio obligatorio antes de permitir el acceso al panel.

**Sprint:** 2 · **Prioridad:** Crítica · **Puntos de historia:** 5  
**Referencia:** CU-07, `POST /api/v1/auth/login`

---

### HU-25 — Cerrar Sesión de Forma Segura

> **Como** funcionario o administrador,  
> **quiero** cerrar mi sesión explícitamente al terminar mi turno,  
> **para** evitar accesos no autorizados desde mi equipo de trabajo compartido.

**Criterios de Aceptación:**

- [ ] **CA-25-1:** El botón "Cerrar Sesión" está visible en todas las pantallas del panel.
- [ ] **CA-25-2:** Al hacer clic, el sistema revoca el refresh token activo en la base de datos.
- [ ] **CA-25-3:** El sistema elimina el access token y el refresh token del almacenamiento del cliente.
- [ ] **CA-25-4:** El sistema redirige a la pantalla de login.
- [ ] **CA-25-5:** Intentar usar el refresh token revocado retorna error 401.
- [ ] **CA-25-6:** El sistema registra el evento `logout` en `auditoria`.

**Sprint:** 2 · **Prioridad:** Alta · **Puntos de historia:** 2  
**Referencia:** CU-08, `POST /api/v1/auth/logout`

---

### HU-26 — Recuperar Mi Contraseña Olvidada

> **Como** funcionario o administrador que olvidé mi contraseña,  
> **quiero** solicitar un enlace de recuperación a mi correo institucional,  
> **para** restablecer el acceso sin intervención del administrador.

**Criterios de Aceptación:**

- [ ] **CA-26-1:** La pantalla de login tiene el enlace "¿Olvidó su contraseña?" que lleva al formulario de recuperación.
- [ ] **CA-26-2:** El formulario solicita únicamente el correo electrónico.
- [ ] **CA-26-3:** El sistema muestra el mismo mensaje independientemente de si el correo existe o no: *"Si el correo está registrado, recibirá un enlace de recuperación en los próximos minutos."*
- [ ] **CA-26-4:** El enlace de recuperación enviado por correo es válido por 1 hora.
- [ ] **CA-26-5:** El enlace solo puede usarse una vez; al usarse queda marcado como consumido.
- [ ] **CA-26-6:** Rate limiting: máximo 3 solicitudes por IP por hora.

**Sprint:** 2 · **Prioridad:** Alta · **Puntos de historia:** 3  
**Referencia:** CU-10, `POST /api/v1/auth/recuperar-contrasena`

---

### HU-27 — Cambiar Mi Contraseña desde Mi Perfil

> **Como** funcionario o administrador con sesión activa,  
> **quiero** cambiar mi contraseña cuando lo considere necesario,  
> **para** mantener la seguridad de mi cuenta.

**Criterios de Aceptación:**

- [ ] **CA-27-1:** El formulario solicita: contraseña actual, nueva contraseña y confirmación de la nueva contraseña.
- [ ] **CA-27-2:** El sistema valida la política de contraseñas: mínimo 10 caracteres, mayúscula, minúscula, número y carácter especial obligatorios.
- [ ] **CA-27-3:** El sistema no permite usar ninguna de las últimas 5 contraseñas. Si se intenta, muestra: *"No puede usar una de sus últimas 5 contraseñas."*
- [ ] **CA-27-4:** Al cambiar exitosamente, el sistema revoca todos los refresh tokens activos del usuario y redirige al login.
- [ ] **CA-27-5:** El sistema registra `cambiar_contrasena` en `auditoria`.

**Sprint:** 2 · **Prioridad:** Alta · **Puntos de historia:** 3  
**Referencia:** CU-12, `POST /api/v1/auth/cambiar-contrasena`

---

### HU-28 — Bloquear Cuenta por Intentos de Acceso Fallidos

> **Como** sistema de seguridad,  
> **quiero** bloquear temporalmente una cuenta después de múltiples intentos de login fallidos,  
> **para** proteger el sistema contra ataques de fuerza bruta.

**Criterios de Aceptación:**

- [ ] **CA-28-1:** Después de 5 intentos de login fallidos consecutivos, la cuenta se bloquea por 30 minutos.
- [ ] **CA-28-2:** Mientras la cuenta está bloqueada, cualquier intento de login retorna: *"Cuenta bloqueada temporalmente. Intente en [tiempo restante]."*
- [ ] **CA-28-3:** El contador de intentos fallidos se resetea a cero tras un login exitoso.
- [ ] **CA-28-4:** Cada intento fallido queda registrado en `auditoria` con la IP de origen.
- [ ] **CA-28-5:** El administrador puede desbloquear una cuenta manualmente antes del tiempo de espera.
- [ ] **CA-28-6:** El bloqueo aplica a la cuenta, no solo a la IP.

**Sprint:** 2 · **Prioridad:** Alta · **Puntos de historia:** 3  
**Referencia:** CU-28 (seguridad), tabla `usuarios.intentos_fallidos`

---

### HU-29 — Renovar Sesión Sin Interrumpir el Trabajo

> **Como** funcionario trabajando en el panel,  
> **quiero** que mi sesión se renueve automáticamente cuando está a punto de expirar,  
> **para** no perder el trabajo en curso por un cierre de sesión inesperado.

**Criterios de Aceptación:**

- [ ] **CA-29-1:** Cuando el access token expira (15 min), el frontend envía automáticamente el refresh token al endpoint `/auth/refresh`.
- [ ] **CA-29-2:** El sistema emite un nuevo access token y un nuevo refresh token. El refresh token anterior queda revocado.
- [ ] **CA-29-3:** La solicitud original que provocó el 401 se reintenta automáticamente con el nuevo token sin que el usuario lo note.
- [ ] **CA-29-4:** Si el refresh token también expiró o fue revocado, el sistema redirige al login con el mensaje: *"Su sesión expiró. Por favor inicie sesión de nuevo."*
- [ ] **CA-29-5:** El mecanismo de rotación de tokens previene el uso concurrente de un mismo refresh token.

**Sprint:** 2 · **Prioridad:** Alta · **Puntos de historia:** 5  
**Referencia:** CU-09, `POST /api/v1/auth/refresh`

---

## É-06 Panel Administrativo

**Descripción:** Como administrador del sistema necesito herramientas de gestión, configuración, auditoría y reporte para mantener el sistema operativo y cumplir con los requerimientos institucionales.

---

### HU-30 — Gestionar Usuarios Funcionarios

> **Como** administrador,  
> **quiero** crear, editar y gestionar las cuentas de los funcionarios que usarán el sistema,  
> **para** controlar quién tiene acceso al panel de gestión de solicitudes.

**Criterios de Aceptación:**

- [ ] **CA-30-1:** El formulario de creación solicita: nombre, apellido, correo institucional, rol y dependencia.
- [ ] **CA-30-2:** El sistema verifica que el correo no esté registrado previamente.
- [ ] **CA-30-3:** Al crear el usuario, el sistema genera una contraseña temporal segura y aleatoria.
- [ ] **CA-30-4:** El sistema envía un correo de bienvenida con la contraseña temporal y la instrucción de cambiarla al primer ingreso.
- [ ] **CA-30-5:** El listado de usuarios muestra: nombre, correo, rol, dependencia, estado (activo/inactivo) y último login.
- [ ] **CA-30-6:** El administrador puede editar nombre, apellido, rol y dependencia (no el correo).
- [ ] **CA-30-7:** La creación y edición quedan registradas en `auditoria`.

**Sprint:** 7 · **Prioridad:** Alta · **Puntos de historia:** 8  
**Referencia:** CU-29, CU-30, `POST /api/v1/usuarios` · `PUT /api/v1/usuarios/{id}`

---

### HU-31 — Activar y Desactivar Cuentas de Usuario

> **Como** administrador,  
> **quiero** activar o desactivar cuentas de usuario sin eliminarlas,  
> **para** gestionar el acceso de funcionarios que se ausentan o son reemplazados sin perder el historial.

**Criterios de Aceptación:**

- [ ] **CA-31-1:** El administrador puede desactivar una cuenta activa con un botón de "Desactivar" y confirmación.
- [ ] **CA-31-2:** Al desactivar, el sistema revoca inmediatamente todos los refresh tokens activos del usuario.
- [ ] **CA-31-3:** Un usuario desactivado que intente hacer login recibe: *"Su cuenta no está activa. Comuníquese con el administrador."*
- [ ] **CA-31-4:** El administrador no puede desactivar su propia cuenta.
- [ ] **CA-31-5:** El administrador puede reactivar una cuenta desactivada con un botón de "Activar".
- [ ] **CA-31-6:** Los cambios quedan registrados en `auditoria`.

**Sprint:** 7 · **Prioridad:** Alta · **Puntos de historia:** 3  
**Referencia:** CU-31, `PATCH /api/v1/usuarios/{id}/estado`

---

### HU-32 — Gestionar Motivos del Formulario

> **Como** administrador,  
> **quiero** agregar, editar y activar/desactivar los motivos disponibles en el formulario de solicitud,  
> **para** adaptar el catálogo de motivos según las políticas de la alcaldía sin modificar código.

**Criterios de Aceptación:**

- [ ] **CA-32-1:** El listado de motivos muestra: nombre, descripción, si requiere soporte documental, orden de aparición y estado (activo/inactivo).
- [ ] **CA-32-2:** El administrador puede crear un nuevo motivo con: nombre (obligatorio), descripción, requiere soporte (booleano) y orden.
- [ ] **CA-32-3:** El administrador puede desactivar un motivo: el motivo deja de aparecer en el formulario público inmediatamente, pero las solicitudes históricas que lo usaron conservan el motivo.
- [ ] **CA-32-4:** No se permite eliminar un motivo que tenga solicitudes asociadas; solo se puede desactivar.
- [ ] **CA-32-5:** El orden de aparición en el formulario es configurable.

**Sprint:** 7 · **Prioridad:** Media · **Puntos de historia:** 5  
**Referencia:** CU-35, `GET/POST/PUT /api/v1/motivos`

---

### HU-33 — Gestionar Dependencias de la Alcaldía

> **Como** administrador,  
> **quiero** gestionar el catálogo de dependencias de la alcaldía,  
> **para** asignar los funcionarios a la dependencia correcta y organizar el trabajo institucional.

**Criterios de Aceptación:**

- [ ] **CA-33-1:** El listado de dependencias muestra: nombre, código, descripción y estado.
- [ ] **CA-33-2:** El administrador puede crear, editar y activar/desactivar dependencias.
- [ ] **CA-33-3:** No se puede eliminar una dependencia que tenga usuarios asignados.
- [ ] **CA-33-4:** Los cambios quedan registrados en `auditoria`.

**Sprint:** 7 · **Prioridad:** Baja · **Puntos de historia:** 3  
**Referencia:** CU-34, `GET/POST/PUT /api/v1/dependencias`

---

### HU-34 — Configurar Parámetros del Sistema

> **Como** administrador,  
> **quiero** actualizar los parámetros operacionales del sistema (logo, nombre de la alcaldía, plazos, colores) desde la interfaz,  
> **para** personalizar el sistema a la identidad institucional sin intervención del equipo técnico.

**Criterios de Aceptación:**

- [ ] **CA-34-1:** La página de configuración muestra todos los parámetros con su valor actual y una descripción de su función.
- [ ] **CA-34-2:** Los parámetros configurables incluyen: `nombre_alcaldia`, `municipio`, `logo_url`, `firma_url`, `sello_url`, `dias_max_permiso`, `plazo_revision_horas`, `plazo_correccion_dias`, `color_institucional`.
- [ ] **CA-34-3:** Los parámetros de imagen (logo, firma, sello) permiten la carga de un archivo PNG o JPG.
- [ ] **CA-34-4:** Los parámetros numéricos tienen validación de rango (ej: `dias_max_permiso` entre 1 y 365).
- [ ] **CA-34-5:** Al guardar un parámetro, el cambio tiene efecto inmediato en el sistema (caché de Redis invalidado).
- [ ] **CA-34-6:** Los PDFs generados **después** del cambio reflejan la nueva configuración. Los PDFs ya generados no se modifican.
- [ ] **CA-34-7:** Todos los cambios quedan registrados en `auditoria` con el valor anterior y el nuevo.

**Sprint:** 7 · **Prioridad:** Media · **Puntos de historia:** 5  
**Referencia:** CU-41, `GET/PUT /api/v1/configuracion`

---

### HU-35 — Ver la Bitácora de Auditoría

> **Como** administrador,  
> **quiero** consultar el registro completo de acciones realizadas en el sistema con filtros por usuario, acción y fecha,  
> **para** investigar incidentes, auditar el uso del sistema y cumplir con la Ley 1712 de 2014.

**Criterios de Aceptación:**

- [ ] **CA-35-1:** La bitácora muestra todos los registros de la tabla `auditoria` en orden descendente (más recientes primero) con paginación de 50 por página.
- [ ] **CA-35-2:** Se pueden aplicar filtros por: usuario responsable, tipo de acción, entidad afectada, rango de fechas e IP de origen.
- [ ] **CA-35-3:** Cada registro muestra: fecha y hora (en COT), usuario, acción, entidad, ID de la entidad, IP y los datos cambiados.
- [ ] **CA-35-4:** Los campos sensibles como `contrasena_hash` están enmascarados en la visualización.
- [ ] **CA-35-5:** La bitácora es de solo lectura para el administrador; no aparecen botones de editar o eliminar.
- [ ] **CA-35-6:** Solo el rol `administrador` puede acceder a este módulo.

**Reglas de Negocio:** Ley 1712/2014 (retención mínima 5 años).

**Sprint:** 7 · **Prioridad:** Alta · **Puntos de historia:** 5  
**Referencia:** CU-38, `GET /api/v1/auditoria`

---

### HU-36 — Generar y Exportar Reportes Estadísticos

> **Como** administrador,  
> **quiero** generar reportes filtrados sobre solicitudes, permisos y actividad de funcionarios, y exportarlos en Excel, PDF o CSV,  
> **para** presentar informes de gestión a las directivas de la alcaldía.

**Criterios de Aceptación:**

- [ ] **CA-36-1:** Los tipos de reporte disponibles son: solicitudes por periodo, permisos vigentes/vencidos, motivos más frecuentes y actividad por funcionario.
- [ ] **CA-36-2:** Cada reporte es filtrable por rango de fechas, estado, funcionario y motivo (según aplique).
- [ ] **CA-36-3:** Los reportes se pueden exportar en tres formatos: Excel (.xlsx), PDF y CSV.
- [ ] **CA-36-4:** Los archivos exportados se generan en el servidor y se entregan mediante URL firmada (TTL 5 min).
- [ ] **CA-36-5:** La exportación queda registrada en `auditoria`.
- [ ] **CA-36-6:** El reporte de actividad por funcionario muestra: solicitudes revisadas, aprobadas, rechazadas, tiempo promedio de revisión.

**Sprint:** 7 · **Prioridad:** Media · **Puntos de historia:** 8  
**Referencia:** CU-39, CU-40, `GET /api/v1/reportes`

---

### HU-37 — Ver Dashboard Administrativo Global

> **Como** administrador,  
> **quiero** ver una vista de indicadores globales del sistema al ingresar al panel,  
> **para** tener una visión ejecutiva del estado operativo en tiempo real.

**Criterios de Aceptación:**

- [ ] **CA-37-1:** El dashboard muestra: total de usuarios activos (funcionarios + administradores), solicitudes del mes con tasa de aprobación y rechazo, tiempo promedio de revisión en horas, total de permisos vigentes, permisos vencidos y revocados.
- [ ] **CA-37-2:** Muestra el Top 3 de motivos de solicitud más frecuentes del mes actual.
- [ ] **CA-37-3:** Muestra la tabla de actividad por funcionario del mes: solicitudes gestionadas, aprobadas, rechazadas.
- [ ] **CA-37-4:** Los indicadores son clickeables y redirigen al listado filtrado correspondiente.

**Sprint:** 7 · **Prioridad:** Media · **Puntos de historia:** 5  
**Referencia:** CU-37, `GET /api/v1/dashboard/admin`

---

## É-07 Automatización del Sistema

**Descripción:** Como sistema, debo ejecutar tareas programadas para mantener los estados correctos sin intervención manual.

---

### HU-38 — Marcar Solicitudes Vencidas Automáticamente

> **Como** sistema,  
> **quiero** identificar y marcar automáticamente las solicitudes que superaron su plazo de atención o de corrección,  
> **para** mantener el inventario de solicitudes en un estado coherente con la realidad operativa.

**Criterios de Aceptación:**

- [ ] **CA-38-1:** Un job programado (cron) se ejecuta diariamente a las 00:01 hora COT.
- [ ] **CA-38-2:** El job marca como `vencida` todas las solicitudes en estado `recibida` cuyo `created_at` supera el plazo `plazo_revision_horas` configurado.
- [ ] **CA-38-3:** El job marca como `vencida` las solicitudes en `pendiente_correccion` cuyo último cambio de historial superó `plazo_correccion_dias` días hábiles.
- [ ] **CA-38-4:** Cada cambio de estado queda registrado en `historial_estados` con `usuario_id = NULL` (cambio automático del sistema).
- [ ] **CA-38-5:** El sistema encola una notificación de correo al ciudadano informando el vencimiento.
- [ ] **CA-38-6:** El estado `vencida` es terminal para solicitudes: no puede revertirse.

**Reglas de Negocio:** RN-08, RN-11, RN-12.

**Sprint:** 3 · **Prioridad:** Alta · **Puntos de historia:** 5  
**Referencia:** CU-26, `SchedulerModule (BullMQ cron)`

---

### HU-39 — Marcar Permisos Vencidos Automáticamente

> **Como** sistema,  
> **quiero** identificar y marcar automáticamente los permisos cuya fecha de vencimiento fue superada,  
> **para** que el escaneo del QR refleje inmediatamente el estado real del permiso.

**Criterios de Aceptación:**

- [ ] **CA-39-1:** Un job programado se ejecuta diariamente a las 00:01 hora COT.
- [ ] **CA-39-2:** El job busca permisos con `estado = 'vigente'` y `fecha_vencimiento < CURRENT_DATE` (en COT).
- [ ] **CA-39-3:** Los permisos encontrados se actualizan a `estado = 'vencido'`.
- [ ] **CA-39-4:** Cada cambio queda registrado en `auditoria`.
- [ ] **CA-39-5:** La página de validación de QR también verifica la fecha en tiempo real, por lo que un permiso vencido muestra "PERMISO VENCIDO" incluso antes de que el job corra.

**Reglas de Negocio:** RN-08.

**Sprint:** 4 · **Prioridad:** Alta · **Puntos de historia:** 3  
**Referencia:** CU-27, `SchedulerModule (BullMQ cron)`

---

## É-08 Notificaciones

**Descripción:** Como sistema, debo mantener al ciudadano informado del estado de su trámite mediante notificaciones por correo electrónico enviadas de forma confiable.

---

### HU-40 — Recibir Correo de Confirmación de Solicitud

> **Como** ciudadano que acabo de enviar mi solicitud,  
> **quiero** recibir un correo electrónico de confirmación con mi número de radicado,  
> **para** tener un registro físico de mi trámite y poder consultarlo en cualquier momento.

**Criterios de Aceptación:**

- [ ] **CA-40-1:** El correo se envía de forma asíncrona (no bloquea la respuesta al ciudadano) mediante BullMQ.
- [ ] **CA-40-2:** El correo llega al ciudadano en menos de 5 minutos tras el envío de la solicitud.
- [ ] **CA-40-3:** El asunto del correo es: *"Solicitud recibida — Radicado [RADICADO]"*.
- [ ] **CA-40-4:** El cuerpo del correo incluye: número de radicado destacado, URL de consulta de estado precargada con el radicado, información del proceso y tiempo estimado de respuesta.
- [ ] **CA-40-5:** Si el envío falla, el sistema reintenta hasta 3 veces con backoff exponencial.
- [ ] **CA-40-6:** El estado del envío queda registrado en la tabla `notificaciones`.

**Sprint:** 3 · **Prioridad:** Alta · **Puntos de historia:** 3  
**Referencia:** CU-28, `NotificacionesModule`

---

### HU-41 — Recibir Correo Cuando Mi Permiso es Aprobado

> **Como** ciudadano cuya solicitud fue aprobada,  
> **quiero** recibir un correo con el enlace para descargar mi permiso,  
> **para** obtener mi documento sin necesidad de entrar al portal a consultar el estado.

**Criterios de Aceptación:**

- [ ] **CA-41-1:** El correo se envía tras la generación exitosa del PDF del permiso.
- [ ] **CA-41-2:** El asunto es: *"Su permiso fue aprobado — [CODIGO_PERMISO]"*.
- [ ] **CA-41-3:** El cuerpo incluye: nombre del titular, código del permiso, fechas de vigencia, botón/enlace "Descargar mi permiso" y recordatorio de que debe portar el documento o tenerlo disponible digitalmente.
- [ ] **CA-41-4:** El enlace de descarga lleva a la página de consulta de estado donde el ciudadano puede descargar el PDF (no un enlace directo al storage).
- [ ] **CA-41-5:** El correo no contiene adjuntos por razones de seguridad y tamaño.

**Sprint:** 4 · **Prioridad:** Alta · **Puntos de historia:** 3  
**Referencia:** CU-28, tipo `solicitud_aprobada`

---

### HU-42 — Recibir Correo Cuando Mi Solicitud es Rechazada

> **Como** ciudadano cuya solicitud fue rechazada,  
> **quiero** recibir un correo con el motivo del rechazo,  
> **para** entender por qué fue rechazada y decidir si creo una nueva solicitud con los requisitos correctos.

**Criterios de Aceptación:**

- [ ] **CA-42-1:** El correo se envía tras el rechazo de la solicitud por parte del funcionario.
- [ ] **CA-42-2:** El asunto es: *"Su solicitud fue rechazada — Radicado [RADICADO]"*.
- [ ] **CA-42-3:** El cuerpo incluye: número de radicado, el motivo del rechazo escrito por el funcionario, e información sobre cómo crear una nueva solicitud si desea intentarlo de nuevo.
- [ ] **CA-42-4:** El correo es respetuoso y explica claramente que el ciudadano puede crear una nueva solicitud.

**Sprint:** 3 · **Prioridad:** Alta · **Puntos de historia:** 2  
**Referencia:** CU-28, tipo `solicitud_rechazada`

---

### HU-43 — Recibir Correo con Instrucciones de Corrección

> **Como** ciudadano cuya solicitud necesita corrección,  
> **quiero** recibir un correo detallando exactamente qué debo corregir y cuánto tiempo tengo para hacerlo,  
> **para** poder subsanar mi solicitud sin necesidad de llamar a la alcaldía.

**Criterios de Aceptación:**

- [ ] **CA-43-1:** El correo se envía cuando el funcionario solicita correcciones.
- [ ] **CA-43-2:** El asunto es: *"Se requieren correcciones — Radicado [RADICADO]"*.
- [ ] **CA-43-3:** El cuerpo incluye: número de radicado, la lista completa de correcciones solicitadas con instrucciones específicas para cada una, el plazo para realizar las correcciones (fecha límite explícita en formato DD/MM/AAAA), y el enlace directo a la página de corrección.
- [ ] **CA-43-4:** El correo advierte que si no se realizan las correcciones antes de la fecha límite, la solicitud será marcada como vencida.

**Sprint:** 3 · **Prioridad:** Alta · **Puntos de historia:** 3  
**Referencia:** CU-28, tipo `correccion_requerida`

---

## É-09 Configuración Institucional

**Descripción:** Como administrador necesito gestionar la identidad institucional de la alcaldía para que el sistema genere documentos oficiales con la información correcta sin depender del equipo técnico.

---

### HU-44 — Consultar la Configuración Institucional Actual

> **Como** administrador,  
> **quiero** ver todos los datos institucionales actuales de la alcaldía (nombre, NIT, dirección, escudo, logo),  
> **para** verificar que la información del sistema esté actualizada antes de emitir permisos oficiales.

**Criterios de Aceptación:**

- [ ] **CA-44-1:** La página muestra todos los campos de `configuracion_institucional` con sus valores actuales.
- [ ] **CA-44-2:** El escudo y el logo se muestran como previsualización de imagen (obtenida mediante URL firmada).
- [ ] **CA-44-3:** La página es accesible únicamente para el rol `administrador`.
- [ ] **CA-44-4:** Los datos de contacto (NIT, código DANE, teléfono, correo, sitio web) se muestran claramente etiquetados.
- [ ] **CA-44-5:** Se indica la fecha de la última modificación y el usuario que la realizó.

**Sprint:** 7 · **Prioridad:** Alta · **Puntos de historia:** 2  
**Referencia:** CU-42, `GET /api/v1/admin/configuracion-institucional`

---

### HU-45 — Editar los Datos Institucionales de la Alcaldía

> **Como** administrador,  
> **quiero** actualizar los datos textuales de la configuración institucional (nombre, NIT, dirección, contacto, etc.),  
> **para** mantener la identidad institucional del sistema al día sin modificar el código fuente.

**Criterios de Aceptación:**

- [ ] **CA-45-1:** El formulario muestra todos los campos editables con sus valores actuales precargados.
- [ ] **CA-45-2:** Todos los campos obligatorios (nombre_alcaldia, nit, codigo_dane, departamento, municipio, direccion, telefono, correo_institucional) son validados antes de guardar.
- [ ] **CA-45-3:** El campo `sitio_web` es opcional y acepta una URL válida.
- [ ] **CA-45-4:** Al guardar, el cambio tiene efecto inmediato en el sistema (caché de Redis invalidado).
- [ ] **CA-45-5:** El cambio queda registrado en `auditoria` con los valores anteriores y los nuevos.
- [ ] **CA-45-6:** Se muestra un mensaje de confirmación tras guardar exitosamente.

**Sprint:** 7 · **Prioridad:** Alta · **Puntos de historia:** 5  
**Referencia:** CU-43, `PUT /api/v1/admin/configuracion-institucional`

---

### HU-46 — Cargar o Reemplazar el Escudo Oficial

> **Como** administrador,  
> **quiero** subir o reemplazar el escudo oficial de la alcaldía,  
> **para** que todos los permisos PDF emitidos desde ese momento incluyan el escudo correcto.

**Criterios de Aceptación:**

- [ ] **CA-46-1:** Se puede subir un archivo de imagen en formato PNG, SVG o JPG con tamaño máximo de 5 MB.
- [ ] **CA-46-2:** El sistema muestra una previsualización del escudo antes de confirmar la carga.
- [ ] **CA-46-3:** Al confirmar, el escudo anterior es reemplazado. Los permisos PDF ya emitidos no se modifican.
- [ ] **CA-46-4:** No se permite eliminar el escudo sin reemplazarlo por otro (es un campo obligatorio).
- [ ] **CA-46-5:** El cambio queda registrado en `auditoria`.
- [ ] **CA-46-6:** El sistema valida que el archivo sea una imagen válida (no se aceptan archivos disfrazados de imagen).

**Reglas de Negocio:** RN-104, RN-107, RN-108.

**Sprint:** 7 · **Prioridad:** Alta · **Puntos de historia:** 5  
**Referencia:** CU-44, `PATCH /api/v1/admin/configuracion-institucional/escudo`

---

### HU-47 — Cargar o Reemplazar el Logo Institucional

> **Como** administrador,  
> **quiero** subir o reemplazar el logo institucional de la alcaldía (opcional),  
> **para** que el portal ciudadano y las comunicaciones usen el logotipo oficial.

**Criterios de Aceptación:**

- [ ] **CA-47-1:** Se puede subir un archivo de imagen en formato PNG, SVG o JPG con tamaño máximo de 5 MB.
- [ ] **CA-47-2:** El sistema muestra una previsualización del logo antes de confirmar la carga.
- [ ] **CA-47-3:** El logo es opcional. Se puede eliminar sin que el sistema falle (el escudo siempre es el elemento obligatorio).
- [ ] **CA-47-4:** Al reemplazar el logo, los correos y el portal usan el nuevo logo a partir de ese momento.
- [ ] **CA-47-5:** El cambio queda registrado en `auditoria`.

**Reglas de Negocio:** RN-107, RN-108.

**Sprint:** 7 · **Prioridad:** Media · **Puntos de historia:** 3  
**Referencia:** CU-45, `PATCH /api/v1/admin/configuracion-institucional/logo`

---

## Resumen de Estimación por Sprint

| Sprint | Épicas trabajadas | Puntos de historia | Historias |
|--------|------------------|--------------------|-----------|
| Sprint 2 | É-05 Autenticación | 21 | HU-24 a HU-29 |
| Sprint 3 | É-01 Ciudadano + É-02 Funcionario (parcial) + É-07 (parcial) + É-08 (parcial) | 52 | HU-01 a HU-05, HU-09 a HU-16, HU-38, HU-40, HU-42, HU-43 |
| Sprint 4 | É-03 Permiso + É-04 QR + É-07 + É-08 (parcial) | 30 | HU-06, HU-18 a HU-23, HU-39, HU-41 |
| Sprint 5 | É-01 Ciudadano (UX) | 5 | HU-07, HU-08 |
| Sprint 6 | É-02 Dashboard Funcionario | 3 | HU-17 |
| Sprint 7 | É-06 Panel Admin + É-09 Config. Institucional | 57 | HU-30 a HU-37, HU-44 a HU-47 |
| **Total** | | **168** | **47 historias** |

---

## Criterios de Definición de "Hecho" (Definition of Done)

Una historia de usuario se considera **completada** cuando:

1. El código fue escrito en TypeScript siguiendo las convenciones de `CODING_STANDARDS.md`.
2. Los criterios de aceptación fueron verificados manualmente.
3. Los endpoints nuevos o modificados están documentados en Swagger.
4. Las acciones que lo requieren generan registros en la tabla `auditoria`.
5. Se escribieron pruebas unitarias para la lógica de negocio (cobertura ≥ 80% del módulo).
6. El código fue revisado en pull request y aprobado.
7. `TASKS.md` fue actualizado marcando la historia como completada.
8. No hay regresiones en las funcionalidades previas.

---

*Este documento es la fuente de verdad para la planificación de sprints.*  
*Toda modificación al alcance debe actualizarse aquí antes de ser implementada.*
