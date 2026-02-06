import { render } from '@testing-library/preact'
import { axe } from 'vitest-axe'
import * as matchers from 'vitest-axe/matchers'
import { MetadataPanel } from '@/components/shared/metadata-panel'
import { PropertyBadge, PropertyList } from '@/components/shared/property-badge'
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
