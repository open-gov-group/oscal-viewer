import { useState, useMemo } from 'preact/hooks'
import type { FunctionComponent } from 'preact'
import type { Catalog, Control } from '@/types/oscal'
import { countControls } from '@/parser/catalog'
import { MetadataPanel } from '@/components/shared/metadata-panel'
import { GroupTree } from './group-tree'
import { ControlDetail } from './control-detail'

interface CatalogViewProps {
  catalog: Catalog
}

export const CatalogView: FunctionComponent<CatalogViewProps> = ({ catalog }) => {
  const [selectedControlId, setSelectedControlId] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const controlMap = useMemo(() => buildControlMap(catalog), [catalog])
  const totalControls = useMemo(() => countControls(catalog), [catalog])
  const selectedControl = selectedControlId ? controlMap.get(selectedControlId) ?? null : null

  const handleControlSelect = (id: string) => {
    setSelectedControlId(id)
    setSidebarOpen(false)
  }

  return (
    <div class="catalog-view">
      <MetadataPanel metadata={catalog.metadata} />

      <div class="catalog-stats">
        <span class="stat">
          <strong>{catalog.groups?.length ?? 0}</strong> Groups
        </span>
        <span class="stat">
          <strong>{totalControls}</strong> Controls
        </span>
      </div>

      <div class="catalog-layout">
        <div class={`sidebar-backdrop ${sidebarOpen ? 'visible' : ''}`} onClick={() => setSidebarOpen(false)} />
        <aside class={`catalog-sidebar ${sidebarOpen ? 'open' : ''}`} aria-label="Control navigation">
          <GroupTree
            groups={catalog.groups}
            controls={catalog.controls}
            selectedControlId={selectedControlId}
            onSelectControl={handleControlSelect}
          />
        </aside>

        <main class="catalog-content">
          {selectedControl ? (
            <ControlDetail control={selectedControl} />
          ) : (
            <div class="catalog-placeholder">
              <p>Select a control from the sidebar to view its details.</p>
            </div>
          )}
        </main>
      </div>

      <button
        class="sidebar-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label={sidebarOpen ? 'Close navigation' : 'Open navigation'}
        aria-expanded={sidebarOpen}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          {sidebarOpen ? (
            <path d="M18 6L6 18M6 6l12 12" />
          ) : (
            <path d="M3 12h18M3 6h18M3 18h18" />
          )}
        </svg>
      </button>
    </div>
  )
}

function buildControlMap(catalog: Catalog): Map<string, Control> {
  const map = new Map<string, Control>()

  function addControls(controls?: Control[]): void {
    if (!controls) return
    for (const control of controls) {
      map.set(control.id, control)
      if (control.controls) {
        addControls(control.controls)
      }
    }
  }

  function addGroups(groups?: Catalog['groups']): void {
    if (!groups) return
    for (const group of groups) {
      addControls(group.controls)
      if (group.groups) {
        addGroups(group.groups)
      }
    }
  }

  addControls(catalog.controls)
  addGroups(catalog.groups)

  return map
}
