/**
 * CatalogView — Main view for OSCAL Catalog documents.
 *
 * Layout: sidebar (navigation tree + filter bar) + content area (control detail).
 * Provides keyword and family-chip filtering, deep-linking to individual controls,
 * and a responsive sidebar toggle for mobile.
 */
import { useState, useMemo } from 'preact/hooks'
import type { FunctionComponent } from 'preact'
import type { Catalog, Control, Group } from '@/types/oscal'
import { countControls } from '@/parser/catalog'
import { useDeepLink } from '@/hooks/use-deep-link'
import { useFilter } from '@/hooks/use-filter'
import { MetadataPanel } from '@/components/shared/metadata-panel'
import { FilterBar } from '@/components/shared/filter-bar'
import type { FilterCategory } from '@/components/shared/filter-bar'
import { Accordion } from '@/components/shared/accordion'
import { ParameterItem } from '@/components/shared/parameter-item'
import { GroupTree } from './group-tree'
import { ControlDetail } from './control-detail'

interface CatalogViewProps {
  catalog: Catalog
}

export const CatalogView: FunctionComponent<CatalogViewProps> = ({ catalog }) => {
  const { selectedId: selectedControlId, setSelectedId: setSelectedControlId } = useDeepLink('catalog')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const filter = useFilter()

  const controlMap = useMemo(() => buildControlMap(catalog), [catalog])
  const totalControls = useMemo(() => countControls(catalog), [catalog])
  const selectedControl = selectedControlId ? controlMap.get(selectedControlId) ?? null : null

  const familyCategories = useMemo((): FilterCategory[] => {
    if (!catalog.groups || catalog.groups.length === 0) return []
    const options = catalog.groups
      .filter(g => g.id)
      .map(g => ({ value: g.id!, label: `${g.id!.toUpperCase()} – ${g.title}` }))
    if (options.length === 0) return []
    return [{ key: 'family', label: 'Family', options }]
  }, [catalog])

  const filteredGroups = useMemo(() => {
    if (!filter.hasActiveFilters) return catalog.groups
    const familyChips = filter.chips.filter(c => c.key === 'family').map(c => c.value)
    return filterGroups(catalog.groups, filter.keyword, familyChips)
  }, [catalog.groups, filter.keyword, filter.chips, filter.hasActiveFilters])

  const filteredControls = useMemo(() => {
    if (!filter.hasActiveFilters) return catalog.controls
    return filterControlList(catalog.controls, filter.keyword)
  }, [catalog.controls, filter.keyword, filter.hasActiveFilters])

  const handleControlSelect = (id: string) => {
    setSelectedControlId(id)
    setSidebarOpen(false)
  }

  return (
    <div class="catalog-view">
      <MetadataPanel metadata={catalog.metadata} />

      {catalog.params && catalog.params.length > 0 && (
        <Accordion
          id="catalog-params"
          title="Catalog Parameters"
          count={catalog.params.length}
          headingLevel={3}
        >
          <div class="params-list">
            {catalog.params.map(param => (
              <ParameterItem key={param.id} param={param} />
            ))}
          </div>
        </Accordion>
      )}

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
          <div class="nav-title-box">
            <span class="nav-doc-type">Catalog</span>
            <span class="nav-doc-title">{catalog.metadata.title}</span>
            {catalog.metadata.version && (
              <span class="nav-doc-version">v{catalog.metadata.version}</span>
            )}
          </div>
          <FilterBar
            keyword={filter.keyword}
            onKeywordChange={filter.setKeyword}
            chips={filter.chips}
            onAddChip={filter.addChip}
            onRemoveChip={filter.removeChip}
            onClearAll={filter.clearAll}
            hasActiveFilters={filter.hasActiveFilters}
            categories={familyCategories}
            placeholder="Filter controls..."
          />
          <GroupTree
            groups={filteredGroups}
            controls={filteredControls}
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

/**
 * Builds a flat id→Control lookup map from the nested catalog structure.
 * Recursively walks groups and their controls (including sub-controls / enhancements).
 */
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

/** Case-insensitive substring match on control id or title. */
function controlMatchesKeyword(control: Control, keyword: string): boolean {
  const kw = keyword.toLowerCase()
  return control.id.toLowerCase().includes(kw) || control.title.toLowerCase().includes(kw)
}

/** Filters top-level controls (outside groups) by keyword. Keeps parent if any sub-control matches. */
function filterControlList(controls: Control[] | undefined, keyword: string): Control[] | undefined {
  if (!controls || !keyword) return controls
  return controls.filter(c => controlMatchesKeyword(c, keyword) ||
    (c.controls && c.controls.some(sub => controlMatchesKeyword(sub, keyword))))
}

/**
 * Recursively filters catalog groups by family chips and keyword.
 * A group is included if: it matches a family chip, its id/title matches the keyword,
 * or any of its controls or sub-groups match.
 */
function filterGroups(groups: Group[] | undefined, keyword: string, familyIds: string[]): Group[] | undefined {
  if (!groups) return groups

  return groups.reduce<Group[]>((acc, group) => {
    // Family chip filter: skip groups that don't match
    if (familyIds.length > 0 && group.id && !familyIds.includes(group.id)) return acc

    if (!keyword) {
      acc.push(group)
      return acc
    }

    // Filter controls within this group
    const filteredControls = group.controls?.filter(c =>
      controlMatchesKeyword(c, keyword) ||
      (c.controls && c.controls.some(sub => controlMatchesKeyword(sub, keyword)))
    )

    // Recursively filter sub-groups
    const filteredSubGroups = filterGroups(group.groups, keyword, [])

    const hasMatchingControls = filteredControls && filteredControls.length > 0
    const hasMatchingSubGroups = filteredSubGroups && filteredSubGroups.length > 0
    const groupIdMatches = group.id?.toLowerCase().includes(keyword.toLowerCase())
    const groupTitleMatches = group.title.toLowerCase().includes(keyword.toLowerCase())

    if (hasMatchingControls || hasMatchingSubGroups || groupIdMatches || groupTitleMatches) {
      acc.push({
        ...group,
        controls: hasMatchingControls ? filteredControls : (groupIdMatches || groupTitleMatches ? group.controls : undefined),
        groups: hasMatchingSubGroups ? filteredSubGroups : (groupIdMatches || groupTitleMatches ? group.groups : undefined),
      })
    }

    return acc
  }, [])
}
