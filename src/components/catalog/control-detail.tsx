import type { FunctionComponent } from 'preact'
import type { Control, Part, Parameter } from '@/types/oscal'
import { PropertyList } from '@/components/shared/property-badge'
import { Accordion } from '@/components/shared/accordion'
import { CopyLinkButton } from '@/components/shared/copy-link-button'

interface ControlDetailProps {
  control: Control
}

export const ControlDetail: FunctionComponent<ControlDetailProps> = ({ control }) => {
  return (
    <article class="control-detail" aria-labelledby={`control-${control.id}-title`}>
      <header class="control-detail-header">
        <span class="control-id-badge">{control.id}</span>
        <CopyLinkButton viewType="catalog" elementId={control.id} />
        <h2 id={`control-${control.id}-title`}>{control.title}</h2>
        {control.class && <span class="control-class">{control.class}</span>}
      </header>

      {control.props && control.props.length > 0 && (
        <PropertyList props={control.props} />
      )}

      {control.parts && control.parts.length > 0 && (
        <Accordion
          id={`${control.id}-parts`}
          title="Content"
          count={control.parts.length}
          defaultOpen={true}
          headingLevel={3}
        >
          {control.parts.map((part, i) => (
            <PartView key={part.id ?? `${part.name}-${i}`} part={part} />
          ))}
        </Accordion>
      )}

      {control.params && control.params.length > 0 && (
        <Accordion
          id={`${control.id}-params`}
          title="Parameters"
          count={control.params.length}
          headingLevel={3}
        >
          <div class="params-list">
            {control.params.map(param => (
              <ParameterItem key={param.id} param={param} />
            ))}
          </div>
        </Accordion>
      )}

      {control.links && control.links.length > 0 && (
        <Accordion
          id={`${control.id}-links`}
          title="Links"
          count={control.links.length}
          headingLevel={3}
        >
          <ul class="links-list">
            {control.links.map((link, i) => (
              <li key={`${link.href}-${i}`}>
                <a href={link.href} rel="noopener noreferrer">
                  {link.text ?? link.href}
                </a>
                {link.rel && <span class="link-rel">{link.rel}</span>}
              </li>
            ))}
          </ul>
        </Accordion>
      )}

      {control.controls && control.controls.length > 0 && (
        <Accordion
          id={`${control.id}-enhancements`}
          title="Control Enhancements"
          count={control.controls.length}
          headingLevel={3}
        >
          <div class="sub-controls">
            {control.controls.map(sub => (
              <ControlDetail key={sub.id} control={sub} />
            ))}
          </div>
        </Accordion>
      )}
    </article>
  )
}

interface ParameterItemProps {
  param: Parameter
}

const ParameterItem: FunctionComponent<ParameterItemProps> = ({ param }) => {
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

interface PartViewProps {
  part: Part
  depth?: number
}

const PartView: FunctionComponent<PartViewProps> = ({ part, depth = 0 }) => {
  const partLabel = formatPartName(part.name)
  const title = part.title ?? partLabel
  const hasChildren = part.parts && part.parts.length > 0
  const partId = part.id ?? part.name

  // Parts without title and without children → flat content
  if (!title && !hasChildren) {
    return (
      <div class={`part-view part-${part.name}`}>
        {part.prose && <div class="part-prose">{part.prose}</div>}
        {part.props && part.props.length > 0 && <PropertyList props={part.props} />}
      </div>
    )
  }

  // Parts with title or children → nested Accordion
  const headingLevel = Math.min(4 + depth, 6) as 4 | 5 | 6

  return (
    <div class={`part-view part-${part.name}`} data-depth={depth}>
      <Accordion
        id={`${partId}-${depth}`}
        title={title || part.name}
        defaultOpen={depth === 0}
        headingLevel={headingLevel}
      >
        {part.prose && <div class="part-prose">{part.prose}</div>}
        {part.props && part.props.length > 0 && <PropertyList props={part.props} />}
        {hasChildren && (
          <div class="part-children">
            {part.parts!.map((child, i) => (
              <PartView key={child.id ?? `${child.name}-${i}`} part={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </Accordion>
    </div>
  )
}

function formatPartName(name: string): string {
  const labels: Record<string, string> = {
    statement: 'Statement',
    guidance: 'Guidance',
    'assessment-objective': 'Assessment Objective',
    'assessment-method': 'Assessment Method',
    item: '',
    overview: 'Overview',
  }
  return labels[name] ?? name.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}
