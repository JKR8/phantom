module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true,
    node: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['@typescript-eslint', 'react-hooks', 'react-refresh'],
  ignorePatterns: [
    'coverage/',
    'dist/',
    'exports/',
    'node_modules/',
    'pbip-export/',
    'playwright-report/',
    'test-results/',
  ],
  rules: {
    'react-hooks/rules-of-hooks': 'error',
  },
};
