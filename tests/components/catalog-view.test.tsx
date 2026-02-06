import { render, screen, fireEvent } from '@testing-library/preact'
import { CatalogView } from '@/components/catalog/catalog-view'
import { GroupTree } from '@/components/catalog/group-tree'
import { ControlDetail } from '@/components/catalog/control-detail'
import type { Catalog, Control, Group } from '@/types/oscal'

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
