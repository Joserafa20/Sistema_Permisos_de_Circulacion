# PROJECT_CONTEXT

## Nombre

Sistema Web para Solicitud y Generación de Permisos de Circulación de Motocicletas (Pico y Placa).

---

## Objetivo

Permitir que los ciudadanos soliciten permisos de circulación durante restricciones de Pico y Placa, para que un funcionario los revise, aprueba o rechace y, en caso de aprobación, el sistema genere automáticamente un permiso institucional en PDF con Código QR único y verificable por autoridades.

---

## Documento Maestro

`docs/PRD_Sistema_Permisos_de_Circulacion.md`

## Análisis Técnico

`docs/ANALISIS_TECNICO.md`

---

## Marco Legal Aplicable (Colombia)

| Norma | Descripción |
|-------|-------------|
| Ley 527/1999 | Comercio electrónico y firma electrónica |
| Ley 1581/2012 | Protección de datos personales (Habeas Data) |
| Decreto 1377/2013 | Reglamentación Ley 1581 — aviso de privacidad |
| Ley 1712/2014 | Transparencia y acceso a la información pública |
| CONPES 3854/2016 | Política Nacional de Seguridad Digital |
| Decreto 2693/2012 | Lineamientos GEL (Gobierno en Línea) |
| NTC 5854 | Accesibilidad web (equivalente WCAG 2.0) |
| Ley 1437/2011 | Código de Procedimiento Administrativo (CPACA) |

---

## Tipos de Usuario

### Ciudadano
- Acceso público sin login.
- Identifica su solicitud con **número de radicado + número de documento**.
- Puede:
  - Crear una solicitud.
  - Consultar el estado por radicado + documento.
  - Corregir su solicitud cuando el funcionario lo solicite.
  - Descargar el permiso únicamente cuando esté aprobado.
- Nunca puede modificar el permiso ya generado.
- Debe aceptar autorización de tratamiento de datos (Ley 1581).

### Funcionario
- Accede mediante usuario y contraseña (JWT).
- Puede:
  - Ver la cola de solicitudes pendientes.
  - Revisar información y documentos adjuntos.
  - Aprobar, rechazar o solicitar corrección (con motivo obligatorio).
  - Generar el permiso (PDF + QR) al aprobar.
  - Imprimir y descargar el PDF.
  - Ver historial de cambios de estado.
- No puede gestionar usuarios ni configuración.

### Administrador
- Control total del sistema.
- Puede:
  - CRUD de usuarios y roles.
  - Configurar parámetros del sistema (nombre alcaldía, logo, firma, sello, días máximos de permiso, plazos).
  - CRUD de motivos (con activación/desactivación sin borrar).
  - CRUD de dependencias.
  - Ver y filtrar la bitácora de auditoría completa.
  - Consultar y exportar reportes (PDF, Excel, CSV).
  - Revocar permisos activos con motivo obligatorio.
  - Gestionar copias de seguridad.

---

## Estados de una Solicitud

```
RECIBIDA → EN_REVISION → PENDIENTE_CORRECCION → (vuelve a RECIBIDA)
                       → APROBADA → (genera permiso)
                       → RECHAZADA
                       → VENCIDA (automático por job)
```

## Estados de un Permiso

```
VIGENTE → VENCIDO (automático al pasar fecha_vencimiento)
        → REVOCADO (por administrador con motivo)
```

---

## Flujo General

```
Ciudadano llena formulario
        ↓
Sistema asigna número de radicado
        ↓
Correo con radicado → Ciudadano
        ↓
Funcionario revisa (cola de trabajo)
        ↓
    ┌───┴───────────────┐
Aprobar              Rechazar / Solicitar corrección
    ↓                       ↓
Sistema genera          Correo → Ciudadano
PDF + QR único
    ↓
Correo con permiso → Ciudadano
    ↓
Autoridad escanea QR → Página pública de validación
```

---

## Reglas de Negocio Clave

| # | Regla |
|---|-------|
| RN-01 | El permiso no puede tener fecha de inicio anterior a la fecha de aprobación |
| RN-02 | Duración máxima de un permiso: configurable (default 30 días) |
| RN-03 | El ciudadano no puede tener dos solicitudes activas simultáneas para la misma moto |
| RN-04 | El funcionario debe indicar un motivo al rechazar o solicitar corrección |
| RN-05 | El QR es único e irrepetible; si se revoca un permiso y se regenera, el nuevo tiene un QR distinto |
| RN-06 | Los datos en el PDF reflejan el snapshot al momento de la aprobación, no los datos actuales |
| RN-07 | El número consecutivo del permiso nunca se reutiliza |
| RN-08 | El estado VENCIDA/VENCIDO se actualiza automáticamente mediante job programado |
| RN-09 | Los documentos adjuntos se conservan aunque la solicitud sea rechazada |
| RN-10 | Una solicitud rechazada no puede reabrirse; el ciudadano debe crear una nueva |
| RN-11 | El plazo para que el ciudadano corrija es configurable (default 5 días hábiles) |
| RN-12 | El plazo para que el funcionario revise es configurable (default 48 horas hábiles) |
| RN-13 | Todas las fechas se almacenan en UTC; se presentan en COT (UTC-5) |
| RN-14 | El número de radicado sigue el formato: AAAAMMDD-PYP-XXXXXX |

---

## Tecnologías

### Frontend
- React + Next.js + TypeScript + TailwindCSS
- Formulario con stepper multi-paso
- Accesibilidad WCAG 2.1 nivel AA (NTC 5854)

### Backend
- NestJS + Node.js + TypeScript
- Arquitectura Hexagonal (Ports & Adapters)
- BullMQ + Redis para colas asíncronas (PDF, correos)

### Base de Datos
- PostgreSQL
- TypeORM + migraciones
- Redis (caché y colas)

### Almacenamiento
- MinIO (compatible S3) para documentos adjuntos y PDFs
- URLs firmadas con expiración (nunca rutas directas)

### Integraciones
- Swagger (documentación API)
- JWT + Refresh Token (autenticación)
- Nodemailer / SendGrid (correos)
- PDFKit o Puppeteer (generación PDF)
- QRCode (generación QR con identificador UUID+hash)
- reCAPTCHA v3 (formulario público)

---

## Configuración Parametrizable (tabla `configuracion`)

| Clave | Descripción | Default |
|-------|-------------|---------|
| `nombre_alcaldia` | Nombre institucional en el PDF | — |
| `municipio` | Municipio | — |
| `logo_url` | Ruta del logo/escudo | — |
| `firma_url` | Imagen de firma del funcionario | — |
| `sello_url` | Sello institucional | — |
| `dias_max_permiso` | Duración máxima de un permiso | 30 |
| `plazo_revision_horas` | Horas para revisar una solicitud | 48 |
| `plazo_correccion_dias` | Días para que el ciudadano corrija | 5 |
| `color_institucional` | Color primario de la interfaz | #1a56db |

---

## Formato de Número Consecutivo de Permiso

```
2026-PYP-00145
 ↑      ↑   ↑
Año  Prefijo Consecutivo global
```

## Formato de Número de Radicado

```
20260802-PYP-001234
    ↑        ↑   ↑
 Fecha    Prefijo Secuencial del día
```
