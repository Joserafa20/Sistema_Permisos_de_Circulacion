# WORKFLOW.md

# Flujo Oficial del Proyecto

Este documento define el comportamiento obligatorio de Claude Code durante todo el ciclo de vida del proyecto.

---

# Objetivo

Desarrollar el proyecto de forma incremental, manteniendo la arquitectura, la documentación y la calidad del código.

Nunca implementar más de una tarea principal por sesión.

---

# Inicio de cada sesión

Al comenzar una nueva sesión debes:

1. Leer START.md.
2. Leer SESSION.md.
3. Leer TASKS.md.
4. Leer ROADMAP.md.
5. Verificar el estado general del proyecto.

---

# Selección automática de la siguiente tarea

No preguntes al usuario qué tarea desarrollar.

Debes:

- Analizar TASKS.md.
- Analizar ROADMAP.md.
- Identificar automáticamente la siguiente tarea pendiente.
- Verificar que pertenezca a la fase activa.
- Priorizar tareas críticas antes que tareas secundarias.

Si detectas inconsistencias entre TASKS.md y ROADMAP.md, informa al usuario antes de continuar.

---

# Análisis técnico

Antes de escribir código debes:

- Analizar la tarea seleccionada.
- Identificar riesgos.
- Identificar dependencias.
- Determinar la documentación necesaria.

Solo debes consultar la documentación relacionada con la tarea.

Ejemplos:

Base de Datos → DATABASE.md

API → API.md

Arquitectura → ARCHITECTURE.md

Seguridad → SECURITY.md

Reglas funcionales → docs/PRD_Sistema_Permisos_de_Circulacion.md

No cargues documentación innecesaria.

---

# Presentación del plan

Siempre presentar:

- Objetivo.
- Alcance.
- Archivos nuevos.
- Archivos modificados.
- Riesgos.
- Estrategia.
- Criterios de aceptación.

Esperar aprobación del usuario.

Nunca escribir código antes de recibir aprobación.

---

# Implementación

Una vez aprobado el plan:

- Implementar únicamente la tarea seleccionada.
- Mantener la arquitectura.
- Seguir CODING_STANDARDS.md.
- Aplicar buenas prácticas.
- No modificar módulos ajenos.

---

# Auto revisión

Al finalizar:

Realizar una revisión técnica del código.

Verificar:

- Clean Code.
- SOLID.
- Seguridad.
- Arquitectura.
- Código duplicado.
- Rendimiento.
- Posibles mejoras.

Si detectas errores críticos, corregirlos antes de finalizar.

---

# Actualización de documentación

Al finalizar la tarea actualizar:

- TASKS.md
- ROADMAP.md
- CHANGELOG.md
- SESSION.md

Registrar:

- Archivos creados.
- Archivos modificados.
- Decisiones técnicas.
- Riesgos encontrados.
- Próxima tarea sugerida.

---

# Finalización

Al terminar:

No continuar automáticamente.

Esperar autorización del usuario.

Nunca comenzar otra tarea principal sin autorización.

---

# Manejo de errores

Si durante la implementación detectas:

- Inconsistencias en el PRD.
- Reglas de negocio contradictorias.
- Problemas de arquitectura.
- Riesgos de seguridad.
- Problemas en la base de datos.

Debes:

1. Detener la implementación.
2. Informar el problema.
3. Proponer una solución.
4. Esperar autorización.

Nunca asumir decisiones funcionales por tu cuenta.

---

# Principio General

La prioridad es:

1. Calidad.
2. Arquitectura.
3. Seguridad.
4. Documentación.
5. Código.

Nunca sacrificar calidad por velocidad.