/**
 * DiffBadge — Visual status indicator for diff entries.
 *
 * Renders a colored badge with accessible label for added/removed/modified/unchanged status.
 */
import type { FunctionComponent } from 'preact'
import type { DiffStatus } from '@/types/diff'

interface DiffBadgeProps {
  status: DiffStatus
}

const LABELS: Record<DiffStatus, string> = {
  added: 'Added',
  removed: 'Removed',
  modified: 'Modified',
  unchanged: 'Unchanged',
}

export const DiffBadge: FunctionComponent<DiffBadgeProps> = ({ status }) => (
  <span class={`diff-badge diff-badge--${status}`} aria-label={`Status: ${status}`}>
    {LABELS[status]}
  </span>
)
