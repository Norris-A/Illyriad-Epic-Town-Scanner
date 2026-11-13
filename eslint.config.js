import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['dist/'] },
  js.configs.recommended,
  {
    rules: {
      'no-shadow': 'error',
      'no-unused-vars': 'error',
    },
  },
  {
    files: ['src/**/*.js', 'scripts/mockup-page.js'],
    languageOptions: { globals: globals.browser },
  },
  {
    files: ['src/worker.js'],
    languageOptions: { globals: globals.worker },
  },
  {
    files: ['test/**/*.js', 'scripts/**/*.mjs', '*.js', '*.mjs'],
    languageOptions: { globals: globals.node },
  },
];
