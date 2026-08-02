# START.md

# Inicio del Proyecto

Este proyecto se desarrolla utilizando una metodología incremental y controlada.

Claude Code debe utilizar este archivo como punto de entrada en cada nueva sesión.

---

# Paso 1 - Inicialización

Antes de realizar cualquier acción debes leer únicamente los siguientes archivos:

1. CLAUDE.md
2. WORKFLOW.md
3. SESSION.md
4. TASKS.md
5. ROADMAP.md

No leas documentación adicional todavía.

---

# Paso 2 - Selección Automática

Debes identificar automáticamente la siguiente tarea pendiente.

Para ello:

- Leer TASKS.md.
- Verificar la fase activa en ROADMAP.md.
- Seleccionar automáticamente la tarea pendiente con mayor prioridad.
- Nunca preguntes al usuario cuál tarea desarrollar.

---

# Paso 3 - Análisis

Antes de escribir código:

Analiza únicamente la tarea seleccionada.

Consulta solamente la documentación necesaria.

Ejemplos:

Si la tarea requiere Base de Datos:

→ Leer DATABASE.md

Si requiere APIs:

→ Leer API.md

Si requiere Arquitectura:

→ Leer ARCHITECTURE.md

Si requiere Seguridad:

→ Leer SECURITY.md

Si requiere reglas funcionales:

→ Leer docs/PRD_Sistema_Permisos_de_Circulacion.md

No cargues documentación innecesaria.

---

# Paso 4 - Plan Técnico

Presenta siempre:

- Objetivo.
- Alcance.
- Archivos a crear.
- Archivos a modificar.
- Dependencias.
- Riesgos.
- Estrategia de implementación.
- Criterios de aceptación.

No escribas código.

Espera la aprobación del usuario.

---

# Paso 5 - Desarrollo

Una vez aprobado el plan:

Implementa únicamente la tarea seleccionada.

No desarrolles otras funcionalidades.

Mantén la arquitectura.

Respeta:

- CLAUDE.md
- CODING_STANDARDS.md
- SECURITY.md
- PROMPT_RULES.md

---

# Paso 6 - Auto Revisión

Al terminar la implementación:

Realiza una revisión técnica del código.

Verifica:

- Clean Code.
- SOLID.
- Seguridad.
- Rendimiento.
- Arquitectura.
- Código duplicado.
- Posibles mejoras.

Corrige únicamente errores encontrados.

No agregues funcionalidades nuevas.

---

# Paso 7 - Actualización

Al finalizar debes actualizar:

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

# Paso 8 - Finalización

Cuando todo termine:

No continúes automáticamente.

Espera la autorización del usuario para comenzar una nueva tarea.

Nunca desarrolles dos tareas principales en una misma sesión.

Nunca avances de Sprint sin autorización.

Fin del proceso.