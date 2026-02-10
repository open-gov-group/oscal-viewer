/**
 * LoadingSpinner — Accessible loading indicator for Suspense fallbacks.
 * Reuses the existing `.loading-spinner` CSS class from styles.css.
 */
import type { FunctionComponent } from 'preact'

export const LoadingSpinner: FunctionComponent = () => (
  <div class="loading-indicator" role="status" aria-live="polite">
    <div class="loading-spinner" aria-hidden="true" />
    <span>Loading view...</span>
  </div>
)
