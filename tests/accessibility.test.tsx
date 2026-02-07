import { render } from '@testing-library/preact'
import { axe } from 'vitest-axe'
import * as matchers from 'vitest-axe/matchers'
import { MetadataPanel } from '@/components/shared/metadata-panel'
import { PropertyBadge, PropertyList } from '@/components/shared/property-badge'
import { StatusBadge } from '@/components/shared/status-badge'
import { Accordion } from '@/components/shared/accordion'
import { SearchBar } from '@/components/shared/search-bar'
import { CatalogView } from '@/components/catalog/catalog-view'
import { ControlDetail } from '@/components/catalog/control-detail'
import { GroupTree } from '@/components/catalog/group-tree'
import { ProfileView } from '@/components/profile/profile-view'
import { ComponentDefView } from '@/components/component-def/component-def-view'
import { SspView } from '@/components/ssp/ssp-view'
import type { Metadata, Property, Catalog, Control, Profile, ComponentDefinition, SystemSecurityPlan } from '@/types/oscal'

expect.extend(matchers)

// ============================================================
// Shared Fixtures
// ============================================================

const metadata: Metadata = {
  title: 'Test Document',
  'last-modified': '2026-02-06T00:00:00Z',
  version: '1.0',
  'oscal-version': '1.1.2',
}

const testCatalog: Catalog = {
  uuid: 'cat-001',
  metadata,
  groups: [
    {
      id: 'ac',
      title: 'Access Control',
      controls: [
        {
          id: 'ac-1',
          title: 'Policy and Procedures',
          params: [{ id: 'ac-1_prm_1', label: 'frequency' }],
          parts: [{ name: 'statement', prose: 'Develop policy.' }],
        },
        { id: 'ac-2', title: 'Account Management' },
      ],
    },
  ],
}

const testProfile: Profile = {
  uuid: 'prof-001',
  metadata,
  imports: [
    {
      href: '#catalog',
      'include-controls': [{ 'with-ids': ['ac-1'] }],
    },
  ],
  merge: { 'as-is': true },
  modify: {
    'set-parameters': [
      { 'param-id': 'ac-1_prm_1', values: ['monthly'] },
    ],
    alters: [
      {
        'control-id': 'ac-1',
        adds: [{ position: 'ending', parts: [{ name: 'guidance', prose: 'Extra.' }] }],
      },
    ],
  },
}

const testComponentDef: ComponentDefinition = {
  uuid: 'cd-001',
  metadata,
  components: [
    {
      uuid: 'comp-001',
      type: 'software',
      title: 'Test App',
      description: 'A test app',
      'control-implementations': [
        {
          uuid: 'ci-001',
          source: '#catalog',
          description: 'Controls',
          'implemented-requirements': [
            { uuid: 'ir-001', 'control-id': 'ac-1', description: 'RBAC' },
          ],
        },
      ],
    },
  ],
}

const testSsp: SystemSecurityPlan = {
  uuid: 'ssp-001',
  metadata,
  'import-profile': { href: '#profile' },
  'system-characteristics': {
    'system-ids': [{ id: 'sys-001' }],
    'system-name': 'Test System',
    description: 'A test system',
    'system-information': {
      'information-types': [{ title: 'Info', description: 'Info' }],
    },
    status: { state: 'operational' },
    'authorization-boundary': { description: 'Boundary' },
  },
  'system-implementation': {
    users: [{ uuid: 'u1', title: 'Admin' }],
    components: [
      { uuid: 'c1', type: 'this-system', title: 'System', description: 'System', status: { state: 'operational' } },
    ],
  },
  'control-implementation': {
    description: 'Controls',
    'implemented-requirements': [
      { uuid: 'ir-1', 'control-id': 'ac-1' },
    ],
  },
}

// ============================================================
// Accessibility Tests - Shared Components
// ============================================================

describe('Accessibility - Shared Components', () => {
  it('MetadataPanel has no a11y violations', async () => {
    const { container } = render(<MetadataPanel metadata={metadata} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('PropertyBadge has no a11y violations', async () => {
    const prop: Property = { name: 'label', value: 'high', uuid: 'p1' }
    const { container } = render(<PropertyBadge prop={prop} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('PropertyList has no a11y violations', async () => {
    const props: Property[] = [
      { name: 'label', value: 'high', uuid: 'p1' },
      { name: 'sort-id', value: 'ac-01', uuid: 'p2' },
    ]
    const { container } = render(<PropertyList props={props} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})

// ============================================================
// Accessibility Tests - Catalog Components
// ============================================================

describe('Accessibility - Catalog', () => {
  it('CatalogView has no a11y violations', async () => {
    const { container } = render(<CatalogView catalog={testCatalog} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('GroupTree has no a11y violations', async () => {
    const { container } = render(
      <GroupTree
        groups={testCatalog.groups}
        selectedControlId={null}
        onSelectControl={() => {}}
      />
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('ControlDetail has no a11y violations', async () => {
    const control: Control = testCatalog.groups![0].controls![0]
    const { container } = render(<ControlDetail control={control} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})

// ============================================================
// Accessibility Tests - Profile
// ============================================================

describe('Accessibility - Profile', () => {
  it('ProfileView has no a11y violations', async () => {
    const { container } = render(<ProfileView profile={testProfile} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})

// ============================================================
// Accessibility Tests - Component Definition
// ============================================================

describe('Accessibility - Component Definition', () => {
  it('ComponentDefView has no a11y violations', async () => {
    const { container } = render(<ComponentDefView componentDef={testComponentDef} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})

// ============================================================
// Accessibility Tests - SSP
// ============================================================

describe('Accessibility - SSP', () => {
  it('SspView has no a11y violations', async () => {
    const { container } = render(<SspView ssp={testSsp} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})

// ============================================================
// Accessibility Tests - StatusBadge
// ============================================================

describe('Accessibility - StatusBadge', () => {
  it('StatusBadge has no a11y violations', async () => {
    const { container } = render(<StatusBadge state="operational" />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})

// ============================================================
// Accessibility Tests - Accordion
// ============================================================

describe('Accessibility - Accordion', () => {
  it('Accordion has no a11y violations', async () => {
    const { container } = render(
      <Accordion id="a11y-test" title="Test Section" headingLevel={3}>
        <p>Accordion content</p>
      </Accordion>
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})

// ============================================================
// Accessibility Tests - SearchBar Combobox
// ============================================================

describe('Accessibility - SearchBar Combobox', () => {
  it('SearchBar with results has no a11y violations', async () => {
    const searchResults = [
      { id: 'ac-1', title: 'Policy', type: 'control', context: 'Access' },
    ]
    const { container } = render(
      <SearchBar query="ac" onQueryChange={() => {}} results={searchResults} isSearching={true} />
    )
    const axeResults = await axe(container)
    expect(axeResults).toHaveNoViolations()
  })

  it('SearchBar without results has no a11y violations', async () => {
    const { container } = render(
      <SearchBar query="" onQueryChange={() => {}} results={[]} isSearching={false} />
    )
    const axeResults = await axe(container)
    expect(axeResults).toHaveNoViolations()
  })
})

// ============================================================
// Accessibility Tests - Nested Part Accordions (QS12)
// ============================================================

describe('Accessibility - Nested Part Accordions (QS12)', () => {
  const nestedControl: Control = {
    id: 'qs12-ac-1',
    title: 'Access Control Policy',
    parts: [
      {
        name: 'statement', id: 'qs12-smt',
        prose: 'Organization defines...',
        parts: [
          { name: 'item', id: 'qs12-smt.a', prose: 'Item a text' },
          {
            name: 'item', id: 'qs12-smt.b', prose: 'Item b text',
            parts: [
              { name: 'item', id: 'qs12-smt.b.1', prose: 'Sub-item 1' },
            ],
          },
        ],
      },
      { name: 'guidance', id: 'qs12-gdn', prose: 'Guidance text...' },
    ],
  }

  it('QS12: ControlDetail with nested parts has no a11y violations', async () => {
    const { container } = render(<ControlDetail control={nestedControl} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})

// ============================================================
// Accessibility Tests - Heading Hierarchy (QS14)
// ============================================================

describe('Accessibility - Heading Hierarchy (QS14)', () => {
  const nestedControl: Control = {
    id: 'qs14-ac-1',
    title: 'Access Control Policy',
    parts: [
      {
        name: 'statement', id: 'qs14-smt',
        prose: 'Organization defines...',
        parts: [
          { name: 'item', id: 'qs14-smt.a', prose: 'Item a' },
          {
            name: 'item', id: 'qs14-smt.b', prose: 'Item b',
            parts: [
              { name: 'item', id: 'qs14-smt.b.1', prose: 'Sub-item 1' },
            ],
          },
        ],
      },
      { name: 'guidance', id: 'qs14-gdn', prose: 'Guidance text' },
    ],
  }

  it('QS14: heading levels do not skip (no h2 to h4 jump)', () => {
    const { container } = render(<ControlDetail control={nestedControl} />)
    const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6')
    const levels = Array.from(headings).map(h => parseInt(h.tagName[1]))

    for (let i = 1; i < levels.length; i++) {
      const jump = levels[i] - levels[i - 1]
      expect(jump).toBeLessThanOrEqual(1)
    }
  })

  it('QS14: heading hierarchy includes h2, h3, h4 in correct sequence', () => {
    const { container } = render(<ControlDetail control={nestedControl} />)
    const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6')
    const uniqueLevels = [...new Set(Array.from(headings).map(h => parseInt(h.tagName[1])))].sort()
    expect(uniqueLevels).toContain(2)
    expect(uniqueLevels).toContain(3)
    expect(uniqueLevels).toContain(4)
  })
})

// ============================================================
// Accessibility Tests - Contrast Ratio (QS16)
// ============================================================

describe('Accessibility - Status Badge Contrast (QS16)', () => {
  function hexToLinear(hex: string): [number, number, number] {
    const h = hex.replace('#', '')
    const toLinear = (c: number): number => {
      const srgb = c / 255
      return srgb <= 0.04045 ? srgb / 12.92 : Math.pow((srgb + 0.055) / 1.055, 2.4)
    }
    return [
      toLinear(parseInt(h.substring(0, 2), 16)),
      toLinear(parseInt(h.substring(2, 4), 16)),
      toLinear(parseInt(h.substring(4, 6), 16)),
    ]
  }

  function luminance(hex: string): number {
    const [r, g, b] = hexToLinear(hex)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }

  function contrastRatio(fg: string, bg: string): number {
    const l1 = luminance(fg)
    const l2 = luminance(bg)
    const lighter = Math.max(l1, l2)
    const darker = Math.min(l1, l2)
    return (lighter + 0.05) / (darker + 0.05)
  }

  const lightPairs = [
    { name: 'success', fg: '#166534', bg: '#dcfce7' },
    { name: 'error', fg: '#991b1b', bg: '#fee2e2' },
    { name: 'warning', fg: '#854d0e', bg: '#fef9c3' },
    { name: 'orange', fg: '#9a3412', bg: '#ffedd5' },
    { name: 'info', fg: '#1e40af', bg: '#dbeafe' },
  ]

  const darkPairs = [
    { name: 'success', fg: '#86efac', bg: '#052e16' },
    { name: 'error', fg: '#fca5a5', bg: '#450a0a' },
    { name: 'warning', fg: '#fde68a', bg: '#422006' },
    { name: 'orange', fg: '#fdba74', bg: '#431407' },
    { name: 'info', fg: '#93c5fd', bg: '#172554' },
  ]

  for (const pair of lightPairs) {
    it(`QS16: light mode ${pair.name} badge contrast >= 4.5:1`, () => {
      const ratio = contrastRatio(pair.fg, pair.bg)
      expect(ratio).toBeGreaterThanOrEqual(4.5)
    })
  }

  for (const pair of darkPairs) {
    it(`QS16: dark mode ${pair.name} badge contrast >= 4.5:1`, () => {
      const ratio = contrastRatio(pair.fg, pair.bg)
      expect(ratio).toBeGreaterThanOrEqual(4.5)
    })
  }
})

// ============================================================
// Accessibility Tests - Full Audit with Nested Parts (QS19)
// ============================================================

describe('Accessibility - Full Audit with Nested Parts (QS19)', () => {
  it('QS19: CatalogView with nested-parts control has no a11y violations', async () => {
    const nestedCatalog: Catalog = {
      uuid: 'cat-qs19',
      metadata,
      groups: [{
        id: 'ac',
        title: 'Access Control',
        controls: [{
          id: 'qs19-ac-1',
          title: 'Access Control Policy',
          parts: [
            {
              name: 'statement', id: 'qs19-smt',
              prose: 'Organization defines...',
              parts: [
                { name: 'item', id: 'qs19-smt.a', prose: 'Item a' },
              ],
            },
          ],
        }],
      }],
    }
    const { container } = render(<CatalogView catalog={nestedCatalog} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
