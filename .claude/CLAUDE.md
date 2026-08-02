# Sistema de Permisos de Circulación

## Objetivo

Desarrollar un sistema web empresarial para la gestión de permisos de circulación de motocicletas por Pico y Placa para una Alcaldía de Colombia.

## Stack Tecnológico

Frontend:
- React
- Next.js
- TypeScript
- Tailwind CSS

Backend:
- NestJS
- Node.js

Base de Datos:
- PostgreSQL

## Arquitectura

Arquitectura Hexagonal.

## Convenciones

- Siempre utilizar TypeScript.
- No modificar código existente sin justificación.
- Mantener el código modular.
- Seguir el PRD ubicado en /docs.
- Documentar todas las APIs con Swagger.
- Utilizar JWT para autenticación.
- Generar PDF institucional.
- Generar QR único para cada permiso.
- Aplicar buenas prácticas de seguridad.

## Fuente de Verdad

Toda funcionalidad debe respetar el PRD ubicado en:

docs/PRD_Sistema_Permisos_de_Circulacion.md

## Estructura del Proyecto

/.claude     -> Contexto permanente del proyecto.
/docs        -> Documentación funcional.
/backend     -> Backend NestJS.
/frontend    -> Frontend Next.js.
/database    -> Scripts SQL y migraciones.
/docker      -> Docker y Docker Compose.
/prompts     -> Prompts reutilizables.

## Regla de Desarrollo

Antes de desarrollar cualquier funcionalidad, consultar:

1. START.md
2. TASKS.md
3. ROADMAP.md
4. PROJECT_CONTEXT.md
5. El documento correspondiente dentro de /docs.