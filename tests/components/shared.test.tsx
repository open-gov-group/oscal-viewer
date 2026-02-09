import { render, screen, fireEvent } from '@testing-library/preact'
import { MetadataPanel } from '@/components/shared/metadata-panel'
import { PropertyBadge, PropertyList } from '@/components/shared/property-badge'
import { StatusBadge } from '@/components/shared/status-badge'
import { LinkBadge } from '@/components/shared/link-badge'
import { Accordion, AccordionGroup } from '@/components/shared/accordion'
import { CopyLinkButton } from '@/components/shared/copy-link-button'
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
    expect(screen.getByText(/Parties/)).toBeInTheDocument()
    expect(screen.getByText('NIST')).toBeInTheDocument()
    expect(screen.getByText('DHS')).toBeInTheDocument()
    expect(screen.getAllByText('organization')).toHaveLength(2)
  })

  it('does not render parties when absent', () => {
    render(<MetadataPanel metadata={minimalMetadata} />)
    expect(screen.queryByText(/Parties/)).not.toBeInTheDocument()
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

// ============================================================
// StatusBadge Tests
// ============================================================

describe('StatusBadge', () => {
  it('renders state text', () => {
    render(<StatusBadge state="operational" />)
    expect(screen.getByText('operational')).toBeInTheDocument()
  })

  it('renders with status-specific CSS class', () => {
    const { container } = render(<StatusBadge state="operational" />)
    expect(container.querySelector('.status-badge--operational')).toBeTruthy()
  })

  it('renders SVG icon for known states', () => {
    const { container } = render(<StatusBadge state="operational" />)
    const svg = container.querySelector('.status-badge-icon')
    expect(svg).toBeTruthy()
    expect(svg?.getAttribute('aria-hidden')).toBe('true')
  })

  it('renders without SVG icon for unknown states', () => {
    const { container } = render(<StatusBadge state="custom-state" />)
    expect(container.querySelector('.status-badge-icon')).toBeNull()
    expect(screen.getByText('custom-state')).toBeInTheDocument()
  })

  it('renders all predefined states', () => {
    const states = ['operational', 'under-development', 'planned', 'disposition', 'implemented', 'partial', 'alternative', 'not-applicable']
    for (const state of states) {
      const { container, unmount } = render(<StatusBadge state={state} />)
      expect(container.querySelector(`.status-badge--${state}`)).toBeTruthy()
      expect(container.querySelector('.status-badge-icon')).toBeTruthy()
      unmount()
    }
  })
})

// ============================================================
// LinkBadge Tests
// ============================================================

describe('LinkBadge', () => {
  it('renders "Implements" label for implements rel', () => {
    render(<LinkBadge rel="implements" />)
    expect(screen.getByText('Implements')).toBeInTheDocument()
  })

  it('renders "Required" label for required rel', () => {
    render(<LinkBadge rel="required" />)
    expect(screen.getByText('Required')).toBeInTheDocument()
  })

  it('renders "Related" label for related-control rel', () => {
    render(<LinkBadge rel="related-control" />)
    expect(screen.getByText('Related')).toBeInTheDocument()
  })

  it('renders "BSI Baustein" label for bsi-baustein rel', () => {
    render(<LinkBadge rel="bsi-baustein" />)
    expect(screen.getByText('BSI Baustein')).toBeInTheDocument()
  })

  it('renders "Template" label for template rel', () => {
    render(<LinkBadge rel="template" />)
    expect(screen.getByText('Template')).toBeInTheDocument()
  })

  it('renders raw rel text for unknown relation', () => {
    render(<LinkBadge rel="custom-rel" />)
    expect(screen.getByText('custom-rel')).toBeInTheDocument()
  })

  it('uses correct CSS modifier for implements', () => {
    const { container } = render(<LinkBadge rel="implements" />)
    expect(container.querySelector('.link-badge--implements')).toBeTruthy()
  })

  it('uses correct CSS modifier for required', () => {
    const { container } = render(<LinkBadge rel="required" />)
    expect(container.querySelector('.link-badge--required')).toBeTruthy()
  })

  it('uses default CSS modifier for unknown relation', () => {
    const { container } = render(<LinkBadge rel="unknown" />)
    expect(container.querySelector('.link-badge--default')).toBeTruthy()
  })
})

// ============================================================
// Accordion Tests
// ============================================================

describe('Accordion', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('renders trigger button with title', () => {
    render(<Accordion id="test" title="Test Section"><p>Content</p></Accordion>)
    expect(screen.getByText('Test Section')).toBeInTheDocument()
  })

  it('content is hidden by default', () => {
    const { container } = render(<Accordion id="test" title="Test Section"><p>Content</p></Accordion>)
    const content = container.querySelector('#test-content')
    expect(content?.hasAttribute('hidden')).toBe(true)
  })

  it('content is visible when defaultOpen is true', () => {
    const { container } = render(<Accordion id="test" title="Test Section" defaultOpen><p>Content</p></Accordion>)
    const content = container.querySelector('#test-content')
    expect(content?.hasAttribute('hidden')).toBe(false)
  })

  it('clicking trigger toggles content visibility', () => {
    const { container } = render(<Accordion id="test" title="Test Section"><p>Content</p></Accordion>)
    const trigger = container.querySelector('#test-trigger')!
    fireEvent.click(trigger)
    const content = container.querySelector('#test-content')
    expect(content?.hasAttribute('hidden')).toBe(false)
  })

  it('trigger has aria-expanded attribute', () => {
    const { container } = render(<Accordion id="test" title="Test Section"><p>Content</p></Accordion>)
    const trigger = container.querySelector('#test-trigger')
    expect(trigger?.getAttribute('aria-expanded')).toBe('false')
    fireEvent.click(trigger!)
    expect(trigger?.getAttribute('aria-expanded')).toBe('true')
  })

  it('trigger has aria-controls pointing to content', () => {
    const { container } = render(<Accordion id="test" title="Test Section"><p>Content</p></Accordion>)
    const trigger = container.querySelector('#test-trigger')
    expect(trigger?.getAttribute('aria-controls')).toBe('test-content')
  })

  it('content region has aria-labelledby pointing to trigger', () => {
    const { container } = render(<Accordion id="test" title="Test Section"><p>Content</p></Accordion>)
    const content = container.querySelector('#test-content')
    expect(content?.getAttribute('role')).toBe('region')
    expect(content?.getAttribute('aria-labelledby')).toBe('test-trigger')
  })

  it('renders count when provided', () => {
    render(<Accordion id="test" title="Test Section" count={5}><p>Content</p></Accordion>)
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('wraps trigger in heading when headingLevel is provided', () => {
    const { container } = render(<Accordion id="test" title="Test Section" headingLevel={3}><p>Content</p></Accordion>)
    const heading = container.querySelector('h3.accordion-heading')
    expect(heading).toBeTruthy()
    expect(heading?.querySelector('#test-trigger')).toBeTruthy()
  })

  it('does not wrap in heading when headingLevel is not provided', () => {
    const { container } = render(<Accordion id="test" title="Test Section"><p>Content</p></Accordion>)
    expect(container.querySelector('.accordion-heading')).toBeNull()
  })

  it('QA1: trigger is a button element (inherent Enter/Space keyboard support)', () => {
    const { container } = render(<Accordion id="test" title="Test Section"><p>Content</p></Accordion>)
    const trigger = container.querySelector('#test-trigger')
    expect(trigger?.tagName).toBe('BUTTON')
  })

  it('QA1: trigger toggles on repeated clicks (keyboard Enter/Space fires click)', () => {
    const { container } = render(<Accordion id="test" title="Test Section"><p>Content</p></Accordion>)
    const trigger = container.querySelector('#test-trigger')!
    // Open
    fireEvent.click(trigger)
    expect(container.querySelector('#test-content')?.hasAttribute('hidden')).toBe(false)
    // Close again
    fireEvent.click(trigger)
    expect(container.querySelector('#test-content')?.hasAttribute('hidden')).toBe(true)
  })
})

// ============================================================
// Accordion Session Persistence Tests
// ============================================================

describe('Accordion - Session Persistence', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('saves open state to sessionStorage on toggle', () => {
    const { container } = render(<Accordion id="persist-test" title="Persist"><p>Content</p></Accordion>)
    fireEvent.click(container.querySelector('#persist-test-trigger')!)
    expect(sessionStorage.getItem('accordion-persist-test')).toBe('true')
  })

  it('saves closed state to sessionStorage', () => {
    const { container } = render(<Accordion id="persist-test" title="Persist" defaultOpen><p>Content</p></Accordion>)
    fireEvent.click(container.querySelector('#persist-test-trigger')!)
    expect(sessionStorage.getItem('accordion-persist-test')).toBe('false')
  })

  it('restores open state from sessionStorage', () => {
    sessionStorage.setItem('accordion-restore-test', 'true')
    const { container } = render(<Accordion id="restore-test" title="Restore"><p>Content</p></Accordion>)
    expect(container.querySelector('#restore-test-content')?.hasAttribute('hidden')).toBe(false)
  })

  it('restores closed state from sessionStorage overriding defaultOpen', () => {
    sessionStorage.setItem('accordion-override-test', 'false')
    const { container } = render(<Accordion id="override-test" title="Override" defaultOpen><p>Content</p></Accordion>)
    expect(container.querySelector('#override-test-content')?.hasAttribute('hidden')).toBe(true)
  })

  it('falls back to defaultOpen when no saved state', () => {
    const { container } = render(<Accordion id="fallback-test" title="Fallback" defaultOpen><p>Content</p></Accordion>)
    expect(container.querySelector('#fallback-test-content')?.hasAttribute('hidden')).toBe(false)
  })
})

// ============================================================
// AccordionGroup Tests
// ============================================================

describe('AccordionGroup', () => {
  it('renders children', () => {
    render(<AccordionGroup><p>Group content</p></AccordionGroup>)
    expect(screen.getByText('Group content')).toBeInTheDocument()
  })

  it('has accordion-group class', () => {
    const { container } = render(<AccordionGroup><p>Group content</p></AccordionGroup>)
    expect(container.querySelector('.accordion-group')).toBeTruthy()
  })

  it('renders Expand all and Collapse all buttons', () => {
    render(<AccordionGroup><p>Content</p></AccordionGroup>)
    expect(screen.getByText('Expand all')).toBeInTheDocument()
    expect(screen.getByText('Collapse all')).toBeInTheDocument()
  })

  it('Expand all opens all child accordions', () => {
    const { container } = render(
      <AccordionGroup>
        <Accordion id="a1" title="First"><p>Content 1</p></Accordion>
        <Accordion id="a2" title="Second"><p>Content 2</p></Accordion>
      </AccordionGroup>
    )
    // Both closed by default
    expect(container.querySelector('#a1-content')?.hasAttribute('hidden')).toBe(true)
    expect(container.querySelector('#a2-content')?.hasAttribute('hidden')).toBe(true)

    fireEvent.click(screen.getByText('Expand all'))

    expect(container.querySelector('#a1-content')?.hasAttribute('hidden')).toBe(false)
    expect(container.querySelector('#a2-content')?.hasAttribute('hidden')).toBe(false)
  })

  it('Collapse all closes all child accordions', () => {
    const { container } = render(
      <AccordionGroup>
        <Accordion id="a1" title="First" defaultOpen><p>Content 1</p></Accordion>
        <Accordion id="a2" title="Second" defaultOpen><p>Content 2</p></Accordion>
      </AccordionGroup>
    )
    // Both open by default
    expect(container.querySelector('#a1-content')?.hasAttribute('hidden')).toBe(false)
    expect(container.querySelector('#a2-content')?.hasAttribute('hidden')).toBe(false)

    fireEvent.click(screen.getByText('Collapse all'))

    expect(container.querySelector('#a1-content')?.hasAttribute('hidden')).toBe(true)
    expect(container.querySelector('#a2-content')?.hasAttribute('hidden')).toBe(true)
  })

  it('individual accordion toggle still works within group', () => {
    const { container } = render(
      <AccordionGroup>
        <Accordion id="a1" title="First"><p>Content 1</p></Accordion>
        <Accordion id="a2" title="Second"><p>Content 2</p></Accordion>
      </AccordionGroup>
    )
    // Open only first
    fireEvent.click(container.querySelector('#a1-trigger')!)
    expect(container.querySelector('#a1-content')?.hasAttribute('hidden')).toBe(false)
    expect(container.querySelector('#a2-content')?.hasAttribute('hidden')).toBe(true)
  })

  it('Expand all works after individual toggle', () => {
    const { container } = render(
      <AccordionGroup>
        <Accordion id="a1" title="First" defaultOpen><p>Content 1</p></Accordion>
        <Accordion id="a2" title="Second"><p>Content 2</p></Accordion>
      </AccordionGroup>
    )
    // Close first manually
    fireEvent.click(container.querySelector('#a1-trigger')!)
    expect(container.querySelector('#a1-content')?.hasAttribute('hidden')).toBe(true)

    // Expand all should open both
    fireEvent.click(screen.getByText('Expand all'))
    expect(container.querySelector('#a1-content')?.hasAttribute('hidden')).toBe(false)
    expect(container.querySelector('#a2-content')?.hasAttribute('hidden')).toBe(false)
  })
})

// ============================================================
// CopyLinkButton Tests (QS15)
// ============================================================

describe('CopyLinkButton (QS15)', () => {
  it('QS15: has aria-live="polite" for clipboard feedback', () => {
    const { container } = render(<CopyLinkButton viewType="catalog" elementId="ac-1" />)
    const btn = container.querySelector('.copy-link-btn')
    expect(btn?.getAttribute('aria-live')).toBe('polite')
  })

  it('QS15: has descriptive aria-label', () => {
    const { container } = render(<CopyLinkButton viewType="catalog" elementId="ac-1" />)
    const btn = container.querySelector('.copy-link-btn')
    expect(btn?.getAttribute('aria-label')).toBe('Copy link to ac-1')
  })

  it('QA5: clicking button calls clipboard.writeText with correct URL', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText: writeTextMock } })
    const { container } = render(<CopyLinkButton viewType="catalog" elementId="ac-1" />)
    const btn = container.querySelector('.copy-link-btn') as HTMLElement
    await fireEvent.click(btn)
    expect(writeTextMock).toHaveBeenCalledTimes(1)
    expect(writeTextMock.mock.calls[0][0]).toContain('#/catalog/ac-1')
  })

  it('QA5: aria-label changes to "Link copied" after click', async () => {
    Object.assign(navigator, { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } })
    const { container } = render(<CopyLinkButton viewType="catalog" elementId="ac-1" />)
    const btn = container.querySelector('.copy-link-btn') as HTMLElement
    await fireEvent.click(btn)
    // Wait for state update
    await new Promise(r => setTimeout(r, 10))
    expect(btn.getAttribute('aria-label')).toBe('Link copied')
  })

  it('QA5: button gets "copied" class after click', async () => {
    Object.assign(navigator, { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } })
    const { container } = render(<CopyLinkButton viewType="catalog" elementId="ac-1" />)
    const btn = container.querySelector('.copy-link-btn') as HTMLElement
    await fireEvent.click(btn)
    await new Promise(r => setTimeout(r, 10))
    expect(btn.classList.contains('copied')).toBe(true)
  })
})
