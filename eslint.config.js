import globals from 'globals';
import pluginJs from '@eslint/js';
import eslintPluginPrettier from 'eslint-config-prettier';

export default [
  {
    languageOptions: { globals: globals.node },
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  pluginJs.configs.recommended,
  eslintPluginPrettier,
  {
    ignores: ['**/node_modules/**', '**/dist/**', '**/public/**'],
  },
];
