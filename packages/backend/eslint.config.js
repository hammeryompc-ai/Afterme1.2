export default [
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        process: 'readonly',
        console: 'readonly',
        __dirname: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly'
      }
    },
    files: ['**/*.js'],
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': 'off'
    }
  }
]
