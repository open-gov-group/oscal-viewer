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

  const controlMap = useMemo(() => buildControlMap(catalog), [catalog])
  const totalControls = useMemo(() => countControls(catalog), [catalog])
  const selectedControl = selectedControlId ? controlMap.get(selectedControlId) ?? null : null

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
        <aside class="catalog-sidebar" aria-label="Control navigation">
          <GroupTree
            groups={catalog.groups}
            controls={catalog.controls}
            selectedControlId={selectedControlId}
            onSelectControl={setSelectedControlId}
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
