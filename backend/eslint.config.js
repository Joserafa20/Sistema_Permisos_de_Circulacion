// @ts-check
const tsEslintPlugin = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');
const prettierPluginRecommended = require('eslint-plugin-prettier/recommended');
const prettierConfig = require('eslint-config-prettier');

/** @type {import('eslint').Linter.Config[]} */
module.exports = [
  {
    ignores: ['dist/**', 'node_modules/**'],
  },
  // Sets up @typescript-eslint plugin + parser + recommended rules
  ...tsEslintPlugin.configs['flat/recommended'],
  // Project-specific parser options (project-aware type checking)
  {
    files: ['src/**/*.ts', 'test/**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
        sourceType: 'module',
      },
    },
    rules: {
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@typescript-eslint/explicit-module-boundary-types': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-floating-promises': 'error',
    },
  },
  // Disable ESLint rules that conflict with Prettier formatting
  prettierConfig,
  // Enable Prettier as an ESLint rule
  prettierPluginRecommended,
  // Override: allow both LF and CRLF (Windows compatibility)
  {
    rules: {
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
    },
  },
];
