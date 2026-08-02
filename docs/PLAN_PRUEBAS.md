# Plan de Pruebas — Sistema de Permisos de Circulación (Pico y Placa)

**Versión:** 1.0  
**Fecha:** 2026-08-02  
**Referencia:** `docs/CASOS_USO.md` · `docs/API_FUNCIONAL.md` · `docs/REGLAS_NEGOCIO.md`

---

## 1. Estrategia de Pruebas

### 1.1 Pirámide de Pruebas

```
                    /\
                   /  \
                  / E2E \        (10%) — Playwright
                 /--------\
                / Integración\   (20%) — Supertest + BD real
               /------------\
              / Unitarias    \   (70%) — Jest + mocks
             /--------------\
```

### 1.2 Principios

- Las pruebas son parte del Definition of Done. Un módulo no se considera completo sin sus pruebas.
- Se prioriza la cobertura de los flujos críticos del negocio sobre la cobertura de líneas de código.
- Las pruebas unitarias verifican lógica de negocio. Las de integración verifican contratos entre capas.
- Las pruebas E2E verifican los flujos del usuario en un navegador real.
- Las pruebas de seguridad se ejecutan en el ambiente de staging, nunca en producción.

### 1.3 Cobertura Mínima Requerida

| Tipo | Cobertura Mínima | Herramienta |
|------|:----------------:|-------------|
| Unitarias (use cases, domain) | ≥ 80% | Jest |
| Integración (endpoints) | Flujos críticos cubiertos | Supertest + PostgreSQL real |
| E2E (portal ciudadano) | Flujos felices + flujos de error principales | Playwright |
| Seguridad | OWASP Top 10 verificado | Manual + herramientas |
| Rendimiento | Definido en criterios de aceptación | k6 |

### 1.4 Ambientes de Prueba

| Ambiente | Propósito | Base de Datos | Notificaciones |
|----------|-----------|:-------------:|:--------------:|
| **local** | Desarrollo y pruebas unitarias | PostgreSQL Docker local | Desactivadas |
| **test** | Pruebas de integración automatizadas CI | PostgreSQL Docker efímero | Desactivadas (mock) |
| **staging** | Pruebas funcionales, aceptación y seguridad | PostgreSQL clone de datos anonimizados | Correos a bandeja de test |
| **production** | Humo post-despliegue únicamente | Real | Reales |

---

## 2. Pruebas Unitarias

### 2.1 Alcance

Las pruebas unitarias cubren:
- **Use Cases:** toda la lógica de negocio en la capa de aplicación.
- **Domain Services:** validaciones, cálculos y reglas de negocio puras.
- **Guards y Pipes:** lógica de autenticación y validación de DTOs.
- **Transformers:** conversiones de datos entre capas.

Las pruebas unitarias **no** prueban:
- Repositorios (se prueban en integración con BD real).
- Controladores de forma aislada (se prueban vía Supertest).
- Jobs de BullMQ (se prueban en integración).

### 2.2 Use Cases Críticos para Pruebas Unitarias

| Módulo | Use Case | Escenarios |
|--------|----------|-----------|
| Solicitudes | `CrearSolicitudUseCase` | Solicitud válida, moto con solicitud activa (RN-03), CAPTCHA fallido, fechas inválidas (RN-01, RN-02), sin consentimiento (RN-96) |
| Solicitudes | `AprobarSolicitudUseCase` | Aprobación válida, estado incorrecto, solapamiento de permisos (RN-17), moto con permiso vigente |
| Solicitudes | `RechazarSolicitudUseCase` | Rechazo válido, sin motivo (RN-04), estado incorrecto (RN-15) |
| Solicitudes | `SolicitarCorreccionUseCase` | Corrección válida, sin campos marcados, estado incorrecto |
| Permisos | `GenerarPermisoUseCase` | Generación exitosa, error en PDF, error en QR, fallo de storage |
| Permisos | `RevocarPermisoUseCase` | Revocación válida, permiso ya vencido (RN-31), sin motivo |
| Auth | `LoginUseCase` | Login válido, contraseña incorrecta, cuenta bloqueada, contraseña vencida |
| Auth | `RefreshTokenUseCase` | Token válido, token revocado, token vencido |
| QR | `ValidarQRUseCase` | QR vigente, QR vencido, QR revocado, QR inexistente |

### 2.3 Reglas de Negocio Prioritarias para Pruebas Unitarias

| Regla | Caso de Prueba |
|-------|---------------|
| RN-01 | Fecha de inicio en el pasado debe fallar la validación |
| RN-02 | Fecha que supera `dias_max_permiso` debe fallar |
| RN-03 | Segunda solicitud para la misma moto activa debe ser rechazada |
| RN-05 | El código QR generado debe ser único (mock del repositorio retorna colisión) |
| RN-06 | El snapshot del permiso debe contener los datos al momento de la aprobación, no los actuales |
| RN-10 | Intentar reabrir una solicitud rechazada debe retornar error |
| RN-14 | El formato del radicado generado debe cumplir el regex `AAAAMMDD-PYP-XXXXXX` |
| RN-34 | La validación del QR siempre debe retornar HTTP 200 |

### 2.4 Convenciones de Pruebas Unitarias

```
describe('[NombreUseCase]', () => {
  describe('execute()', () => {
    it('should [resultado esperado] when [condición]', async () => {
      // Arrange
      // Act
      // Assert
    });
  });
});
```

- Un `it()` por escenario.
- Nombres en inglés (convención del stack).
- Usar `jest.mock()` para repositorios, servicios externos y time-sensitive (`Date.now()`).

---

## 3. Pruebas de Integración

### 3.1 Alcance

Las pruebas de integración verifican que los endpoints HTTP retornan las respuestas correctas usando:
- Una instancia real de NestJS en modo test.
- Una base de datos PostgreSQL real (contenedor Docker efímero, limpiada entre suites).
- Mocks para servicios externos: MinIO, Redis, BullMQ, SMTP, reCAPTCHA.

### 3.2 Flujos de Integración Críticos

#### Flujo 1: Ciclo completo de una solicitud aprobada

```
POST /public/solicitudes                → 201, radicado generado
POST /auth/login (funcionario)          → 200, access token
GET  /solicitudes                       → 200, solicitud en lista
GET  /solicitudes/{id}                  → 200, estado cambia a en_revision
POST /solicitudes/{id}/aprobar          → 202, job encolado (mock)
[Simular job] → permiso creado
GET  /permisos/{id}                     → 200, permiso vigente
GET  /public/verificar/{codigoQR}       → 200, resultado: vigente
```

#### Flujo 2: Ciclo de rechazo

```
POST /public/solicitudes                → 201
POST /auth/login (funcionario)          → 200
GET  /solicitudes/{id}                  → 200, en_revision
POST /solicitudes/{id}/rechazar         → 200, estado rechazada
GET  /public/solicitudes/estado         → 200, estado: rechazada con motivo
```

#### Flujo 3: Ciclo de corrección

```
POST /public/solicitudes                → 201
GET  /solicitudes/{id}                  → 200, en_revision
POST /solicitudes/{id}/correccion       → 200, pendiente_correccion
GET  /public/solicitudes/estado         → 200, pendiente_correccion con campos
PUT  /public/solicitudes/{rad}/correccion → 200, estado: recibida
GET  /solicitudes/{id}                  → 200, recibida
```

#### Flujo 4: Autenticación completa

```
POST /auth/login (correcto)             → 200, tokens
POST /auth/login (incorrecto x5)        → 429/403, cuenta bloqueada
POST /auth/refresh                      → 200, nuevos tokens
POST /auth/logout                       → 200, token revocado
POST /auth/refresh (token revocado)     → 401
```

#### Flujo 5: Vencimiento automático

```
POST /public/solicitudes                → 201
[Simular paso del tiempo > plazo]
[Ejecutar job manualmente]
GET  /public/solicitudes/estado         → 200, estado: vencida
```

### 3.3 Pruebas de Contratos de API

Para cada endpoint verificar:
- El código HTTP de respuesta es el correcto (200, 201, 202, 400, 401, 403, 404, 409, 422).
- La estructura del body de respuesta coincide con el contrato de `API_FUNCIONAL.md`.
- Los campos requeridos están presentes en la respuesta.
- Los campos prohibidos NO están presentes (ej: `storage_key`, `contrasena_hash`).
- La paginación funciona correctamente con `limit`, `offset` y metadatos.

---

## 4. Pruebas Funcionales

### 4.1 Alcance

Las pruebas funcionales verifican que el sistema se comporta correctamente desde la perspectiva del usuario, usando la interfaz web real en un ambiente de staging.

### 4.2 Módulo Portal Ciudadano

| ID | Caso de Prueba | Precondición | Pasos | Resultado Esperado |
|----|---------------|-------------|-------|-------------------|
| PF-01 | Crear solicitud válida completa | Portal accesible | Completar los 5 pasos del formulario con datos válidos, marcar consentimiento, enviar | Pantalla de confirmación con número de radicado. Correo recibido en 5 min. |
| PF-02 | Validación de placa en tiempo real | Formulario abierto | Ingresar placa `AB12` (inválida) | Error en tiempo real: "Formato de placa inválido" |
| PF-03 | Consultar estado de solicitud existente | Solicitud con radicado `20260802-PYP-000001` | Ingresar radicado y documento válidos | Estado actual mostrado en lenguaje ciudadano |
| PF-04 | Consultar con datos incorrectos | Radicado válido | Ingresar documento incorrecto | Mismo mensaje que radicado inexistente |
| PF-05 | Descargar permiso aprobado | Solicitud aprobada y permiso generado | Consultar estado, hacer clic en "Descargar Permiso" | PDF descargado con datos correctos y QR visible |
| PF-06 | Escanear QR de permiso vigente | Permiso generado, código QR impreso | Escanear QR con dispositivo móvil | Pantalla verde con datos del titular |
| PF-07 | Escanear QR de permiso revocado | Permiso revocado | Escanear QR | Pantalla roja con mensaje de revocado |
| PF-08 | Formulario se recupera tras cierre del navegador | Formulario a mitad de completar | Cerrar navegador, volver a la URL | Datos restaurados del localStorage con aviso de recuperación |

### 4.3 Módulo Panel Funcionario

| ID | Caso de Prueba | Pasos | Resultado Esperado |
|----|---------------|-------|-------------------|
| PF-09 | Login exitoso como funcionario | Ingresar correo y contraseña válidos | Redirección al panel con cola de solicitudes |
| PF-10 | Cola ordenada por antigüedad | Crear 3 solicitudes en orden A, B, C | La cola muestra A primero (más antigua) |
| PF-11 | Solicitud con alerta de urgencia | Solicitud creada hace más de 24 horas | Indicador visual rojo/alerta en la tarjeta |
| PF-12 | Apertura de solicitud cambia estado | Solicitud en `recibida` | Al abrir, el estado cambia a `en_revision` |
| PF-13 | Previsualización de documento PDF | Solicitud con documento PDF adjunto | PDF se abre en panel lateral sin descargar |
| PF-14 | Aprobación con confirmación | Solicitud en `en_revision` | Modal de confirmación → Aprobación → Mensaje de procesando |
| PF-15 | Rechazo requiere motivo mínimo | Hacer clic en Rechazar | El botón de confirmar está deshabilitado con menos de 20 caracteres |
| PF-16 | Corrección con campos específicos | Marcar 2 campos a corregir | El ciudadano solo puede editar esos 2 campos |

### 4.4 Módulo Panel Administrador

| ID | Caso de Prueba | Pasos | Resultado Esperado |
|----|---------------|-------|-------------------|
| PF-17 | Crear funcionario nuevo | Completar formulario de creación | Usuario creado, correo de bienvenida enviado |
| PF-18 | Desactivar usuario | Hacer clic en Desactivar y confirmar | Usuario no puede iniciar sesión. Sesiones activas revocadas. |
| PF-19 | Revocar permiso vigente | Buscar permiso vigente, clic en Revocar, ingresar motivo | Permiso en estado revocado. QR muestra REVOCADO de inmediato. |
| PF-20 | Cambiar `dias_max_permiso` | Ir a Configuración, editar parámetro a 15 | Nueva solicitud con 20 días rechazada. Solicitudes anteriores sin cambio. |
| PF-21 | Exportar reporte en Excel | Seleccionar reporte de solicitudes, clic en Exportar Excel | Descarga de archivo `.xlsx` con datos correctos |
| PF-22 | Consultar bitácora de auditoría | Ir a Auditoría, filtrar por acción `login` | Lista de eventos de login con usuario, IP y fecha |

---

## 5. Pruebas de Aceptación (UAT)

### 5.1 Criterios de Participantes

- **Ciudadano:** persona sin conocimientos técnicos previos del sistema.
- **Funcionario:** servidor de la alcaldía que gestionará solicitudes diariamente.
- **Administrador:** responsable de TI o coordinador del proyecto.

### 5.2 Escenarios de Aceptación

#### Escenario UAT-01 — Ciudadano realiza el trámite completo

**Objetivo:** Verificar que un ciudadano sin capacitación puede completar el trámite.  
**Participante:** Ciudadano real o rol ciudadano interpretado por alguien del equipo de la alcaldía.

| Paso | Acción del ciudadano | Criterio de aceptación |
|------|---------------------|----------------------|
| 1 | Accede al portal desde el celular | El portal carga en menos de 3 segundos en 4G |
| 2 | Completa el formulario en 5 pasos | Puede completarlo sin asistencia en menos de 10 minutos |
| 3 | Adjunta documentos desde el celular | La carga de archivos funciona desde galería del móvil |
| 4 | Recibe el correo de confirmación | El correo llega en menos de 5 minutos con el radicado |
| 5 | Consulta el estado usando el radicado del correo | Puede consultar el estado sin asistencia |
| 6 | Descarga el permiso cuando es aprobado | El PDF es legible y contiene todos sus datos |

#### Escenario UAT-02 — Funcionario gestiona la cola de trabajo

**Participante:** Servidor de la alcaldía designado para gestionar solicitudes.

| Paso | Acción del funcionario | Criterio de aceptación |
|------|----------------------|----------------------|
| 1 | Inicia sesión con sus credenciales | Accede al panel sin asistencia técnica |
| 2 | Revisa la cola de solicitudes | Entiende el orden y las alertas de urgencia |
| 3 | Abre el detalle de una solicitud | Puede ver todos los datos y previsualizar documentos |
| 4 | Aprueba, rechaza o pide corrección | Completa las acciones sin ambigüedad |
| 5 | Descarga el PDF para entregar al ciudadano | PDF se imprime correctamente en hoja A4 |

#### Escenario UAT-03 — Autoridad de tránsito verifica permiso en campo

**Participante:** Agente de tránsito.

| Paso | Acción | Criterio de aceptación |
|------|--------|----------------------|
| 1 | Escanea el QR del permiso físico con su celular | La página carga automáticamente |
| 2 | Lee el resultado | Puede leer el estado (verde/rojo) a simple vista |
| 3 | Verifica los datos | Los datos del titular y la moto son claros |
| 4 | Escanea un QR de permiso vencido | La pantalla muestra claramente PERMISO VENCIDO |

### 5.3 Criterios de Aprobación del UAT

- El 100% de los escenarios UAT completan sin errores bloqueantes.
- El tiempo de completitud del trámite por el ciudadano es menor a 10 minutos.
- Los participantes califican la experiencia con un puntaje ≥ 4/5 en usabilidad.
- Ningún participante necesitó asistencia técnica para completar los flujos principales.

---

## 6. Pruebas de Seguridad

### 6.1 OWASP Top 10 — Verificaciones Requeridas

| Vulnerabilidad | Vector de Prueba | Resultado Esperado |
|---------------|-----------------|-------------------|
| **A01 Control de Acceso Roto** | Acceder a `/solicitudes/{id}` de otro ciudadano desde el portal público | HTTP 401 o 403 |
| **A02 Fallas Criptográficas** | Verificar que los PDFs en MinIO no son accesibles sin URL firmada | HTTP 403 desde URL directa |
| **A03 Inyección** | Ingresar `'; DROP TABLE solicitudes; --` en el campo de placa | La consulta no se ejecuta; placa retorna error de validación |
| **A04 Diseño Inseguro** | Crear solicitud sin token CAPTCHA | HTTP 422 |
| **A05 Mala Configuración** | Verificar headers HTTP de respuesta | Helmet configura X-Frame-Options, CSP, HSTS |
| **A06 Componentes Vulnerables** | Escanear dependencias con `npm audit` | Sin vulnerabilidades críticas |
| **A07 Auth Fallida** | Intentar 10 logins fallidos | Cuenta bloqueada a los 5 intentos |
| **A08 Integridad de Software** | Verificar hash SHA-256 del PDF almacenado | Hash coincide con el del PDF descargado |
| **A09 Logging Insuficiente** | Verificar que los intentos de acceso no autorizado generan registros | Entradas en `auditoria` con IP y timestamp |
| **A10 SSRF** | Enviar URL interna en el campo de adjunto | Backend no realiza peticiones a URLs externas desde archivos |

### 6.2 Pruebas Específicas de Seguridad del Sistema

| ID | Prueba | Descripción |
|----|--------|-------------|
| PS-01 | Enumeración de radicados | Probar 1000 radicados secuenciales para verificar que la respuesta es idéntica para existentes e inexistentes |
| PS-02 | Enumeración de QRs | Probar 1000 códigos QR aleatorios para verificar respuesta uniforme |
| PS-03 | Bypass de rate limiting | Rotar IPs y verificar que el rate limiting por cuenta también aplica |
| PS-04 | JWT manipulation | Modificar el payload del JWT y verificar que el servidor lo rechaza |
| PS-05 | Refresh token replay | Usar un refresh token revocado y verificar HTTP 401 |
| PS-06 | XSS en panel de funcionario | Crear solicitud con `<script>alert(1)</script>` en nombre, verificar que no se ejecuta |
| PS-07 | IDOR en documentos | Solicitar URL firmada de un documento de otra solicitud como funcionario |
| PS-08 | Upload de executable | Intentar subir un archivo `.exe` con content-type `application/pdf` | 
| PS-09 | Path traversal en storage | Verificar que nombres de archivos con `../` son sanitizados |
| PS-10 | Exposición de stacktrace | Causar un error 500 y verificar que el body no expone detalles internos |

### 6.3 Herramientas de Seguridad

| Herramienta | Uso |
|-------------|-----|
| OWASP ZAP | Escaneo automatizado de la API |
| npm audit | Vulnerabilidades en dependencias |
| Burp Suite Community | Pruebas manuales de interceptación |
| Semgrep | Análisis estático de código (SAST) |
| trivy | Escaneo de imágenes Docker |

---

## 7. Pruebas de Rendimiento

### 7.1 Perfiles de Carga

| Perfil | Usuarios Concurrentes | Duración | Descripción |
|--------|:--------------------:|:--------:|-------------|
| Carga normal | 50 | 5 min | Operación diaria típica |
| Carga alta | 200 | 10 min | Pico de demanda (inicio de semana) |
| Carga de estrés | 500 | 5 min | Límite del sistema |
| Spike | 0 → 300 en 30s | 2 min | Ráfaga repentina de demanda |

### 7.2 Criterios de Rendimiento

| Endpoint | Percentil 95 | Percentil 99 | Tasa de Error Máx. |
|----------|:------------:|:------------:|:------------------:|
| `GET /public/solicitudes/estado` | < 500ms | < 1000ms | < 1% |
| `POST /public/solicitudes` | < 2000ms | < 3000ms | < 1% |
| `GET /solicitudes` (paginado) | < 800ms | < 1500ms | < 1% |
| `GET /public/verificar/{qr}` | < 300ms | < 500ms | < 0.5% |
| `POST /auth/login` | < 1000ms | < 2000ms | < 1% |
| `GET /api/v1/health` | < 100ms | < 200ms | 0% |

### 7.3 Prueba de Carga para la Generación de PDF

**Escenario:** 50 aprobaciones simultáneas.

| Métrica | Criterio |
|---------|---------|
| Todos los PDFs generados | En menos de 5 minutos |
| Sin PDFs corruptos | Hash SHA-256 válido en el 100% |
| Tamaño de la cola BullMQ | No supera 100 jobs pendientes por worker |
| Workers en error | Menos del 2% de jobs pasan a DLQ |

### 7.4 Herramientas de Rendimiento

| Herramienta | Uso |
|-------------|-----|
| k6 | Scripts de carga y estrés de la API |
| pg_stat_statements | Queries lentos en PostgreSQL |
| BullMQ Dashboard | Monitoreo de la cola en tiempo real |
| Prometheus + Grafana | Métricas de infraestructura |

---

## 8. Casos de Prueba Detallados — Flujos Críticos

### CP-01: Crear Solicitud con Todos los Campos Válidos

| Campo | Valor de Prueba |
|-------|----------------|
| tipoDocumento | `CC` |
| numeroDocumento | `1234567890` |
| nombre | `Juan` |
| apellido | `Pérez` |
| email | `juan.perez@email.com` |
| celular | `3001234567` |
| placa | `ABC123` |
| marca | `Honda` |
| fechaInicio | Hoy + 1 día |
| fechaFin | Hoy + 15 días |
| motivoId | UUID del motivo "Trabajo" |
| declaracionJurada | `true` |
| aceptaTratamientoDatos | `true` |
| captchaToken | Token válido (mock en test) |

**Resultado esperado:**
- HTTP 201
- Body contiene `data.numeroRadicado` con formato `AAAAMMDD-PYP-XXXXXX`
- Body contiene `data.id` (UUID)
- Registro creado en `solicitudes` con `estado = 'recibida'`
- Registro en `historial_estados` con estado inicial
- Job de correo encolado en BullMQ

### CP-02: Validación de Código QR — Permiso Vigente

**Precondición:** Permiso con `estado = 'vigente'`, `fecha_vencimiento` en el futuro, `codigo_qr = 'abc123opaco'`.

| Paso | Acción | Esperado |
|------|--------|---------|
| 1 | `GET /api/v1/public/verificar/abc123opaco` | HTTP 200 |
| 2 | Verificar body | `data.resultado = 'vigente'` |
| 3 | Verificar datos | `data.titular.nombre`, `data.motocicleta.placa` presentes |
| 4 | Verificar registro | Nuevo registro en `qr_validaciones` |
| 5 | Verificar IP | `ip_address` registrado en `qr_validaciones` |

### CP-03: Bloqueo de Cuenta por Intentos Fallidos

| Intento | Contraseña | Estado Cuenta | Respuesta HTTP |
|:-------:|-----------|:-------------:|:--------------:|
| 1 | Incorrecta | `intentos_fallidos = 1` | 401 |
| 2 | Incorrecta | `intentos_fallidos = 2` | 401 |
| 3 | Incorrecta | `intentos_fallidos = 3` | 401 |
| 4 | Incorrecta | `intentos_fallidos = 4` | 401 |
| 5 | Incorrecta | `bloqueado_hasta = NOW()+30min` | 403 |
| 6 | Correcta | Sigue bloqueada | 403 "Cuenta bloqueada, intente en X min" |

### CP-04: Generación del PDF del Permiso (Job Asíncrono)

| Paso | Acción | Resultado |
|------|--------|---------|
| 1 | Funcionario aprueba solicitud | HTTP 202 |
| 2 | Verificar estado solicitud | `aprobada` |
| 3 | Verificar cola BullMQ | Job `generar-permiso` encolado |
| 4 | Ejecutar job manualmente en test | Permiso creado en `permisos` |
| 5 | Verificar campos del permiso | `codigo_qr` presente, `storage_key_pdf` presente, `hash_pdf` presente |
| 6 | Verificar snapshots | `snapshot_ciudadano`, `snapshot_motocicleta`, `snapshot_motivo` no vacíos |
| 7 | Verificar código del permiso | Formato `AAAA-PYP-NNNNN` |
| 8 | Descargar PDF vía URL firmada | PDF válido y legible |
| 9 | Verificar integridad del PDF | Hash SHA-256 del PDF descargado = `permisos.hash_pdf` |

---

## 9. Criterios de Aprobación

Una versión del sistema se considera **apta para producción** cuando:

| Criterio | Umbral |
|---------|--------|
| Cobertura de pruebas unitarias | ≥ 80% en módulos críticos |
| Flujos de integración críticos | 100% de los 5 flujos definidos pasan |
| Pruebas E2E del portal ciudadano | 100% de los flujos UAT-01, UAT-02, UAT-03 pasan |
| Pruebas de seguridad OWASP Top 10 | 0 vulnerabilidades críticas o altas sin mitigación |
| Rendimiento bajo carga normal (50 usuarios) | P95 < umbrales definidos, tasa de error < 1% |
| `npm audit` | 0 vulnerabilidades críticas en dependencias |
| Trivy (Docker images) | 0 vulnerabilidades críticas |
| Accessibilidad WCAG 2.1 AA | 0 violaciones en axe-core sobre el portal ciudadano |

---

## 10. Criterios de Rechazo

Una versión se rechaza y no puede desplegarse a producción cuando:

| Criterio de Rechazo |
|--------------------|
| Cualquier prueba de integración del flujo crítico 1 (ciclo completo de aprobación) falla |
| El endpoint `GET /public/verificar/{qr}` retorna HTTP diferente a 200 en cualquier caso |
| La información personal de un ciudadano es accesible sin los datos de identificación correctos |
| El PDF generado no contiene el código QR o la imagen es ilegible |
| El hash SHA-256 del PDF descargado no coincide con el almacenado |
| La `storage_key` aparece en cualquier respuesta de la API |
| Una vulnerabilidad OWASP de severidad alta o crítica no está mitigada |
| Datos de un ciudadano son visibles en la respuesta de validación del QR |
| El sistema no registra eventos de login, aprobación o revocación en `auditoria` |
| La tasa de error bajo carga normal supera el 5% en cualquier endpoint crítico |

---

*El cumplimiento de este plan de pruebas es obligatorio antes de cada despliegue a producción.*
