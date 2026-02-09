/**
 * ImportPanel — Displays resolved import sources for an OSCAL Profile.
 *
 * Shows each import source with status indicator (loaded/cached/error),
 * href, resolved URL, control count, and error messages.
 * Includes merge strategy and modification summary when available.
 *
 * Presentation Layer: follows the content-box pattern.
 */
import type { FunctionComponent } from 'preact'
import type { ImportSource } from '@/services/resolver'
import type { Merge, Modify } from '@/types/oscal'

interface ImportPanelProps {
  /** Metadata about each resolved import source. */
  sources: ImportSource[]
  /** Whether resolution is currently in progress. */
  loading: boolean
  /** Error message if resolution failed. */
  error?: string | null
  /** Profile merge strategy, if defined. */
  merge?: Merge
  /** Profile modifications, if defined. */
  modify?: Modify
}

/** Status indicator icon mapping. */
const statusIcons: Record<string, string> = {
  loaded: '\u2713',   // checkmark
  cached: '\u26A1',   // lightning bolt (cached = fast)
  error: '\u2717',    // cross mark
}

/** Status label mapping. */
const statusLabels: Record<string, string> = {
  loaded: 'Loaded',
  cached: 'Cached',
  error: 'Error',
}

/** Renders resolved import sources, merge strategy, and modification summary for a Profile. */
export const ImportPanel: FunctionComponent<ImportPanelProps> = ({
  sources,
  loading,
  error,
  merge,
  modify,
}) => {
  const loadedCount = sources.filter(s => s.status !== 'error').length
  const totalControls = sources.reduce((sum, s) => sum + s.controlCount, 0)

  return (
    <div class="import-panel" aria-busy={loading}>
      <div class="import-panel-header">
        <h3>Resolved Imports</h3>
        {!loading && sources.length > 0 && (
          <span class="import-panel-summary">
            {loadedCount}/{sources.length} sources, {totalControls} controls
          </span>
        )}
      </div>

      {loading && (
        <div class="import-panel-loading" role="status" aria-live="polite">
          <span class="import-status--loading">Resolving imports...</span>
        </div>
      )}

      {error && (
        <div class="import-panel-error" role="alert">
          {error}
        </div>
      )}

      {!loading && sources.length > 0 && (
        <div class="import-source-list">
          {sources.map((source, i) => (
            <div key={`${source.href}-${i}`} class={`import-source-card import-source-card--${source.status}`}>
              <div class="import-source-header">
                <span class={`import-source-status import-status--${source.status}`} aria-label={statusLabels[source.status]}>
                  {statusIcons[source.status]}
                </span>
                <code class="import-source-href">{source.href}</code>
              </div>
              {source.resolvedUrl && source.resolvedUrl !== source.href && (
                <div class="import-source-resolved">
                  <span class="import-source-resolved-label">Resolved:</span>
                  <code>{source.resolvedUrl}</code>
                </div>
              )}
              {source.status !== 'error' && (
                <span class="import-source-controls">
                  {source.controlCount} control{source.controlCount !== 1 ? 's' : ''}
                </span>
              )}
              {source.error && (
                <span class="import-source-error">{source.error}</span>
              )}
            </div>
          ))}
        </div>
      )}

      {merge && (
        <div class="import-panel-merge">
          <span class="import-panel-merge-label">Merge:</span>
          <span>{merge.combine?.method ?? (merge.flat !== undefined ? 'flat' : merge['as-is'] ? 'as-is' : 'default')}</span>
        </div>
      )}

      {modify && (
        <div class="import-panel-modify">
          {modify['set-parameters'] && modify['set-parameters'].length > 0 && (
            <span>{modify['set-parameters'].length} parameter override{modify['set-parameters'].length !== 1 ? 's' : ''}</span>
          )}
          {modify.alters && modify.alters.length > 0 && (
            <span>, {modify.alters.length} alteration{modify.alters.length !== 1 ? 's' : ''}</span>
          )}
        </div>
      )}
    </div>
  )
}
