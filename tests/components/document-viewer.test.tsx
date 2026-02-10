import { render, screen, waitFor } from '@testing-library/preact'
import { DocumentViewer } from '@/components/document-viewer'
import type { OscalDocumentData } from '@/types/oscal'

// ============================================================
// Test Fixtures
// ============================================================

const minimalMetadata = {
  title: 'Test Document',
  'last-modified': '2026-02-06T00:00:00Z',
  version: '1.0',
  'oscal-version': '1.1.2',
}

const catalogData: OscalDocumentData = {
  type: 'catalog',
  document: {
    uuid: 'cat-001',
    metadata: minimalMetadata,
    groups: [
      {
        id: 'ac',
        title: 'Access Control',
        controls: [{ id: 'ac-1', title: 'Test Control' }],
      },
    ],
  },
}

const profileData: OscalDocumentData = {
  type: 'profile',
  document: {
    uuid: 'prof-001',
    metadata: { ...minimalMetadata, title: 'Test Profile' },
    imports: [{ href: '#catalog' }],
  },
}

const componentDefData: OscalDocumentData = {
  type: 'component-definition',
  document: {
    uuid: 'cd-001',
    metadata: { ...minimalMetadata, title: 'Test Component Def' },
    components: [
      {
        uuid: 'comp-001',
        type: 'software',
        title: 'Test App',
        description: 'A test application',
      },
    ],
  },
}

const assessmentResultsData: OscalDocumentData = {
  type: 'assessment-results',
  document: {
    uuid: 'ar-001',
    metadata: { ...minimalMetadata, title: 'Test Assessment Results' },
    results: [
      {
        uuid: 'result-001',
        title: 'Test Result',
        description: 'A test assessment result',
        start: '2026-01-01T00:00:00Z',
        findings: [
          {
            uuid: 'f-001',
            title: 'Test Finding',
            description: 'A finding',
            target: { type: 'objective-id', 'target-id': 'ac-1', status: { state: 'satisfied' } },
          },
        ],
      },
    ],
  },
}

const poamData: OscalDocumentData = {
  type: 'plan-of-action-and-milestones',
  document: {
    uuid: 'poam-001',
    metadata: { ...minimalMetadata, title: 'Test POA&M' },
    'poam-items': [
      {
        uuid: 'pi-001',
        title: 'Remediate Finding',
        description: 'Fix the issue',
      },
    ],
  },
}

const sspData: OscalDocumentData = {
  type: 'system-security-plan',
  document: {
    uuid: 'ssp-001',
    metadata: { ...minimalMetadata, title: 'Test SSP' },
    'import-profile': { href: '#profile' },
    'system-characteristics': {
      'system-ids': [{ id: 'sys-001' }],
      'system-name': 'Test System',
      description: 'A test system',
      'system-information': {
        'information-types': [
          { title: 'Info', description: 'Information' },
        ],
      },
      status: { state: 'operational' },
      'authorization-boundary': { description: 'Boundary' },
    },
    'system-implementation': {
      users: [{ uuid: 'u1', title: 'Admin' }],
      components: [
        {
          uuid: 'c1',
          type: 'this-system',
          title: 'System',
          description: 'The system',
          status: { state: 'operational' },
        },
      ],
    },
    'control-implementation': {
      description: 'Controls',
      'implemented-requirements': [
        { uuid: 'ir-1', 'control-id': 'ac-1' },
      ],
    },
  },
}

// ============================================================
// DocumentViewer Routing Tests (lazy-loaded views)
// ============================================================

describe('DocumentViewer', () => {
  it('renders CatalogView for catalog type', async () => {
    render(<DocumentViewer data={catalogData} />)
    await waitFor(() => {
      expect(screen.getByText('Access Control')).toBeInTheDocument()
    })
    expect(screen.getByText('ac-1')).toBeInTheDocument()
  })

  it('renders ProfileView for profile type', async () => {
    render(<DocumentViewer data={profileData} />)
    await waitFor(() => {
      expect(screen.getByText('#catalog')).toBeInTheDocument()
    })
  })

  it('renders ComponentDefView for component-definition type', async () => {
    render(<DocumentViewer data={componentDefData} />)
    await waitFor(() => {
      expect(screen.getByText('Test App')).toBeInTheDocument()
    })
  })

  it('renders SspView for system-security-plan type', async () => {
    render(<DocumentViewer data={sspData} />)
    await waitFor(() => {
      expect(screen.getByText('Test System')).toBeInTheDocument()
    })
  })

  it('renders AssessmentResultsView for assessment-results type', async () => {
    render(<DocumentViewer data={assessmentResultsData} />)
    await waitFor(() => {
      expect(screen.getByText('Test Assessment Results')).toBeInTheDocument()
    })
    expect(screen.getByText('Test Result')).toBeInTheDocument()
  })

  it('renders PoamView for plan-of-action-and-milestones type', async () => {
    render(<DocumentViewer data={poamData} />)
    await waitFor(() => {
      expect(screen.getByText('Test POA&M')).toBeInTheDocument()
    })
    expect(screen.getByText('Remediate Finding')).toBeInTheDocument()
  })

  it('renders metadata panel for all types', async () => {
    const types = [catalogData, profileData, componentDefData, sspData, assessmentResultsData, poamData]
    for (const data of types) {
      const { unmount } = render(<DocumentViewer data={data} />)
      await waitFor(() => {
        expect(screen.getByText('Metadata')).toBeInTheDocument()
      })
      unmount()
    }
  })
})

// ============================================================
// Phase 5c — onNavigate Prop Tests
// ============================================================

describe('DocumentViewer — onNavigate prop', () => {
  it('renders catalog view without errors when onNavigate is provided', async () => {
    const handleNavigate = vi.fn()
    render(<DocumentViewer data={catalogData} onNavigate={handleNavigate} />)
    await waitFor(() => {
      expect(screen.getByText('Access Control')).toBeInTheDocument()
    })
    expect(screen.getByText('ac-1')).toBeInTheDocument()
  })

  it('renders profile view without errors when onNavigate is provided', async () => {
    const handleNavigate = vi.fn()
    render(<DocumentViewer data={profileData} onNavigate={handleNavigate} />)
    await waitFor(() => {
      expect(screen.getByText('#catalog')).toBeInTheDocument()
    })
    expect(screen.getByText('Test Profile')).toBeInTheDocument()
  })

  it('renders ssp view without errors when onNavigate is provided', async () => {
    const handleNavigate = vi.fn()
    render(<DocumentViewer data={sspData} onNavigate={handleNavigate} />)
    await waitFor(() => {
      expect(screen.getByText('Test System')).toBeInTheDocument()
    })
    expect(screen.getByText('Test SSP')).toBeInTheDocument()
  })

  it('renders assessment-results view without errors when onNavigate is provided', async () => {
    const handleNavigate = vi.fn()
    render(<DocumentViewer data={assessmentResultsData} onNavigate={handleNavigate} />)
    await waitFor(() => {
      expect(screen.getByText('Test Assessment Results')).toBeInTheDocument()
    })
    expect(screen.getByText('Test Result')).toBeInTheDocument()
  })

  it('renders poam view without errors when onNavigate is provided', async () => {
    const handleNavigate = vi.fn()
    render(<DocumentViewer data={poamData} onNavigate={handleNavigate} />)
    await waitFor(() => {
      expect(screen.getByText('Test POA&M')).toBeInTheDocument()
    })
    expect(screen.getByText('Remediate Finding')).toBeInTheDocument()
  })
})
