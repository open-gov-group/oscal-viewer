import { render, screen, fireEvent } from '@testing-library/preact'
import { AssessmentResultsView } from '@/components/assessment-results/assessment-results-view'
import type { AssessmentResults } from '@/types/oscal'

beforeEach(() => {
  history.replaceState(null, '', window.location.pathname)
})

// ============================================================
// Test Fixtures
// ============================================================

const minimalMetadata = {
  title: 'Test Assessment Results',
  'last-modified': '2026-01-15T00:00:00Z',
  version: '1.0',
  'oscal-version': '1.1.2',
}

const fullAR: AssessmentResults = {
  uuid: 'ar-001',
  metadata: minimalMetadata,
  'import-ap': { href: 'assessment-plan.json' },
  results: [
    {
      uuid: 'result-001',
      title: 'Annual Assessment',
      description: 'Annual security assessment.',
      start: '2026-01-01T00:00:00Z',
      end: '2026-01-15T00:00:00Z',
      findings: [
        {
          uuid: 'f-001',
          title: 'AC-1 Satisfied',
          description: 'Access control implemented.',
          target: { type: 'objective-id', 'target-id': 'ac-1', status: { state: 'satisfied' } },
        },
        {
          uuid: 'f-002',
          title: 'AU-2 Not Satisfied',
          description: 'Audit logging incomplete.',
          target: { type: 'objective-id', 'target-id': 'au-2', status: { state: 'not-satisfied' } },
          'related-observations': [{ 'observation-uuid': 'obs-001' }],
          'related-risks': [{ 'risk-uuid': 'risk-001' }],
        },
      ],
      observations: [
        {
          uuid: 'obs-001',
          description: 'Audit log gaps found.',
          methods: ['EXAMINE', 'INTERVIEW'],
          collected: '2026-01-10T00:00:00Z',
        },
      ],
      risks: [
        {
          uuid: 'risk-001',
          title: 'Incomplete Audit',
          description: 'Audit logging gaps.',
          status: 'open',
        },
      ],
    },
  ],
}

const minimalAR: AssessmentResults = {
  uuid: 'ar-min',
  metadata: minimalMetadata,
  results: [
    {
      uuid: 'r-min',
      title: 'Minimal Result',
      description: 'Minimal.',
      start: '2026-01-01T00:00:00Z',
    },
  ],
}

// ============================================================
// AssessmentResultsView - Metadata & Summary
// ============================================================

describe('AssessmentResultsView - Metadata & Summary', () => {
  it('renders metadata panel', () => {
    render(<AssessmentResultsView assessmentResults={fullAR} />)
    expect(screen.getByText('Test Assessment Results')).toBeInTheDocument()
  })

  it('shows import-ap reference', () => {
    render(<AssessmentResultsView assessmentResults={fullAR} />)
    expect(screen.getByText('assessment-plan.json')).toBeInTheDocument()
  })

  it('displays result count in stats', () => {
    const { container } = render(<AssessmentResultsView assessmentResults={fullAR} />)
    const stats = container.querySelector('.ar-stats')
    expect(stats?.textContent).toContain('Result')
    expect(stats?.textContent).toContain('1')
  })

  it('displays finding count in stats', () => {
    const { container } = render(<AssessmentResultsView assessmentResults={fullAR} />)
    const stats = container.querySelector('.ar-stats')
    expect(stats?.textContent).toContain('Finding')
  })

  it('displays observation count in stats', () => {
    const { container } = render(<AssessmentResultsView assessmentResults={fullAR} />)
    const stats = container.querySelector('.ar-stats')
    expect(stats?.textContent).toContain('Observation')
  })

  it('displays risk count in stats', () => {
    const { container } = render(<AssessmentResultsView assessmentResults={fullAR} />)
    const stats = container.querySelector('.ar-stats')
    expect(stats?.textContent).toContain('Risk')
  })

  it('shows satisfaction summary', () => {
    render(<AssessmentResultsView assessmentResults={fullAR} />)
    expect(screen.getByText('1 satisfied')).toBeInTheDocument()
    expect(screen.getByText('1 not satisfied')).toBeInTheDocument()
  })
})

// ============================================================
// AssessmentResultsView - Tabs
// ============================================================

describe('AssessmentResultsView - Tabs', () => {
  it('renders three tab buttons', () => {
    render(<AssessmentResultsView assessmentResults={fullAR} />)
    expect(screen.getByRole('tab', { name: 'Results' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Findings' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Observations & Risks' })).toBeInTheDocument()
  })

  it('has tablist role', () => {
    const { container } = render(<AssessmentResultsView assessmentResults={fullAR} />)
    expect(container.querySelector('[role="tablist"]')).toBeTruthy()
  })

  it('shows Results tab by default', () => {
    render(<AssessmentResultsView assessmentResults={fullAR} />)
    expect(screen.getByRole('tab', { name: 'Results' })).toHaveAttribute('aria-selected', 'true')
  })

  it('renders result accordion in Results tab', () => {
    render(<AssessmentResultsView assessmentResults={fullAR} />)
    expect(screen.getByText('Annual Assessment')).toBeInTheDocument()
  })

  it('switches to Findings tab on click', () => {
    render(<AssessmentResultsView assessmentResults={fullAR} />)
    fireEvent.click(screen.getByRole('tab', { name: 'Findings' }))
    expect(screen.getByRole('tab', { name: 'Findings' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByText('ac-1')).toBeInTheDocument()
    expect(screen.getByText('satisfied')).toBeInTheDocument()
  })

  it('switches to Observations & Risks tab on click', () => {
    render(<AssessmentResultsView assessmentResults={fullAR} />)
    fireEvent.click(screen.getByRole('tab', { name: 'Observations & Risks' }))
    expect(screen.getByRole('tab', { name: 'Observations & Risks' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByText('EXAMINE')).toBeInTheDocument()
    expect(screen.getByText('Incomplete Audit')).toBeInTheDocument()
  })
})

// ============================================================
// AssessmentResultsView - Results Tab
// ============================================================

describe('AssessmentResultsView - Results Tab', () => {
  it('renders result description when expanded', () => {
    render(<AssessmentResultsView assessmentResults={fullAR} />)
    fireEvent.click(screen.getByText('Annual Assessment'))
    expect(screen.getByText('Annual security assessment.')).toBeInTheDocument()
  })

  it('renders start and end dates when expanded', () => {
    render(<AssessmentResultsView assessmentResults={fullAR} />)
    fireEvent.click(screen.getByText('Annual Assessment'))
    expect(screen.getByText(/2026-01-01/)).toBeInTheDocument()
    expect(screen.getByText(/2026-01-15/)).toBeInTheDocument()
  })

  it('renders result finding count when expanded', () => {
    const { container } = render(<AssessmentResultsView assessmentResults={fullAR} />)
    fireEvent.click(screen.getByText('Annual Assessment'))
    const resultCounts = container.querySelector('.ar-result-counts')
    expect(resultCounts?.textContent).toContain('2')
    expect(resultCounts?.textContent).toContain('finding')
  })
})

// ============================================================
// AssessmentResultsView - Findings Tab
// ============================================================

describe('AssessmentResultsView - Findings Tab', () => {
  beforeEach(() => {
    render(<AssessmentResultsView assessmentResults={fullAR} />)
    fireEvent.click(screen.getByRole('tab', { name: 'Findings' }))
  })

  it('renders finding titles', () => {
    expect(screen.getByText('AC-1 Satisfied')).toBeInTheDocument()
    expect(screen.getByText('AU-2 Not Satisfied')).toBeInTheDocument()
  })

  it('renders finding target IDs', () => {
    expect(screen.getByText('ac-1')).toBeInTheDocument()
    expect(screen.getByText('au-2')).toBeInTheDocument()
  })

  it('renders finding satisfaction status', () => {
    expect(screen.getByText('satisfied')).toBeInTheDocument()
    expect(screen.getByText('not-satisfied')).toBeInTheDocument()
  })

  it('renders related observation count', () => {
    expect(screen.getByText(/1 related observation/)).toBeInTheDocument()
  })

  it('renders related risk count', () => {
    expect(screen.getByText(/1 related risk/)).toBeInTheDocument()
  })
})

// ============================================================
// AssessmentResultsView - Observations & Risks Tab
// ============================================================

describe('AssessmentResultsView - Observations & Risks Tab', () => {
  beforeEach(() => {
    render(<AssessmentResultsView assessmentResults={fullAR} />)
    fireEvent.click(screen.getByRole('tab', { name: 'Observations & Risks' }))
  })

  it('renders observation description', () => {
    expect(screen.getByText('Audit log gaps found.')).toBeInTheDocument()
  })

  it('renders method badges', () => {
    expect(screen.getByText('EXAMINE')).toBeInTheDocument()
    expect(screen.getByText('INTERVIEW')).toBeInTheDocument()
  })

  it('renders collected date', () => {
    expect(screen.getByText(/2026-01-10/)).toBeInTheDocument()
  })

  it('renders risk title', () => {
    expect(screen.getByText('Incomplete Audit')).toBeInTheDocument()
  })

  it('renders risk description', () => {
    expect(screen.getByText('Audit logging gaps.')).toBeInTheDocument()
  })

  it('renders risk status', () => {
    expect(screen.getByText('open')).toBeInTheDocument()
  })
})

// ============================================================
// AssessmentResultsView - Tab Keyboard Navigation
// ============================================================

describe('AssessmentResultsView - Tab Keyboard Navigation', () => {
  it('ArrowRight moves from first to second tab', () => {
    const { container } = render(<AssessmentResultsView assessmentResults={fullAR} />)
    const firstTab = container.querySelector('#ar-tab-results')!
    fireEvent.keyDown(firstTab, { key: 'ArrowRight' })
    expect(screen.getByRole('tab', { name: 'Findings' })).toHaveAttribute('aria-selected', 'true')
  })

  it('ArrowRight wraps from last tab to first tab', () => {
    render(<AssessmentResultsView assessmentResults={fullAR} />)
    fireEvent.click(screen.getByRole('tab', { name: 'Observations & Risks' }))
    const lastTab = screen.getByRole('tab', { name: 'Observations & Risks' })
    fireEvent.keyDown(lastTab, { key: 'ArrowRight' })
    expect(screen.getByRole('tab', { name: 'Results' })).toHaveAttribute('aria-selected', 'true')
  })

  it('ArrowLeft wraps from first tab to last tab', () => {
    const { container } = render(<AssessmentResultsView assessmentResults={fullAR} />)
    const firstTab = container.querySelector('#ar-tab-results')!
    fireEvent.keyDown(firstTab, { key: 'ArrowLeft' })
    expect(screen.getByRole('tab', { name: 'Observations & Risks' })).toHaveAttribute('aria-selected', 'true')
  })

  it('Home key moves to first tab', () => {
    render(<AssessmentResultsView assessmentResults={fullAR} />)
    fireEvent.click(screen.getByRole('tab', { name: 'Observations & Risks' }))
    const lastTab = screen.getByRole('tab', { name: 'Observations & Risks' })
    fireEvent.keyDown(lastTab, { key: 'Home' })
    expect(screen.getByRole('tab', { name: 'Results' })).toHaveAttribute('aria-selected', 'true')
  })

  it('End key moves to last tab', () => {
    const { container } = render(<AssessmentResultsView assessmentResults={fullAR} />)
    const firstTab = container.querySelector('#ar-tab-results')!
    fireEvent.keyDown(firstTab, { key: 'End' })
    expect(screen.getByRole('tab', { name: 'Observations & Risks' })).toHaveAttribute('aria-selected', 'true')
  })

  it('active tab has tabIndex 0, inactive tabs have tabIndex -1', () => {
    const { container } = render(<AssessmentResultsView assessmentResults={fullAR} />)
    const tabs = container.querySelectorAll('[role="tab"]')
    expect(tabs[0].getAttribute('tabindex')).toBe('0')
    expect(tabs[1].getAttribute('tabindex')).toBe('-1')
    expect(tabs[2].getAttribute('tabindex')).toBe('-1')
  })

  it('each tab has aria-controls pointing to tabpanel', () => {
    const { container } = render(<AssessmentResultsView assessmentResults={fullAR} />)
    const tabs = container.querySelectorAll('[role="tab"]')
    expect(tabs[0].getAttribute('aria-controls')).toBe('ar-tabpanel-results')
    expect(tabs[1].getAttribute('aria-controls')).toBe('ar-tabpanel-findings')
    expect(tabs[2].getAttribute('aria-controls')).toBe('ar-tabpanel-observations')
  })

  it('tabpanel has aria-labelledby pointing to active tab', () => {
    const { container } = render(<AssessmentResultsView assessmentResults={fullAR} />)
    const tabpanel = container.querySelector('[role="tabpanel"]')
    expect(tabpanel?.getAttribute('aria-labelledby')).toBe('ar-tab-results')
  })

  it('tabpanel aria-labelledby updates when tab changes', () => {
    const { container } = render(<AssessmentResultsView assessmentResults={fullAR} />)
    fireEvent.click(screen.getByRole('tab', { name: 'Findings' }))
    const tabpanel = container.querySelector('[role="tabpanel"]')
    expect(tabpanel?.getAttribute('aria-labelledby')).toBe('ar-tab-findings')
  })
})

// ============================================================
// AssessmentResultsView - Minimal / Edge Cases
// ============================================================

describe('AssessmentResultsView - Edge Cases', () => {
  it('renders minimal AR without errors', () => {
    render(<AssessmentResultsView assessmentResults={minimalAR} />)
    expect(screen.getByText('Minimal Result')).toBeInTheDocument()
  })

  it('does not render import-ap when absent', () => {
    render(<AssessmentResultsView assessmentResults={minimalAR} />)
    expect(screen.queryByText('Assessment Plan:')).not.toBeInTheDocument()
  })

  it('does not show satisfaction summary when no findings', () => {
    render(<AssessmentResultsView assessmentResults={minimalAR} />)
    expect(screen.queryByText(/satisfied/)).not.toBeInTheDocument()
  })

  it('shows empty message in Findings tab when no findings', () => {
    render(<AssessmentResultsView assessmentResults={minimalAR} />)
    fireEvent.click(screen.getByRole('tab', { name: 'Findings' }))
    expect(screen.getByText('No findings recorded.')).toBeInTheDocument()
  })

  it('shows empty message in Observations tab when no observations or risks', () => {
    render(<AssessmentResultsView assessmentResults={minimalAR} />)
    fireEvent.click(screen.getByRole('tab', { name: 'Observations & Risks' }))
    expect(screen.getByText('No observations or risks recorded.')).toBeInTheDocument()
  })
})
