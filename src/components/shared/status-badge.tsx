/**
 * StatusBadge — Visual indicator for OSCAL status/state values.
 *
 * Maps state strings (operational, under-development, planned, implemented, partial, etc.)
 * to SVG icons and CSS modifier classes (e.g. `.status-badge--operational`).
 */
import type { FunctionComponent } from 'preact'

interface StatusBadgeProps {
  state: string
}

const statusIcons: Record<string, string> = {
  operational: 'M20 6L9 17l-5-5',                    // checkmark
  'under-development': 'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z', // wrench
  planned: 'M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83', // clock/sun
  disposition: 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 8v4M12 16h.01', // info circle
  implemented: 'M20 6L9 17l-5-5',                    // checkmark
  partial: 'M12 2v20M2 12h20',                       // plus
  alternative: 'M18 6L6 18M6 6l12 12',               // x
  'not-applicable': 'M5 12h14',                       // dash
}

export const StatusBadge: FunctionComponent<StatusBadgeProps> = ({ state }) => {
  const iconPath = statusIcons[state]

  return (
    <span class={`status-badge status-badge--${state}`}>
      {iconPath && (
        <svg class="status-badge-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d={iconPath} />
        </svg>
      )}
      <span class="status-badge-text">{state}</span>
    </span>
  )
}
