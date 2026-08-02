/** @type {import('@commitlint/types').UserConfig} */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'docs', 'style', 'refactor', 'test', 'chore', 'perf', 'ci', 'revert'],
    ],
    'scope-enum': [
      1,
      'always',
      [
        'auth', 'solicitudes', 'permisos', 'documentos', 'usuarios', 'dependencias',
        'motivos', 'configuracion', 'auditoria', 'reportes', 'qr', 'pdf', 'notificaciones',
        'health', 'storage', 'config', 'common', 'docker', 'ci', 'docs', 'tracking',
        'fase-0', 'fase-1', 'fase-2', 'fase-3', 'fase-4', 'fase-5', 'fase-6', 'fase-7', 'fase-8',
      ],
    ],
    'subject-case': [2, 'never', ['sentence-case', 'start-case', 'pascal-case', 'upper-case']],
    'header-max-length': [2, 'always', 100],
    'body-max-line-length': [1, 'always', 150],
  },
};
