/// <reference types="@testing-library/jest-dom/vitest" />

import 'vitest'

declare module 'vitest' {
  interface Assertion {
    toHaveNoViolations(): void
  }
  interface AsymmetricMatchersContaining {
    toHaveNoViolations(): void
  }
}
