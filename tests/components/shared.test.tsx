import { render, screen } from '@testing-library/preact'
import { MetadataPanel } from '@/components/shared/metadata-panel'
import { PropertyBadge, PropertyList } from '@/components/shared/property-badge'
import type { Metadata, Property } from '@/types/oscal'

// ============================================================
// Test Fixtures
// ============================================================

const minimalMetadata: Metadata = {
  title: 'Test Catalog',
  'last-modified': '2026-02-06T12:00:00Z',
  version: '1.0',
  'oscal-version': '1.1.2',
}

const fullMetadata: Metadata = {
  title: 'Full Test Document',
  'last-modified': '2026-02-06T12:00:00Z',
  version: '2.1',
  'oscal-version': '1.1.2',
  published: '2026-01-01T00:00:00Z',
  roles: [
    { id: 'admin', title: 'Administrator' },
    { id: 'author', title: 'Author' },
  ],
  parties: [
    { uuid: 'p1', type: 'organization', name: 'NIST' },
    { uuid: 'p2', type: 'organization', 'short-name': 'DHS' },
  ],
}

// ============================================================
// MetadataPanel Tests
// ============================================================

describe('MetadataPanel', () => {
  it('renders the summary element', () => {
    render(<MetadataPanel metadata={minimalMetadata} />)
    expect(screen.getByText('Metadata')).toBeInTheDocument()
  })

  it('renders the title', () => {
    render(<MetadataPanel metadata={minimalMetadata} />)
    expect(screen.getByText('Test Catalog')).toBeInTheDocument()
  })

  it('renders the version', () => {
    render(<MetadataPanel metadata={minimalMetadata} />)
    expect(screen.getByText('1.0')).toBeInTheDocument()
  })

  it('renders the OSCAL version', () => {
    render(<MetadataPanel metadata={minimalMetadata} />)
    expect(screen.getByText('1.1.2')).toBeInTheDocument()
  })

  it('renders the last-modified date', () => {
    render(<MetadataPanel metadata={minimalMetadata} />)
    const dateEl = screen.getByText('Last Modified').nextElementSibling
    expect(dateEl).toBeDefined()
    expect(dateEl?.textContent).toBeTruthy()
  })

  it('renders published date when present', () => {
    render(<MetadataPanel metadata={fullMetadata} />)
    expect(screen.getByText('Published')).toBeInTheDocument()
  })

  it('does not render published date when absent', () => {
    render(<MetadataPanel metadata={minimalMetadata} />)
    expect(screen.queryByText('Published')).not.toBeInTheDocument()
  })

  it('renders roles when present', () => {
    render(<MetadataPanel metadata={fullMetadata} />)
    expect(screen.getByText('Roles')).toBeInTheDocument()
    expect(screen.getByText('Administrator, Author')).toBeInTheDocument()
  })

  it('does not render roles when absent', () => {
    render(<MetadataPanel metadata={minimalMetadata} />)
    expect(screen.queryByText('Roles')).not.toBeInTheDocument()
  })

  it('renders parties when present', () => {
    render(<MetadataPanel metadata={fullMetadata} />)
    expect(screen.getByText('Parties')).toBeInTheDocument()
    expect(screen.getByText('NIST, DHS')).toBeInTheDocument()
  })

  it('does not render parties when absent', () => {
    render(<MetadataPanel metadata={minimalMetadata} />)
    expect(screen.queryByText('Parties')).not.toBeInTheDocument()
  })

  it('uses details element for collapsible panel', () => {
    const { container } = render(<MetadataPanel metadata={minimalMetadata} />)
    const details = container.querySelector('details')
    expect(details).toBeTruthy()
    expect(details?.className).toContain('metadata-panel')
  })
})

// ============================================================
// PropertyBadge Tests
// ============================================================

describe('PropertyBadge', () => {
  const prop: Property = { name: 'label', value: 'high', uuid: 'p1' }

  it('renders the property name', () => {
    render(<PropertyBadge prop={prop} />)
    expect(screen.getByText('label')).toBeInTheDocument()
  })

  it('renders the property value', () => {
    render(<PropertyBadge prop={prop} />)
    expect(screen.getByText('high')).toBeInTheDocument()
  })

  it('has proper CSS class', () => {
    const { container } = render(<PropertyBadge prop={prop} />)
    expect(container.querySelector('.property-badge')).toBeTruthy()
  })

  it('shows remarks in title when present', () => {
    const propWithRemarks: Property = { name: 'status', value: 'active', uuid: 'p2', remarks: 'Currently active' }
    const { container } = render(<PropertyBadge prop={propWithRemarks} />)
    const badge = container.querySelector('.property-badge')
    expect(badge?.getAttribute('title')).toBe('Currently active')
  })

  it('shows name: value in title when no remarks', () => {
    const { container } = render(<PropertyBadge prop={prop} />)
    const badge = container.querySelector('.property-badge')
    expect(badge?.getAttribute('title')).toBe('label: high')
  })
})

// ============================================================
// PropertyList Tests
// ============================================================

describe('PropertyList', () => {
  const props: Property[] = [
    { name: 'label', value: 'high', uuid: 'p1' },
    { name: 'sort-id', value: 'ac-01', uuid: 'p2' },
  ]

  it('renders all properties', () => {
    render(<PropertyList props={props} />)
    expect(screen.getByText('label')).toBeInTheDocument()
    expect(screen.getByText('sort-id')).toBeInTheDocument()
  })

  it('renders nothing for empty array', () => {
    const { container } = render(<PropertyList props={[]} />)
    expect(container.querySelector('.property-list')).toBeNull()
  })

  it('has list role for accessibility', () => {
    const { container } = render(<PropertyList props={props} />)
    const list = container.querySelector('[role="list"]')
    expect(list).toBeTruthy()
  })

  it('has aria-label', () => {
    const { container } = render(<PropertyList props={props} />)
    const list = container.querySelector('[aria-label="Properties"]')
    expect(list).toBeTruthy()
  })
})
