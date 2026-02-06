// ESLint Configuration - OSCAL Viewer
// Layer Architecture Rules (ADR-003):
//   Domain (types/, parser/) -> Application (hooks/) -> Presentation (components/)
//   Each layer may only import from the same or lower layers.

module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  settings: {
    // Preact JSX pragma
    react: { pragma: 'h', version: '17' },
  },
  rules: {
    // General quality rules
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',

    // Prefer type imports for non-runtime usage
    '@typescript-eslint/consistent-type-imports': ['error', {
      prefer: 'type-imports',
      disallowTypeAnnotations: false,
    }],
  },
  overrides: [
    // -------------------------------------------------------
    // Layer Rule: src/types/ - Domain Types (lowest layer)
    // May NOT import from parser, hooks, or components
    // -------------------------------------------------------
    {
      files: ['src/types/**/*.ts'],
      rules: {
        'no-restricted-imports': ['error', {
          patterns: [
            { group: ['@/parser/*', '@/parser'], message: 'types/ must not import from parser/ (layer violation)' },
            { group: ['@/hooks/*', '@/hooks'], message: 'types/ must not import from hooks/ (layer violation)' },
            { group: ['@/components/*', '@/components/**'], message: 'types/ must not import from components/ (layer violation)' },
            { group: ['../parser/*', '../parser'], message: 'types/ must not import from parser/ (layer violation)' },
            { group: ['../hooks/*', '../hooks'], message: 'types/ must not import from hooks/ (layer violation)' },
            { group: ['../components/*', '../components/**'], message: 'types/ must not import from components/ (layer violation)' },
          ],
        }],
      },
    },
    // -------------------------------------------------------
    // Layer Rule: src/parser/ - Domain Logic
    // May import from types/, but NOT from hooks/ or components/
    // -------------------------------------------------------
    {
      files: ['src/parser/**/*.ts'],
      rules: {
        'no-restricted-imports': ['error', {
          patterns: [
            { group: ['@/hooks/*', '@/hooks'], message: 'parser/ must not import from hooks/ (layer violation)' },
            { group: ['@/components/*', '@/components/**'], message: 'parser/ must not import from components/ (layer violation)' },
            { group: ['../hooks/*', '../hooks'], message: 'parser/ must not import from hooks/ (layer violation)' },
            { group: ['../components/*', '../components/**'], message: 'parser/ must not import from components/ (layer violation)' },
          ],
        }],
      },
    },
    // -------------------------------------------------------
    // Layer Rule: src/hooks/ - Application Layer
    // May import from types/ and parser/, but NOT from components/
    // -------------------------------------------------------
    {
      files: ['src/hooks/**/*.ts', 'src/hooks/**/*.tsx'],
      rules: {
        'no-restricted-imports': ['error', {
          patterns: [
            { group: ['@/components/*', '@/components/**'], message: 'hooks/ must not import from components/ (layer violation)' },
            { group: ['../components/*', '../components/**'], message: 'hooks/ must not import from components/ (layer violation)' },
          ],
        }],
      },
    },
    // -------------------------------------------------------
    // Test files: relaxed rules
    // -------------------------------------------------------
    {
      files: ['tests/**/*.ts', 'tests/**/*.tsx', '**/*.test.ts', '**/*.test.tsx'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        'no-restricted-imports': 'off',
      },
    },
  ],
  ignorePatterns: ['dist/', 'node_modules/', '*.config.*'],
}
