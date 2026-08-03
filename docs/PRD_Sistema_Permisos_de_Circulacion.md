# PRD - Sistema Web para Solicitud y Generación de Permisos de Circulación de Motocicletas (Pico y Placa)

## ROL
Actúa como un Arquitecto de Software Senior, UX/UI Designer, Ingeniero Full Stack, Especialista en Seguridad Informática y Analista Funcional.
Debes desarrollar un aplicativo web profesional, escalable y seguro para la gestión de permisos de circulación de motocicletas durante la restricción de Pico y Placa.
El sistema debe estar listo para producción y seguir buenas prácticas de arquitectura, seguridad y experiencia de usuario.

## OBJETIVO
Desarrollar un sistema web donde:
- El ciudadano únicamente diligencia la solicitud.
- El funcionario revisa la información.
- El funcionario aprueba o rechaza.
- Si aprueba, el sistema genera automáticamente un permiso en PDF con un Código QR único de validación.
- Cualquier autoridad podrá escanear el QR para verificar si el permiso es auténtico.

## TIPOS DE USUARIOS

### 1. Ciudadano
No necesita conocimientos técnicos.
Solo podrá:
- Crear una solicitud.
- Consultar el estado de su solicitud.
- Descargar el permiso únicamente cuando haya sido aprobado.
Nunca podrá modificar el permiso generado.

### 2. Funcionario
Inicia sesión mediante usuario y contraseña.
Podrá:
- Ver solicitudes.
- Revisarlas.
- Aprobar.
- Rechazar.
- Solicitar correcciones.
- Generar el permiso.
- Generar el Código QR.
- Imprimir.
- Descargar PDF.

### 3. Administrador
Control total del sistema.
Podrá administrar:
- Usuarios
- Roles
- Configuración del sistema (parámetros operativos)
- **Configuración Institucional** (identidad de la alcaldía, escudo, logo)
- Motivos permitidos
- Auditoría
- Reportes
- Copias de seguridad

---

## MÓDULO: CONFIGURACIÓN INSTITUCIONAL

### Objetivo

Permitir que el sistema pueda instalarse en cualquier Alcaldía de Colombia sin necesidad de modificar el código fuente. Cada instalación del sistema tendrá una única configuración institucional. Toda la información utilizada en documentos oficiales (como el permiso PDF y los correos institucionales) se obtiene automáticamente desde esta configuración.

### Información que administra

**Información General:**
- Nombre de la Alcaldía
- NIT
- Código DANE del municipio sede
- Departamento
- Municipio

**Información de Contacto:**
- Dirección física
- Teléfono institucional
- Correo institucional
- Sitio web (opcional)

**Identidad Institucional:**
- Escudo oficial (imagen — obligatorio)
- Logo institucional (imagen — opcional)

### Reglas del módulo

- Solo puede existir una configuración institucional por instalación del sistema (singleton).
- Únicamente el usuario con rol **Administrador** puede modificar esta información.
- Todos los módulos del sistema utilizan estos datos en modo de solo lectura.
- La generación del permiso PDF obtiene automáticamente el nombre de la alcaldía y el escudo desde esta configuración.
- No se permite eliminar la configuración institucional.
- No se almacena historial de versiones (la tabla `auditoria` registra los cambios).
- La inicialización del registro se realiza mediante el seed de despliegue.

## FLUJO DEL CIUDADANO

### Paso 1
Ingresa al portal.
Visualiza:
- Solicitar Permiso de Pico y Placa

### Paso 2
Diligencia el formulario.

**Campos:**
*Información personal*
- Tipo de documento
- Número de documento
- Nombre completo
- Fecha de nacimiento
- Dirección
- Barrio
- Municipio
- Departamento
- Celular
- Correo electrónico

*Información de la motocicleta*
- Placa
- Marca
- Línea
- Modelo
- Cilindraje
- Color
- Número de motor
- Número de chasis

*Motivo de la solicitud*
Lista desplegable configurable.
Ejemplos:
- Trabajo
- Emergencia médica
- Prestación de servicios
- Domicilios
- Contratista
- Empresa pública
- Empresa privada
- Fuerza mayor
- Otro

*Fecha solicitada*
- Fecha inicio
- Fecha final

**Adjuntos**
Permitir cargar:
- Cédula
- Licencia de conducción
- Licencia de tránsito
- SOAT
- Revisión Técnico Mecánica
- Carta laboral
- Otros soportes

Formatos:
- PDF
- JPG
- PNG

**Declaración**
Casilla obligatoria:
"Acepto que la información suministrada es verdadera."

**Botón**
- Enviar Solicitud

## ESTADOS
- Recibida
- En revisión
- Pendiente de corrección
- Aprobada
- Rechazada
- Vencida

## PANEL DEL FUNCIONARIO
Dashboard moderno.
Debe mostrar:
- Solicitudes del día
- Pendientes
- Aprobadas
- Rechazadas
- Vencidas

Filtros:
- Fecha
- Documento
- Nombre
- Placa
- Estado

## REVISIÓN
El funcionario puede abrir una solicitud.
Visualiza:
- Toda la información.
- Todos los documentos.

Botones:
- Aprobar
- Rechazar
- Solicitar corrección

## GENERACIÓN DEL PERMISO
Únicamente el funcionario podrá generarlo.
Cuando aprueba:
El sistema debe crear automáticamente un documento oficial con:
- Número único del permiso
- Fecha de expedición
- Fecha de vencimiento
- Datos del ciudadano
- Datos de la motocicleta
- Motivo autorizado
- Nombre del funcionario
- Firma digital configurable
- Sello institucional configurable

## CÓDIGO QR
Al aprobar el permiso:
Generar automáticamente un Código QR único.
El QR debe contener un enlace seguro.
Ejemplo: `https://dominio.gov.co/verificar/ABC123XYZ789`
Nunca deberá contener información sensible.
Solo un identificador único.

## VALIDACIÓN DEL QR
Al escanear el QR se abrirá una página pública.
Debe mostrar:

**Si es válido:**
- Permiso Vigente
- Número
- Titular
- Documento
- Placa
- Motocicleta
- Motivo
- Fecha expedición
- Fecha vencimiento
- Estado
- Funcionario que autorizó

**Si está vencido:**
Mostrar:
- Permiso Vencido

**Si fue revocado:**
Mostrar:
- Permiso Revocado

**Si el código no existe:**
Mostrar:
- Permiso No Encontrado

## PDF
Debe generarse automáticamente.
Con diseño institucional.
Incluye:
- Escudo
- Encabezado
- Datos completos
- Código QR
- Pie de página
- Número consecutivo
- Fecha de emisión

## REPORTES
Permitir exportar:
- Excel
- PDF
- CSV

Reportes:
- Solicitudes por fecha
- Solicitudes por funcionario
- Solicitudes por estado
- Motivos más frecuentes
- Permisos vigentes
- Permisos vencidos

## NOTIFICACIONES
Enviar correo electrónico cuando:
- Se registra una solicitud.
- Se aprueba.
- Se rechaza.
- Se solicita corrección.

## SEGURIDAD
Implementar:
- JWT
- Contraseñas cifradas con BCrypt
- HTTPS
- Protección CSRF
- Protección XSS
- Protección SQL Injection
- Registro de auditoría
- Registro de IP
- Registro de fecha y hora
- Bitácora completa

## BASE DE DATOS
Diseñar completamente normalizada.
Tablas mínimas:
- usuarios
- roles
- permisos
- solicitudes
- documentos
- motocicletas
- ciudadanos
- auditoria
- configuracion
- motivos
- qr_validaciones

Generar:
- Modelo entidad-relación
- Script SQL
- Migraciones

## TECNOLOGÍA
**Frontend:**
- React
- Next.js
- TypeScript
- Tailwind CSS

**Backend:**
- Node.js
- NestJS

**Base de datos:**
- PostgreSQL

**Almacenamiento:**
- Carpeta protegida o almacenamiento compatible con S3.

## API REST
Crear documentación completa con Swagger.
Implementar:
- CRUD
- Autenticación
- Validaciones
- Manejo de errores
- Versionado de API

## INTERFAZ
- Diseño moderno.
- Responsive.
- Accesible.
- Colores institucionales configurables.

## ENTREGABLES
Genera absolutamente todo el proyecto incluyendo:
1. Arquitectura completa.
2. Diseño UX/UI.
3. Wireframes.
4. Base de datos.
5. Modelo entidad-relación.
6. Backend completo.
7. Frontend completo.
8. API REST documentada.
9. Generación automática del PDF.
10. Generación automática del Código QR.
11. Página pública de validación del QR.
12. Autenticación y control de roles.
13. Panel de administración.
14. Panel del funcionario.
15. Portal del ciudadano.
16. Reportes.
17. Manual técnico.
18. Manual de usuario.
19. Docker.
20. Docker Compose.
21. Archivo .env.example.
22. Datos de prueba.
23. Pruebas unitarias y de integración.
24. Guía completa para despliegue en producción.
