/**
 * AssessmentResultsView — Tabbed view for OSCAL Assessment Results documents.
 *
 * Three tabs with WAI-ARIA tab pattern:
 * - Results: Assessment result entries with dates and summary counts
 * - Findings: Control findings with satisfaction status
 * - Observations & Risks: Assessment observations and identified risks
 */
import { useState, useMemo, useEffect } from 'preact/hooks'
import type { FunctionComponent } from 'preact'
import type { AssessmentResults, AssessmentResult, Finding, Observation, Risk } from '@/types/oscal'
import { useDeepLink } from '@/hooks/use-deep-link'
import { MetadataPanel } from '@/components/shared/metadata-panel'
import { Accordion, AccordionGroup } from '@/components/shared/accordion'
import { ResourcePanel } from '@/components/shared/resource-panel'

interface AssessmentResultsViewProps {
  assessmentResults: AssessmentResults
}

type ArTab = 'results' | 'findings' | 'observations'

const tabDefs: Array<{ id: ArTab; label: string }> = [
  { id: 'results', label: 'Results' },
  { id: 'findings', label: 'Findings' },
  { id: 'observations', label: 'Observations & Risks' },
]

const validTabs: ArTab[] = ['results', 'findings', 'observations']

export const AssessmentResultsView: FunctionComponent<AssessmentResultsViewProps> = ({ assessmentResults }) => {
  const { selectedId: hashTab, setSelectedId: setHashTab } = useDeepLink('ar')
  const initialTab = hashTab && validTabs.includes(hashTab as ArTab) ? hashTab as ArTab : 'results'
  const [activeTab, setActiveTabState] = useState<ArTab>(initialTab)

  const setActiveTab = (tab: ArTab) => {
    setActiveTabState(tab)
    setHashTab(tab)
  }

  useEffect(() => {
    if (hashTab && validTabs.includes(hashTab as ArTab)) {
      setActiveTabState(hashTab as ArTab)
    }
  }, [hashTab])

  // Aggregate all findings, observations, risks across all results
  const allFindings = useMemo(() =>
    assessmentResults.results.flatMap(r => r.findings ?? []),
    [assessmentResults]
  )
  const allObservations = useMemo(() =>
    assessmentResults.results.flatMap(r => r.observations ?? []),
    [assessmentResults]
  )
  const allRisks = useMemo(() =>
    assessmentResults.results.flatMap(r => r.risks ?? []),
    [assessmentResults]
  )

  const stats = useMemo(() => ({
    results: assessmentResults.results.length,
    findings: allFindings.length,
    observations: allObservations.length,
    risks: allRisks.length,
    satisfied: allFindings.filter(f => f.target.status.state === 'satisfied').length,
    notSatisfied: allFindings.filter(f => f.target.status.state === 'not-satisfied').length,
  }), [assessmentResults, allFindings, allObservations, allRisks])

  const handleTabKeyDown = (e: KeyboardEvent, currentTab: ArTab) => {
    const tabIds = tabDefs.map(t => t.id)
    const currentIndex = tabIds.indexOf(currentTab)
    let newIndex = currentIndex

    if (e.key === 'ArrowRight') newIndex = (currentIndex + 1) % tabIds.length
    else if (e.key === 'ArrowLeft') newIndex = (currentIndex - 1 + tabIds.length) % tabIds.length
    else if (e.key === 'Home') newIndex = 0
    else if (e.key === 'End') newIndex = tabIds.length - 1
    else return

    e.preventDefault()
    setActiveTab(tabIds[newIndex])
    document.getElementById(`ar-tab-${tabIds[newIndex]}`)?.focus()
  }

  return (
    <div class="ar-view">
      <MetadataPanel metadata={assessmentResults.metadata} />

      {assessmentResults['import-ap'] && (
        <div class="ar-import-ap">
          <span class="ar-import-label">Assessment Plan:</span>
          <code>{assessmentResults['import-ap'].href}</code>
        </div>
      )}

      <div class="ar-stats">
        <span class="stat"><strong>{stats.results}</strong> Result{stats.results !== 1 ? 's' : ''}</span>
        <span class="stat"><strong>{stats.findings}</strong> Finding{stats.findings !== 1 ? 's' : ''}</span>
        <span class="stat"><strong>{stats.observations}</strong> Observation{stats.observations !== 1 ? 's' : ''}</span>
        <span class="stat"><strong>{stats.risks}</strong> Risk{stats.risks !== 1 ? 's' : ''}</span>
      </div>

      {stats.findings > 0 && (
        <div class="ar-satisfaction-summary">
          <span class="ar-satisfaction ar-satisfied">{stats.satisfied} satisfied</span>
          <span class="ar-satisfaction ar-not-satisfied">{stats.notSatisfied} not satisfied</span>
        </div>
      )}

      <nav class="ar-tabs" role="tablist" aria-label="Assessment Results Sections">
        {tabDefs.map(tab => (
          <button
            key={tab.id}
            id={`ar-tab-${tab.id}`}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`ar-tabpanel-${tab.id}`}
            tabIndex={activeTab === tab.id ? 0 : -1}
            class={`ar-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            onKeyDown={(e) => handleTabKeyDown(e as unknown as KeyboardEvent, tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div id={`ar-tabpanel-${activeTab}`} class="ar-tab-content" role="tabpanel" aria-labelledby={`ar-tab-${activeTab}`}>
        {activeTab === 'results' && <ResultsPanel results={assessmentResults.results} />}
        {activeTab === 'findings' && <FindingsPanel findings={allFindings} />}
        {activeTab === 'observations' && <ObservationsRisksPanel observations={allObservations} risks={allRisks} />}
      </div>

      {assessmentResults['back-matter']?.resources && assessmentResults['back-matter'].resources.length > 0 && (
        <ResourcePanel backMatter={assessmentResults['back-matter']} />
      )}
    </div>
  )
}

// --- Sub-components ---

const ResultsPanel: FunctionComponent<{ results: AssessmentResult[] }> = ({ results }) => (
  <AccordionGroup>
    {results.map(result => (
      <Accordion
        key={result.uuid}
        id={`ar-result-${result.uuid}`}
        title={result.title}
        count={(result.findings?.length ?? 0) + (result.observations?.length ?? 0) + (result.risks?.length ?? 0)}
        headingLevel={3}
      >
        <div class="ar-result-card">
          <p class="ar-result-description">{result.description}</p>
          <div class="ar-result-dates">
            <span class="ar-date"><strong>Start:</strong> {result.start}</span>
            {result.end && <span class="ar-date"><strong>End:</strong> {result.end}</span>}
          </div>
          <div class="ar-result-counts">
            {result.findings && <span class="stat"><strong>{result.findings.length}</strong> finding{result.findings.length !== 1 ? 's' : ''}</span>}
            {result.observations && <span class="stat"><strong>{result.observations.length}</strong> observation{result.observations.length !== 1 ? 's' : ''}</span>}
            {result.risks && <span class="stat"><strong>{result.risks.length}</strong> risk{result.risks.length !== 1 ? 's' : ''}</span>}
          </div>
          {result.remarks && <p class="ar-remarks">{result.remarks}</p>}
        </div>
      </Accordion>
    ))}
  </AccordionGroup>
)

const FindingsPanel: FunctionComponent<{ findings: Finding[] }> = ({ findings }) => (
  <div class="ar-findings-list">
    {findings.length === 0 ? (
      <p class="ar-empty">No findings recorded.</p>
    ) : (
      findings.map(finding => (
        <div key={finding.uuid} class="ar-finding-card">
          <div class="ar-finding-header">
            <code class="ar-control-id">{finding.target['target-id']}</code>
            <span class={`ar-finding-status ar-status--${finding.target.status.state}`}>
              {finding.target.status.state}
            </span>
          </div>
          <strong class="ar-finding-title">{finding.title}</strong>
          <p class="ar-finding-description">{finding.description}</p>
          {finding['related-observations'] && finding['related-observations'].length > 0 && (
            <span class="ar-related-count">{finding['related-observations'].length} related observation{finding['related-observations'].length !== 1 ? 's' : ''}</span>
          )}
          {finding['related-risks'] && finding['related-risks'].length > 0 && (
            <span class="ar-related-count">{finding['related-risks'].length} related risk{finding['related-risks'].length !== 1 ? 's' : ''}</span>
          )}
        </div>
      ))
    )}
  </div>
)

const ObservationsRisksPanel: FunctionComponent<{ observations: Observation[]; risks: Risk[] }> = ({ observations, risks }) => (
  <div class="ar-obs-risks">
    {observations.length > 0 && (
      <section aria-labelledby="ar-observations-heading">
        <h4 id="ar-observations-heading">Observations ({observations.length})</h4>
        <div class="ar-observations-list">
          {observations.map(obs => (
            <div key={obs.uuid} class="ar-observation-card">
              {obs.title && <strong>{obs.title}</strong>}
              <p>{obs.description}</p>
              <div class="ar-methods">
                {obs.methods.map(m => (
                  <span key={m} class="ar-method-badge">{m}</span>
                ))}
              </div>
              <span class="ar-collected">Collected: {obs.collected}</span>
            </div>
          ))}
        </div>
      </section>
    )}
    {risks.length > 0 && (
      <section aria-labelledby="ar-risks-heading">
        <h4 id="ar-risks-heading">Risks ({risks.length})</h4>
        <div class="ar-risks-list">
          {risks.map(risk => (
            <div key={risk.uuid} class="ar-risk-card">
              <div class="ar-risk-header">
                <strong>{risk.title}</strong>
                <span class="ar-risk-status">{risk.status}</span>
              </div>
              <p>{risk.description}</p>
            </div>
          ))}
        </div>
      </section>
    )}
    {observations.length === 0 && risks.length === 0 && (
      <p class="ar-empty">No observations or risks recorded.</p>
    )}
  </div>
)
