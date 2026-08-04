# QUALITY_GATE.md

# Criterios de Calidad del Proyecto

Este documento define cuándo una tarea puede considerarse terminada.

---

## Compilación

- El proyecto debe compilar sin errores.
- No deben existir errores de TypeScript.
- No deben existir errores de ESLint.
- No deben existir errores de Prettier.

---

## Arquitectura

Debe respetarse:

- Arquitectura Hexagonal.
- Clean Architecture.
- SOLID.
- Repository Pattern.
- Service Pattern.
- DTO Pattern.

No se permite código duplicado.

---

## Seguridad

Verificar:

- JWT correctamente implementado.
- BCrypt.
- Validaciones DTO.
- Protección contra SQL Injection.
- Protección XSS.
- Protección CSRF cuando aplique.
- Helmet.
- CORS.
- Rate Limit.

---

## Base de Datos

Verificar:

- Migraciones correctas.
- Relaciones correctas.
- Índices.
- UUID.
- Soft Delete.
- Auditoría.

---

## API

Verificar:

- Swagger actualizado.
- Responses correctos.
- Manejo de errores.
- Validaciones.

---

## Frontend

Verificar:

- Componentes reutilizables.
- Hooks reutilizables.
- Tipado completo.
- Responsive.

---

## Documentación

Actualizar siempre:

- TASKS.md
- ROADMAP.md
- CHANGELOG.md
- SESSION.md

Actualizar también:

- API.md
- DATABASE.md

si fueron modificados.

---

## Git

Antes de cerrar la tarea:

- Commit realizado.
- Commit con mensaje descriptivo.
- Rama actualizada.

---

## Revisión

Antes de finalizar una tarea Claude debe verificar:

✓ Código limpio

✓ Arquitectura

✓ Seguridad

✓ Rendimiento

✓ Documentación

✓ Sin errores de compilación

---

## Definición de Terminado (Definition of Done)

Una tarea solo podrá marcarse como completada cuando:

- Compile correctamente.
- Pase todas las validaciones.
- Cumpla la arquitectura.
- Cumpla las reglas de negocio.
- Actualice la documentación.
- Pase la auto revisión.

Si cualquiera de estos puntos falla, la tarea permanecerá como "En Progreso".