import { render, screen, fireEvent } from '@testing-library/preact'
import { SspView } from '@/components/ssp/ssp-view'
import type { SystemSecurityPlan } from '@/types/oscal'

// ============================================================
// Test Fixtures
// ============================================================

const minimalMetadata = {
  title: 'Test SSP',
  'last-modified': '2026-02-06T00:00:00Z',
  version: '1.0',
  'oscal-version': '1.1.2',
}

const fullSsp: SystemSecurityPlan = {
  uuid: 'ssp-001',
  metadata: minimalMetadata,
  'import-profile': { href: '#profile-uuid' },
  'system-characteristics': {
    'system-ids': [
      { id: 'SYS-001', 'identifier-type': 'https://ietf.org/rfc/rfc4122' },
    ],
    'system-name': 'Enterprise Portal',
    'system-name-short': 'EP',
    description: 'Enterprise web portal for data management',
    'security-sensitivity-level': 'moderate',
    status: { state: 'operational' },
    'security-impact-level': {
      'security-objective-confidentiality': 'moderate',
      'security-objective-integrity': 'moderate',
      'security-objective-availability': 'low',
    },
    'authorization-boundary': { description: 'The system boundary includes all web servers.' },
    'system-information': {
      'information-types': [
        { title: 'Admin Data', description: 'Administrative data' },
      ],
    },
  },
  'system-implementation': {
    users: [
      {
        uuid: 'user-001',
        title: 'System Administrator',
        description: 'Admin user with full access',
        'role-ids': ['admin'],
        props: [{ name: 'type', value: 'internal', uuid: 'up1' }],
      },
      { uuid: 'user-002', title: 'End User' },
    ],
    components: [
      {
        uuid: 'sc-001',
        type: 'this-system',
        title: 'Enterprise Portal System',
        description: 'The primary system',
        status: { state: 'operational' },
      },
      {
        uuid: 'sc-002',
        type: 'software',
        title: 'Web Server',
        description: 'Apache HTTP Server',
        status: { state: 'operational' },
        props: [{ name: 'version', value: '2.4.51', uuid: 'cp1' }],
      },
    ],
    'inventory-items': [
      {
        uuid: 'inv-001',
        description: 'Production web server instance',
        props: [{ name: 'hostname', value: 'web-prod-01', uuid: 'ip1' }],
      },
    ],
  },
  'control-implementation': {
    description: 'Implementation of NIST 800-53 controls',
    'implemented-requirements': [
      {
        uuid: 'ir-001',
        'control-id': 'ac-1',
        statements: [
          {
            uuid: 'stmt-001',
            'statement-id': 'ac-1_stmt.a',
            'by-components': [
              {
                uuid: 'bc-001',
                'component-uuid': 'sc-001',
                description: 'Access control policy maintained by IT department',
                'implementation-status': { state: 'implemented' },
              },
            ],
          },
        ],
      },
      {
        uuid: 'ir-002',
        'control-id': 'au-1',
        remarks: 'Audit logging is enabled system-wide',
        'by-components': [
          {
            uuid: 'bc-002',
            'component-uuid': 'sc-002',
            description: 'Audit logging via Apache access logs',
          },
        ],
      },
    ],
  },
}

// ============================================================
// SspView - Header & Stats Tests
// ============================================================

describe('SspView - Header and Stats', () => {
  it('renders metadata panel', () => {
    render(<SspView ssp={fullSsp} />)
    expect(screen.getByText('Metadata')).toBeInTheDocument()
  })

  it('renders system name', () => {
    render(<SspView ssp={fullSsp} />)
    expect(screen.getByText('Enterprise Portal')).toBeInTheDocument()
  })

  it('renders short name', () => {
    render(<SspView ssp={fullSsp} />)
    expect(screen.getByText('(EP)')).toBeInTheDocument()
  })

  it('renders status badge', () => {
    render(<SspView ssp={fullSsp} />)
    expect(screen.getByText('operational')).toBeInTheDocument()
  })

  it('renders sensitivity level', () => {
    const { container } = render(<SspView ssp={fullSsp} />)
    const badge = container.querySelector('.ssp-sensitivity-badge')
    expect(badge?.textContent).toBe('moderate')
  })

  it('renders user count', () => {
    render(<SspView ssp={fullSsp} />)
    expect(screen.getByText('Users')).toBeInTheDocument()
  })

  it('renders component count', () => {
    render(<SspView ssp={fullSsp} />)
    expect(screen.getByText('Components')).toBeInTheDocument()
  })

  it('renders requirement count', () => {
    render(<SspView ssp={fullSsp} />)
    expect(screen.getByText('Implemented Requirements')).toBeInTheDocument()
  })

  it('renders import-profile href', () => {
    render(<SspView ssp={fullSsp} />)
    expect(screen.getByText('#profile-uuid')).toBeInTheDocument()
  })
})

// ============================================================
// SspView - Tabs Tests
// ============================================================

describe('SspView - Tabs', () => {
  it('renders three tab buttons', () => {
    render(<SspView ssp={fullSsp} />)
    expect(screen.getByText('System Characteristics')).toBeInTheDocument()
    expect(screen.getByText('System Implementation')).toBeInTheDocument()
    expect(screen.getByText('Control Implementation')).toBeInTheDocument()
  })

  it('has tablist role', () => {
    const { container } = render(<SspView ssp={fullSsp} />)
    expect(container.querySelector('[role="tablist"]')).toBeTruthy()
  })

  it('has tab roles on buttons', () => {
    const { container } = render(<SspView ssp={fullSsp} />)
    const tabs = container.querySelectorAll('[role="tab"]')
    expect(tabs.length).toBe(3)
  })

  it('shows characteristics tab by default', () => {
    render(<SspView ssp={fullSsp} />)
    expect(screen.getByText('Enterprise web portal for data management')).toBeInTheDocument()
  })

  it('switches to implementation tab on click', () => {
    render(<SspView ssp={fullSsp} />)
    fireEvent.click(screen.getByText('System Implementation'))
    expect(screen.getByText('System Administrator')).toBeInTheDocument()
    expect(screen.getByText('Enterprise Portal System')).toBeInTheDocument()
  })

  it('switches to control implementation tab on click', () => {
    render(<SspView ssp={fullSsp} />)
    fireEvent.click(screen.getByText('Control Implementation'))
    expect(screen.getByText('ac-1')).toBeInTheDocument()
    expect(screen.getByText('au-1')).toBeInTheDocument()
  })

  it('marks active tab with aria-selected', () => {
    render(<SspView ssp={fullSsp} />)
    const charTab = screen.getByText('System Characteristics').closest('[role="tab"]')
    expect(charTab?.getAttribute('aria-selected')).toBe('true')
  })
})

// ============================================================
// SspView - Characteristics Tab Tests
// ============================================================

describe('SspView - Characteristics', () => {
  it('renders system description', () => {
    render(<SspView ssp={fullSsp} />)
    expect(screen.getByText('Enterprise web portal for data management')).toBeInTheDocument()
  })

  it('renders system IDs', () => {
    render(<SspView ssp={fullSsp} />)
    expect(screen.getByText('SYS-001')).toBeInTheDocument()
  })

  it('renders security impact levels', () => {
    render(<SspView ssp={fullSsp} />)
    expect(screen.getByText('Confidentiality')).toBeInTheDocument()
    expect(screen.getByText('Integrity')).toBeInTheDocument()
    expect(screen.getByText('Availability')).toBeInTheDocument()
  })

  it('renders authorization boundary', () => {
    render(<SspView ssp={fullSsp} />)
    expect(screen.getByText('The system boundary includes all web servers.')).toBeInTheDocument()
  })
})

// ============================================================
// SspView - Implementation Tab Tests
// ============================================================

describe('SspView - Implementation', () => {
  beforeEach(() => {
    render(<SspView ssp={fullSsp} />)
    fireEvent.click(screen.getByText('System Implementation'))
  })

  it('renders users section', () => {
    expect(screen.getByText(/Users \(/)).toBeInTheDocument()
    expect(screen.getByText('System Administrator')).toBeInTheDocument()
    expect(screen.getByText('End User')).toBeInTheDocument()
  })

  it('renders user description', () => {
    expect(screen.getByText('Admin user with full access')).toBeInTheDocument()
  })

  it('renders user role-ids', () => {
    expect(screen.getByText('admin')).toBeInTheDocument()
  })

  it('renders components section', () => {
    expect(screen.getByText(/Components \(/)).toBeInTheDocument()
    expect(screen.getByText('Enterprise Portal System')).toBeInTheDocument()
    expect(screen.getByText('Web Server')).toBeInTheDocument()
  })

  it('renders component types', () => {
    expect(screen.getByText('this-system')).toBeInTheDocument()
    expect(screen.getByText('software')).toBeInTheDocument()
  })

  it('renders inventory items', () => {
    expect(screen.getByText(/Inventory Items/)).toBeInTheDocument()
    expect(screen.getByText('Production web server instance')).toBeInTheDocument()
  })
})

// ============================================================
// SspView - Control Implementation Tab Tests
// ============================================================

describe('SspView - Control Implementation', () => {
  beforeEach(() => {
    render(<SspView ssp={fullSsp} />)
    fireEvent.click(screen.getByText('Control Implementation'))
  })

  it('renders control implementation description', () => {
    expect(screen.getByText('Implementation of NIST 800-53 controls')).toBeInTheDocument()
  })

  it('renders implemented requirement control-ids', () => {
    expect(screen.getByText('ac-1')).toBeInTheDocument()
    expect(screen.getByText('au-1')).toBeInTheDocument()
  })

  it('renders statements with by-components', () => {
    expect(screen.getByText('ac-1_stmt.a')).toBeInTheDocument()
    expect(screen.getByText('Access control policy maintained by IT department')).toBeInTheDocument()
  })

  it('renders implementation status', () => {
    expect(screen.getByText('implemented')).toBeInTheDocument()
  })

  it('renders remarks', () => {
    expect(screen.getByText('Audit logging is enabled system-wide')).toBeInTheDocument()
  })

  it('renders by-components on requirements', () => {
    expect(screen.getByText('Audit logging via Apache access logs')).toBeInTheDocument()
  })
})
