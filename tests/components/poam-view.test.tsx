import { render, screen, fireEvent } from '@testing-library/preact'
import { PoamView } from '@/components/poam/poam-view'
import type { PlanOfActionAndMilestones } from '@/types/oscal'

// ============================================================
// Test Fixtures
// ============================================================

const minimalMetadata = {
  title: 'Test POA&M',
  'last-modified': '2026-02-01T00:00:00Z',
  version: '1.0',
  'oscal-version': '1.1.2',
}

const fullPoam: PlanOfActionAndMilestones = {
  uuid: 'poam-001',
  metadata: minimalMetadata,
  'import-ssp': { href: 'ssp.json' },
  findings: [
    {
      uuid: 'pf-001',
      title: 'Audit Gap',
      description: 'Audit logging incomplete.',
      target: { type: 'objective-id', 'target-id': 'au-2', status: { state: 'not-satisfied' } },
    },
  ],
  risks: [
    {
      uuid: 'pr-001',
      title: 'Audit Risk',
      description: 'Security incidents may go undetected.',
      status: 'open',
    },
  ],
  'poam-items': [
    {
      uuid: 'pi-001',
      title: 'Fix Audit Logging',
      description: 'Configure complete audit event capture.',
      'related-findings': [{ 'finding-uuid': 'pf-001111' }],
      'related-risks': [{ 'risk-uuid': 'pr-001111' }],
      milestones: [
        {
          uuid: 'ms-001',
          title: 'Config Update',
          description: 'Update audit configuration.',
          schedule: { tasks: [{ uuid: 't1', title: 'Configure events', start: '2026-02-15', end: '2026-03-01' }] },
        },
        { uuid: 'ms-002', title: 'Verification' },
      ],
      props: [{ name: 'priority', value: 'high' }],
    },
    {
      uuid: 'pi-002',
      title: 'Training Update',
      description: 'Update security training.',
    },
  ],
}

const minimalPoam: PlanOfActionAndMilestones = {
  uuid: 'poam-min',
  metadata: minimalMetadata,
  'poam-items': [
    { uuid: 'pi-min', title: 'Minimal Item', description: 'Minimal.' },
  ],
}

// ============================================================
// PoamView - Metadata & Summary
// ============================================================

describe('PoamView - Metadata & Summary', () => {
  it('renders metadata panel', () => {
    render(<PoamView poam={fullPoam} />)
    expect(screen.getByText('Test POA&M')).toBeInTheDocument()
  })

  it('shows import-ssp reference', () => {
    render(<PoamView poam={fullPoam} />)
    expect(screen.getByText('ssp.json')).toBeInTheDocument()
  })

  it('shows import SSP label', () => {
    render(<PoamView poam={fullPoam} />)
    expect(screen.getByText('Import SSP:')).toBeInTheDocument()
  })

  it('displays POA&M item count in stats', () => {
    const { container } = render(<PoamView poam={fullPoam} />)
    const stats = container.querySelector('.poam-stats')
    expect(stats?.textContent).toContain('POA&M Item')
    expect(stats?.textContent).toContain('2')
  })

  it('displays finding count in stats when present', () => {
    const { container } = render(<PoamView poam={fullPoam} />)
    const stats = container.querySelector('.poam-stats')
    expect(stats?.textContent).toContain('Finding')
  })

  it('displays risk count in stats when present', () => {
    const { container } = render(<PoamView poam={fullPoam} />)
    const stats = container.querySelector('.poam-stats')
    expect(stats?.textContent).toContain('Risk')
  })

  it('displays milestone count in stats when present', () => {
    const { container } = render(<PoamView poam={fullPoam} />)
    const stats = container.querySelector('.poam-stats')
    expect(stats?.textContent).toContain('Milestone')
  })
})

// ============================================================
// PoamView - POA&M Items Accordion
// ============================================================

describe('PoamView - POA&M Items', () => {
  it('renders POA&M Items accordion', () => {
    const { container } = render(<PoamView poam={fullPoam} />)
    const trigger = container.querySelector('#poam-items-trigger')
    expect(trigger).toBeTruthy()
    expect(trigger?.textContent).toContain('POA&M Items')
  })

  it('renders POA&M item titles', () => {
    render(<PoamView poam={fullPoam} />)
    expect(screen.getByText('Fix Audit Logging')).toBeInTheDocument()
    expect(screen.getByText('Training Update')).toBeInTheDocument()
  })

  it('renders POA&M item description when expanded', () => {
    render(<PoamView poam={fullPoam} />)
    fireEvent.click(screen.getByText('Fix Audit Logging'))
    expect(screen.getByText('Configure complete audit event capture.')).toBeInTheDocument()
  })

  it('renders related findings label when expanded', () => {
    render(<PoamView poam={fullPoam} />)
    fireEvent.click(screen.getByText('Fix Audit Logging'))
    expect(screen.getByText('Related Findings:')).toBeInTheDocument()
  })

  it('renders related risks label when expanded', () => {
    render(<PoamView poam={fullPoam} />)
    fireEvent.click(screen.getByText('Fix Audit Logging'))
    expect(screen.getByText('Related Risks:')).toBeInTheDocument()
  })

  it('renders truncated finding UUID', () => {
    render(<PoamView poam={fullPoam} />)
    fireEvent.click(screen.getByText('Fix Audit Logging'))
    // UUID "pf-001111" truncated to first 8 chars: "pf-00111" + "..."
    expect(screen.getByText('pf-00111...')).toBeInTheDocument()
  })

  it('renders milestones heading within item', () => {
    render(<PoamView poam={fullPoam} />)
    fireEvent.click(screen.getByText('Fix Audit Logging'))
    expect(screen.getByRole('heading', { name: 'Milestones', level: 5 })).toBeInTheDocument()
  })

  it('renders milestone titles', () => {
    render(<PoamView poam={fullPoam} />)
    fireEvent.click(screen.getByText('Fix Audit Logging'))
    expect(screen.getByText('Config Update')).toBeInTheDocument()
    expect(screen.getByText('Verification')).toBeInTheDocument()
  })

  it('renders milestone description', () => {
    render(<PoamView poam={fullPoam} />)
    fireEvent.click(screen.getByText('Fix Audit Logging'))
    expect(screen.getByText('Update audit configuration.')).toBeInTheDocument()
  })

  it('renders milestone schedule task', () => {
    render(<PoamView poam={fullPoam} />)
    fireEvent.click(screen.getByText('Fix Audit Logging'))
    expect(screen.getByText('Configure events')).toBeInTheDocument()
    expect(screen.getByText(/2026-02-15/)).toBeInTheDocument()
    expect(screen.getByText(/2026-03-01/)).toBeInTheDocument()
  })

  it('renders property badges for POA&M item', () => {
    render(<PoamView poam={fullPoam} />)
    fireEvent.click(screen.getByText('Fix Audit Logging'))
    expect(screen.getByText('priority')).toBeInTheDocument()
    expect(screen.getByText('high')).toBeInTheDocument()
  })
})

// ============================================================
// PoamView - Findings Section
// ============================================================

describe('PoamView - Findings', () => {
  it('renders findings accordion', () => {
    render(<PoamView poam={fullPoam} />)
    expect(screen.getByText('Findings')).toBeInTheDocument()
  })

  it('renders finding title when expanded', () => {
    render(<PoamView poam={fullPoam} />)
    fireEvent.click(screen.getByText('Findings'))
    expect(screen.getByText('Audit Gap')).toBeInTheDocument()
  })

  it('renders finding target ID', () => {
    render(<PoamView poam={fullPoam} />)
    fireEvent.click(screen.getByText('Findings'))
    expect(screen.getByText('au-2')).toBeInTheDocument()
  })

  it('renders finding target status', () => {
    render(<PoamView poam={fullPoam} />)
    fireEvent.click(screen.getByText('Findings'))
    expect(screen.getByText('not-satisfied')).toBeInTheDocument()
  })
})

// ============================================================
// PoamView - Risks Section
// ============================================================

describe('PoamView - Risks', () => {
  it('renders risks accordion', () => {
    render(<PoamView poam={fullPoam} />)
    expect(screen.getByText('Risks')).toBeInTheDocument()
  })

  it('renders risk title when expanded', () => {
    render(<PoamView poam={fullPoam} />)
    fireEvent.click(screen.getByText('Risks'))
    expect(screen.getByText('Audit Risk')).toBeInTheDocument()
  })

  it('renders risk status', () => {
    render(<PoamView poam={fullPoam} />)
    fireEvent.click(screen.getByText('Risks'))
    expect(screen.getByText('open')).toBeInTheDocument()
  })

  it('renders risk description when expanded', () => {
    render(<PoamView poam={fullPoam} />)
    fireEvent.click(screen.getByText('Risks'))
    expect(screen.getByText('Security incidents may go undetected.')).toBeInTheDocument()
  })
})

// ============================================================
// PoamView - Minimal / Edge Cases
// ============================================================

describe('PoamView - Edge Cases', () => {
  it('renders minimal POA&M without errors', () => {
    render(<PoamView poam={minimalPoam} />)
    expect(screen.getByText('Minimal Item')).toBeInTheDocument()
  })

  it('does not show findings section when empty', () => {
    render(<PoamView poam={minimalPoam} />)
    expect(screen.queryByText('Findings')).not.toBeInTheDocument()
  })

  it('does not show risks section when empty', () => {
    render(<PoamView poam={minimalPoam} />)
    expect(screen.queryByText('Risks')).not.toBeInTheDocument()
  })

  it('does not show import-ssp when absent', () => {
    render(<PoamView poam={minimalPoam} />)
    expect(screen.queryByText('Import SSP:')).not.toBeInTheDocument()
  })

  it('does not show milestones when item has none', () => {
    render(<PoamView poam={minimalPoam} />)
    fireEvent.click(screen.getByText('Minimal Item'))
    expect(screen.queryByText('Milestones')).not.toBeInTheDocument()
  })
})
