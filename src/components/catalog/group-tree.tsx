import { useState, useRef, useCallback, useEffect } from 'preact/hooks'
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
  const treeRef = useRef<HTMLUListElement>(null)

  const getVisibleItems = useCallback((): HTMLElement[] => {
    if (!treeRef.current) return []
    return Array.from(treeRef.current.querySelectorAll<HTMLElement>(
      '.tree-group-header, .tree-control-btn'
    ))
  }, [])

  // Roving tabindex: ensure exactly one item has tabIndex=0
  useEffect(() => {
    const items = getVisibleItems()
    if (items.length === 0) return
    if (!items.some(el => el.getAttribute('tabindex') === '0')) {
      items[0].setAttribute('tabindex', '0')
    }
  })

  // Update roving tabindex when any tree button receives focus
  const handleTreeFocus = useCallback((e: FocusEvent) => {
    const target = e.target as HTMLElement
    if (!target.classList.contains('tree-group-header') && !target.classList.contains('tree-control-btn')) return
    const items = getVisibleItems()
    for (const item of items) {
      item.setAttribute('tabindex', item === target ? '0' : '-1')
    }
  }, [getVisibleItems])

  // WAI-ARIA TreeView keyboard navigation
  const handleTreeKeyDown = useCallback((e: KeyboardEvent) => {
    const target = e.target as HTMLElement
    if (!target.classList.contains('tree-group-header') && !target.classList.contains('tree-control-btn')) return

    const items = getVisibleItems()
    const currentIndex = items.indexOf(target)
    if (currentIndex === -1) return

    const treeItem = target.closest('[role="treeitem"]') as HTMLElement | null
    let newIndex = currentIndex

    switch (e.key) {
      case 'ArrowDown':
        newIndex = Math.min(currentIndex + 1, items.length - 1)
        break
      case 'ArrowUp':
        newIndex = Math.max(currentIndex - 1, 0)
        break
      case 'ArrowRight': {
        const exp = treeItem?.getAttribute('aria-expanded')
        if (exp === 'false') {
          e.preventDefault()
          if (target.classList.contains('tree-group-header')) {
            target.click()
          } else {
            treeItem?.querySelector<HTMLElement>('.tree-expand-btn')?.click()
          }
          return
        }
        if (exp === 'true') {
          newIndex = Math.min(currentIndex + 1, items.length - 1)
        }
        break
      }
      case 'ArrowLeft': {
        const exp = treeItem?.getAttribute('aria-expanded')
        if (exp === 'true') {
          e.preventDefault()
          if (target.classList.contains('tree-group-header')) {
            target.click()
          } else {
            treeItem?.querySelector<HTMLElement>('.tree-expand-btn')?.click()
          }
          return
        }
        const parentItem = treeItem?.parentElement?.closest('[role="treeitem"]')
        if (parentItem) {
          const parentBtn = parentItem.querySelector<HTMLElement>(
            ':scope > .tree-group-header, :scope > .tree-control-row > .tree-control-btn'
          )
          if (parentBtn) {
            const idx = items.indexOf(parentBtn)
            if (idx !== -1) newIndex = idx
          }
        }
        break
      }
      case 'Home':
        newIndex = 0
        break
      case 'End':
        newIndex = items.length - 1
        break
      default:
        return
    }

    e.preventDefault()
    if (newIndex !== currentIndex) {
      items[newIndex].focus()
    }
  }, [getVisibleItems])

  return (
    <nav class="group-tree" aria-label="Catalog navigation">
      <ul
        role="tree"
        class="tree-list"
        ref={treeRef}
        onKeyDown={(e) => handleTreeKeyDown(e as unknown as KeyboardEvent)}
        onFocus={(e) => handleTreeFocus(e as unknown as FocusEvent)}
      >
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
    <li role="treeitem" aria-expanded={expanded} aria-level={depth + 1} class="tree-group">
      <button
        class="tree-group-header"
        tabIndex={-1}
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
    <li role="treeitem" aria-expanded={hasChildren ? expanded : undefined} aria-level={depth + 1} class="tree-control">
      <div class={`tree-control-row ${isSelected ? 'selected' : ''}`}>
        {hasChildren ? (
          <button
            class="tree-expand-btn"
            tabIndex={-1}
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
          tabIndex={-1}
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
