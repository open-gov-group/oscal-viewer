/**
 * ProseView — Renders OSCAL prose text with parameter substitution highlighting.
 *
 * When a paramMap is provided, replaces {{ insert: param, id }} placeholders
 * with resolved values shown in amber highlight. Without paramMap, renders raw prose.
 */
import type { FunctionComponent } from 'preact'
import { substituteProse } from '@/services/param-substitutor'

/** Props for the ProseView component. */
interface ProseViewProps {
  /** The raw OSCAL prose string (may contain parameter placeholders). */
  prose: string
  /** Optional map of parameter ID to display value for substitution. */
  paramMap?: Map<string, string>
}

/** Renders OSCAL prose with optional parameter substitution and highlighting. */
export const ProseView: FunctionComponent<ProseViewProps> = ({ prose, paramMap }) => {
  // If no paramMap or empty, render raw prose without substitution
  if (!paramMap || paramMap.size === 0) {
    return <div class="part-prose">{prose}</div>
  }

  const segments = substituteProse(prose, paramMap)

  return (
    <div class="part-prose">
      {segments.map((seg, i) =>
        seg.type === 'param' ? (
          <span key={i} class="param-substitution" title={`Parameter: ${seg.paramId}`}>
            {seg.content}
          </span>
        ) : (
          <span key={i}>{seg.content}</span>
        )
      )}
    </div>
  )
}
