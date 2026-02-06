import { render, screen } from '@testing-library/preact'
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
// DocumentViewer Routing Tests
// ============================================================

describe('DocumentViewer', () => {
  it('renders CatalogView for catalog type', () => {
    render(<DocumentViewer data={catalogData} />)
    expect(screen.getByText('Access Control')).toBeInTheDocument()
    expect(screen.getByText('ac-1')).toBeInTheDocument()
  })

  it('renders ProfileView for profile type', () => {
    render(<DocumentViewer data={profileData} />)
    expect(screen.getByText('#catalog')).toBeInTheDocument()
  })

  it('renders ComponentDefView for component-definition type', () => {
    render(<DocumentViewer data={componentDefData} />)
    expect(screen.getByText('Test App')).toBeInTheDocument()
  })

  it('renders SspView for system-security-plan type', () => {
    render(<DocumentViewer data={sspData} />)
    expect(screen.getByText('Test System')).toBeInTheDocument()
  })

  it('renders metadata panel for all types', () => {
    const types = [catalogData, profileData, componentDefData, sspData]
    for (const data of types) {
      const { unmount } = render(<DocumentViewer data={data} />)
      expect(screen.getByText('Metadata')).toBeInTheDocument()
      unmount()
    }
  })
})
