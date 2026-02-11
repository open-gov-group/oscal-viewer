import { buildIndex, indexResolvedControls } from '@/hooks/use-search'
import type { OscalDocumentData, Control } from '@/types/oscal'

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
    uuid: 'cat-uuid-001',
    metadata: minimalMetadata,
    groups: [
      {
        id: 'ac',
        title: 'Access Control',
        controls: [
          {
            id: 'ac-1',
            title: 'Policy and Procedures',
            parts: [
              { name: 'statement', prose: 'The organization develops access control policy.' },
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
        title: 'Audit and Accountability',
        controls: [
          { id: 'au-1', title: 'Audit Policy' },
        ],
      },
    ],
  },
}

const profileData: OscalDocumentData = {
  type: 'profile',
  document: {
    uuid: 'prof-uuid-001',
    metadata: { ...minimalMetadata, title: 'Test Profile' },
    imports: [
      {
        href: '#catalog-uuid',
        'include-controls': [{ 'with-ids': ['ac-1', 'ac-2'] }],
      },
      {
        href: 'https://example.com/catalog.json',
      },
    ],
    modify: {
      'set-parameters': [
        { 'param-id': 'ac-1_prm_1', values: ['monthly'], label: 'Frequency' },
      ],
      alters: [
        { 'control-id': 'ac-1', adds: [{ position: 'ending', parts: [{ name: 'guidance', prose: 'Extra guidance.' }] }] },
      ],
    },
  },
}

const componentDefData: OscalDocumentData = {
  type: 'component-definition',
  document: {
    uuid: 'comp-uuid-001',
    metadata: { ...minimalMetadata, title: 'Test Component Definition' },
    components: [
      {
        uuid: 'comp-001',
        type: 'software',
        title: 'Test Application',
        description: 'A test application component',
        purpose: 'To test things',
        'control-implementations': [
          {
            uuid: 'ci-001',
            source: '#catalog-uuid',
            description: 'Implementation of controls',
            'implemented-requirements': [
              {
                uuid: 'ir-001',
                'control-id': 'ac-1',
                description: 'Access control is implemented via RBAC',
              },
              {
                uuid: 'ir-002',
                'control-id': 'ac-2',
                description: 'Account management via LDAP',
              },
            ],
          },
        ],
      },
      {
        uuid: 'comp-002',
        type: 'hardware',
        title: 'Firewall Appliance',
        description: 'Network perimeter firewall',
      },
    ],
  },
}

const sspData: OscalDocumentData = {
  type: 'system-security-plan',
  document: {
    uuid: 'ssp-uuid-001',
    metadata: { ...minimalMetadata, title: 'Test SSP' },
    'import-profile': { href: '#profile-uuid' },
    'system-characteristics': {
      'system-ids': [{ id: 'sys-001' }],
      'system-name': 'Enterprise Portal',
      'system-name-short': 'EP',
      description: 'An enterprise web portal for data management',
      'system-information': {
        'information-types': [
          { title: 'General Info', description: 'General information' },
        ],
      },
      status: { state: 'operational' },
      'authorization-boundary': { description: 'The system boundary' },
    },
    'system-implementation': {
      users: [
        { uuid: 'user-001', title: 'System Administrator', 'role-ids': ['admin'] },
        { uuid: 'user-002', title: 'End User' },
      ],
      components: [
        {
          uuid: 'sc-001',
          type: 'this-system',
          title: 'Enterprise Portal System',
          description: 'The system itself',
          status: { state: 'operational' },
        },
      ],
    },
    'control-implementation': {
      description: 'Control implementation for the system',
      'implemented-requirements': [
        {
          uuid: 'ir-001',
          'control-id': 'ac-1',
          'by-components': [
            {
              'component-uuid': 'sc-001',
              uuid: 'bc-001',
              description: 'Access control policy enforced by the portal',
            },
          ],
        },
        {
          uuid: 'ir-002',
          'control-id': 'au-1',
          remarks: 'Audit logging is enabled system-wide',
        },
      ],
    },
  },
}

// ============================================================
// Catalog Indexing Tests
// ============================================================

describe('buildIndex - Catalog', () => {
  it('should index groups', () => {
    const index = buildIndex(catalogData)
    const groups = index.filter(e => e.type === 'group')
    expect(groups).toHaveLength(2)
    expect(groups[0].id).toBe('ac')
    expect(groups[0].title).toBe('Access Control')
    expect(groups[1].id).toBe('au')
  })

  it('should index controls', () => {
    const index = buildIndex(catalogData)
    const controls = index.filter(e => e.type === 'control')
    expect(controls).toHaveLength(4)
    expect(controls.map(c => c.id)).toContain('ac-1')
    expect(controls.map(c => c.id)).toContain('ac-1.1')
    expect(controls.map(c => c.id)).toContain('ac-2')
    expect(controls.map(c => c.id)).toContain('au-1')
  })

  it('should include group title as context for controls', () => {
    const index = buildIndex(catalogData)
    const ac1 = index.find(e => e.id === 'ac-1')
    expect(ac1?.context).toBe('Access Control')
  })

  it('should include prose in searchText', () => {
    const index = buildIndex(catalogData)
    const ac1 = index.find(e => e.id === 'ac-1')
    expect(ac1?.searchText).toContain('access control policy')
  })

  it('should make searchText lowercase for case-insensitive search', () => {
    const index = buildIndex(catalogData)
    for (const entry of index) {
      expect(entry.searchText).toBe(entry.searchText.toLowerCase())
    }
  })
})

// ============================================================
// Profile Indexing Tests
// ============================================================

describe('buildIndex - Profile', () => {
  it('should index imports', () => {
    const index = buildIndex(profileData)
    const imports = index.filter(e => e.type === 'import')
    expect(imports).toHaveLength(2)
    expect(imports[0].id).toBe('#catalog-uuid')
    expect(imports[1].id).toBe('https://example.com/catalog.json')
  })

  it('should index alterations', () => {
    const index = buildIndex(profileData)
    const alters = index.filter(e => e.type === 'alteration')
    expect(alters).toHaveLength(1)
    expect(alters[0].id).toBe('ac-1')
  })

  it('should index parameter settings', () => {
    const index = buildIndex(profileData)
    const params = index.filter(e => e.type === 'parameter')
    expect(params).toHaveLength(1)
    expect(params[0].id).toBe('ac-1_prm_1')
    expect(params[0].context).toBe('monthly')
  })

  it('should include label in parameter searchText', () => {
    const index = buildIndex(profileData)
    const param = index.find(e => e.type === 'parameter')
    expect(param?.searchText).toContain('frequency')
  })
})

// ============================================================
// Component Definition Indexing Tests
// ============================================================

describe('buildIndex - Component Definition', () => {
  it('should index components', () => {
    const index = buildIndex(componentDefData)
    const components = index.filter(e => e.type === 'software' || e.type === 'hardware')
    expect(components).toHaveLength(2)
    expect(components[0].title).toBe('Test Application')
    expect(components[1].title).toBe('Firewall Appliance')
  })

  it('should index implemented requirements', () => {
    const index = buildIndex(componentDefData)
    const reqs = index.filter(e => e.type === 'requirement')
    expect(reqs).toHaveLength(2)
    expect(reqs[0].id).toBe('ac-1')
    expect(reqs[1].id).toBe('ac-2')
  })

  it('should include component title in requirement title', () => {
    const index = buildIndex(componentDefData)
    const req = index.find(e => e.id === 'ac-1' && e.type === 'requirement')
    expect(req?.title).toContain('Test Application')
  })

  it('should include purpose in component searchText', () => {
    const index = buildIndex(componentDefData)
    const comp = index.find(e => e.title === 'Test Application')
    expect(comp?.searchText).toContain('to test things')
  })
})

// ============================================================
// SSP Indexing Tests
// ============================================================

describe('buildIndex - SSP', () => {
  it('should index system entry', () => {
    const index = buildIndex(sspData)
    const system = index.find(e => e.type === 'system')
    expect(system).toBeDefined()
    expect(system?.title).toBe('Enterprise Portal')
    expect(system?.searchText).toContain('enterprise portal')
    expect(system?.searchText).toContain('ep')
  })

  it('should index system components', () => {
    const index = buildIndex(sspData)
    const components = index.filter(e => e.type === 'this-system')
    expect(components).toHaveLength(1)
    expect(components[0].title).toBe('Enterprise Portal System')
  })

  it('should index users', () => {
    const index = buildIndex(sspData)
    const users = index.filter(e => e.type === 'user')
    expect(users).toHaveLength(2)
    expect(users[0].title).toBe('System Administrator')
  })

  it('should include role-ids in user searchText', () => {
    const index = buildIndex(sspData)
    const admin = index.find(e => e.title === 'System Administrator')
    expect(admin?.searchText).toContain('admin')
  })

  it('should index implemented requirements', () => {
    const index = buildIndex(sspData)
    const reqs = index.filter(e => e.type === 'requirement')
    expect(reqs).toHaveLength(2)
    expect(reqs[0].id).toBe('ac-1')
    expect(reqs[1].id).toBe('au-1')
  })

  it('should include by-component descriptions in requirement searchText', () => {
    const index = buildIndex(sspData)
    const ac1 = index.find(e => e.id === 'ac-1' && e.type === 'requirement')
    expect(ac1?.searchText).toContain('access control policy enforced')
  })

  it('should include remarks in requirement searchText', () => {
    const index = buildIndex(sspData)
    const au1 = index.find(e => e.id === 'au-1' && e.type === 'requirement')
    expect(au1?.searchText).toContain('audit logging')
  })
})

// ============================================================
// Search Filtering Tests (simulated)
// ============================================================

describe('search filtering logic', () => {
  it('should find controls by ID', () => {
    const index = buildIndex(catalogData)
    const query = 'ac-1'
    const results = index.filter(e => e.searchText.includes(query.toLowerCase()))
    expect(results.length).toBeGreaterThan(0)
    expect(results.some(r => r.id === 'ac-1')).toBe(true)
  })

  it('should find controls by title keyword', () => {
    const index = buildIndex(catalogData)
    const query = 'account management'
    const results = index.filter(e => e.searchText.includes(query.toLowerCase()))
    expect(results.some(r => r.id === 'ac-2')).toBe(true)
  })

  it('should find controls by prose content', () => {
    const index = buildIndex(catalogData)
    const query = 'develops access'
    const results = index.filter(e => e.searchText.includes(query.toLowerCase()))
    expect(results.some(r => r.id === 'ac-1')).toBe(true)
  })

  it('should return no results for non-matching query', () => {
    const index = buildIndex(catalogData)
    const query = 'zzzznonexistent'
    const results = index.filter(e => e.searchText.includes(query.toLowerCase()))
    expect(results).toHaveLength(0)
  })

  it('should be case-insensitive', () => {
    const index = buildIndex(catalogData)
    const queryUpper = 'ACCESS CONTROL'
    const queryLower = 'access control'
    const resultsUpper = index.filter(e => e.searchText.includes(queryUpper.toLowerCase()))
    const resultsLower = index.filter(e => e.searchText.includes(queryLower.toLowerCase()))
    expect(resultsUpper).toEqual(resultsLower)
  })

  it('should find SSP system by short name', () => {
    const index = buildIndex(sspData)
    const query = 'ep'
    const results = index.filter(e => e.searchText.includes(query.toLowerCase()))
    expect(results.some(r => r.type === 'system')).toBe(true)
  })

  it('should find profile parameters by value', () => {
    const index = buildIndex(profileData)
    const query = 'monthly'
    const results = index.filter(e => e.searchText.includes(query.toLowerCase()))
    expect(results.some(r => r.type === 'parameter')).toBe(true)
  })
})

// ============================================================
// Resolved Controls Indexing Tests
// ============================================================

describe('indexResolvedControls', () => {
  const resolvedControls: Control[] = [
    {
      id: 'ac-1',
      title: 'Access Control Policy and Procedures',
      parts: [
        { name: 'statement', prose: 'The organization develops and maintains access control policy.' },
        { name: 'guidance', prose: 'Review annually.' },
      ],
    },
    {
      id: 'ac-2',
      title: 'Account Management',
    },
    {
      id: 'au-1',
      title: 'Audit and Accountability Policy',
      parts: [
        { name: 'statement', prose: 'Establish audit logging procedures.' },
      ],
    },
  ]

  it('should return empty array for undefined input', () => {
    expect(indexResolvedControls(undefined)).toEqual([])
  })

  it('should return empty array for empty array', () => {
    expect(indexResolvedControls([])).toEqual([])
  })

  it('should index all resolved controls', () => {
    const index = indexResolvedControls(resolvedControls)
    expect(index).toHaveLength(3)
  })

  it('should set type to resolved-control', () => {
    const index = indexResolvedControls(resolvedControls)
    for (const entry of index) {
      expect(entry.type).toBe('resolved-control')
    }
  })

  it('should set context to resolved hint', () => {
    const index = indexResolvedControls(resolvedControls)
    for (const entry of index) {
      expect(entry.context).toBe('Resolved from imported catalog')
    }
  })

  it('should include control ID and title in searchText', () => {
    const index = indexResolvedControls(resolvedControls)
    const ac1 = index.find(e => e.id === 'ac-1')
    expect(ac1?.searchText).toContain('ac-1')
    expect(ac1?.searchText).toContain('access control policy and procedures')
  })

  it('should include prose from parts in searchText', () => {
    const index = indexResolvedControls(resolvedControls)
    const ac1 = index.find(e => e.id === 'ac-1')
    expect(ac1?.searchText).toContain('develops and maintains')
    expect(ac1?.searchText).toContain('review annually')
  })

  it('should handle controls without parts', () => {
    const index = indexResolvedControls(resolvedControls)
    const ac2 = index.find(e => e.id === 'ac-2')
    expect(ac2).toBeDefined()
    expect(ac2?.title).toBe('Account Management')
    expect(ac2?.searchText).toContain('ac-2')
  })

  it('should produce lowercase searchText', () => {
    const index = indexResolvedControls(resolvedControls)
    for (const entry of index) {
      expect(entry.searchText).toBe(entry.searchText.toLowerCase())
    }
  })

  it('should be searchable alongside base index', () => {
    const baseIndex = buildIndex(catalogData)
    const resolvedIndex = indexResolvedControls(resolvedControls)
    const combined = [...baseIndex, ...resolvedIndex]
    const query = 'audit'
    const results = combined.filter(e => e.searchText.includes(query.toLowerCase()))
    // Should find from both base catalog and resolved controls
    expect(results.some(r => r.type === 'group')).toBe(true)
    expect(results.some(r => r.type === 'resolved-control')).toBe(true)
  })
})
