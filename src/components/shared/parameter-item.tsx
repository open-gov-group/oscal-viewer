/**
 * ParameterItem — Renders a single OSCAL parameter with id, label, usage,
 * values, selection constraints, and guidelines.
 * Shared across Catalog (top-level + control params) and Profile views.
 */
import type { FunctionComponent } from 'preact'
import type { Parameter } from '@/types/oscal'

interface ParameterItemProps {
  param: Parameter
}

export const ParameterItem: FunctionComponent<ParameterItemProps> = ({ param }) => {
  return (
    <div class="param-item">
      <div class="param-header">
        <code class="param-id">{param.id}</code>
        {param.label && <span class="param-label">{param.label}</span>}
      </div>
      {param.usage && <p class="param-usage">{param.usage}</p>}
      {param.values && param.values.length > 0 && (
        <div class="param-values">
          <span class="param-values-label">Values:</span>
          {param.values.map((v, i) => (
            <code key={i} class="param-value">{v}</code>
          ))}
        </div>
      )}
      {param.select && (
        <div class="param-select">
          <span class="param-select-label">
            Select {param.select['how-many'] === 'one-or-more' ? 'one or more' : 'one'}:
          </span>
          {param.select.choice?.map((c, i) => (
            <span key={i} class="param-choice">{c}</span>
          ))}
        </div>
      )}
      {param.guidelines && param.guidelines.length > 0 && (
        <div class="param-guidelines">
          {param.guidelines.map((g, i) => (
            <p key={i} class="param-guideline">{g.prose}</p>
          ))}
        </div>
      )}
    </div>
  )
}
