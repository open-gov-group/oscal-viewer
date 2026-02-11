/**
 * ExportMenu — Accessible dropdown menu for exporting OSCAL documents.
 *
 * Implements WAI-ARIA Menu pattern with keyboard navigation
 * (ArrowDown/Up, Enter, Space, Escape) and click-outside-close.
 * Four export options: JSON, Markdown, CSV, and Print/PDF.
 */
import { useState, useEffect, useRef, useCallback } from 'preact/hooks'
import type { FunctionComponent } from 'preact'
import type { UseExportReturn } from '@/hooks/use-export'

interface ExportMenuProps {
  exportActions: UseExportReturn
}

interface MenuItem {
  label: string
  description: string
  action: () => void
}

export const ExportMenu: FunctionComponent<ExportMenuProps> = ({ exportActions }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const items: MenuItem[] = [
    { label: 'JSON', description: 'OSCAL JSON format', action: exportActions.exportJson },
    { label: 'Markdown', description: 'Human-readable summary', action: exportActions.exportMarkdown },
    { label: 'CSV', description: 'Tabular spreadsheet format', action: exportActions.exportCsv },
    { label: 'Print / PDF', description: 'Print or save as PDF', action: exportActions.exportPdf },
  ]

  const close = useCallback(() => {
    setIsOpen(false)
    setActiveIndex(-1)
    buttonRef.current?.focus()
  }, [])

  const selectItem = useCallback((item: MenuItem) => {
    item.action()
    close()
  }, [close])

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        close()
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [isOpen, close])

  const handleButtonKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setIsOpen(true)
      setActiveIndex(0)
    }
  }

  const handleMenuKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setActiveIndex(prev => Math.min(prev + 1, items.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setActiveIndex(prev => Math.max(prev - 1, 0))
        break
      case 'Home':
        e.preventDefault()
        setActiveIndex(0)
        break
      case 'End':
        e.preventDefault()
        setActiveIndex(items.length - 1)
        break
      case 'Enter':
      case ' ':
        e.preventDefault()
        if (activeIndex >= 0) selectItem(items[activeIndex])
        break
      case 'Escape':
        e.preventDefault()
        close()
        break
      case 'Tab':
        close()
        break
    }
  }

  return (
    <div class="export-menu" ref={menuRef}>
      <button
        ref={buttonRef}
        class="export-menu-button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={isOpen ? 'export-menu-list' : undefined}
        onClick={() => {
          if (isOpen) { close() } else { setIsOpen(true); setActiveIndex(0) }
        }}
        onKeyDown={(e) => handleButtonKeyDown(e as unknown as KeyboardEvent)}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Export
      </button>

      {isOpen && (
        <div
          id="export-menu-list"
          class="export-menu-dropdown"
          role="menu"
          aria-label="Export options"
          onKeyDown={(e) => handleMenuKeyDown(e as unknown as KeyboardEvent)}
        >
          {items.map((item, i) => (
            <div
              key={item.label}
              class={`export-menu-item ${i === activeIndex ? 'export-menu-item--active' : ''}`}
              role="menuitem"
              tabIndex={i === activeIndex ? 0 : -1}
              ref={(el) => { if (i === activeIndex && el) el.focus() }}
              onClick={() => selectItem(item)}
            >
              <span class="export-menu-item-label">{item.label}</span>
              <span class="export-menu-item-desc">{item.description}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
