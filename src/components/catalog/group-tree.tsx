import { useState } from 'preact/hooks'
import type { FunctionComponent } from 'preact'
import type { Group, Control } from '@/types/oscal'

interface GroupTreeProps {
  groups?: Group[]
  controls?: Control[]
  selectedControlId: string | null
  onSelectControl: (id: string) => void
}

export const GroupTree: FunctionComponent<GroupTreeProps> = ({
  groups,
  controls,
  selectedControlId,
  onSelectControl,
}) => {
  return (
    <nav class="group-tree" aria-label="Catalog navigation">
      <ul role="tree" class="tree-list">
        {groups?.map(group => (
          <GroupNode
            key={group.id ?? group.title}
            group={group}
            selectedControlId={selectedControlId}
            onSelectControl={onSelectControl}
          />
        ))}
        {controls?.map(control => (
          <ControlNode
            key={control.id}
            control={control}
            selectedControlId={selectedControlId}
            onSelectControl={onSelectControl}
            depth={0}
          />
        ))}
      </ul>
    </nav>
  )
}

interface GroupNodeProps {
  group: Group
  selectedControlId: string | null
  onSelectControl: (id: string) => void
  depth?: number
}

const GroupNode: FunctionComponent<GroupNodeProps> = ({
  group,
  selectedControlId,
  onSelectControl,
  depth = 0,
}) => {
  const [expanded, setExpanded] = useState(depth === 0)
  const controlCount = countGroupControls(group)

  return (
    <li role="treeitem" aria-expanded={expanded} class="tree-group">
      <button
        class="tree-group-header"
        onClick={() => setExpanded(!expanded)}
        aria-label={`${group.title} (${controlCount} controls)`}
      >
        <span class={`tree-chevron ${expanded ? 'expanded' : ''}`} aria-hidden="true">
          &#9656;
        </span>
        <span class="tree-group-id">{group.id}</span>
        <span class="tree-group-title">{group.title}</span>
        <span class="tree-count">{controlCount}</span>
      </button>
      {expanded && (
        <ul role="group" class="tree-list">
          {group.groups?.map(subGroup => (
            <GroupNode
              key={subGroup.id ?? subGroup.title}
              group={subGroup}
              selectedControlId={selectedControlId}
              onSelectControl={onSelectControl}
              depth={depth + 1}
            />
          ))}
          {group.controls?.map(control => (
            <ControlNode
              key={control.id}
              control={control}
              selectedControlId={selectedControlId}
              onSelectControl={onSelectControl}
              depth={depth + 1}
            />
          ))}
        </ul>
      )}
    </li>
  )
}

interface ControlNodeProps {
  control: Control
  selectedControlId: string | null
  onSelectControl: (id: string) => void
  depth: number
}

const ControlNode: FunctionComponent<ControlNodeProps> = ({
  control,
  selectedControlId,
  onSelectControl,
  depth,
}) => {
  const [expanded, setExpanded] = useState(false)
  const hasChildren = control.controls && control.controls.length > 0
  const isSelected = selectedControlId === control.id

  return (
    <li role="treeitem" aria-expanded={hasChildren ? expanded : undefined} class="tree-control">
      <div class={`tree-control-row ${isSelected ? 'selected' : ''}`}>
        {hasChildren ? (
          <button
            class="tree-expand-btn"
            onClick={() => setExpanded(!expanded)}
            aria-label={`Expand ${control.id}`}
          >
            <span class={`tree-chevron ${expanded ? 'expanded' : ''}`} aria-hidden="true">
              &#9656;
            </span>
          </button>
        ) : (
          <span class="tree-expand-spacer" />
        )}
        <button
          class="tree-control-btn"
          onClick={() => onSelectControl(control.id)}
          aria-current={isSelected ? 'true' : undefined}
        >
          <span class="tree-control-id">{control.id}</span>
          <span class="tree-control-title">{control.title}</span>
        </button>
      </div>
      {hasChildren && expanded && (
        <ul role="group" class="tree-list">
          {control.controls!.map(sub => (
            <ControlNode
              key={sub.id}
              control={sub}
              selectedControlId={selectedControlId}
              onSelectControl={onSelectControl}
              depth={depth + 1}
            />
          ))}
        </ul>
      )}
    </li>
  )
}

function countGroupControls(group: Group): number {
  let count = group.controls?.length ?? 0
  if (group.controls) {
    for (const c of group.controls) {
      count += c.controls?.length ?? 0
    }
  }
  if (group.groups) {
    for (const g of group.groups) {
      count += countGroupControls(g)
    }
  }
  return count
}
