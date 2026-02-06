import type { FunctionComponent } from 'preact'
import type { Property } from '@/types/oscal'

interface PropertyBadgeProps {
  prop: Property
}

export const PropertyBadge: FunctionComponent<PropertyBadgeProps> = ({ prop }) => {
  return (
    <span class="property-badge" title={prop.remarks ?? `${prop.name}: ${prop.value}`}>
      <span class="property-badge-name">{prop.name}</span>
      <span class="property-badge-value">{prop.value}</span>
    </span>
  )
}

interface PropertyListProps {
  props: Property[]
}

export const PropertyList: FunctionComponent<PropertyListProps> = ({ props }) => {
  if (props.length === 0) return null

  return (
    <div class="property-list" role="list" aria-label="Properties">
      {props.map((prop, i) => (
        <span key={`${prop.name}-${i}`} role="listitem">
          <PropertyBadge prop={prop} />
        </span>
      ))}
    </div>
  )
}
