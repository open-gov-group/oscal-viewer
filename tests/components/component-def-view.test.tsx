import { render, screen, fireEvent } from '@testing-library/preact'
import { ComponentDefView } from '@/components/component-def/component-def-view'
import type { ComponentDefinition } from '@/types/oscal'

// ============================================================
// Test Fixtures
// ============================================================

const minimalMetadata = {
  title: 'Test Component Definition',
  'last-modified': '2026-02-06T00:00:00Z',
  version: '1.0',
  'oscal-version': '1.1.2',
}

const fullComponentDef: ComponentDefinition = {
  uuid: 'cd-001',
  metadata: minimalMetadata,
  components: [
    {
      uuid: 'comp-001',
      type: 'software',
      title: 'Web Application',
      description: 'A web application for data management',
      purpose: 'To manage organizational data',
      props: [
        { name: 'version', value: '3.2.1', uuid: 'p1' },
      ],
      'responsible-roles': [
        { 'role-id': 'provider' },
        { 'role-id': 'maintainer' },
      ],
      'control-implementations': [
        {
          uuid: 'ci-001',
          source: '#nist-800-53',
          description: 'NIST 800-53 control implementations',
          'implemented-requirements': [
            {
              uuid: 'ir-001',
              'control-id': 'ac-1',
              description: 'Access control via RBAC',
            },
            {
              uuid: 'ir-002',
              'control-id': 'ac-2',
              description: 'Account management via LDAP',
              statements: [
                {
                  uuid: 'stmt-001',
                  'statement-id': 'ac-2_stmt.a',
                  description: 'Account creation process',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      uuid: 'comp-002',
      type: 'hardware',
      title: 'Firewall',
      description: 'Network perimeter firewall',
    },
  ],
}

const emptyComponentDef: ComponentDefinition = {
  uuid: 'cd-empty',
  metadata: minimalMetadata,
}

// ============================================================
// ComponentDefView Tests
// ============================================================

describe('ComponentDefView', () => {
  it('renders metadata panel', () => {
    render(<ComponentDefView componentDef={fullComponentDef} />)
    expect(screen.getByText('Metadata')).toBeInTheDocument()
  })

  it('renders component count in stats', () => {
    const { container } = render(<ComponentDefView componentDef={fullComponentDef} />)
    const stats = container.querySelector('.compdef-stats')
    expect(stats?.textContent).toContain('2')
    expect(stats?.textContent).toContain('Component')
  })

  it('renders implemented requirements count in stats', () => {
    const { container } = render(<ComponentDefView componentDef={fullComponentDef} />)
    const stats = container.querySelector('.compdef-stats')
    expect(stats?.textContent).toContain('Implemented Requirement')
  })

  it('renders component list in sidebar', () => {
    render(<ComponentDefView componentDef={fullComponentDef} />)
    expect(screen.getByText('Web Application')).toBeInTheDocument()
    expect(screen.getByText('Firewall')).toBeInTheDocument()
  })

  it('renders type badges', () => {
    render(<ComponentDefView componentDef={fullComponentDef} />)
    expect(screen.getByText('software')).toBeInTheDocument()
    expect(screen.getByText('hardware')).toBeInTheDocument()
  })

  it('shows placeholder when no component is selected', () => {
    render(<ComponentDefView componentDef={fullComponentDef} />)
    expect(screen.getByText('Select a component from the sidebar to view its details.')).toBeInTheDocument()
  })

  it('shows component detail when clicked', () => {
    render(<ComponentDefView componentDef={fullComponentDef} />)
    const webAppOption = screen.getByText('Web Application').closest('[role="option"]')
    if (webAppOption) {
      fireEvent.click(webAppOption)
    }
    expect(screen.getByText('A web application for data management')).toBeInTheDocument()
  })

  it('renders purpose when component is selected', () => {
    render(<ComponentDefView componentDef={fullComponentDef} />)
    const webAppOption = screen.getByText('Web Application').closest('[role="option"]')
    if (webAppOption) {
      fireEvent.click(webAppOption)
    }
    expect(screen.getByText(/To manage organizational data/)).toBeInTheDocument()
  })

  it('renders responsible roles when component is selected', () => {
    render(<ComponentDefView componentDef={fullComponentDef} />)
    const webAppOption = screen.getByText('Web Application').closest('[role="option"]')
    if (webAppOption) {
      fireEvent.click(webAppOption)
    }
    expect(screen.getByText('provider')).toBeInTheDocument()
    expect(screen.getByText('maintainer')).toBeInTheDocument()
  })

  it('renders control implementations when component is selected', () => {
    render(<ComponentDefView componentDef={fullComponentDef} />)
    const webAppOption = screen.getByText('Web Application').closest('[role="option"]')
    if (webAppOption) {
      fireEvent.click(webAppOption)
    }
    expect(screen.getByText('Control Implementations')).toBeInTheDocument()
    expect(screen.getByText('#nist-800-53')).toBeInTheDocument()
  })

  it('renders implemented requirements in detail', () => {
    render(<ComponentDefView componentDef={fullComponentDef} />)
    const webAppOption = screen.getByText('Web Application').closest('[role="option"]')
    if (webAppOption) {
      fireEvent.click(webAppOption)
    }
    expect(screen.getByText('ac-1')).toBeInTheDocument()
    expect(screen.getByText('Access control via RBAC')).toBeInTheDocument()
  })

  it('renders statements within requirements', () => {
    render(<ComponentDefView componentDef={fullComponentDef} />)
    const webAppOption = screen.getByText('Web Application').closest('[role="option"]')
    if (webAppOption) {
      fireEvent.click(webAppOption)
    }
    expect(screen.getByText('ac-2_stmt.a')).toBeInTheDocument()
    expect(screen.getByText('Account creation process')).toBeInTheDocument()
  })

  it('handles empty component definition', () => {
    const { container } = render(<ComponentDefView componentDef={emptyComponentDef} />)
    const stats = container.querySelector('.compdef-stats')
    expect(stats?.textContent).toContain('0')
  })

  it('has accessible sidebar', () => {
    const { container } = render(<ComponentDefView componentDef={fullComponentDef} />)
    const sidebar = container.querySelector('[aria-label="Component list"]')
    expect(sidebar).toBeTruthy()
  })

  it('has accessible listbox', () => {
    const { container } = render(<ComponentDefView componentDef={fullComponentDef} />)
    const listbox = container.querySelector('[role="listbox"]')
    expect(listbox).toBeTruthy()
  })

  it('marks selected component with aria-selected', () => {
    const { container } = render(<ComponentDefView componentDef={fullComponentDef} />)
    const webAppOption = screen.getByText('Web Application').closest('[role="option"]')
    if (webAppOption) {
      fireEvent.click(webAppOption)
    }
    const options = container.querySelectorAll('[role="option"]')
    const selected = Array.from(options).find(o => o.getAttribute('aria-selected') === 'true')
    expect(selected).toBeTruthy()
    expect(selected?.textContent).toContain('Web Application')
  })
})
