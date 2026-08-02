# Glosario Oficial del Proyecto

**Sistema de Permisos de Circulación — Pico y Placa**
**Versión:** 1.0.0
**Fecha:** 2026-08-02
**Responsable:** Equipo de Arquitectura

---

## Introducción

Este documento es el glosario oficial del proyecto. Define de manera precisa y unificada todos los términos funcionales, técnicos y administrativos utilizados en el sistema, la documentación y las comunicaciones del equipo. Todo el equipo de desarrollo, diseño, QA y gestión debe usar estos términos de forma consistente.

---

## Índice de Términos

| # | Término | Categoría |
|---|---------|-----------|
| 01 | [Ciudadano](#ciudadano) | Funcional |
| 02 | [Funcionario](#funcionario) | Funcional |
| 03 | [Administrador](#administrador) | Funcional |
| 04 | [Permiso de Circulación](#permiso-de-circulación) | Funcional |
| 05 | [Pico y Placa](#pico-y-placa) | Funcional |
| 06 | [Solicitud](#solicitud) | Funcional |
| 07 | [Estado de Solicitud](#estado-de-solicitud) | Funcional |
| 08 | [Documento Soporte](#documento-soporte) | Funcional |
| 09 | [Motocicleta](#motocicleta) | Funcional |
| 10 | [Placa](#placa) | Funcional |
| 11 | [QR de Validación](#qr-de-validación) | Funcional |
| 12 | [Código Único](#código-único) | Funcional |
| 13 | [Auditoría](#auditoría) | Funcional |
| 14 | [Rol](#rol) | Funcional |
| 15 | [Usuario](#usuario) | Funcional |
| 16 | [Dependencia](#dependencia) | Funcional |
| 17 | [Radicado](#radicado) | Funcional |
| 18 | [Motivo de Permiso](#motivo-de-permiso) | Funcional |
| 19 | [Vigencia](#vigencia) | Funcional |
| 20 | [Estado de Permiso](#estado-de-permiso) | Funcional |
| 21 | [Revocación](#revocación) | Funcional |
| 22 | [JWT](#jwt) | Técnico |
| 23 | [Swagger](#swagger) | Técnico |
| 24 | [UUID](#uuid) | Técnico |
| 25 | [PostgreSQL](#postgresql) | Técnico |
| 26 | [NestJS](#nestjs) | Técnico |
| 27 | [Next.js](#nextjs) | Técnico |
| 28 | [Docker](#docker) | Técnico |
| 29 | [API](#api) | Técnico |
| 30 | [Endpoint](#endpoint) | Técnico |
| 31 | [DTO](#dto) | Técnico |
| 32 | [Repository](#repository) | Técnico |
| 33 | [Service](#service) | Técnico |
| 34 | [Arquitectura Hexagonal](#arquitectura-hexagonal) | Técnico |
| 35 | [BCrypt](#bcrypt) | Técnico |
| 36 | [BullMQ](#bullmq) | Técnico |
| 37 | [Redis](#redis) | Técnico |
| 38 | [MinIO](#minio) | Técnico |
| 39 | [TypeORM](#typeorm) | Técnico |
| 40 | [reCAPTCHA](#recaptcha) | Técnico |
| 41 | [Soft Delete](#soft-delete) | Técnico |
| 42 | [Snapshot](#snapshot) | Técnico |
| 43 | [PDF Institucional](#pdf-institucional) | Funcional |
| 44 | [RBAC](#rbac) | Técnico |
| 45 | [Rate Limiting](#rate-limiting) | Técnico |

---

## Términos Funcionales

---

### Ciudadano

| Campo | Valor |
|-------|-------|
| **Término** | Ciudadano |
| **Categoría** | Funcional |
| **Actor Relacionado** | Ciudadano |
| **Documento de Referencia** | PRD §2.1, CASOS_USO.md §Actor A-01, HISTORIAS_USUARIO.md Épica É-01 |

**Definición:**
Persona natural que solicita un permiso de circulación especial para su motocicleta ante la Alcaldía, con el fin de justificar la necesidad de circular durante los horarios o días restringidos por la norma Pico y Placa.

**Descripción:**
El Ciudadano es el actor principal del sistema desde el lado del trámite. No requiere cuenta de usuario ni contraseña; se identifica únicamente mediante el número de radicado y su número de documento de identidad (cédula de ciudadanía u otro tipo válido). Puede crear solicitudes, adjuntar documentos soporte, consultar el estado de su trámite, recibir notificaciones por correo electrónico y descargar el permiso en formato PDF una vez aprobado.

---

### Funcionario

| Campo | Valor |
|-------|-------|
| **Término** | Funcionario |
| **Categoría** | Funcional |
| **Actor Relacionado** | Funcionario |
| **Documento de Referencia** | PRD §2.2, CASOS_USO.md §Actor A-02, HISTORIAS_USUARIO.md Épica É-04 |

**Definición:**
Empleado de la Alcaldía con acceso autenticado al sistema, responsable de revisar, aprobar, rechazar o solicitar correcciones sobre las solicitudes de permiso radicadas por los ciudadanos.

**Descripción:**
El Funcionario accede al sistema mediante credenciales (email + contraseña) con autenticación JWT. Gestiona una cola de trabajo con las solicitudes en estado `recibida` o `en_revision`. Puede revisar los documentos soporte adjuntos, emitir una decisión fundamentada y redactar observaciones. Su actividad queda registrada íntegramente en la tabla de auditoría. No puede crear usuarios ni modificar configuraciones del sistema.

---

### Administrador

| Campo | Valor |
|-------|-------|
| **Término** | Administrador |
| **Categoría** | Funcional |
| **Actor Relacionado** | Administrador |
| **Documento de Referencia** | PRD §2.3, CASOS_USO.md §Actor A-03, HISTORIAS_USUARIO.md Épica É-06 |

**Definición:**
Superusuario del sistema con acceso total a todas las funcionalidades administrativas: gestión de usuarios, dependencias, motivos de permiso, parámetros del sistema, reportes y supervisión de auditoría.

**Descripción:**
El Administrador accede con las mismas credenciales que el Funcionario pero posee el rol `ADMINISTRADOR` en el JWT. Puede crear, editar y desactivar cuentas de Funcionarios; gestionar el catálogo de motivos de permiso; configurar parámetros globales (vigencia por defecto, textos institucionales, límites de correcciones); revocar permisos vigentes; exportar reportes en CSV/Excel; y consultar la bitácora de auditoría completa.

---

### Permiso de Circulación

| Campo | Valor |
|-------|-------|
| **Término** | Permiso de Circulación |
| **Categoría** | Funcional |
| **Actor Relacionado** | Ciudadano, Funcionario, Administrador, Autoridad de Tránsito |
| **Documento de Referencia** | PRD §3, REGLAS_NEGOCIO.md RN-16 a RN-25, MODELO_DATOS.md tabla `permisos` |

**Definición:**
Documento oficial digital expedido por la Alcaldía que autoriza a una motocicleta a circular durante los horarios o días restringidos por Pico y Placa, durante un período de vigencia determinado.

**Descripción:**
El permiso se genera automáticamente cuando el Funcionario aprueba una solicitud. Posee un número único correlativo en formato `AAAA-PYP-NNNNN`, una fecha de inicio y fecha de fin (vigencia), un código QR opaco para verificación en campo, y queda disponible como PDF institucional descargable. Puede estar en estado `vigente`, `vencido` (por cumplimiento de fecha fin) o `revocado` (por decisión administrativa). Al momento de su creación se almacena un snapshot inmutable de los datos del ciudadano, la motocicleta y el motivo.

---

### Pico y Placa

| Campo | Valor |
|-------|-------|
| **Término** | Pico y Placa |
| **Categoría** | Funcional |
| **Actor Relacionado** | Ciudadano, Autoridad de Tránsito |
| **Documento de Referencia** | PRD §1 (Contexto), REGLAS_NEGOCIO.md RN-01 |

**Definición:**
Medida de restricción vehicular adoptada por municipios colombianos que limita la circulación de vehículos en días u horarios específicos según el último dígito de la placa, con el objetivo de reducir la congestión del tráfico y la contaminación ambiental.

**Descripción:**
En el contexto de este sistema, Pico y Placa aplica específicamente a motocicletas. Los propietarios que requieran circular durante las horas restringidas por razones justificadas (salud, trabajo esencial, desplazamiento urgente, entre otros) deben obtener un permiso especial a través de este sistema. Las restricciones exactas (días, horarios, dígitos de placa) son configurables por el Administrador.

---

### Solicitud

| Campo | Valor |
|-------|-------|
| **Término** | Solicitud |
| **Categoría** | Funcional |
| **Actor Relacionado** | Ciudadano, Funcionario |
| **Documento de Referencia** | PRD §4, REGLAS_NEGOCIO.md RN-01 a RN-14, MODELO_DATOS.md tabla `solicitudes` |

**Definición:**
Trámite formal presentado por el Ciudadano ante la Alcaldía, mediante el cual solicita la expedición de un permiso de circulación especial para su motocicleta durante la restricción Pico y Placa.

**Descripción:**
La solicitud es el objeto central del sistema. Contiene los datos personales del solicitante, la información de la motocicleta, el motivo de la solicitud y los documentos soporte adjuntos. Se identifica mediante un número de radicado único. Atraviesa una máquina de estados desde `recibida` hasta su resolución final (`aprobada` o `rechazada`), pasando opcionalmente por estados intermedios (`en_revision`, `pendiente_correccion`). Una solicitud aprobada genera automáticamente un permiso de circulación.

---

### Estado de Solicitud

| Campo | Valor |
|-------|-------|
| **Término** | Estado de Solicitud |
| **Categoría** | Funcional |
| **Actor Relacionado** | Ciudadano, Funcionario |
| **Documento de Referencia** | REGLAS_NEGOCIO.md RN-15, MODELO_DATOS.md ENUM `estado_solicitud` |

**Definición:**
Etapa actual de una solicitud dentro de la máquina de estados del sistema. Determina qué acciones son posibles sobre la solicitud en un momento dado.

**Descripción:**
Los estados posibles son:

| Estado | Descripción |
|--------|-------------|
| `recibida` | Solicitud ingresada al sistema, pendiente de asignación. |
| `en_revision` | El Funcionario tomó la solicitud y está evaluándola activamente. |
| `pendiente_correccion` | El Funcionario solicitó correcciones al Ciudadano. |
| `aprobada` | Solicitud aprobada. Genera un permiso de circulación vigente. Estado terminal. |
| `rechazada` | Solicitud rechazada. Incluye observaciones del Funcionario. Estado terminal. |
| `vencida` | Tiempo de respuesta del sistema superado (configurado por el Administrador). |

---

### Documento Soporte

| Campo | Valor |
|-------|-------|
| **Término** | Documento Soporte |
| **Categoría** | Funcional |
| **Actor Relacionado** | Ciudadano, Funcionario |
| **Documento de Referencia** | PRD §4.2, REGLAS_NEGOCIO.md RN-07 a RN-09, MODELO_DATOS.md tabla `documentos_soporte` |

**Definición:**
Archivo digital (imagen o PDF) adjuntado por el Ciudadano a su solicitud, que sirve como evidencia para justificar la necesidad del permiso de circulación.

**Descripción:**
El sistema acepta documentos en formato PDF, JPG o PNG con un tamaño máximo configurable (por defecto 5 MB). Los documentos se almacenan en un bucket privado de MinIO y se acceden únicamente mediante URLs firmadas con tiempo de vida de 5 minutos. El Funcionario revisa estos documentos durante la evaluación de la solicitud. Los tipos de documentos aceptados dependen del motivo de la solicitud y son configurables.

---

### Motocicleta

| Campo | Valor |
|-------|-------|
| **Término** | Motocicleta |
| **Categoría** | Funcional |
| **Actor Relacionado** | Ciudadano |
| **Documento de Referencia** | PRD §4.1, MODELO_DATOS.md tabla `solicitudes` (campos moto_*) |

**Definición:**
Vehículo de dos ruedas de motor cuya circulación está sujeta a restricciones Pico y Placa, y para la cual el Ciudadano solicita el permiso especial.

**Descripción:**
Los datos de la motocicleta registrados en la solicitud son: placa, marca, línea, modelo (año) y cilindraje. Esta información se incluye en el PDF del permiso y en el snapshot inmutable que se genera al momento de la aprobación. No existe un catálogo de motocicletas en el sistema; los datos se capturan directamente del formulario del Ciudadano.

---

### Placa

| Campo | Valor |
|-------|-------|
| **Término** | Placa |
| **Categoría** | Funcional |
| **Actor Relacionado** | Ciudadano, Autoridad de Tránsito |
| **Documento de Referencia** | REGLAS_NEGOCIO.md RN-02, RN-03 |

**Definición:**
Identificador alfanumérico único asignado por el Estado colombiano a cada motocicleta, utilizado para la identificación del vehículo en el contexto de la restricción Pico y Placa.

**Descripción:**
El formato estándar colombiano para placas de motocicletas es tres letras seguidas de dos dígitos y una letra (ej. `ABC12D`). En el sistema, la placa es un campo obligatorio de la solicitud y se almacena en mayúsculas. El último dígito numérico de la placa determina qué días aplica la restricción Pico y Placa al vehículo. Solo puede existir una solicitud activa (no rechazada ni vencida) por placa en el mismo período de vigencia (RN-03).

---

### QR de Validación

| Campo | Valor |
|-------|-------|
| **Término** | QR de Validación |
| **Categoría** | Funcional |
| **Actor Relacionado** | Autoridad de Tránsito, Sistema |
| **Documento de Referencia** | PRD §5, REGLAS_NEGOCIO.md RN-05, DECISIONS.md ADR-009, MODELO_DATOS.md tabla `qr_validaciones` |

**Definición:**
Código de respuesta rápida (Quick Response) bidimensional impreso en el PDF del permiso de circulación, que permite a la Autoridad de Tránsito verificar la autenticidad y vigencia del permiso en tiempo real mediante un dispositivo móvil.

**Descripción:**
El QR apunta a la URL pública de verificación: `https://dominio.gov.co/verificar/{codigoOpaco}`. El código opaco es un identificador derivado de la combinación de un UUID v4 y un hash SHA-256 del UUID más un salt secreto del servidor. Nunca contiene datos personales ni el número de permiso directamente. La verificación siempre retorna HTTP 200 para no revelar si un código existe o no (RN-34). El sistema registra cada escaneo en la tabla `qr_validaciones` para auditoría.

---

### Código Único

| Campo | Valor |
|-------|-------|
| **Término** | Código Único |
| **Categoría** | Funcional |
| **Actor Relacionado** | Sistema, Autoridad de Tránsito |
| **Documento de Referencia** | REGLAS_NEGOCIO.md RN-05, MODELO_DATOS.md columna `codigo_qr` en tabla `permisos` |

**Definición:**
Identificador opaco e irrepetible asignado a cada permiso de circulación, embebido en el código QR del PDF institucional.

**Descripción:**
Se genera como `SHA-256(UUID_v4 + QR_SECRET_SALT)`, produciendo un token hexadecimal de 64 caracteres. Es único globalmente, no predecible, y no contiene información personal del ciudadano o del permiso. Se almacena en la base de datos vinculado al permiso correspondiente. Su único propósito es servir como token de verificación pública.

---

### Auditoría

| Campo | Valor |
|-------|-------|
| **Término** | Auditoría |
| **Categoría** | Funcional / Técnico |
| **Actor Relacionado** | Administrador, Sistema |
| **Documento de Referencia** | REGLAS_NEGOCIO.md RN-60 a RN-70, MODELO_DATOS.md tabla `auditoria`, PLAN_DESPLIEGUE.md §Auditoría |

**Definición:**
Registro cronológico, inmutable y detallado de todas las acciones y eventos significativos realizados en el sistema por cualquier actor, con el propósito de trazabilidad, rendición de cuentas y cumplimiento legal.

**Descripción:**
La tabla `auditoria` es append-only: el usuario de base de datos de la aplicación solo tiene permisos de INSERT y SELECT sobre ella. Registra: actor (usuario_id o IP para ciudadanos), acción realizada, entidad afectada, identificador de la entidad, datos anteriores (JSONB), datos nuevos (JSONB), dirección IP, user agent y timestamp en UTC. La retención mínima es de 5 años según la Ley 1712/2014. La tabla está particionada por rango de fecha para optimizar consultas históricas.

---

### Rol

| Campo | Valor |
|-------|-------|
| **Término** | Rol |
| **Categoría** | Funcional / Técnico |
| **Actor Relacionado** | Funcionario, Administrador |
| **Documento de Referencia** | REGLAS_NEGOCIO.md RN-40 a RN-50, MODELO_DATOS.md ENUM `rol_usuario` |

**Definición:**
Conjunto de permisos y capacidades asignado a un usuario del sistema (Funcionario o Administrador) que determina a qué funcionalidades puede acceder.

**Descripción:**
El sistema implementa RBAC (Control de Acceso Basado en Roles). Los roles son `FUNCIONARIO` y `ADMINISTRADOR`. El rol se incluye en el payload del JWT y es validado por los guards de NestJS en cada endpoint protegido. Los ciudadanos no tienen rol pues no se autentican. Solo el Administrador puede cambiar el rol de un usuario.

---

### Usuario

| Campo | Valor |
|-------|-------|
| **Término** | Usuario |
| **Categoría** | Funcional / Técnico |
| **Actor Relacionado** | Funcionario, Administrador |
| **Documento de Referencia** | MODELO_DATOS.md tabla `usuarios`, REGLAS_NEGOCIO.md RN-40 a RN-55 |

**Definición:**
Cuenta de acceso al backoffice del sistema (panel del funcionario o del administrador), identificada por un email institucional y protegida con contraseña.

**Descripción:**
Los usuarios son exclusivamente los empleados de la Alcaldía (Funcionarios y Administradores). Los ciudadanos no son usuarios del sistema en sentido técnico. Un usuario tiene: id, nombre completo, email institucional, contraseña hasheada con BCrypt (12 rounds), rol, dependencia asignada, estado activo/inactivo, y registros de auditoría de sus acciones. La contraseña nunca se expone ni se almacena en texto plano.

---

### Dependencia

| Campo | Valor |
|-------|-------|
| **Término** | Dependencia |
| **Categoría** | Funcional |
| **Actor Relacionado** | Administrador, Funcionario |
| **Documento de Referencia** | MODELO_DATOS.md tabla `dependencias`, HISTORIAS_USUARIO.md HU-34 |

**Definición:**
Unidad organizacional de la Alcaldía (área, despacho, secretaría) a la que pertenece un Funcionario, utilizada para la organización interna y la asignación de responsabilidades.

**Descripción:**
Las dependencias son administradas por el Administrador del sistema. Cada Funcionario pertenece a una dependencia. En reportes y auditoría se identifica la dependencia del actor que realizó una acción. La estructura de dependencias es configurable y puede reflejar el organigrama real de la Alcaldía.

---

### Radicado

| Campo | Valor |
|-------|-------|
| **Término** | Radicado |
| **Categoría** | Funcional |
| **Actor Relacionado** | Ciudadano, Funcionario |
| **Documento de Referencia** | REGLAS_NEGOCIO.md RN-04, MODELO_DATOS.md columna `numero_radicado` |

**Definición:**
Número de identificación único asignado automáticamente a cada solicitud de permiso en el momento de su creación, que sirve como referencia oficial del trámite.

**Descripción:**
Formato: `AAAAMMDD-PYP-XXXXXX` donde `AAAAMMDD` es la fecha de creación en UTC, `PYP` es el identificador del sistema, y `XXXXXX` es un número secuencial de 6 dígitos con cero a la izquierda (ej. `20260802-PYP-000123`). El Ciudadano usa este número junto con su número de documento para consultar el estado de su solicitud sin necesidad de autenticarse.

---

### Motivo de Permiso

| Campo | Valor |
|-------|-------|
| **Término** | Motivo de Permiso |
| **Categoría** | Funcional |
| **Actor Relacionado** | Ciudadano, Administrador |
| **Documento de Referencia** | PRD §3.1, MODELO_DATOS.md tabla `motivos_permiso`, HISTORIAS_USUARIO.md HU-35 |

**Definición:**
Categoría de justificación predefinida por el Administrador que describe la razón por la cual el Ciudadano requiere circular durante la restricción Pico y Placa.

**Descripción:**
Ejemplos: salud (citas médicas, tratamientos), trabajo esencial (servicios de emergencia), discapacidad, situación especial, entre otros. El catálogo es gestionado por el Administrador (crear, editar, activar/desactivar). Cada motivo puede tener requisitos específicos de documentación. El motivo seleccionado se incluye en el snapshot de la solicitud al momento de aprobación.

---

### Vigencia

| Campo | Valor |
|-------|-------|
| **Término** | Vigencia |
| **Categoría** | Funcional |
| **Actor Relacionado** | Ciudadano, Funcionario, Administrador |
| **Documento de Referencia** | REGLAS_NEGOCIO.md RN-16 a RN-20, MODELO_DATOS.md columnas `fecha_inicio_permiso`, `fecha_fin_permiso` |

**Definición:**
Período de tiempo durante el cual un permiso de circulación está activo y habilita a la motocicleta para circular en los horarios restringidos por Pico y Placa.

**Descripción:**
La vigencia tiene una fecha de inicio y una fecha de fin. La duración por defecto es configurable por el Administrador (ej. 30 días). El Funcionario puede ajustar las fechas al aprobar la solicitud, dentro de los límites configurados. Una vez vencida la fecha fin, el permiso pasa automáticamente a estado `vencido` (proceso de sistema programado). Las fechas se almacenan en UTC y se muestran en hora colombiana (COT, UTC-5).

---

### Estado de Permiso

| Campo | Valor |
|-------|-------|
| **Término** | Estado de Permiso |
| **Categoría** | Funcional |
| **Actor Relacionado** | Ciudadano, Administrador, Autoridad de Tránsito |
| **Documento de Referencia** | REGLAS_NEGOCIO.md RN-22 a RN-25, MODELO_DATOS.md ENUM `estado_permiso` |

**Definición:**
Condición actual de un permiso de circulación que determina si está habilitado para circular o no.

**Descripción:**

| Estado | Descripción |
|--------|-------------|
| `vigente` | Permiso activo dentro del período de vigencia. |
| `vencido` | Fecha de fin superada. El permiso ya no es válido. |
| `revocado` | Cancelado por decisión administrativa del Administrador antes de su vencimiento. |

---

### Revocación

| Campo | Valor |
|-------|-------|
| **Término** | Revocación |
| **Categoría** | Funcional |
| **Actor Relacionado** | Administrador |
| **Documento de Referencia** | REGLAS_NEGOCIO.md RN-26, CASOS_USO.md CU-29, HISTORIAS_USUARIO.md HU-40 |

**Definición:**
Acción administrativa que cancela un permiso de circulación vigente antes de que alcance su fecha de vencimiento natural, dejándolo en estado `revocado`.

**Descripción:**
Solo el Administrador puede revocar un permiso. La revocación requiere un motivo obligatorio que queda registrado en auditoría. A partir del momento de la revocación, el código QR del permiso dejará de retornar datos válidos en la verificación pública. El ciudadano puede ser notificado por correo electrónico (configurable). La revocación es irreversible.

---

### PDF Institucional

| Campo | Valor |
|-------|-------|
| **Término** | PDF Institucional |
| **Categoría** | Funcional / Técnico |
| **Actor Relacionado** | Ciudadano, Sistema |
| **Documento de Referencia** | PRD §5, REGLAS_NEGOCIO.md RN-28 a RN-33, HISTORIAS_USUARIO.md HU-18 |

**Definición:**
Documento en formato PDF generado automáticamente por el sistema al aprobar una solicitud, que constituye el comprobante oficial del permiso de circulación y contiene el código QR de verificación.

**Descripción:**
El PDF incluye: encabezado institucional de la Alcaldía (logo, nombre, datos), número de permiso, datos del ciudadano, datos de la motocicleta, motivo, período de vigencia, código QR, y pie de página con información legal. Se genera de forma asíncrona mediante un worker de BullMQ (PDFKit o Puppeteer). Se almacena en el bucket privado `pyp-permisos` de MinIO. El ciudadano lo descarga mediante una URL firmada de corta duración. No se puede modificar después de generado.

---

## Términos Técnicos

---

### JWT

| Campo | Valor |
|-------|-------|
| **Término** | JWT (JSON Web Token) |
| **Categoría** | Técnico |
| **Actor Relacionado** | Funcionario, Administrador |
| **Documento de Referencia** | DECISIONS.md ADR-004, SECURITY.md §Autenticación, ANALISIS_TECNICO.md §Seguridad |

**Definición:**
Estándar abierto (RFC 7519) para la transmisión segura de información entre partes como un objeto JSON firmado digitalmente, utilizado en este sistema para autenticar las sesiones de los usuarios del backoffice.

**Descripción:**
El sistema emite dos tipos de tokens: Access Token (vigencia 15 minutos, contiene `sub`, `email`, `rol`, `dependencia_id`) y Refresh Token (vigencia 7 días, con rotación — cada uso emite uno nuevo e invalida el anterior). El algoritmo de firma es HS256 en desarrollo y RS256 recomendado para producción. Los tokens se almacenan en memoria (Access) y en cookie HttpOnly (Refresh). El payload nunca contiene contraseñas ni datos sensibles.

---

### Swagger

| Campo | Valor |
|-------|-------|
| **Término** | Swagger / OpenAPI |
| **Categoría** | Técnico |
| **Actor Relacionado** | Equipo de Desarrollo |
| **Documento de Referencia** | DECISIONS.md ADR-005, MANUAL_TECNICO.md §Swagger |

**Definición:**
Conjunto de herramientas y especificación (OpenAPI 3.0) para documentar, diseñar y probar APIs REST de forma interactiva y estandarizada.

**Descripción:**
El backend NestJS expone automáticamente la documentación de todos los endpoints en la ruta `/api/docs` usando el módulo `@nestjs/swagger`. Cada endpoint está decorado con los schemas de request/response, códigos de error, ejemplos y requisitos de autenticación. Permite al equipo frontend y al equipo de QA explorar y probar la API sin necesidad de un cliente externo. En producción, el acceso a `/api/docs` está restringido por IP o Basic Auth.

---

### UUID

| Campo | Valor |
|-------|-------|
| **Término** | UUID (Universally Unique Identifier) |
| **Categoría** | Técnico |
| **Actor Relacionado** | Sistema |
| **Documento de Referencia** | DECISIONS.md ADR-007, MODELO_DATOS.md §Convenciones |

**Definición:**
Identificador universalmente único de 128 bits generado según el estándar RFC 4122, utilizado como clave primaria de todas las entidades del sistema.

**Descripción:**
Se utiliza la versión 4 (UUID v4), que se basa en números aleatorios, garantizando unicidad sin coordinación central. En PostgreSQL se genera con la función `uuid_generate_v4()` de la extensión `uuid-ossp`. Formato estándar: `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`. Ventajas: no expone la secuencia del negocio, soporta generación distribuida, facilita la fusión de datos. Se almacena como tipo `UUID` nativo de PostgreSQL.

---

### PostgreSQL

| Campo | Valor |
|-------|-------|
| **Término** | PostgreSQL |
| **Categoría** | Técnico |
| **Actor Relacionado** | Equipo de Desarrollo, TI |
| **Documento de Referencia** | DECISIONS.md ADR-003, MODELO_DATOS.md, PLAN_DESPLIEGUE.md §PostgreSQL |

**Definición:**
Sistema de gestión de bases de datos relacional de código abierto, robusto y orientado a objetos, utilizado como base de datos principal del sistema.

**Descripción:**
Versión requerida: PostgreSQL 15+. Extensiones usadas: `uuid-ossp` (generación de UUIDs) y `pg_stat_statements` (monitoreo de queries). Características aprovechadas: tipos ENUM nativos, JSONB para snapshots y auditoría, TIMESTAMPTZ para fechas UTC, particionamiento por RANGE en la tabla `auditoria`, índices parciales y funcionales. Se ejecuta como contenedor Docker en desarrollo y como servicio gestionado o instancia dedicada en producción.

---

### NestJS

| Campo | Valor |
|-------|-------|
| **Término** | NestJS |
| **Categoría** | Técnico |
| **Actor Relacionado** | Equipo de Desarrollo Backend |
| **Documento de Referencia** | DECISIONS.md ADR-001, ANALISIS_TECNICO.md §Stack, MANUAL_TECNICO.md §Backend |

**Definición:**
Framework de Node.js para construir aplicaciones de servidor eficientes, escalables y mantenibles, basado en TypeScript y con una arquitectura modular inspirada en Angular.

**Descripción:**
Versión utilizada: NestJS 10.x con Node.js 20 LTS. Proporciona: inyección de dependencias (IoC), decoradores para definir módulos, controladores, servicios y guards, integración nativa con TypeORM, Passport.js para autenticación, Swagger para documentación, BullMQ para colas, y pipes de validación con `class-validator`. El proyecto se organiza en 17 módulos funcionales siguiendo la arquitectura hexagonal.

---

### Next.js

| Campo | Valor |
|-------|-------|
| **Término** | Next.js |
| **Categoría** | Técnico |
| **Actor Relacionado** | Equipo de Desarrollo Frontend |
| **Documento de Referencia** | DECISIONS.md ADR-002, ANALISIS_TECNICO.md §Stack, MANUAL_TECNICO.md §Frontend |

**Definición:**
Framework de React para construir aplicaciones web con renderizado del lado del servidor (SSR), generación estática (SSG) y enrutamiento basado en sistema de archivos.

**Descripción:**
Versión utilizada: Next.js 14 con App Router. Se usa React 18, TypeScript 5 y TailwindCSS 3. La estructura de rutas utiliza route groups: `(public)/` para formularios ciudadanos sin autenticación, `(auth)/` para login, `funcionario/` para el backoffice del funcionario y `admin/` para el panel de administración. El rendering es híbrido: Server Components para páginas que requieren datos iniciales, Client Components para interactividad.

---

### Docker

| Campo | Valor |
|-------|-------|
| **Término** | Docker |
| **Categoría** | Técnico |
| **Actor Relacionado** | Equipo de DevOps, TI |
| **Documento de Referencia** | DECISIONS.md ADR-008, PLAN_DESPLIEGUE.md §Docker, MANUAL_TECNICO.md §Docker |

**Definición:**
Plataforma de contenedorización que empaqueta aplicaciones y sus dependencias en unidades portables llamadas contenedores, garantizando consistencia entre entornos de desarrollo, pruebas y producción.

**Descripción:**
El proyecto usa Docker con builds multi-etapa para minimizar el tamaño de las imágenes. Se proporcionan dos archivos de composición: `docker-compose.yml` para desarrollo (con hot reload) y `docker-compose.prod.yml` para producción (con Nginx como reverse proxy y terminación SSL). Los servicios contenedorizados son: backend (NestJS), frontend (Next.js), PostgreSQL 15, Redis 7, MinIO y Nginx.

---

### API

| Campo | Valor |
|-------|-------|
| **Término** | API (Application Programming Interface) |
| **Categoría** | Técnico |
| **Actor Relacionado** | Frontend, Equipo de Desarrollo |
| **Documento de Referencia** | API_FUNCIONAL.md, MANUAL_TECNICO.md §Swagger |

**Definición:**
Interfaz de programación que define cómo dos aplicaciones se comunican entre sí, en este proyecto específicamente la API REST HTTP/JSON que expone el backend NestJS para ser consumida por el frontend Next.js.

**Descripción:**
La API del sistema es REST, versionada bajo el prefijo `/api/v1/`. Contiene 56 endpoints documentados en `API_FUNCIONAL.md`. Usa JSON como formato de intercambio, autenticación JWT vía header `Authorization: Bearer {token}`, y sigue las convenciones de códigos de estado HTTP. Está documentada con Swagger/OpenAPI 3.0 en `/api/docs`.

---

### Endpoint

| Campo | Valor |
|-------|-------|
| **Término** | Endpoint |
| **Categoría** | Técnico |
| **Actor Relacionado** | Equipo de Desarrollo |
| **Documento de Referencia** | API_FUNCIONAL.md |

**Definición:**
Dirección URL específica en la API que acepta peticiones HTTP de un método determinado (GET, POST, PUT, PATCH, DELETE) para ejecutar una operación concreta del sistema.

**Descripción:**
Cada endpoint tiene: método HTTP, ruta (ej. `POST /api/v1/solicitudes`), rol requerido (público, funcionario o administrador), schema de request body (DTO), schema de response, y posibles errores. El sistema tiene 56 endpoints distribuidos en módulos: auth (4), solicitudes (8), permisos (6), documentos (4), usuarios (8), dependencias (4), motivos (6), parámetros (4), reportes (4), auditoría (3), QR/verificación (2), y notificaciones (3).

---

### DTO

| Campo | Valor |
|-------|-------|
| **Término** | DTO (Data Transfer Object) |
| **Categoría** | Técnico |
| **Actor Relacionado** | Equipo de Desarrollo Backend |
| **Documento de Referencia** | ANALISIS_TECNICO.md §Arquitectura, MANUAL_TECNICO.md §Buenas Prácticas |

**Definición:**
Objeto de transferencia de datos: clase TypeScript utilizada para definir y validar la estructura exacta de los datos que entran o salen de la API, separando la representación externa de las entidades del dominio interno.

**Descripción:**
En NestJS los DTOs se definen con clases TypeScript decoradas con `class-validator` para validación automática y `@nestjs/swagger` para documentación. Existen DTOs de entrada (request body, query params) y de salida (response). Nunca se expone directamente una entidad de base de datos como respuesta; siempre se mapea a un DTO de salida. Los DTOs se ubican en `src/[módulo]/dto/`.

---

### Repository

| Campo | Valor |
|-------|-------|
| **Término** | Repository |
| **Categoría** | Técnico |
| **Actor Relacionado** | Equipo de Desarrollo Backend |
| **Documento de Referencia** | ANALISIS_TECNICO.md §Arquitectura Hexagonal, DECISIONS.md ADR-006 |

**Definición:**
Patrón de diseño que abstrae el acceso a la capa de persistencia (base de datos), proporcionando una interfaz clara para las operaciones CRUD y consultas sobre una entidad del dominio.

**Descripción:**
En la arquitectura hexagonal del proyecto, los repositorios son puertos (interfaces TypeScript) definidos en la capa de dominio. Sus implementaciones concretas (adaptadores) usan TypeORM y se ubican en la capa de infraestructura. El servicio de dominio solo conoce la interfaz, no la implementación concreta. Esto facilita el testing unitario con mocks y un eventual cambio de ORM o motor de base de datos.

---

### Service

| Campo | Valor |
|-------|-------|
| **Término** | Service |
| **Categoría** | Técnico |
| **Actor Relacionado** | Equipo de Desarrollo Backend |
| **Documento de Referencia** | MANUAL_TECNICO.md §Arquitectura, ANALISIS_TECNICO.md §Módulos |

**Definición:**
Clase de NestJS que encapsula la lógica de negocio de un módulo, orquesta las operaciones entre repositorios y otros servicios, y es invocada por los controladores.

**Descripción:**
En la arquitectura hexagonal, el Service corresponde al caso de uso de la capa de aplicación. Recibe DTOs del controlador, ejecuta validaciones de negocio, coordina las operaciones de repositorios y emite eventos de dominio. No contiene lógica de acceso a base de datos directamente (eso está en el repositorio). Un controlador nunca accede directamente a un repositorio; siempre lo hace a través de un servicio.

---

### Arquitectura Hexagonal

| Campo | Valor |
|-------|-------|
| **Término** | Arquitectura Hexagonal |
| **Categoría** | Técnico |
| **Actor Relacionado** | Equipo de Desarrollo |
| **Documento de Referencia** | DECISIONS.md ADR-006, ANALISIS_TECNICO.md §Arquitectura, MANUAL_TECNICO.md §Arquitectura |

**Definición:**
Patrón de arquitectura de software (también conocido como Ports & Adapters) que separa el núcleo de la lógica de negocio (dominio) de los detalles de infraestructura mediante el uso de interfaces (puertos) e implementaciones intercambiables (adaptadores).

**Descripción:**
El sistema se organiza en tres capas: (1) **Dominio** — entidades, value objects, reglas de negocio, interfaces de repositorios; (2) **Aplicación** — casos de uso, servicios de aplicación, DTOs, eventos; (3) **Infraestructura** — implementaciones TypeORM, controladores REST, adaptadores de correo, PDF, QR, almacenamiento. Las dependencias solo fluyen hacia adentro (desde infraestructura hacia dominio, nunca al revés). Esto garantiza que el dominio sea testeable de forma aislada.

---

### BCrypt

| Campo | Valor |
|-------|-------|
| **Término** | BCrypt |
| **Categoría** | Técnico |
| **Actor Relacionado** | Sistema |
| **Documento de Referencia** | SECURITY.md §Contraseñas, REGLAS_NEGOCIO.md RN-42 |

**Definición:**
Función de hash de contraseñas adaptativa basada en el cifrado Blowfish, diseñada para ser computacionalmente costosa y resistente a ataques de fuerza bruta.

**Descripción:**
El sistema usa BCrypt con factor de costo 12 rounds (configurable mediante la variable de entorno `BCRYPT_ROUNDS`). Nunca se almacenan contraseñas en texto plano. El hash incluye un salt aleatorio incorporado, lo que previene ataques de rainbow table. Con 12 rounds el tiempo de hash es ~300ms, lo que es aceptable para operaciones de login pero prohibitivo para ataques de diccionario masivo.

---

### BullMQ

| Campo | Valor |
|-------|-------|
| **Término** | BullMQ |
| **Categoría** | Técnico |
| **Actor Relacionado** | Sistema |
| **Documento de Referencia** | ANALISIS_TECNICO.md §Stack, PLAN_DESPLIEGUE.md §Redis |

**Definición:**
Librería de Node.js para la gestión de colas de trabajo y procesamiento asíncrono de tareas en segundo plano, basada en Redis como broker de mensajes.

**Descripción:**
Versión: BullMQ 4.x. Se usa para dos flujos asíncronos principales: (1) generación de PDFs — cuando se aprueba una solicitud, se encola un job de generación PDF en lugar de hacerlo de forma síncrona; (2) envío de notificaciones por correo — los emails se encolan para no bloquear el flujo de respuesta HTTP. Incluye reintentos automáticos con backoff exponencial, Dead Letter Queue (DLQ) para jobs fallidos, y dashboard de monitoreo.

---

### Redis

| Campo | Valor |
|-------|-------|
| **Término** | Redis |
| **Categoría** | Técnico |
| **Actor Relacionado** | Sistema |
| **Documento de Referencia** | PLAN_DESPLIEGUE.md §Redis, ANALISIS_TECNICO.md §Caché |

**Definición:**
Almacén de datos en memoria de código abierto, utilizado en este sistema como broker de mensajes para BullMQ y como caché de datos frecuentemente consultados.

**Descripción:**
Versión: Redis 7. Se usa para: (1) broker de colas BullMQ (trabajos de PDF y correo); (2) almacenamiento de Refresh Tokens revocados (lista negra); (3) caché de consultas frecuentes (catálogos, parámetros de configuración) con TTL configurado. Se ejecuta como contenedor Docker. En producción se recomienda Redis Sentinel o Redis Cluster para alta disponibilidad.

---

### MinIO

| Campo | Valor |
|-------|-------|
| **Término** | MinIO |
| **Categoría** | Técnico |
| **Actor Relacionado** | Sistema |
| **Documento de Referencia** | PLAN_DESPLIEGUE.md §Storage, REGLAS_NEGOCIO.md RN-07 a RN-09 |

**Definición:**
Servidor de almacenamiento de objetos de alto rendimiento compatible con la API de Amazon S3, utilizado para almacenar documentos soporte, PDFs de permisos y reportes exportados.

**Descripción:**
Se configuran tres buckets privados: `pyp-documentos` (documentos soporte de ciudadanos), `pyp-permisos` (PDFs de permisos generados) y `pyp-reportes` (reportes exportados por el administrador). Ningún bucket es de acceso público. El acceso a archivos se realiza exclusivamente mediante URLs prefirmadas (Presigned URLs) con tiempo de vida de 5 minutos, generadas por el backend en cada solicitud. Esto garantiza que los archivos nunca sean accesibles directamente desde el navegador sin autorización del servidor.

---

### TypeORM

| Campo | Valor |
|-------|-------|
| **Término** | TypeORM |
| **Categoría** | Técnico |
| **Actor Relacionado** | Equipo de Desarrollo Backend |
| **Documento de Referencia** | ANALISIS_TECNICO.md §Stack, MANUAL_TECNICO.md §Base de Datos |

**Definición:**
ORM (Object-Relational Mapper) para TypeScript y JavaScript que permite interactuar con bases de datos relacionales usando clases y decoradores en lugar de SQL crudo.

**Descripción:**
Versión: TypeORM 0.3.x. Se usa para mapear las entidades del dominio a tablas de PostgreSQL, gestionar migraciones de esquema, y ejecutar consultas tipadas. Las entidades se definen con decoradores `@Entity`, `@Column`, `@ManyToOne`, etc. Las migraciones se generan con `typeorm migration:generate` y se ejecutan en el pipeline de CI/CD antes del despliegue. El proyecto no usa `synchronize: true` en producción — solo migraciones explícitas.

---

### reCAPTCHA

| Campo | Valor |
|-------|-------|
| **Término** | reCAPTCHA v3 |
| **Categoría** | Técnico |
| **Actor Relacionado** | Ciudadano, Sistema |
| **Documento de Referencia** | REGLAS_NEGOCIO.md RN-73, SECURITY.md §Anti-Bot |

**Definición:**
Servicio de Google que protege formularios públicos contra el abuso automatizado (bots, scraping, ataques de spam) evaluando el comportamiento del usuario y asignando una puntuación de riesgo.

**Descripción:**
El sistema usa reCAPTCHA v3 (invisible para el usuario, sin checkbox). El token generado en el frontend se envía al backend, que lo valida contra la API de Google y verifica que la puntuación sea ≥ 0.5 (configurable). Si la puntuación es menor, la solicitud es rechazada con un error 400. Se aplica en todos los formularios públicos: creación de solicitud, consulta de estado y verificación de QR desde web.

---

### Soft Delete

| Campo | Valor |
|-------|-------|
| **Término** | Soft Delete |
| **Categoría** | Técnico |
| **Actor Relacionado** | Sistema, Administrador |
| **Documento de Referencia** | REGLAS_NEGOCIO.md RN-60 a RN-65, MODELO_DATOS.md §Convenciones |

**Definición:**
Estrategia de eliminación lógica de registros en la que, en lugar de borrar físicamente el dato de la base de datos, se marca con una fecha de eliminación o un indicador de inactividad, preservando el historial.

**Descripción:**
El sistema usa dos variantes: (1) columna `deleted_at TIMESTAMPTZ` en tablas transaccionales (solicitudes, permisos, usuarios); si `deleted_at IS NOT NULL` el registro se considera eliminado y es excluido de las consultas normales. (2) columna `activo BOOLEAN` en tablas de catálogo (motivos, dependencias). Las tablas de auditoría, historial de estados y validaciones QR son append-only y no tienen mecanismo de eliminación.

---

### Snapshot

| Campo | Valor |
|-------|-------|
| **Término** | Snapshot |
| **Categoría** | Técnico |
| **Actor Relacionado** | Sistema |
| **Documento de Referencia** | REGLAS_NEGOCIO.md RN-06, MODELO_DATOS.md tabla `permisos` columnas `snapshot_*` |

**Definición:**
Copia inmutable del estado de ciertos datos en el momento exacto en que ocurre un evento significativo (aprobación de solicitud), almacenada en formato JSONB dentro del registro del permiso.

**Descripción:**
Al aprobar una solicitud, el sistema captura y congela: `snapshot_ciudadano` (nombre, tipo y número de documento, email, teléfono), `snapshot_motocicleta` (placa, marca, línea, modelo, cilindraje) y `snapshot_motivo` (nombre y descripción del motivo). Estos datos no se actualizan aunque el ciudadano modifique su información en el futuro. Esto garantiza que el PDF del permiso siempre refleje los datos vigentes al momento de la expedición, cumpliendo con principios de integridad documental y con la Ley 527/1999.

---

### RBAC

| Campo | Valor |
|-------|-------|
| **Término** | RBAC (Role-Based Access Control) |
| **Categoría** | Técnico |
| **Actor Relacionado** | Funcionario, Administrador |
| **Documento de Referencia** | SECURITY.md §RBAC, REGLAS_NEGOCIO.md RN-40 a RN-50 |

**Definición:**
Modelo de control de acceso en el que los permisos se asignan a roles y los roles se asignan a usuarios, en lugar de asignar permisos directamente a cada usuario.

**Descripción:**
El sistema implementa RBAC con dos roles: `FUNCIONARIO` (acceso al backoffice de gestión de solicitudes) y `ADMINISTRADOR` (acceso total incluyendo configuración y reportes). El rol se incluye en el JWT y es validado por guards de NestJS usando el decorador `@Roles()`. La lógica de autorización está centralizada en el módulo `AuthModule`. El rol `ADMINISTRADOR` incluye todos los permisos de `FUNCIONARIO` más los administrativos.

---

### Rate Limiting

| Campo | Valor |
|-------|-------|
| **Término** | Rate Limiting |
| **Categoría** | Técnico |
| **Actor Relacionado** | Sistema |
| **Documento de Referencia** | SECURITY.md §Rate Limiting, REGLAS_NEGOCIO.md RN-74 a RN-78 |

**Definición:**
Mecanismo de seguridad que limita la cantidad de peticiones que un cliente (identificado por IP u otro criterio) puede hacer a un endpoint en un intervalo de tiempo determinado, para prevenir abusos y ataques de fuerza bruta.

**Descripción:**
Se implementa con el módulo `@nestjs/throttler` de NestJS, respaldado por Redis para estado distribuido. Límites configurados: endpoints públicos (100 req/15 min/IP), login (5 intentos/15 min/IP con bloqueo progresivo), creación de solicitud (10 req/hora/IP), verificación QR (60 req/min/IP). Las respuestas con límite excedido retornan HTTP 429 con cabecera `Retry-After`. Los límites son ajustables por el Administrador mediante parámetros del sistema.

---

## Control de Versiones del Glosario

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 1.0.0 | 2026-08-02 | Versión inicial. 45 términos definidos. |

---

*Este glosario es un documento vivo. Debe actualizarse cada vez que se incorpore un nuevo término relevante al proyecto o cuando la definición de un término existente cambie.*
