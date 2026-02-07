import { useState, useEffect, useContext } from 'preact/hooks'
import type { FunctionComponent, ComponentChildren } from 'preact'
import { createElement, createContext } from 'preact'

interface AccordionGroupContextValue {
  expandSignal: number
  collapseSignal: number
}

const AccordionGroupCtx = createContext<AccordionGroupContextValue | null>(null)

interface AccordionProps {
  title: string
  count?: number
  defaultOpen?: boolean
  id: string
  headingLevel?: 2 | 3 | 4 | 5 | 6
  children: ComponentChildren
}

const STORAGE_PREFIX = 'accordion-'

function readSavedState(id: string): boolean | null {
  try {
    const v = sessionStorage.getItem(STORAGE_PREFIX + id)
    return v === 'true' ? true : v === 'false' ? false : null
  } catch {
    return null
  }
}

function writeSavedState(id: string, open: boolean): void {
  try {
    sessionStorage.setItem(STORAGE_PREFIX + id, String(open))
  } catch {
    // sessionStorage unavailable (private mode, quota exceeded)
  }
}

export const Accordion: FunctionComponent<AccordionProps> = ({
  title,
  count,
  defaultOpen = false,
  id,
  headingLevel,
  children,
}) => {
  const [open, setOpen] = useState(() => readSavedState(id) ?? defaultOpen)
  const group = useContext(AccordionGroupCtx)

  useEffect(() => {
    writeSavedState(id, open)
  }, [id, open])

  useEffect(() => {
    if (group && group.expandSignal > 0) setOpen(true)
  }, [group?.expandSignal])

  useEffect(() => {
    if (group && group.collapseSignal > 0) setOpen(false)
  }, [group?.collapseSignal])

  const trigger = (
    <button
      id={`${id}-trigger`}
      class="accordion-trigger"
      aria-expanded={open}
      aria-controls={`${id}-content`}
      onClick={() => setOpen(!open)}
    >
      <span class="accordion-trigger-icon" aria-hidden="true">&#9656;</span>
      <span class="accordion-trigger-title">{title}</span>
      {count !== undefined && (
        <span class="accordion-trigger-count">{count}</span>
      )}
    </button>
  )

  return (
    <div class="accordion">
      {headingLevel
        ? createElement(`h${headingLevel}`, { class: 'accordion-heading' }, trigger)
        : trigger}
      <div
        id={`${id}-content`}
        role="region"
        aria-labelledby={`${id}-trigger`}
        class="accordion-content"
        hidden={!open}
      >
        {children}
      </div>
    </div>
  )
}

interface AccordionGroupProps {
  children: ComponentChildren
}

export const AccordionGroup: FunctionComponent<AccordionGroupProps> = ({ children }) => {
  const [expandSignal, setExpandSignal] = useState(0)
  const [collapseSignal, setCollapseSignal] = useState(0)

  return (
    <AccordionGroupCtx.Provider value={{ expandSignal, collapseSignal }}>
      <div class="accordion-group">
        <div class="accordion-actions">
          <button onClick={() => setExpandSignal(c => c + 1)}>Expand all</button>
          <button onClick={() => setCollapseSignal(c => c + 1)}>Collapse all</button>
        </div>
        {children}
      </div>
    </AccordionGroupCtx.Provider>
  )
}
