import { render, screen, fireEvent } from '@testing-library/preact'
import { CatalogView } from '@/components/catalog/catalog-view'
import { GroupTree } from '@/components/catalog/group-tree'
import { ControlDetail } from '@/components/catalog/control-detail'
import type { Catalog, Control, Group, Link } from '@/types/oscal'

// Clean up URL hash between tests to prevent state leaking via useDeepLink
beforeEach(() => {
  history.replaceState(null, '', window.location.pathname)
})

// ============================================================
// Test Fixtures
// ============================================================

const minimalMetadata = {
  title: 'Test Catalog',
  'last-modified': '2026-02-06T00:00:00Z',
  version: '1.0',
  'oscal-version': '1.1.2',
}

const testCatalog: Catalog = {
  uuid: 'cat-001',
  metadata: minimalMetadata,
  groups: [
    {
      id: 'ac',
      title: 'Access Control',
      controls: [
        {
          id: 'ac-1',
          title: 'Policy and Procedures',
          params: [
            { id: 'ac-1_prm_1', label: 'frequency' },
          ],
          parts: [
            { name: 'statement', prose: 'Develop an access control policy.' },
            { name: 'guidance', prose: 'Access control guidance text.' },
          ],
          controls: [
            { id: 'ac-1.1', title: 'Sub-Control Enhancement' },
          ],
        },
        { id: 'ac-2', title: 'Account Management' },
      ],
    },
    {
      id: 'au',
      title: 'Audit',
      controls: [
        { id: 'au-1', title: 'Audit Policy' },
      ],
    },
  ],
}

const emptyCatalog: Catalog = {
  uuid: 'cat-empty',
  metadata: minimalMetadata,
}

const controlWithLinks: Control = {
  id: 'ac-3',
  title: 'Access Enforcement',
  links: [
    { href: '#ac-1', rel: 'related', text: 'Related to AC-1' },
    { href: 'https://example.com/docs' },
  ],
  props: [
    { name: 'label', value: 'AC-3', uuid: 'p1' },
  ],
  class: 'SP800-53',
}

const controlWithSelect: Control = {
  id: 'ac-4',
  title: 'Information Flow',
  params: [
    {
      id: 'ac-4_prm_1',
      label: 'flow policy',
      select: {
        'how-many': 'one-or-more',
        choice: ['deny all', 'allow specific', 'block by category'],
      },
    },
    {
      id: 'ac-4_prm_2',
      label: 'timeout',
      values: ['30 minutes'],
      usage: 'Maximum session timeout',
      guidelines: [{ prose: 'Should not exceed 60 minutes.' }],
    },
  ],
}

// ============================================================
// CatalogView Tests
// ============================================================

describe('CatalogView', () => {
  it('renders metadata panel', () => {
    render(<CatalogView catalog={testCatalog} />)
    expect(screen.getByText('Metadata')).toBeInTheDocument()
  })

  it('renders group count', () => {
    render(<CatalogView catalog={testCatalog} />)
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('Groups')).toBeInTheDocument()
  })

  it('renders total controls count', () => {
    render(<CatalogView catalog={testCatalog} />)
    // ac-1, ac-1.1, ac-2, au-1 = 4
    expect(screen.getByText('4')).toBeInTheDocument()
    expect(screen.getByText('Controls')).toBeInTheDocument()
  })

  it('shows placeholder when no control is selected', () => {
    render(<CatalogView catalog={testCatalog} />)
    expect(screen.getByText('Select a control from the sidebar to view its details.')).toBeInTheDocument()
  })

  it('renders sidebar with navigation label', () => {
    const { container } = render(<CatalogView catalog={testCatalog} />)
    const sidebar = container.querySelector('[aria-label="Control navigation"]')
    expect(sidebar).toBeTruthy()
  })

  it('handles empty catalog without errors', () => {
    const { container } = render(<CatalogView catalog={emptyCatalog} />)
    const stats = container.querySelector('.catalog-stats')
    expect(stats?.textContent).toContain('0')
  })

  it('renders ResourcePanel when back-matter has resources', () => {
    const catalogWithBackMatter = {
      ...testCatalog,
      'back-matter': {
        resources: [{ uuid: 'res-1', title: 'Test Resource', description: 'A test' }]
      }
    }
    const { container } = render(<CatalogView catalog={catalogWithBackMatter} />)
    expect(container.querySelector('#resource-res-1')).toBeTruthy()
  })

  it('shows control detail when a control is selected', async () => {
    const { container } = render(<CatalogView catalog={testCatalog} />)
    // Click the control button in the tree (tree-control-btn)
    const controlBtns = container.querySelectorAll('.tree-control-btn')
    const ac1Btn = Array.from(controlBtns).find(btn => btn.textContent?.includes('ac-1'))
    if (ac1Btn) {
      fireEvent.click(ac1Btn)
    }
    // The control detail should now show in the main area
    const mainArea = container.querySelector('.catalog-content')
    expect(mainArea?.textContent).toContain('Policy and Procedures')
  })
})

// ============================================================
// GroupTree Tests
// ============================================================

describe('GroupTree', () => {
  const groups: Group[] = testCatalog.groups!
  const onSelect = vi.fn()

  it('renders all groups', () => {
    render(<GroupTree groups={groups} selectedControlId={null} onSelectControl={onSelect} />)
    expect(screen.getByText('Access Control')).toBeInTheDocument()
    expect(screen.getByText('Audit')).toBeInTheDocument()
  })

  it('renders group IDs', () => {
    render(<GroupTree groups={groups} selectedControlId={null} onSelectControl={onSelect} />)
    expect(screen.getByText('ac')).toBeInTheDocument()
    expect(screen.getByText('au')).toBeInTheDocument()
  })

  it('shows control count per group', () => {
    render(<GroupTree groups={groups} selectedControlId={null} onSelectControl={onSelect} />)
    // ac group: ac-1 (with ac-1.1 sub) + ac-2 = 3 controls total
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('has tree role for accessibility', () => {
    const { container } = render(
      <GroupTree groups={groups} selectedControlId={null} onSelectControl={onSelect} />
    )
    expect(container.querySelector('[role="tree"]')).toBeTruthy()
  })

  it('has treeitem roles', () => {
    const { container } = render(
      <GroupTree groups={groups} selectedControlId={null} onSelectControl={onSelect} />
    )
    const treeitems = container.querySelectorAll('[role="treeitem"]')
    expect(treeitems.length).toBeGreaterThan(0)
  })

  it('expands top-level groups by default', () => {
    render(<GroupTree groups={groups} selectedControlId={null} onSelectControl={onSelect} />)
    // Controls should be visible since depth=0 groups are expanded
    expect(screen.getByText('ac-1')).toBeInTheDocument()
  })

  it('calls onSelectControl when control is clicked', () => {
    render(<GroupTree groups={groups} selectedControlId={null} onSelectControl={onSelect} />)
    const controlBtn = screen.getByText('ac-2').closest('button')
    if (controlBtn) {
      fireEvent.click(controlBtn)
    }
    expect(onSelect).toHaveBeenCalledWith('ac-2')
  })

  it('toggles group expand/collapse', () => {
    render(<GroupTree groups={groups} selectedControlId={null} onSelectControl={onSelect} />)
    // Click the Access Control group header to collapse
    const groupHeader = screen.getByLabelText(/Access Control.*controls/)
    fireEvent.click(groupHeader)
    // After collapse, ac-1 should no longer be visible
    expect(screen.queryByText('ac-1')).not.toBeInTheDocument()
  })

  it('renders nothing for undefined groups', () => {
    const { container } = render(
      <GroupTree selectedControlId={null} onSelectControl={onSelect} />
    )
    const tree = container.querySelector('[role="tree"]')
    expect(tree?.children.length).toBe(0)
  })
})

// ============================================================
// GroupTree - Keyboard Navigation Tests
// ============================================================

describe('GroupTree - Keyboard Navigation', () => {
  const groups: Group[] = testCatalog.groups!
  const onSelect = vi.fn()

  function getVisibleItems(container: Element): HTMLElement[] {
    return Array.from(container.querySelectorAll<HTMLElement>(
      '.tree-group-header, .tree-control-btn'
    ))
  }

  it('ArrowDown moves focus to next item', () => {
    const { container } = render(
      <GroupTree groups={groups} selectedControlId={null} onSelectControl={onSelect} />
    )
    const items = getVisibleItems(container)
    items[0].focus()
    fireEvent.keyDown(items[0], { key: 'ArrowDown' })
    expect(document.activeElement).toBe(items[1])
  })

  it('ArrowUp moves focus to previous item', () => {
    const { container } = render(
      <GroupTree groups={groups} selectedControlId={null} onSelectControl={onSelect} />
    )
    const items = getVisibleItems(container)
    items[1].focus()
    fireEvent.keyDown(items[1], { key: 'ArrowUp' })
    expect(document.activeElement).toBe(items[0])
  })

  it('Home moves focus to first item', () => {
    const { container } = render(
      <GroupTree groups={groups} selectedControlId={null} onSelectControl={onSelect} />
    )
    const items = getVisibleItems(container)
    items[2].focus()
    fireEvent.keyDown(items[2], { key: 'Home' })
    expect(document.activeElement).toBe(items[0])
  })

  it('End moves focus to last item', () => {
    const { container } = render(
      <GroupTree groups={groups} selectedControlId={null} onSelectControl={onSelect} />
    )
    const items = getVisibleItems(container)
    items[0].focus()
    fireEvent.keyDown(items[0], { key: 'End' })
    expect(document.activeElement).toBe(items[items.length - 1])
  })

  it('ArrowDown does not go past last item', () => {
    const { container } = render(
      <GroupTree groups={groups} selectedControlId={null} onSelectControl={onSelect} />
    )
    const items = getVisibleItems(container)
    const lastItem = items[items.length - 1]
    lastItem.focus()
    fireEvent.keyDown(lastItem, { key: 'ArrowDown' })
    expect(document.activeElement).toBe(lastItem)
  })

  it('ArrowUp does not go before first item', () => {
    const { container } = render(
      <GroupTree groups={groups} selectedControlId={null} onSelectControl={onSelect} />
    )
    const items = getVisibleItems(container)
    items[0].focus()
    fireEvent.keyDown(items[0], { key: 'ArrowUp' })
    expect(document.activeElement).toBe(items[0])
  })

  it('ArrowLeft on expanded group collapses it', () => {
    render(
      <GroupTree groups={groups} selectedControlId={null} onSelectControl={onSelect} />
    )
    const groupHeader = screen.getByLabelText(/Access Control.*controls/)
    groupHeader.focus()
    const treeitem = groupHeader.closest('[role="treeitem"]')
    expect(treeitem?.getAttribute('aria-expanded')).toBe('true')
    fireEvent.keyDown(groupHeader, { key: 'ArrowLeft' })
    expect(treeitem?.getAttribute('aria-expanded')).toBe('false')
  })

  it('ArrowRight on collapsed group expands it', () => {
    render(
      <GroupTree groups={groups} selectedControlId={null} onSelectControl={onSelect} />
    )
    const groupHeader = screen.getByLabelText(/Access Control.*controls/)
    // First collapse
    fireEvent.click(groupHeader)
    const treeitem = groupHeader.closest('[role="treeitem"]')
    expect(treeitem?.getAttribute('aria-expanded')).toBe('false')
    // Then ArrowRight to expand
    groupHeader.focus()
    fireEvent.keyDown(groupHeader, { key: 'ArrowRight' })
    expect(treeitem?.getAttribute('aria-expanded')).toBe('true')
  })

  it('roving tabindex: first item gets tabindex 0 by default', () => {
    const { container } = render(
      <GroupTree groups={groups} selectedControlId={null} onSelectControl={onSelect} />
    )
    const items = getVisibleItems(container)
    // useEffect sets tabindex=0 on first item if none has it
    expect(items.some(el => el.getAttribute('tabindex') === '0')).toBe(true)
  })

  it('renders sub-control expand button for controls with children', () => {
    const { container } = render(
      <GroupTree groups={groups} selectedControlId={null} onSelectControl={onSelect} />
    )
    // ac-1 has a sub-control (ac-1.1), so it should have an expand button
    const expandBtns = container.querySelectorAll('.tree-expand-btn')
    expect(expandBtns.length).toBeGreaterThan(0)
  })

  it('clicking sub-control expand button shows child controls', () => {
    const { container } = render(
      <GroupTree groups={groups} selectedControlId={null} onSelectControl={onSelect} />
    )
    const expandBtn = container.querySelector('.tree-expand-btn')!
    fireEvent.click(expandBtn)
    // ac-1.1 should be visible after expanding
    expect(screen.getByText('ac-1.1')).toBeInTheDocument()
  })

  it('renders top-level controls when passed as controls prop', () => {
    const controls: Control[] = [
      { id: 'ctrl-1', title: 'Standalone Control' },
    ]
    render(
      <GroupTree controls={controls} selectedControlId={null} onSelectControl={onSelect} />
    )
    expect(screen.getByText('ctrl-1')).toBeInTheDocument()
    expect(screen.getByText('Standalone Control')).toBeInTheDocument()
  })
})

// ============================================================
// ControlDetail Tests
// ============================================================

describe('ControlDetail', () => {
  const basicControl = testCatalog.groups![0].controls![0] // ac-1

  it('renders control ID', () => {
    render(<ControlDetail control={basicControl} />)
    expect(screen.getByText('ac-1')).toBeInTheDocument()
  })

  it('renders control title', () => {
    render(<ControlDetail control={basicControl} />)
    expect(screen.getByText('Policy and Procedures')).toBeInTheDocument()
  })

  it('renders parameters section', () => {
    render(<ControlDetail control={basicControl} />)
    expect(screen.getByText('Parameters')).toBeInTheDocument()
    expect(screen.getByText('ac-1_prm_1')).toBeInTheDocument()
    expect(screen.getByText('frequency')).toBeInTheDocument()
  })

  it('renders parts as content', () => {
    render(<ControlDetail control={basicControl} />)
    expect(screen.getByText('Content')).toBeInTheDocument()
    expect(screen.getByText('Develop an access control policy.')).toBeInTheDocument()
  })

  it('renders sub-controls (enhancements)', () => {
    render(<ControlDetail control={basicControl} />)
    expect(screen.getByText('Control Enhancements')).toBeInTheDocument()
    expect(screen.getByText('ac-1.1')).toBeInTheDocument()
    expect(screen.getByText('Sub-Control Enhancement')).toBeInTheDocument()
  })

  it('renders links when present', () => {
    render(<ControlDetail control={controlWithLinks} />)
    expect(screen.getByText('Links')).toBeInTheDocument()
    expect(screen.getByText('Related to AC-1')).toBeInTheDocument()
  })

  it('renders properties when present', () => {
    render(<ControlDetail control={controlWithLinks} />)
    expect(screen.getByText('label')).toBeInTheDocument()
    expect(screen.getByText('AC-3')).toBeInTheDocument()
  })

  it('renders control class when present', () => {
    render(<ControlDetail control={controlWithLinks} />)
    expect(screen.getByText('SP800-53')).toBeInTheDocument()
  })

  it('renders parameter with select/choice', () => {
    render(<ControlDetail control={controlWithSelect} />)
    expect(screen.getByText('Select one or more:')).toBeInTheDocument()
    expect(screen.getByText('deny all')).toBeInTheDocument()
    expect(screen.getByText('allow specific')).toBeInTheDocument()
  })

  it('renders parameter with values', () => {
    render(<ControlDetail control={controlWithSelect} />)
    expect(screen.getByText('30 minutes')).toBeInTheDocument()
  })

  it('renders parameter usage text', () => {
    render(<ControlDetail control={controlWithSelect} />)
    expect(screen.getByText('Maximum session timeout')).toBeInTheDocument()
  })

  it('renders parameter guidelines', () => {
    render(<ControlDetail control={controlWithSelect} />)
    expect(screen.getByText('Should not exceed 60 minutes.')).toBeInTheDocument()
  })

  it('has proper ARIA labelledby', () => {
    const { container } = render(<ControlDetail control={basicControl} />)
    const article = container.querySelector('article')
    expect(article?.getAttribute('aria-labelledby')).toBe('control-ac-1-title')
  })

  it('does not render sections that are absent', () => {
    const simpleControl: Control = { id: 'simple-1', title: 'Simple Control' }
    render(<ControlDetail control={simpleControl} />)
    expect(screen.queryByText('Parameters')).not.toBeInTheDocument()
    expect(screen.queryByText('Content')).not.toBeInTheDocument()
    expect(screen.queryByText('Links')).not.toBeInTheDocument()
    expect(screen.queryByText('Control Enhancements')).not.toBeInTheDocument()
  })
})

// ============================================================
// CatalogView - FAB Sidebar Toggle Tests
// ============================================================

describe('CatalogView - FAB Sidebar Toggle', () => {
  it('renders FAB toggle button', () => {
    render(<CatalogView catalog={testCatalog} />)
    expect(screen.getByLabelText('Open navigation')).toBeInTheDocument()
  })

  it('FAB has aria-expanded false by default', () => {
    render(<CatalogView catalog={testCatalog} />)
    expect(screen.getByLabelText('Open navigation').getAttribute('aria-expanded')).toBe('false')
  })

  it('clicking FAB opens sidebar', () => {
    const { container } = render(<CatalogView catalog={testCatalog} />)
    fireEvent.click(screen.getByLabelText('Open navigation'))
    const sidebar = container.querySelector('.catalog-sidebar')
    expect(sidebar?.classList.contains('open')).toBe(true)
  })

  it('FAB aria-label changes when sidebar is open', () => {
    render(<CatalogView catalog={testCatalog} />)
    fireEvent.click(screen.getByLabelText('Open navigation'))
    expect(screen.getByLabelText('Close navigation')).toBeInTheDocument()
  })

  it('FAB aria-expanded is true when sidebar is open', () => {
    render(<CatalogView catalog={testCatalog} />)
    fireEvent.click(screen.getByLabelText('Open navigation'))
    expect(screen.getByLabelText('Close navigation').getAttribute('aria-expanded')).toBe('true')
  })

  it('clicking FAB again closes sidebar', () => {
    const { container } = render(<CatalogView catalog={testCatalog} />)
    fireEvent.click(screen.getByLabelText('Open navigation'))
    fireEvent.click(screen.getByLabelText('Close navigation'))
    const sidebar = container.querySelector('.catalog-sidebar')
    expect(sidebar?.classList.contains('open')).toBe(false)
  })
})

// ============================================================
// CatalogView - Sidebar Backdrop Tests
// ============================================================

describe('CatalogView - Sidebar Backdrop', () => {
  it('renders backdrop element', () => {
    const { container } = render(<CatalogView catalog={testCatalog} />)
    expect(container.querySelector('.sidebar-backdrop')).toBeTruthy()
  })

  it('backdrop is not visible by default', () => {
    const { container } = render(<CatalogView catalog={testCatalog} />)
    const backdrop = container.querySelector('.sidebar-backdrop')
    expect(backdrop?.classList.contains('visible')).toBe(false)
  })

  it('backdrop becomes visible when sidebar opens', () => {
    const { container } = render(<CatalogView catalog={testCatalog} />)
    fireEvent.click(screen.getByLabelText('Open navigation'))
    const backdrop = container.querySelector('.sidebar-backdrop')
    expect(backdrop?.classList.contains('visible')).toBe(true)
  })

  it('clicking backdrop closes sidebar', () => {
    const { container } = render(<CatalogView catalog={testCatalog} />)
    fireEvent.click(screen.getByLabelText('Open navigation'))
    const backdrop = container.querySelector('.sidebar-backdrop')!
    fireEvent.click(backdrop)
    const sidebar = container.querySelector('.catalog-sidebar')
    expect(sidebar?.classList.contains('open')).toBe(false)
  })
})

// ============================================================
// Navigation Multi-Line Tests (QS1-QS4)
// ============================================================

const catalogWithLongTitles: Catalog = {
  uuid: 'cat-long',
  metadata: minimalMetadata,
  groups: [{
    id: 'ac',
    title: 'Access Control Family with a Very Long Title That Should Wrap to Multiple Lines in Navigation',
    controls: [{
      id: 'ac-1',
      title: 'Access Control Policy and Procedures for Organizational Information Systems and Environments of Operation',
    }],
  }],
}

describe('GroupTree - Multi-Line Navigation (QS1-QS4)', () => {
  const onSelect = vi.fn()

  it('QS1: long control title is fully displayed without truncation', () => {
    render(<GroupTree groups={catalogWithLongTitles.groups} selectedControlId={null} onSelectControl={onSelect} />)
    expect(screen.getByText('Access Control Policy and Procedures for Organizational Information Systems and Environments of Operation')).toBeInTheDocument()
  })

  it('QS1: long group title is fully displayed', () => {
    render(<GroupTree groups={catalogWithLongTitles.groups} selectedControlId={null} onSelectControl={onSelect} />)
    expect(screen.getByText('Access Control Family with a Very Long Title That Should Wrap to Multiple Lines in Navigation')).toBeInTheDocument()
  })

  it('QS2: control button has separate ID and title spans for multi-line alignment', () => {
    const { container } = render(<GroupTree groups={catalogWithLongTitles.groups} selectedControlId={null} onSelectControl={onSelect} />)
    const controlBtn = container.querySelector('.tree-control-btn')!
    expect(controlBtn.querySelector('.tree-control-id')).toBeTruthy()
    expect(controlBtn.querySelector('.tree-control-title')).toBeTruthy()
    expect(controlBtn.querySelector('.tree-control-id')?.textContent).toBe('ac-1')
  })

  it('QS2: group header has separate chevron, ID and title elements', () => {
    const { container } = render(<GroupTree groups={catalogWithLongTitles.groups} selectedControlId={null} onSelectControl={onSelect} />)
    const groupHeader = container.querySelector('.tree-group-header')!
    expect(groupHeader.querySelector('.tree-chevron')).toBeTruthy()
    expect(groupHeader.querySelector('.tree-group-id')).toBeTruthy()
    expect(groupHeader.querySelector('.tree-group-title')).toBeTruthy()
  })

  it('QS3: selected state is applied to full-width row container', () => {
    const { container } = render(<GroupTree groups={catalogWithLongTitles.groups} selectedControlId="ac-1" onSelectControl={onSelect} />)
    const selectedRow = container.querySelector('.tree-control-row.selected')
    expect(selectedRow).toBeTruthy()
    expect(selectedRow?.querySelector('.tree-control-btn')).toBeTruthy()
  })

  it('QS4: control navigation items are native button elements', () => {
    const { container } = render(<GroupTree groups={catalogWithLongTitles.groups} selectedControlId={null} onSelectControl={onSelect} />)
    const controlBtns = container.querySelectorAll('.tree-control-btn')
    expect(controlBtns.length).toBeGreaterThan(0)
    for (const btn of Array.from(controlBtns)) {
      expect(btn.tagName.toLowerCase()).toBe('button')
    }
  })

  it('QS4: group headers are native button elements', () => {
    const { container } = render(<GroupTree groups={catalogWithLongTitles.groups} selectedControlId={null} onSelectControl={onSelect} />)
    const groupHeaders = container.querySelectorAll('.tree-group-header')
    expect(groupHeaders.length).toBeGreaterThan(0)
    for (const btn of Array.from(groupHeaders)) {
      expect(btn.tagName.toLowerCase()).toBe('button')
    }
  })
})

// ============================================================
// Nested Part-Accordion Tests (QS5-QS11)
// ============================================================

const controlWithNestedParts: Control = {
  id: 'nested-ac-1',
  title: 'Access Control Policy',
  parts: [
    {
      name: 'statement', id: 'ac-1_smt',
      prose: 'Organization defines...',
      parts: [
        { name: 'item', id: 'ac-1_smt.a', prose: 'Item a text' },
        {
          name: 'item', id: 'ac-1_smt.b', prose: 'Item b text',
          parts: [
            { name: 'item', id: 'ac-1_smt.b.1', prose: 'Sub-item 1' },
          ],
        },
      ],
    },
    { name: 'guidance', id: 'ac-1_gdn', prose: 'Guidance text here' },
  ],
}

describe('ControlDetail - Nested Part Accordions (QS5-QS11)', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('QS5: part accordion renders with correct aria-expanded', () => {
    const { container } = render(<ControlDetail control={controlWithNestedParts} />)
    const trigger = container.querySelector('#ac-1_smt-0-trigger')
    expect(trigger).toBeTruthy()
    expect(trigger?.getAttribute('aria-expanded')).toBe('true')
  })

  it('QS5: guidance part accordion also has aria-expanded', () => {
    const { container } = render(<ControlDetail control={controlWithNestedParts} />)
    const trigger = container.querySelector('#ac-1_gdn-0-trigger')
    expect(trigger).toBeTruthy()
    expect(trigger?.hasAttribute('aria-expanded')).toBe(true)
  })

  it('QS6: depth 0 part renders heading as h4', () => {
    const { container } = render(<ControlDetail control={controlWithNestedParts} />)
    const h4headings = container.querySelectorAll('h4.accordion-heading')
    expect(h4headings.length).toBeGreaterThan(0)
  })

  it('QS6: depth 1 nested part renders heading as h5', () => {
    const { container } = render(<ControlDetail control={controlWithNestedParts} />)
    const h5headings = container.querySelectorAll('h5.accordion-heading')
    expect(h5headings.length).toBeGreaterThan(0)
  })

  it('QS7: top-level parts (depth 0) are open by default', () => {
    const { container } = render(<ControlDetail control={controlWithNestedParts} />)
    const content = container.querySelector('#ac-1_smt-0-content')
    expect(content?.hasAttribute('hidden')).toBe(false)
  })

  it('QS7: sub-level parts (depth > 0) are closed by default', () => {
    const { container } = render(<ControlDetail control={controlWithNestedParts} />)
    const content = container.querySelector('[id="ac-1_smt.b-1-content"]')
    expect(content?.hasAttribute('hidden')).toBe(true)
  })

  it('QS8: item without children renders flat (no accordion)', () => {
    const { container } = render(<ControlDetail control={controlWithNestedParts} />)
    expect(container.querySelector('[id="ac-1_smt.a-1-trigger"]')).toBeNull()
    expect(screen.getByText('Item a text')).toBeInTheDocument()
  })

  it('QS8: item with children renders as accordion', () => {
    const { container } = render(<ControlDetail control={controlWithNestedParts} />)
    const trigger = container.querySelector('[id="ac-1_smt.b-1-trigger"]')
    expect(trigger).toBeTruthy()
  })

  it('QS10: clicking accordion trigger toggles part visibility', () => {
    const { container } = render(<ControlDetail control={controlWithNestedParts} />)
    const trigger = container.querySelector('#ac-1_smt-0-trigger')!
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    fireEvent.click(trigger)
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    fireEvent.click(trigger)
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
  })

  it('QS11: part accordion state persists to sessionStorage', () => {
    const { container } = render(<ControlDetail control={controlWithNestedParts} />)
    fireEvent.click(container.querySelector('#ac-1_smt-0-trigger')!)
    expect(sessionStorage.getItem('accordion-ac-1_smt-0')).toBe('false')
  })

  it('QS11: part accordion restores state from sessionStorage', () => {
    sessionStorage.setItem('accordion-ac-1_smt-0', 'false')
    const { container } = render(<ControlDetail control={controlWithNestedParts} />)
    const content = container.querySelector('#ac-1_smt-0-content')
    expect(content?.hasAttribute('hidden')).toBe(true)
  })
})

// ============================================================
// Deep Nesting Heading Cap Tests (QS9)
// ============================================================

const deeplyNestedControl: Control = {
  id: 'deep-1',
  title: 'Deeply Nested Control',
  parts: [
    {
      name: 'statement', id: 'deep_smt', title: 'Statement',
      prose: 'Top level',
      parts: [
        {
          name: 'guidance', id: 'deep_l1', title: 'Level 1',
          parts: [
            {
              name: 'guidance', id: 'deep_l2', title: 'Level 2',
              parts: [
                {
                  name: 'guidance', id: 'deep_l3', title: 'Level 3',
                  prose: 'Deepest content',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}

describe('ControlDetail - Deep Nesting Heading Cap (QS9)', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('QS9: heading levels cap at h6 for deeply nested parts', () => {
    const { container } = render(<ControlDetail control={deeplyNestedControl} />)
    const h6s = container.querySelectorAll('h6.accordion-heading')
    // depth 2 (Level 2) and depth 3 (Level 3) both produce h6
    expect(h6s.length).toBe(2)
  })

  it('QS9: no heading level beyond h6 exists', () => {
    const { container } = render(<ControlDetail control={deeplyNestedControl} />)
    for (let i = 7; i <= 10; i++) {
      expect(container.querySelector(`h${i}`)).toBeNull()
    }
  })
})

// ============================================================
// Tab Order & Keyboard Reachability (QS17-QS18)
// ============================================================

describe('ControlDetail - Tab Order & Keyboard (QS17-QS18)', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('QS17: accordion triggers appear in logical document order', () => {
    const { container } = render(<ControlDetail control={controlWithNestedParts} />)
    const triggers = container.querySelectorAll('[id$="-trigger"]')
    const triggerIds = Array.from(triggers).map(t => t.id)
    // Content accordion first, then parts in DOM order
    expect(triggerIds[0]).toContain('parts-trigger')
    expect(triggerIds).toContain('ac-1_smt-0-trigger')
    expect(triggerIds).toContain('ac-1_gdn-0-trigger')
  })

  it('QS18: all accordion triggers are button elements', () => {
    const { container } = render(<ControlDetail control={controlWithNestedParts} />)
    const triggers = container.querySelectorAll('[id$="-trigger"]')
    expect(triggers.length).toBeGreaterThan(0)
    for (const trigger of Array.from(triggers)) {
      expect(trigger.tagName.toLowerCase()).toBe('button')
    }
  })

  it('QS18: CopyLinkButton is a keyboard-accessible button', () => {
    const { container } = render(<ControlDetail control={controlWithNestedParts} />)
    const copyBtn = container.querySelector('.copy-link-btn')
    expect(copyBtn).toBeTruthy()
    expect(copyBtn?.tagName.toLowerCase()).toBe('button')
  })
})

// ============================================================
// ControlDetail - Link Resolution Tests
// ============================================================

const allLinkTypes: Link[] = [
  { href: '#ac-1', rel: 'related-control', text: 'See AC-1' },
  { href: 'https://example.com/nist.json', rel: 'implements', text: 'NIST Doc' },
  { href: 'urn:iso:std:27001:2022', rel: 'required' },
  { href: './other-catalog.json#ctrl-1', rel: 'template', text: 'Other Catalog' },
  { href: 'https://bsi.bund.de/baustein', rel: 'bsi-baustein' },
]

const controlWithAllLinks: Control = {
  id: 'link-test',
  title: 'Link Resolution Test Control',
  links: allLinkTypes,
}

describe('ControlDetail - Link Resolution', () => {
  beforeEach(() => {
    sessionStorage.clear()
    history.replaceState(null, '', window.location.pathname)
  })

  it('fragment link renders as anchor with catalog deep-link href', () => {
    const { container } = render(<ControlDetail control={controlWithAllLinks} />)
    const link = container.querySelector('a[href="#/catalog/ac-1"]')
    expect(link).toBeTruthy()
    expect(link?.textContent).toBe('See AC-1')
  })

  it('fragment link click sets location hash', () => {
    const { container } = render(<ControlDetail control={controlWithAllLinks} />)
    const link = container.querySelector('a[href="#/catalog/ac-1"]') as HTMLAnchorElement
    fireEvent.click(link)
    expect(location.hash).toBe('#/catalog/ac-1')
  })

  it('absolute URL renders as external link with target="_blank"', () => {
    const { container } = render(<ControlDetail control={controlWithAllLinks} />)
    const link = container.querySelector('a[href="https://example.com/nist.json"]')
    expect(link).toBeTruthy()
    expect(link?.getAttribute('target')).toBe('_blank')
    expect(link?.getAttribute('rel')).toBe('noopener noreferrer')
    expect(link?.textContent).toBe('NIST Doc')
  })

  it('URN renders as non-clickable span', () => {
    const { container } = render(<ControlDetail control={controlWithAllLinks} />)
    const urnSpan = container.querySelector('.link-urn')
    expect(urnSpan).toBeTruthy()
    expect(urnSpan?.textContent).toBe('urn:iso:std:27001:2022')
    expect(urnSpan?.tagName.toLowerCase()).toBe('span')
  })

  it('relative path renders as non-clickable span', () => {
    render(<ControlDetail control={controlWithAllLinks} />)
    expect(screen.getByText('Other Catalog')).toBeInTheDocument()
    const span = screen.getByText('Other Catalog')
    expect(span.tagName.toLowerCase()).toBe('span')
    expect(span.classList.contains('link-urn')).toBe(true)
  })

  it('absolute URL without text shows href as label', () => {
    const ctrl: Control = {
      id: 'no-text',
      title: 'No Text Links',
      links: [{ href: 'https://example.com/doc' }],
    }
    render(<ControlDetail control={ctrl} />)
    expect(screen.getByText('https://example.com/doc')).toBeInTheDocument()
  })
})

// ============================================================
// ControlDetail - LinkBadge Integration Tests
// ============================================================

describe('ControlDetail - LinkBadge Integration', () => {
  it('renders LinkBadge for implements rel', () => {
    const { container } = render(<ControlDetail control={controlWithAllLinks} />)
    expect(container.querySelector('.link-badge--implements')).toBeTruthy()
  })

  it('renders LinkBadge for required rel', () => {
    const { container } = render(<ControlDetail control={controlWithAllLinks} />)
    expect(container.querySelector('.link-badge--required')).toBeTruthy()
  })

  it('renders LinkBadge for related-control rel', () => {
    const { container } = render(<ControlDetail control={controlWithAllLinks} />)
    expect(container.querySelector('.link-badge--related')).toBeTruthy()
  })

  it('renders LinkBadge for bsi-baustein rel', () => {
    const { container } = render(<ControlDetail control={controlWithAllLinks} />)
    expect(container.querySelector('.link-badge--bsi')).toBeTruthy()
  })

  it('renders LinkBadge for template rel', () => {
    const { container } = render(<ControlDetail control={controlWithAllLinks} />)
    expect(container.querySelector('.link-badge--template')).toBeTruthy()
  })

  it('does not render LinkBadge when link has no rel', () => {
    const ctrl: Control = {
      id: 'no-rel',
      title: 'No Rel Test',
      links: [{ href: 'https://example.com' }],
    }
    const { container } = render(<ControlDetail control={ctrl} />)
    expect(container.querySelector('.link-badge')).toBeNull()
  })

  it('renders correct badge count matching links with rel', () => {
    const { container } = render(<ControlDetail control={controlWithAllLinks} />)
    const badges = container.querySelectorAll('.link-badge')
    // All 5 links have rel attributes
    expect(badges.length).toBe(5)
  })
})
