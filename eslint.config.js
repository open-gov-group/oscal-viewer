// ESLint Flat Configuration - OSCAL Viewer
// Layer Architecture Rules (ADR-003 + ADR-008):
//   Domain (types/, parser/, services/, lib/) -> Application (hooks/) -> Presentation (components/)
//   Each layer may only import from the same or lower layers.

import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import jsdoc from 'eslint-plugin-jsdoc'

export default tseslint.config(
  // Global ignores (replaces ignorePatterns)
  {
    ignores: ['dist/', 'node_modules/', '*.config.*'],
  },

  // Base configs
  eslint.configs.recommended,
  ...tseslint.configs.recommended,

  // Global rules for all TS/TSX files
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
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
  },

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
  // Layer Rule: src/lib/ - Package Entry Point (Domain Layer)
  // May import from types/ and parser/, but NOT from hooks/ or components/
  // Ensures the npm package stays framework-independent (ADR-007)
  // -------------------------------------------------------
  {
    files: ['src/lib/**/*.ts'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          { group: ['@/hooks/*', '@/hooks'], message: 'lib/ must not import from hooks/ (package must stay framework-independent)' },
          { group: ['@/components/*', '@/components/**'], message: 'lib/ must not import from components/ (package must stay framework-independent)' },
          { group: ['../hooks/*', '../hooks'], message: 'lib/ must not import from hooks/ (layer violation)' },
          { group: ['../components/*', '../components/**'], message: 'lib/ must not import from components/ (layer violation)' },
        ],
      }],
    },
  },

  // -------------------------------------------------------
  // Layer Rule: src/services/ - Domain Services (ADR-008)
  // May import from types/ and parser/, but NOT from hooks/, components/, or preact
  // Ensures services remain framework-independent and testable
  // -------------------------------------------------------
  {
    files: ['src/services/**/*.ts'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          { group: ['@/hooks/*', '@/hooks'], message: 'services/ must not import from hooks/ (Domain cannot import Application)' },
          { group: ['@/components/*', '@/components/**'], message: 'services/ must not import from components/ (Domain cannot import Presentation)' },
          { group: ['../hooks/*', '../hooks'], message: 'services/ must not import from hooks/ (layer violation)' },
          { group: ['../components/*', '../components/**'], message: 'services/ must not import from components/ (layer violation)' },
        ],
        paths: [
          { name: 'preact', message: 'services/ must be framework-independent (no Preact imports)' },
          { name: 'preact/hooks', message: 'services/ must be framework-independent (no Preact imports)' },
          { name: 'preact/compat', message: 'services/ must be framework-independent (no Preact imports)' },
        ],
      }],
    },
  },

  // -------------------------------------------------------
  // Layer Rule: src/hooks/ - Application Layer
  // May import from types/, parser/, and services/, but NOT from components/
  // -------------------------------------------------------
  {
    files: ['src/hooks/**/*.{ts,tsx}'],
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
  // JSDoc: require-jsdoc on exported functions (E4 — QA Audit)
  // Level: warn (not error) — gradual adoption while E2 is in progress
  // Scope: src/ only (publicOnly = exported functions/components)
  // -------------------------------------------------------
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/main.tsx'],
    plugins: { jsdoc },
    rules: {
      'jsdoc/require-jsdoc': ['warn', {
        publicOnly: true,
        require: {
          FunctionDeclaration: true,
          FunctionExpression: true,
          ArrowFunctionExpression: true,
        },
      }],
    },
  },

  // -------------------------------------------------------
  // Test files: relaxed rules
  // -------------------------------------------------------
  {
    files: ['tests/**/*.{ts,tsx}', '**/*.test.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'no-restricted-imports': 'off',
    },
  },
)
