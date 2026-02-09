/**
 * LinkBadge — Color-coded badge for OSCAL link relation types.
 *
 * Maps `links[].rel` values to semantic labels and CSS modifier classes.
 * Known relations: implements (green), required (red), related-control (blue),
 * bsi-baustein (orange), template (gray). Unknown relations render as default gray.
 *
 * Presentation Layer: follows the StatusBadge pattern.
 */
import type { FunctionComponent } from 'preact'

interface LinkBadgeProps {
  /** The `rel` attribute from an OSCAL Link object. */
  rel: string
}

/** Mapping from OSCAL link relation to display label. */
const relLabels: Record<string, string> = {
  implements: 'Implements',
  required: 'Required',
  'related-control': 'Related',
  'bsi-baustein': 'BSI Baustein',
  template: 'Template',
}

/** Mapping from OSCAL link relation to CSS modifier suffix. */
const relModifiers: Record<string, string> = {
  implements: 'implements',
  required: 'required',
  'related-control': 'related',
  'bsi-baustein': 'bsi',
  template: 'template',
}

/** Renders a color-coded badge for an OSCAL link relation type. */
export const LinkBadge: FunctionComponent<LinkBadgeProps> = ({ rel }) => {
  const label = relLabels[rel] ?? rel
  const modifier = relModifiers[rel] ?? 'default'

  return (
    <span class={`link-badge link-badge--${modifier}`}>
      {label}
    </span>
  )
}
