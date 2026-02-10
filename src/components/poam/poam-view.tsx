/**
 * PoamView — View for OSCAL Plan of Action and Milestones (POA&M) documents.
 *
 * Displays POA&M items with their milestones, related findings, and risks.
 * Uses accordion pattern for POA&M items and metadata panel for document info.
 */
import { useMemo } from 'preact/hooks'
import type { FunctionComponent } from 'preact'
import type { PlanOfActionAndMilestones, PoamItem } from '@/types/oscal'
import { MetadataPanel } from '@/components/shared/metadata-panel'
import { Accordion, AccordionGroup } from '@/components/shared/accordion'
import { PropertyList } from '@/components/shared/property-badge'
import { ResourcePanel } from '@/components/shared/resource-panel'

interface PoamViewProps {
  poam: PlanOfActionAndMilestones
  onNavigate?: (url: string) => void
}

export const PoamView: FunctionComponent<PoamViewProps> = ({ poam }) => {
  const stats = useMemo(() => ({
    items: poam['poam-items'].length,
    findings: poam.findings?.length ?? 0,
    risks: poam.risks?.length ?? 0,
    observations: poam.observations?.length ?? 0,
    totalMilestones: poam['poam-items'].reduce((sum, item) => sum + (item.milestones?.length ?? 0), 0),
  }), [poam])

  return (
    <div class="poam-view">
      <MetadataPanel metadata={poam.metadata} />

      {poam['import-ssp'] && (
        <div class="poam-import-ssp">
          <span class="poam-import-label">Import SSP:</span>
          <code>{poam['import-ssp'].href}</code>
        </div>
      )}

      <div class="poam-stats">
        <span class="stat"><strong>{stats.items}</strong> POA&M Item{stats.items !== 1 ? 's' : ''}</span>
        {stats.findings > 0 && <span class="stat"><strong>{stats.findings}</strong> Finding{stats.findings !== 1 ? 's' : ''}</span>}
        {stats.risks > 0 && <span class="stat"><strong>{stats.risks}</strong> Risk{stats.risks !== 1 ? 's' : ''}</span>}
        {stats.totalMilestones > 0 && <span class="stat"><strong>{stats.totalMilestones}</strong> Milestone{stats.totalMilestones !== 1 ? 's' : ''}</span>}
      </div>

      <Accordion
        id="poam-items"
        title="POA&M Items"
        count={stats.items}
        defaultOpen={true}
        headingLevel={3}
      >
        <AccordionGroup>
          {poam['poam-items'].map(item => (
            <Accordion
              key={item.uuid}
              id={`poam-item-${item.uuid}`}
              title={item.title}
              count={item.milestones?.length}
              headingLevel={4}
            >
              <PoamItemDetail item={item} />
            </Accordion>
          ))}
        </AccordionGroup>
      </Accordion>

      {poam.findings && poam.findings.length > 0 && (
        <Accordion
          id="poam-findings"
          title="Findings"
          count={poam.findings.length}
          headingLevel={3}
        >
          <div class="poam-findings-list">
            {poam.findings.map(f => (
              <div key={f.uuid} class="poam-finding-card">
                <div class="poam-finding-header">
                  <code>{f.target['target-id']}</code>
                  <span class={`ar-finding-status ar-status--${f.target.status.state}`}>
                    {f.target.status.state}
                  </span>
                </div>
                <strong>{f.title}</strong>
                <p>{f.description}</p>
              </div>
            ))}
          </div>
        </Accordion>
      )}

      {poam.risks && poam.risks.length > 0 && (
        <Accordion
          id="poam-risks"
          title="Risks"
          count={poam.risks.length}
          headingLevel={3}
        >
          <div class="poam-risks-list">
            {poam.risks.map(r => (
              <div key={r.uuid} class="poam-risk-card">
                <strong>{r.title}</strong>
                <span class="ar-risk-status">{r.status}</span>
                <p>{r.description}</p>
              </div>
            ))}
          </div>
        </Accordion>
      )}

      {poam['back-matter']?.resources && poam['back-matter'].resources.length > 0 && (
        <ResourcePanel backMatter={poam['back-matter']} />
      )}
    </div>
  )
}

const PoamItemDetail: FunctionComponent<{ item: PoamItem }> = ({ item }) => (
  <div class="poam-item-detail">
    <p class="poam-item-description">{item.description}</p>

    {item['related-findings'] && item['related-findings'].length > 0 && (
      <div class="poam-related">
        <span class="poam-related-label">Related Findings:</span>
        {item['related-findings'].map((rf, i) => (
          <code key={i} class="poam-related-uuid">{rf['finding-uuid'].slice(0, 8)}...</code>
        ))}
      </div>
    )}

    {item['related-risks'] && item['related-risks'].length > 0 && (
      <div class="poam-related">
        <span class="poam-related-label">Related Risks:</span>
        {item['related-risks'].map((rr, i) => (
          <code key={i} class="poam-related-uuid">{rr['risk-uuid'].slice(0, 8)}...</code>
        ))}
      </div>
    )}

    {item.milestones && item.milestones.length > 0 && (
      <div class="poam-milestones">
        <h5>Milestones</h5>
        {item.milestones.map(ms => (
          <div key={ms.uuid} class="poam-milestone-card">
            <strong>{ms.title}</strong>
            {ms.description && <p>{ms.description}</p>}
            {ms.schedule?.tasks && ms.schedule.tasks.length > 0 && (
              <div class="poam-milestone-tasks">
                {ms.schedule.tasks.map(task => (
                  <span key={task.uuid} class="poam-task">
                    {task.title}
                    {task.start && <span class="poam-task-date"> ({task.start}{task.end ? ` - ${task.end}` : ''})</span>}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    )}

    {item.props && item.props.length > 0 && <PropertyList props={item.props} />}
  </div>
)
