/**
 * SspView — Tabbed view for OSCAL System Security Plan documents.
 *
 * Three tabs with WAI-ARIA tab pattern (Arrow key navigation, roving tabindex):
 * - System Characteristics: description, impact levels, authorization boundary
 * - System Implementation: users, components, inventory items
 * - Control Implementation: implemented requirements with by-component narratives
 *
 * Tab state is synced with the URL hash via useDeepLink.
 */
import { useState, useMemo, useEffect } from 'preact/hooks'
import type { FunctionComponent } from 'preact'
import type { SystemSecurityPlan, SystemCharacteristics, SystemImplementation, SspControlImplementation } from '@/types/oscal'
import { useDeepLink } from '@/hooks/use-deep-link'
import { MetadataPanel } from '@/components/shared/metadata-panel'
import { PropertyList } from '@/components/shared/property-badge'
import { StatusBadge } from '@/components/shared/status-badge'
import { useSspResolver } from '@/hooks/use-ssp-resolver'
import { ImportPanel } from '@/components/shared/import-panel'
import { ResourcePanel } from '@/components/shared/resource-panel'

interface SspViewProps {
  ssp: SystemSecurityPlan
  /** Cross-document navigation callback, passed to ImportPanel for clickable sources. */
  onNavigate?: (url: string) => void
}

type SspTab = 'characteristics' | 'implementation' | 'controls'

/** Tab definitions for the three SSP sections, used for rendering and keyboard navigation. */
const tabDefs: Array<{ id: SspTab; label: string }> = [
  { id: 'characteristics', label: 'System Characteristics' },
  { id: 'implementation', label: 'System Implementation' },
  { id: 'controls', label: 'Control Implementation' },
]

/** Valid tab IDs for URL hash validation (prevents invalid deep-link values). */
const validTabs: SspTab[] = ['characteristics', 'implementation', 'controls']

/** Renders an OSCAL System Security Plan with three tabbed sections and deep-link support. */
export const SspView: FunctionComponent<SspViewProps> = ({ ssp, onNavigate }) => {
  const { selectedId: hashTab, setSelectedId: setHashTab } = useDeepLink('ssp')
  const initialTab = hashTab && validTabs.includes(hashTab as SspTab) ? hashTab as SspTab : 'characteristics'
  const [activeTab, setActiveTabState] = useState<SspTab>(initialTab)

  /** Update active tab state and sync to URL hash for deep-linking. */
  const setActiveTab = (tab: SspTab) => {
    setActiveTabState(tab)
    setHashTab(tab)
  }

  useEffect(() => {
    if (hashTab && validTabs.includes(hashTab as SspTab)) {
      setActiveTabState(hashTab as SspTab)
    }
  }, [hashTab])

  const stats = useMemo(() => ({
    users: ssp['system-implementation'].users.length,
    components: ssp['system-implementation'].components.length,
    requirements: ssp['control-implementation']['implemented-requirements'].length,
  }), [ssp])

  const { profileMeta, catalogSources, loading: resolving, error: resolveError, resolve: resolveSspFn } = useSspResolver()

  const baseUrl = useMemo(() => {
    const urlParam = new URLSearchParams(window.location.search).get('url')
    if (!urlParam) return undefined
    const lastSlash = urlParam.lastIndexOf('/')
    return lastSlash > 0 ? urlParam.slice(0, lastSlash + 1) : undefined
  }, [])

  useEffect(() => {
    if (ssp['import-profile']?.href) {
      resolveSspFn(ssp, baseUrl)
    }
  }, [ssp, baseUrl, resolveSspFn])

  /**
   * WAI-ARIA Tabs keyboard handler: ArrowRight/Left cycle tabs, Home/End jump to first/last.
   * Moves focus to the newly activated tab button.
   */
  const handleTabKeyDown = (e: KeyboardEvent, currentTab: SspTab) => {
    const tabIds = tabDefs.map(t => t.id)
    const currentIndex = tabIds.indexOf(currentTab)
    let newIndex = currentIndex

    if (e.key === 'ArrowRight') {
      newIndex = (currentIndex + 1) % tabIds.length
    } else if (e.key === 'ArrowLeft') {
      newIndex = (currentIndex - 1 + tabIds.length) % tabIds.length
    } else if (e.key === 'Home') {
      newIndex = 0
    } else if (e.key === 'End') {
      newIndex = tabIds.length - 1
    } else {
      return
    }

    e.preventDefault()
    setActiveTab(tabIds[newIndex])
    document.getElementById(`ssp-tab-${tabIds[newIndex]}`)?.focus()
  }

  return (
    <div class="ssp-view">
      <MetadataPanel metadata={ssp.metadata} />

      <div class="ssp-system-header">
        <h2>{ssp['system-characteristics']['system-name']}</h2>
        {ssp['system-characteristics']['system-name-short'] && (
          <span class="ssp-short-name">({ssp['system-characteristics']['system-name-short']})</span>
        )}
        <div class="ssp-system-badges">
          <StatusBadge state={ssp['system-characteristics'].status.state} />
          {ssp['system-characteristics']['security-sensitivity-level'] && (
            <span class="ssp-sensitivity-badge">
              {ssp['system-characteristics']['security-sensitivity-level']}
            </span>
          )}
        </div>
      </div>

      <div class="ssp-stats">
        <span class="stat"><strong>{stats.users}</strong> User{stats.users !== 1 ? 's' : ''}</span>
        <span class="stat"><strong>{stats.components}</strong> Component{stats.components !== 1 ? 's' : ''}</span>
        <span class="stat"><strong>{stats.requirements}</strong> Implemented Requirement{stats.requirements !== 1 ? 's' : ''}</span>
      </div>

      <div class="ssp-import-profile">
        <span class="ssp-import-label">Import Profile:</span>
        <code>{ssp['import-profile'].href}</code>
        {profileMeta && (
          <div class="ssp-profile-resolved">
            {profileMeta.title} (v{profileMeta.version}, {profileMeta.importCount} import{profileMeta.importCount !== 1 ? 's' : ''})
          </div>
        )}
      </div>

      {(catalogSources.length > 0 || resolving) && (
        <ImportPanel
          sources={catalogSources}
          loading={resolving}
          error={resolveError}
          onSourceClick={onNavigate}
        />
      )}

      <nav class="ssp-tabs" role="tablist" aria-label="SSP Sections">
        {tabDefs.map((tab) => (
          <button
            key={tab.id}
            id={`ssp-tab-${tab.id}`}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`ssp-tabpanel-${tab.id}`}
            tabIndex={activeTab === tab.id ? 0 : -1}
            class={`ssp-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            onKeyDown={(e) => handleTabKeyDown(e as unknown as KeyboardEvent, tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div
        id={`ssp-tabpanel-${activeTab}`}
        class="ssp-tab-content"
        role="tabpanel"
        aria-labelledby={`ssp-tab-${activeTab}`}
      >
        {activeTab === 'characteristics' && (
          <CharacteristicsPanel characteristics={ssp['system-characteristics']} />
        )}
        {activeTab === 'implementation' && (
          <ImplementationPanel implementation={ssp['system-implementation']} />
        )}
        {activeTab === 'controls' && (
          <ControlImplementationPanel controlImpl={ssp['control-implementation']} />
        )}
      </div>

      {ssp['back-matter']?.resources && ssp['back-matter'].resources.length > 0 && (
        <ResourcePanel backMatter={ssp['back-matter']} />
      )}
    </div>
  )
}

interface CharacteristicsPanelProps {
  characteristics: SystemCharacteristics
}

/** Renders system description, IDs, security impact levels, authorization boundary, and properties. */
const CharacteristicsPanel: FunctionComponent<CharacteristicsPanelProps> = ({ characteristics }) => {
  return (
    <div class="ssp-characteristics">
      <div class="ssp-field">
        <span class="ssp-field-label">Description</span>
        <p class="ssp-field-value">{characteristics.description}</p>
      </div>

      {characteristics['system-ids'] && characteristics['system-ids'].length > 0 && (
        <div class="ssp-field">
          <span class="ssp-field-label">System IDs</span>
          <div class="ssp-field-value">
            {characteristics['system-ids'].map((sid, i) => (
              <div key={i} class="ssp-system-id">
                <code>{sid.id}</code>
                {sid['identifier-type'] && (
                  <span class="ssp-id-type">{sid['identifier-type']}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {characteristics['security-impact-level'] && (
        <div class="content-box">
          <div class="content-box-header">
            <h3>Security Impact Level</h3>
          </div>
          <div class="ssp-impact-grid">
            <div class="ssp-impact-item">
              <span class="ssp-impact-label">Confidentiality</span>
              <span class="ssp-impact-value">
                {characteristics['security-impact-level']['security-objective-confidentiality']}
              </span>
            </div>
            <div class="ssp-impact-item">
              <span class="ssp-impact-label">Integrity</span>
              <span class="ssp-impact-value">
                {characteristics['security-impact-level']['security-objective-integrity']}
              </span>
            </div>
            <div class="ssp-impact-item">
              <span class="ssp-impact-label">Availability</span>
              <span class="ssp-impact-value">
                {characteristics['security-impact-level']['security-objective-availability']}
              </span>
            </div>
          </div>
        </div>
      )}

      {characteristics['authorization-boundary'] && (
        <div class="content-box">
          <div class="content-box-header">
            <h3>Authorization Boundary</h3>
          </div>
          <p class="ssp-field-value">{characteristics['authorization-boundary'].description}</p>
        </div>
      )}

      {characteristics['date-authorized'] && (
        <div class="ssp-field">
          <span class="ssp-field-label">Date Authorized</span>
          <span class="ssp-field-value">{characteristics['date-authorized']}</span>
        </div>
      )}

      {characteristics.props && characteristics.props.length > 0 && (
        <PropertyList props={characteristics.props} />
      )}
    </div>
  )
}

interface ImplementationPanelProps {
  implementation: SystemImplementation
}

/** Renders system users (with roles), components (with status badges), and inventory items. */
const ImplementationPanel: FunctionComponent<ImplementationPanelProps> = ({ implementation }) => {
  return (
    <div class="ssp-implementation">
      <section class="ssp-impl-section" aria-labelledby="ssp-users-heading">
        <h4 id="ssp-users-heading">Users ({implementation.users.length})</h4>
        <div class="ssp-items-list">
          {implementation.users.map(user => (
            <div key={user.uuid} class="ssp-item-card">
              <div class="ssp-item-header">
                <strong>{user.title ?? user.uuid.slice(0, 8)}</strong>
                {user['short-name'] && <span class="ssp-short-name">({user['short-name']})</span>}
              </div>
              {user.description && <p class="ssp-item-description">{user.description}</p>}
              {user['role-ids'] && user['role-ids'].length > 0 && (
                <div class="ssp-item-roles">
                  {user['role-ids'].map(rid => (
                    <span key={rid} class="ssp-role-tag">{rid}</span>
                  ))}
                </div>
              )}
              {user.props && user.props.length > 0 && (
                <PropertyList props={user.props} />
              )}
            </div>
          ))}
        </div>
      </section>

      <section class="ssp-impl-section" aria-labelledby="ssp-components-heading">
        <h4 id="ssp-components-heading">Components ({implementation.components.length})</h4>
        <div class="ssp-items-list">
          {implementation.components.map(comp => (
            <div key={comp.uuid} class="ssp-item-card">
              <div class="ssp-item-header">
                <span class="ssp-component-type">{comp.type}</span>
                <strong>{comp.title}</strong>
                <StatusBadge state={comp.status.state} />
              </div>
              <p class="ssp-item-description">{comp.description}</p>
              {comp.props && comp.props.length > 0 && (
                <PropertyList props={comp.props} />
              )}
            </div>
          ))}
        </div>
      </section>

      {implementation['inventory-items'] && implementation['inventory-items'].length > 0 && (
        <section class="ssp-impl-section" aria-labelledby="ssp-inventory-heading">
          <h4 id="ssp-inventory-heading">Inventory Items ({implementation['inventory-items'].length})</h4>
          <div class="ssp-items-list">
            {implementation['inventory-items'].map(item => (
              <div key={item.uuid} class="ssp-item-card">
                <p class="ssp-item-description">{item.description}</p>
                {item.props && item.props.length > 0 && (
                  <PropertyList props={item.props} />
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

interface ControlImplementationPanelProps {
  controlImpl: SspControlImplementation
}

/** Renders implemented requirements with statements and by-component implementation narratives. */
const ControlImplementationPanel: FunctionComponent<ControlImplementationPanelProps> = ({ controlImpl }) => {
  return (
    <div class="ssp-control-impl">
      {controlImpl.description && (
        <p class="ssp-ci-description">{controlImpl.description}</p>
      )}

      <div class="ssp-requirements-list">
        {controlImpl['implemented-requirements'].map(req => (
          <div key={req.uuid} class="ssp-requirement-card">
            <div class="ssp-requirement-header">
              <code class="ssp-control-id">{req['control-id']}</code>
              {req.props && req.props.length > 0 && (
                <PropertyList props={req.props} />
              )}
            </div>

            {req.statements && req.statements.length > 0 && (
              <div class="ssp-statements">
                {req.statements.map(stmt => (
                  <div key={stmt.uuid} class="ssp-statement">
                    <code class="ssp-statement-id">{stmt['statement-id']}</code>
                    {stmt['by-components'] && stmt['by-components'].length > 0 && (
                      <div class="ssp-by-components">
                        {stmt['by-components'].map(bc => (
                          <div key={bc.uuid} class="ssp-by-component">
                            <span class="ssp-bc-uuid">{bc['component-uuid'].slice(0, 8)}...</span>
                            <p>{bc.description}</p>
                            {bc['implementation-status'] && (
                              <StatusBadge state={bc['implementation-status'].state} />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {req['by-components'] && req['by-components'].length > 0 && (
              <div class="ssp-by-components">
                {req['by-components'].map(bc => (
                  <div key={bc.uuid} class="ssp-by-component">
                    <span class="ssp-bc-uuid">{bc['component-uuid'].slice(0, 8)}...</span>
                    <p>{bc.description}</p>
                  </div>
                ))}
              </div>
            )}

            {req.remarks && <p class="ssp-remarks">{req.remarks}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}
