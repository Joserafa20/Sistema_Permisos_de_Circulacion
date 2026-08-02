# START.md

# Inicio del Proyecto

Este proyecto se desarrolla utilizando una metodología incremental, controlada y orientada a arquitectura empresarial.

Claude Code debe utilizar este archivo como punto de entrada en cada nueva sesión.

---

# Paso 1 - Inicialización

Antes de realizar cualquier acción debes leer obligatoriamente los siguientes archivos:

1. CLAUDE.md
2. WORKFLOW.md
3. SESSION.md
4. TASKS.md
5. ROADMAP.md

No cargues ningún otro documento en esta etapa.

Los siguientes documentos deberán consultarse únicamente cuando la tarea lo requiera:

- QUALITY_GATE.md → Antes de finalizar una tarea.
- RELEASE_PROCESS.md → Antes de crear ramas, commits, Pull Requests, Releases o realizar merges.
- CODING_STANDARDS.md → Antes de comenzar la implementación.
- SECURITY.md → Si la tarea involucra autenticación, autorización, manejo de usuarios o seguridad.
- DATABASE.md → Si la tarea modifica la base de datos.
- API.md → Si la tarea modifica o crea endpoints.
- ARCHITECTURE.md → Si la tarea afecta la arquitectura del sistema.
- PROJECT_CONTEXT.md → Si la tarea requiere contexto funcional adicional.
- docs/PRD_Sistema_Permisos_de_Circulacion.md → Solo cuando sea necesario validar reglas de negocio o requisitos funcionales.

Evita cargar documentación innecesaria para optimizar el uso del contexto.

---

# Paso 2 - Selección Automática

Debes identificar automáticamente la siguiente tarea pendiente.

Para ello:

- Leer TASKS.md.
- Verificar la fase activa en ROADMAP.md.
- Seleccionar automáticamente la tarea pendiente con mayor prioridad.
- Nunca preguntes al usuario cuál tarea desarrollar.
- Si existen inconsistencias entre TASKS.md y ROADMAP.md, detente e infórmalo antes de continuar.

---

# Paso 3 - Análisis

Antes de escribir código:

- Analiza únicamente la tarea seleccionada.
- Consulta solamente la documentación necesaria para esa tarea.
- No cargues documentos que no sean relevantes.

Presenta siempre un plan técnico con:

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

# Paso 4 - Desarrollo

Una vez aprobado el plan:

- Implementa únicamente la tarea seleccionada.
- No desarrolles funcionalidades adicionales.
- No modifiques módulos ajenos salvo que sea estrictamente necesario.
- Mantén la arquitectura definida para el proyecto.

Respeta siempre:

- CLAUDE.md
- PROMPT_RULES.md

Consulta cuando aplique:

- CODING_STANDARDS.md
- SECURITY.md
- DATABASE.md
- API.md
- ARCHITECTURE.md

---

# Paso 5 - Auto Revisión

Al terminar la implementación:

Realiza una revisión técnica completa.

Verifica:

- Clean Code.
- SOLID.
- Seguridad.
- Rendimiento.
- Arquitectura.
- Código duplicado.
- Posibles mejoras.

Consulta QUALITY_GATE.md.

Si detectas errores críticos:

- Corrígelos antes de finalizar.
- No agregues funcionalidades nuevas.

---

# Paso 6 - Actualización

Al finalizar debes actualizar:

- TASKS.md
- ROADMAP.md
- CHANGELOG.md
- SESSION.md

Actualizar además la documentación técnica afectada cuando corresponda.

Registrar:

- Archivos creados.
- Archivos modificados.
- Decisiones técnicas.
- Riesgos encontrados.
- Próxima tarea sugerida.

---

# Paso 7 - Git y Versionado

Antes de realizar cualquier acción relacionada con Git:

Consultar RELEASE_PROCESS.md.

Seguir obligatoriamente:

- GitFlow.
- Conventional Commits.
- Pull Requests.
- Versionado Semántico.

Nunca trabajar directamente sobre main.

---

# Paso 8 - Finalización

Cuando la tarea termine:

- No continúes automáticamente con la siguiente tarea.
- Espera la autorización del usuario.
- Nunca desarrolles dos tareas principales en una misma sesión.
- Nunca avances de Sprint o Fase sin autorización.

El objetivo es priorizar:

1. Calidad.
2. Arquitectura.
3. Seguridad.
4. Documentación.
5. Código.

Fin del proceso.