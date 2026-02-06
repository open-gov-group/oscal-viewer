import { useState, useMemo } from 'preact/hooks'
import type { FunctionComponent } from 'preact'
import type { SystemSecurityPlan, SystemCharacteristics, SystemImplementation, SspControlImplementation } from '@/types/oscal'
import { MetadataPanel } from '@/components/shared/metadata-panel'
import { PropertyList } from '@/components/shared/property-badge'

interface SspViewProps {
  ssp: SystemSecurityPlan
}

type SspTab = 'characteristics' | 'implementation' | 'controls'

export const SspView: FunctionComponent<SspViewProps> = ({ ssp }) => {
  const [activeTab, setActiveTab] = useState<SspTab>('characteristics')

  const stats = useMemo(() => ({
    users: ssp['system-implementation'].users.length,
    components: ssp['system-implementation'].components.length,
    requirements: ssp['control-implementation']['implemented-requirements'].length,
  }), [ssp])

  return (
    <div class="ssp-view">
      <MetadataPanel metadata={ssp.metadata} />

      <div class="ssp-system-header">
        <h2>{ssp['system-characteristics']['system-name']}</h2>
        {ssp['system-characteristics']['system-name-short'] && (
          <span class="ssp-short-name">({ssp['system-characteristics']['system-name-short']})</span>
        )}
        <div class="ssp-system-badges">
          <span class={`ssp-status-badge ssp-status--${ssp['system-characteristics'].status.state}`}>
            {ssp['system-characteristics'].status.state}
          </span>
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
      </div>

      <nav class="ssp-tabs" role="tablist" aria-label="SSP Sections">
        <button
          role="tab"
          aria-selected={activeTab === 'characteristics'}
          class={`ssp-tab ${activeTab === 'characteristics' ? 'active' : ''}`}
          onClick={() => setActiveTab('characteristics')}
        >
          System Characteristics
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'implementation'}
          class={`ssp-tab ${activeTab === 'implementation' ? 'active' : ''}`}
          onClick={() => setActiveTab('implementation')}
        >
          System Implementation
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'controls'}
          class={`ssp-tab ${activeTab === 'controls' ? 'active' : ''}`}
          onClick={() => setActiveTab('controls')}
        >
          Control Implementation
        </button>
      </nav>

      <div class="ssp-tab-content" role="tabpanel">
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
    </div>
  )
}

interface CharacteristicsPanelProps {
  characteristics: SystemCharacteristics
}

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
        <div class="ssp-impact-levels">
          <h4>Security Impact Level</h4>
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
        <div class="ssp-field">
          <span class="ssp-field-label">Authorization Boundary</span>
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
                <span class={`ssp-status-badge ssp-status--${comp.status.state}`}>
                  {comp.status.state}
                </span>
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
                              <span class={`ssp-impl-status ssp-impl-status--${bc['implementation-status'].state}`}>
                                {bc['implementation-status'].state}
                              </span>
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
