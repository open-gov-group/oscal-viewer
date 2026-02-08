/**
 * ControlDetail — Detail panel for an individual OSCAL control.
 *
 * Renders control metadata (id, title, class), properties, content parts,
 * parameters, links, and sub-controls (enhancements) in collapsible Accordions.
 * Sub-controls are rendered recursively via self-reference.
 * Parts are rendered recursively via PartView with depth-based heading levels (h4→h5→h6).
 */
import type { FunctionComponent } from 'preact'
import type { Control, Part } from '@/types/oscal'
import { PropertyList } from '@/components/shared/property-badge'
import { Accordion } from '@/components/shared/accordion'
import { CopyLinkButton } from '@/components/shared/copy-link-button'
import { ParameterItem } from '@/components/shared/parameter-item'

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

interface PartViewProps {
  part: Part
  depth?: number
}

/**
 * Recursive part renderer. Parts without a title render as flat content.
 * Parts with a title or children render inside a nested Accordion.
 * Heading level increases with depth: h4 (depth 0) → h5 (depth 1) → h6 (depth 2+).
 */
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

/** Maps OSCAL part names to human-readable labels. Falls back to title-cased hyphen-split. */
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
