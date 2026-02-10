import { render, screen, fireEvent } from '@testing-library/preact'
import { SspView } from '@/components/ssp/ssp-view'
import type { SystemSecurityPlan } from '@/types/oscal'

// Clean up URL hash between tests to prevent state leaking via useDeepLink
beforeEach(() => {
  history.replaceState(null, '', window.location.pathname)
})

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

  it('renders ResourcePanel when back-matter has resources', () => {
    const sspWithBackMatter = {
      ...fullSsp,
      'back-matter': {
        resources: [{ uuid: 'res-1', title: 'Test Resource' }]
      }
    }
    const { container } = render(<SspView ssp={sspWithBackMatter} />)
    expect(container.querySelector('#resource-res-1')).toBeTruthy()
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

// ============================================================
// SspView - Tab Keyboard Navigation Tests
// ============================================================

describe('SspView - Tab Keyboard Navigation', () => {
  it('ArrowRight moves from first to second tab', () => {
    const { container } = render(<SspView ssp={fullSsp} />)
    const firstTab = container.querySelector('#ssp-tab-characteristics')!
    fireEvent.keyDown(firstTab, { key: 'ArrowRight' })
    expect(screen.getByText('System Implementation').closest('[role="tab"]')?.getAttribute('aria-selected')).toBe('true')
  })

  it('ArrowRight wraps from last tab to first tab', () => {
    const { container } = render(<SspView ssp={fullSsp} />)
    fireEvent.click(screen.getByText('Control Implementation'))
    const lastTab = container.querySelector('#ssp-tab-controls')!
    fireEvent.keyDown(lastTab, { key: 'ArrowRight' })
    expect(screen.getByText('System Characteristics').closest('[role="tab"]')?.getAttribute('aria-selected')).toBe('true')
  })

  it('ArrowLeft wraps from first tab to last tab', () => {
    const { container } = render(<SspView ssp={fullSsp} />)
    const firstTab = container.querySelector('#ssp-tab-characteristics')!
    fireEvent.keyDown(firstTab, { key: 'ArrowLeft' })
    expect(screen.getByText('Control Implementation').closest('[role="tab"]')?.getAttribute('aria-selected')).toBe('true')
  })

  it('ArrowLeft moves from second to first tab', () => {
    const { container } = render(<SspView ssp={fullSsp} />)
    fireEvent.click(screen.getByText('System Implementation'))
    const secondTab = container.querySelector('#ssp-tab-implementation')!
    fireEvent.keyDown(secondTab, { key: 'ArrowLeft' })
    expect(screen.getByText('System Characteristics').closest('[role="tab"]')?.getAttribute('aria-selected')).toBe('true')
  })

  it('Home key moves to first tab', () => {
    const { container } = render(<SspView ssp={fullSsp} />)
    fireEvent.click(screen.getByText('Control Implementation'))
    const lastTab = container.querySelector('#ssp-tab-controls')!
    fireEvent.keyDown(lastTab, { key: 'Home' })
    expect(screen.getByText('System Characteristics').closest('[role="tab"]')?.getAttribute('aria-selected')).toBe('true')
  })

  it('End key moves to last tab', () => {
    const { container } = render(<SspView ssp={fullSsp} />)
    const firstTab = container.querySelector('#ssp-tab-characteristics')!
    fireEvent.keyDown(firstTab, { key: 'End' })
    expect(screen.getByText('Control Implementation').closest('[role="tab"]')?.getAttribute('aria-selected')).toBe('true')
  })

  it('active tab has tabIndex 0, inactive tabs have tabIndex -1', () => {
    const { container } = render(<SspView ssp={fullSsp} />)
    const tabs = container.querySelectorAll('[role="tab"]')
    expect(tabs[0].getAttribute('tabindex')).toBe('0')
    expect(tabs[1].getAttribute('tabindex')).toBe('-1')
    expect(tabs[2].getAttribute('tabindex')).toBe('-1')
  })

  it('tabIndex updates when active tab changes', () => {
    const { container } = render(<SspView ssp={fullSsp} />)
    fireEvent.click(screen.getByText('System Implementation'))
    const tabs = container.querySelectorAll('[role="tab"]')
    expect(tabs[0].getAttribute('tabindex')).toBe('-1')
    expect(tabs[1].getAttribute('tabindex')).toBe('0')
    expect(tabs[2].getAttribute('tabindex')).toBe('-1')
  })

  it('each tab has aria-controls pointing to tabpanel', () => {
    const { container } = render(<SspView ssp={fullSsp} />)
    const tabs = container.querySelectorAll('[role="tab"]')
    expect(tabs[0].getAttribute('aria-controls')).toBe('ssp-tabpanel-characteristics')
    expect(tabs[1].getAttribute('aria-controls')).toBe('ssp-tabpanel-implementation')
    expect(tabs[2].getAttribute('aria-controls')).toBe('ssp-tabpanel-controls')
  })

  it('tabpanel has aria-labelledby pointing to active tab', () => {
    const { container } = render(<SspView ssp={fullSsp} />)
    const tabpanel = container.querySelector('[role="tabpanel"]')
    expect(tabpanel?.getAttribute('aria-labelledby')).toBe('ssp-tab-characteristics')
  })

  it('tabpanel aria-labelledby updates when tab changes', () => {
    const { container } = render(<SspView ssp={fullSsp} />)
    fireEvent.click(screen.getByText('System Implementation'))
    const tabpanel = container.querySelector('[role="tabpanel"]')
    expect(tabpanel?.getAttribute('aria-labelledby')).toBe('ssp-tab-implementation')
  })
})

// ============================================================
// SspView - Control Title Map Tests
// ============================================================

describe('SspView - Control Title Enrichment', () => {
  it('renders control-id codes in Control Implementation tab', () => {
    render(<SspView ssp={fullSsp} />)
    fireEvent.click(screen.getByText('Control Implementation'))
    const controlIds = document.querySelectorAll('.ssp-control-id')
    expect(controlIds.length).toBe(2)
    expect(controlIds[0].textContent).toBe('ac-1')
    expect(controlIds[1].textContent).toBe('au-1')
  })

  it('does not render control titles when no controls are resolved', () => {
    render(<SspView ssp={fullSsp} />)
    fireEvent.click(screen.getByText('Control Implementation'))
    const titles = document.querySelectorAll('.ssp-control-title')
    // No resolved controls by default (hook returns empty until resolution completes)
    expect(titles.length).toBe(0)
  })

  it('does not show Resolved Controls stat when no controls resolved', () => {
    render(<SspView ssp={fullSsp} />)
    expect(screen.queryByText(/Resolved Control/)).toBeNull()
  })

  it('does not render Resolved Catalog accordion when no controls resolved', () => {
    const { container } = render(<SspView ssp={fullSsp} />)
    expect(container.querySelector('#ssp-resolved-catalog')).toBeNull()
  })
})

// ============================================================
// SspView - ImportPanel Integration Tests
// ============================================================

describe('SspView - ImportPanel Integration', () => {
  it('does not render ImportPanel when no sources and not resolving', () => {
    // SSP with no import-profile href triggers no resolution
    const sspNoImport = {
      ...fullSsp,
      'import-profile': { href: '' },
    }
    const { container } = render(<SspView ssp={sspNoImport} />)
    // ImportPanel renders when catalogSources > 0 or resolving
    // With empty href, resolveSsp is not called, so no ImportPanel
    expect(container.querySelector('.import-panel')).toBeNull()
  })
})
