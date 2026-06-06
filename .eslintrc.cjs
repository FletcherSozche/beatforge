module.exports = {
  root: true,
  env: { browser: true, es2020: true, node: true, electron: true },
  extends: 'eslint:recommended',
  parserOptions: { ecmaVersion: 2022, sourceType: 'module' },
  globals: { Tone: 'readonly' },
  rules: {
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    'no-empty': ['error', { allowEmptyCatch: true }]
  },
  ignorePatterns: ['dist/', 'node_modules/', 'dist-electron/', 'android/', 'ios/', '*.cjs', 'capacitor.config.ts', 'vite.config.js']
};
