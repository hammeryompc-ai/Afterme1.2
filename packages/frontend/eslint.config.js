export default [
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        console: 'readonly',
        fetch: 'readonly',
        FormData: 'readonly',
        MediaRecorder: 'readonly',
        Blob: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        Date: 'readonly'
      }
    },
    files: ['**/*.{js,jsx}'],
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': 'off'
    }
  }
]
