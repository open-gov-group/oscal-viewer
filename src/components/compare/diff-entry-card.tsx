/**
 * DiffEntryCard — Renders a single diff entry with status badge and change details.
 *
 * Shows the element's label, diff badge, and for modified entries a list of what changed.
 * Added entries have a green border, removed red, modified yellow.
 */
import type { FunctionComponent } from 'preact'
import { useState } from 'preact/hooks'
import type { DiffEntry } from '@/types/diff'
import { DiffBadge } from './diff-badge'

interface DiffEntryCardProps {
  entry: DiffEntry<unknown>
}

export const DiffEntryCard: FunctionComponent<DiffEntryCardProps> = ({ entry }) => {
  const [expanded, setExpanded] = useState(entry.status === 'modified')

  return (
    <div class={`diff-entry diff-entry--${entry.status}`}>
      <button
        class="diff-entry-header"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        aria-label={`${entry.label}, ${entry.status}`}
      >
        <span class="diff-entry-key">{entry.label}</span>
        <DiffBadge status={entry.status} />
        <span class="diff-entry-toggle" aria-hidden="true">{expanded ? '▾' : '▸'}</span>
      </button>

      {expanded && entry.status === 'modified' && entry.changes && (
        <div class="diff-entry-changes">
          <ul class="diff-changes-list">
            {entry.changes.map((change, i) => (
              <li key={i} class="diff-change-item">{change}</li>
            ))}
          </ul>
        </div>
      )}

      {expanded && entry.status === 'added' && (
        <div class="diff-entry-detail diff-entry-detail--added">
          <p class="diff-entry-note">New element in Document B</p>
        </div>
      )}

      {expanded && entry.status === 'removed' && (
        <div class="diff-entry-detail diff-entry-detail--removed">
          <p class="diff-entry-note">Removed from Document A</p>
        </div>
      )}
    </div>
  )
}
