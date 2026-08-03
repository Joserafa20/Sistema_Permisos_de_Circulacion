export enum AccionAuditoria {
  LOGIN = 'login',
  LOGOUT = 'logout',
  LOGIN_FALLIDO = 'login_fallido',
  CREAR = 'crear',
  EDITAR = 'editar',
  ELIMINAR = 'eliminar',
  APROBAR = 'aprobar',
  RECHAZAR = 'rechazar',
  SOLICITAR_CORRECCION = 'solicitar_correccion',
  GENERAR_PERMISO = 'generar_permiso',
  REVOCAR_PERMISO = 'revocar_permiso',
  CAMBIAR_CONTRASENA = 'cambiar_contrasena',
  EXPORTAR_REPORTE = 'exportar_reporte',
  // Requiere migración: ALTER TYPE accion_auditoria ADD VALUE 'usuario_consultado';
  USUARIO_CONSULTADO = 'usuario_consultado',
}
