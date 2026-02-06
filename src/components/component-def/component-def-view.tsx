import { useState, useMemo } from 'preact/hooks'
import type { FunctionComponent } from 'preact'
import type { ComponentDefinition, DefinedComponent, ControlImplementation, ImplementedRequirement } from '@/types/oscal'
import { MetadataPanel } from '@/components/shared/metadata-panel'
import { PropertyList } from '@/components/shared/property-badge'

interface ComponentDefViewProps {
  componentDef: ComponentDefinition
}

export const ComponentDefView: FunctionComponent<ComponentDefViewProps> = ({ componentDef }) => {
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null)

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

  const selectedComponent = useMemo(() => {
    if (!selectedComponentId) return null
    return componentDef.components?.find(c => c.uuid === selectedComponentId) ?? null
  }, [componentDef, selectedComponentId])

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
          <aside class="compdef-sidebar" aria-label="Component list">
            <ul class="compdef-component-list" role="listbox" aria-label="Components">
              {componentDef.components.map(comp => (
                <li key={comp.uuid} role="option" aria-selected={selectedComponentId === comp.uuid}>
                  <button
                    class={`compdef-component-item ${selectedComponentId === comp.uuid ? 'selected' : ''}`}
                    onClick={() => setSelectedComponentId(comp.uuid)}
                  >
                    <span class="compdef-type-badge">{comp.type}</span>
                    <span class="compdef-component-title">{comp.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          <main class="compdef-content">
            {selectedComponent ? (
              <ComponentDetail component={selectedComponent} />
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
    </div>
  )
}

interface ComponentDetailProps {
  component: DefinedComponent
}

const ComponentDetail: FunctionComponent<ComponentDetailProps> = ({ component }) => {
  return (
    <article class="compdef-detail" aria-labelledby={`comp-${component.uuid}-title`}>
      <header class="compdef-detail-header">
        <span class="compdef-type-badge">{component.type}</span>
        <h2 id={`comp-${component.uuid}-title`}>{component.title}</h2>
      </header>

      <p class="compdef-description">{component.description}</p>

      {component.purpose && (
        <div class="compdef-purpose">
          <strong>Purpose:</strong> {component.purpose}
        </div>
      )}

      {component.props && component.props.length > 0 && (
        <PropertyList props={component.props} />
      )}

      {component['responsible-roles'] && component['responsible-roles'].length > 0 && (
        <section class="compdef-subsection">
          <h3>Responsible Roles</h3>
          <div class="compdef-roles-list">
            {component['responsible-roles'].map(role => (
              <span key={role['role-id']} class="compdef-role-badge">{role['role-id']}</span>
            ))}
          </div>
        </section>
      )}

      {component['control-implementations'] && component['control-implementations'].length > 0 && (
        <section class="compdef-subsection" aria-labelledby={`comp-${component.uuid}-ci`}>
          <h3 id={`comp-${component.uuid}-ci`}>Control Implementations</h3>
          {component['control-implementations'].map(ci => (
            <ControlImplementationView key={ci.uuid} implementation={ci} />
          ))}
        </section>
      )}
    </article>
  )
}

interface ControlImplementationViewProps {
  implementation: ControlImplementation
}

const ControlImplementationView: FunctionComponent<ControlImplementationViewProps> = ({ implementation }) => {
  return (
    <div class="compdef-ci">
      <div class="compdef-ci-header">
        <span class="compdef-ci-source">Source: <code>{implementation.source}</code></span>
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
