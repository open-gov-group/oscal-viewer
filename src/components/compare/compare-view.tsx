/**
 * CompareView — Main comparison layout showing diff results between two OSCAL documents.
 *
 * Displays a summary bar with counts, metadata comparison, and collapsible diff sections.
 * Lazy-loaded from app.tsx to keep the main bundle small.
 */
import type { FunctionComponent } from 'preact'
import type { OscalDocument } from '@/types/oscal'
import type { DocumentDiffResult, DiffSection, DiffSummary } from '@/types/diff'
import { MetadataDiffView } from './metadata-diff'
import { DiffEntryCard } from './diff-entry-card'
import { Accordion } from '@/components/shared/accordion'

interface CompareViewProps {
  docA: OscalDocument
  docB: OscalDocument
  diffResult: DocumentDiffResult
  onExit: () => void
}

const SummaryBar: FunctionComponent<{ summary: DiffSummary }> = ({ summary }) => (
  <div class="diff-summary-bar" role="status" aria-live="polite">
    <span class="diff-count diff-count--added" aria-label={`${summary.added} added`}>
      +{summary.added} added
    </span>
    <span class="diff-count diff-count--removed" aria-label={`${summary.removed} removed`}>
      −{summary.removed} removed
    </span>
    <span class="diff-count diff-count--modified" aria-label={`${summary.modified} modified`}>
      ~{summary.modified} modified
    </span>
    <span class="diff-count diff-count--unchanged" aria-label={`${summary.unchanged} unchanged`}>
      {summary.unchanged} unchanged
    </span>
  </div>
)

const DiffSectionView: FunctionComponent<{ section: DiffSection }> = ({ section }) => {
  const nonUnchanged = section.entries.filter(e => e.status !== 'unchanged')
  const unchanged = section.entries.filter(e => e.status === 'unchanged')

  return (
    <Accordion
      id={`diff-${section.title.toLowerCase().replace(/\s+/g, '-')}`}
      title={`${section.title} (${section.summary.added}+ ${section.summary.removed}− ${section.summary.modified}~)`}
      defaultOpen={nonUnchanged.length > 0}
    >
      <div class="diff-section-entries">
        {nonUnchanged.map(entry => (
          <DiffEntryCard key={entry.key} entry={entry} />
        ))}
        {unchanged.length > 0 && (
          <details class="diff-unchanged-group">
            <summary class="diff-unchanged-summary">
              {unchanged.length} unchanged {section.title.toLowerCase()}
            </summary>
            {unchanged.map(entry => (
              <DiffEntryCard key={entry.key} entry={entry} />
            ))}
          </details>
        )}
      </div>
    </Accordion>
  )
}

export const CompareView: FunctionComponent<CompareViewProps> = ({ docA, docB, diffResult, onExit }) => (
  <div class="compare-view">
    <div class="compare-header">
      <div class="compare-title-row">
        <h2 class="compare-title">Document Comparison</h2>
        <button class="btn-clear" onClick={onExit}>Exit comparison</button>
      </div>
      <div class="compare-docs-info">
        <div class="compare-doc-label" aria-label="Document A">
          <strong>A:</strong> {docA.data.document.metadata.title} (v{docA.data.document.metadata.version})
        </div>
        <div class="compare-doc-label" aria-label="Document B">
          <strong>B:</strong> {docB.data.document.metadata.title} (v{docB.data.document.metadata.version})
        </div>
      </div>
    </div>

    <SummaryBar summary={diffResult.summary} />

    <MetadataDiffView diff={diffResult.metadata} />

    {diffResult.sections.map(section => (
      <DiffSectionView key={section.title} section={section} />
    ))}

    {diffResult.sections.length === 0 && diffResult.summary.total === 0 && (
      <p class="compare-no-diff">The two documents have identical content structure.</p>
    )}
  </div>
)
