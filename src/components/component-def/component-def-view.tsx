/**
 * ComponentDefView — Sidebar + detail view for OSCAL Component Definition documents.
 *
 * Sidebar lists all defined components with type badges, filterable by type category
 * and keyword. Detail pane shows description, purpose, properties, responsible roles,
 * and control implementations. Deep-linked via useDeepLink('compdef').
 * Capabilities section shown below when present.
 */
import { useState, useMemo, useEffect } from 'preact/hooks'
import type { FunctionComponent } from 'preact'
import type { ComponentDefinition, DefinedComponent, ControlImplementation, ImplementedRequirement } from '@/types/oscal'
import type { ResolvedSource } from '@/services/resolver'
import { useDeepLink } from '@/hooks/use-deep-link'
import { useFilter } from '@/hooks/use-filter'
import { useSourceResolver } from '@/hooks/use-source-resolver'
import { MetadataPanel } from '@/components/shared/metadata-panel'
import { PropertyList } from '@/components/shared/property-badge'
import { Accordion } from '@/components/shared/accordion'
import { FilterBar } from '@/components/shared/filter-bar'
import type { FilterCategory } from '@/components/shared/filter-bar'
import { ResourcePanel } from '@/components/shared/resource-panel'

interface ComponentDefViewProps {
  componentDef: ComponentDefinition
}

/** Renders an OSCAL Component Definition with sidebar navigation, filtering, and detail pane. */
export const ComponentDefView: FunctionComponent<ComponentDefViewProps> = ({ componentDef }) => {
  const { selectedId: selectedComponentId, setSelectedId: setSelectedComponentId } = useDeepLink('compdef')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const filter = useFilter()

  // Count total implemented requirements across all components and their control-implementations
  const stats = useMemo(() => {
    const components = componentDef.components ?? []
    const totalImplementations = components.reduce((sum, c) =>
      sum + (c['control-implementations']?.reduce((s, ci) =>
        s + ci['implemented-requirements'].length, 0) ?? 0), 0)
    return {
      components: components.length,
      capabilities: componentDef.capabilities?.length ?? 0,
      implementations: totalImplementations,
    }
  }, [componentDef])

  /** Build filter dropdown categories from unique component types. Hidden if only one type exists. */
  const typeCategories = useMemo((): FilterCategory[] => {
    const components = componentDef.components ?? []
    const types = [...new Set(components.map(c => c.type))]
    if (types.length <= 1) return []
    return [{ key: 'type', label: 'Type', options: types.map(t => ({ value: t, label: t })) }]
  }, [componentDef])

  /** Filter components by active type chips and keyword (matches title, type, description). */
  const filteredComponents = useMemo(() => {
    const components = componentDef.components ?? []
    if (!filter.hasActiveFilters) return components
    const typeChips = filter.chips.filter(c => c.key === 'type').map(c => c.value)
    return components.filter(comp => {
      if (typeChips.length > 0 && !typeChips.includes(comp.type)) return false
      if (filter.keyword) {
        const kw = filter.keyword.toLowerCase()
        return comp.title.toLowerCase().includes(kw) ||
          comp.type.toLowerCase().includes(kw) ||
          comp.description.toLowerCase().includes(kw)
      }
      return true
    })
  }, [componentDef, filter.keyword, filter.chips, filter.hasActiveFilters])

  // Collect unique source hrefs from all control-implementations for resolution
  const uniqueSourceHrefs = useMemo(() => {
    const hrefs = new Set<string>()
    for (const comp of componentDef.components ?? []) {
      for (const ci of comp['control-implementations'] ?? []) {
        hrefs.add(ci.source)
      }
    }
    return [...hrefs]
  }, [componentDef])

  const { sources: resolvedSources, resolve: resolveSources } = useSourceResolver()

  // Extract base URL from ?url= query parameter for resolving relative sources
  const baseUrl = useMemo(() => {
    const urlParam = new URLSearchParams(window.location.search).get('url')
    if (!urlParam) return undefined
    const lastSlash = urlParam.lastIndexOf('/')
    return lastSlash > 0 ? urlParam.slice(0, lastSlash + 1) : undefined
  }, [])

  // Auto-resolve source hrefs when component definition is loaded
  useEffect(() => {
    if (uniqueSourceHrefs.length > 0) {
      resolveSources(uniqueSourceHrefs, baseUrl)
    }
  }, [uniqueSourceHrefs, baseUrl, resolveSources])

  const selectedComponent = useMemo(() => {
    if (!selectedComponentId) return null
    return componentDef.components?.find(c => c.uuid === selectedComponentId) ?? null
  }, [componentDef, selectedComponentId])

  /** Select a component by UUID, sync to URL hash, and close mobile sidebar. */
  const handleComponentSelect = (uuid: string) => {
    setSelectedComponentId(uuid)
    setSidebarOpen(false)
  }

  return (
    <div class="compdef-view">
      <MetadataPanel metadata={componentDef.metadata} />

      <div class="compdef-stats">
        <span class="stat">
          <strong>{stats.components}</strong> Component{stats.components !== 1 ? 's' : ''}
        </span>
        {stats.capabilities > 0 && (
          <span class="stat">
            <strong>{stats.capabilities}</strong> Capabilit{stats.capabilities !== 1 ? 'ies' : 'y'}
          </span>
        )}
        <span class="stat">
          <strong>{stats.implementations}</strong> Implemented Requirement{stats.implementations !== 1 ? 's' : ''}
        </span>
      </div>

      {componentDef.components && componentDef.components.length > 0 && (
        <div class="compdef-layout">
          <div class={`sidebar-backdrop ${sidebarOpen ? 'visible' : ''}`} onClick={() => setSidebarOpen(false)} />
          <aside class={`compdef-sidebar ${sidebarOpen ? 'open' : ''}`} aria-label="Component list">
            <div class="nav-title-box">
              <span class="nav-doc-type">Component Definition</span>
              <span class="nav-doc-title">{componentDef.metadata.title}</span>
              {componentDef.metadata.version && (
                <span class="nav-doc-version">v{componentDef.metadata.version}</span>
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
              categories={typeCategories}
              placeholder="Filter components..."
            />
            <ul class="compdef-component-list" role="listbox" aria-label="Components">
              {filteredComponents.map(comp => (
                <li
                  key={comp.uuid}
                  role="option"
                  aria-selected={selectedComponentId === comp.uuid}
                  class={`compdef-component-item ${selectedComponentId === comp.uuid ? 'selected' : ''}`}
                  tabIndex={0}
                  onClick={() => handleComponentSelect(comp.uuid)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleComponentSelect(comp.uuid)
                    }
                  }}
                >
                  <span class="compdef-type-badge">{comp.type}</span>
                  <span class="compdef-component-title">{comp.title}</span>
                </li>
              ))}
            </ul>
          </aside>

          <main class="compdef-content">
            {selectedComponent ? (
              <ComponentDetail component={selectedComponent} resolvedSources={resolvedSources} />
            ) : (
              <div class="compdef-placeholder">
                <p>Select a component from the sidebar to view its details.</p>
              </div>
            )}
          </main>
        </div>
      )}

      {componentDef.capabilities && componentDef.capabilities.length > 0 && (
        <section class="compdef-section" aria-labelledby="compdef-capabilities-heading">
          <h3 id="compdef-capabilities-heading">Capabilities</h3>
          <div class="compdef-capabilities-list">
            {componentDef.capabilities.map(cap => (
              <div key={cap.uuid} class="compdef-capability-card">
                <h4>{cap.name}</h4>
                <p>{cap.description}</p>
                {cap['incorporates-components'] && cap['incorporates-components'].length > 0 && (
                  <div class="capability-incorporates">
                    <span class="capability-label">Incorporates:</span>
                    {cap['incorporates-components'].map(ic => (
                      <code key={ic['component-uuid']}>{ic['component-uuid'].slice(0, 8)}...</code>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {componentDef['back-matter']?.resources && componentDef['back-matter'].resources.length > 0 && (
        <ResourcePanel backMatter={componentDef['back-matter']} />
      )}

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

interface ComponentDetailProps {
  component: DefinedComponent
  resolvedSources: Map<string, ResolvedSource>
}

/** Detail view for a single component: description, purpose, properties, roles, and control implementations. */
const ComponentDetail: FunctionComponent<ComponentDetailProps> = ({ component, resolvedSources }) => {
  return (
    <article class="compdef-detail" aria-labelledby={`comp-${component.uuid}-title`}>
      <header class="compdef-detail-header">
        <span class="compdef-type-badge">{component.type}</span>
        <h2 id={`comp-${component.uuid}-title`}>{component.title}</h2>
      </header>

      <div class="content-box">
        <p class="compdef-description">{component.description}</p>
        {component.purpose && (
          <div class="compdef-purpose">
            <strong>Purpose:</strong> {component.purpose}
          </div>
        )}
      </div>

      {component.props && component.props.length > 0 && (
        <div class="content-box">
          <div class="content-box-header">
            <h3>Properties</h3>
            <span class="content-box-count">{component.props.length}</span>
          </div>
          <PropertyList props={component.props} />
        </div>
      )}

      {component['responsible-roles'] && component['responsible-roles'].length > 0 && (
        <div class="content-box">
          <div class="content-box-header">
            <h3>Responsible Roles</h3>
            <span class="content-box-count">{component['responsible-roles'].length}</span>
          </div>
          <div class="compdef-roles-list">
            {component['responsible-roles'].map(role => (
              <span key={role['role-id']} class="compdef-role-badge">{role['role-id']}</span>
            ))}
          </div>
        </div>
      )}

      {/* Each component can reference multiple control frameworks via control-implementations */}
      {component['control-implementations'] && component['control-implementations'].length > 0 && (
        <div class="compdef-subsection">
          {component['control-implementations'].map(ci => {
            const resolved = resolvedSources.get(ci.source)
            const ciTitle = resolved?.title
              ? `Control Implementation: ${resolved.title}`
              : `Control Implementation: ${ci.source}`
            return (
              <Accordion
                key={ci.uuid}
                id={`ci-${ci.uuid}`}
                title={ciTitle}
                count={ci['implemented-requirements'].length}
                defaultOpen={component['control-implementations']!.length === 1}
                headingLevel={3}
              >
                <ControlImplementationView implementation={ci} resolvedSource={resolved} />
              </Accordion>
            )
          })}
        </div>
      )}
    </article>
  )
}

interface ControlImplementationViewProps {
  implementation: ControlImplementation
  resolvedSource?: ResolvedSource
}

/** Renders a control implementation with source reference, description, and requirement cards. */
const ControlImplementationView: FunctionComponent<ControlImplementationViewProps> = ({ implementation, resolvedSource }) => {
  return (
    <div class="compdef-ci">
      <div class="compdef-ci-header">
        <span class="compdef-ci-source">
          Source: {resolvedSource?.title && resolvedSource.status !== 'error'
            ? <><strong>{resolvedSource.title}</strong> <code class="compdef-ci-source-href">{implementation.source}</code></>
            : <code>{implementation.source}</code>}
        </span>
        <span class="compdef-ci-count">
          {implementation['implemented-requirements'].length} requirement{implementation['implemented-requirements'].length !== 1 ? 's' : ''}
        </span>
      </div>
      <p class="compdef-ci-description">{implementation.description}</p>

      <div class="compdef-requirements-list">
        {implementation['implemented-requirements'].map(req => (
          <RequirementCard key={req.uuid} requirement={req} />
        ))}
      </div>
    </div>
  )
}

interface RequirementCardProps {
  requirement: ImplementedRequirement
}

/** Renders a single implemented requirement with control-id, description, properties, and statements. */
const RequirementCard: FunctionComponent<RequirementCardProps> = ({ requirement }) => {
  return (
    <div class="compdef-requirement">
      <div class="compdef-requirement-header">
        <code class="compdef-control-id">{requirement['control-id']}</code>
      </div>
      <p class="compdef-requirement-desc">{requirement.description}</p>
      {requirement.props && requirement.props.length > 0 && (
        <PropertyList props={requirement.props} />
      )}
      {/* Statements break down implementation narrative by control part (e.g. ac-1_smt.a) */}
      {requirement.statements && requirement.statements.length > 0 && (
        <div class="compdef-statements">
          {requirement.statements.map(stmt => (
            <div key={stmt.uuid} class="compdef-statement">
              <code class="compdef-statement-id">{stmt['statement-id']}</code>
              <p>{stmt.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
