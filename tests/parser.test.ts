import { detectDocumentType, detectVersion } from '@/parser/detect'
import { parseCatalog, countControls } from '@/parser/catalog'
import { parseProfile } from '@/parser/profile'
import { parseComponentDefinition } from '@/parser/component-definition'
import { parseSSP } from '@/parser/ssp'
import { parseAssessmentResults } from '@/parser/assessment-results'
import { parsePoam } from '@/parser/poam'
import { parseOscalDocument } from '@/parser'

// ============================================================
// Test Fixtures
// ============================================================

const minimalMetadata = {
  title: 'Test Document',
  'last-modified': '2026-02-06T00:00:00Z',
  version: '1.0',
  'oscal-version': '1.1.2',
}

const catalogFixture = {
  catalog: {
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
            params: [{ id: 'ac-1_prm_1', label: 'organization-defined frequency' }],
            parts: [
              { name: 'statement', prose: 'The organization...' },
              { name: 'guidance', prose: 'Access control policy...' },
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

const profileFixture = {
  profile: {
    uuid: 'prof-uuid-001',
    metadata: { ...minimalMetadata, title: 'Test Profile' },
    imports: [
      {
        href: '#catalog-uuid',
        'include-controls': [{ 'with-ids': ['ac-1', 'ac-2'] }],
      },
    ],
    merge: { 'as-is': true },
    modify: {
      'set-parameters': [
        { 'param-id': 'ac-1_prm_1', values: ['monthly'] },
      ],
    },
  },
}

const componentDefFixture = {
  'component-definition': {
    uuid: 'comp-uuid-001',
    metadata: { ...minimalMetadata, title: 'Test Component Definition' },
    components: [
      {
        uuid: 'comp-001',
        type: 'software',
        title: 'Test Application',
        description: 'A test application component',
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
            ],
          },
        ],
      },
    ],
  },
}

const sspFixture = {
  'system-security-plan': {
    uuid: 'ssp-uuid-001',
    metadata: { ...minimalMetadata, title: 'Test SSP' },
    'import-profile': { href: '#profile-uuid' },
    'system-characteristics': {
      'system-ids': [{ id: 'sys-001' }],
      'system-name': 'Test System',
      description: 'A test system',
      'system-information': {
        'information-types': [
          { title: 'General Info', description: 'General information' },
        ],
      },
      status: { state: 'operational' },
      'authorization-boundary': { description: 'The system boundary' },
    },
    'system-implementation': {
      users: [{ uuid: 'user-001', title: 'Admin' }],
      components: [
        {
          uuid: 'sc-001',
          type: 'this-system',
          title: 'Test System',
          description: 'The system itself',
          status: { state: 'operational' },
        },
      ],
    },
    'control-implementation': {
      description: 'Control implementation for the system',
      'implemented-requirements': [
        { uuid: 'ir-001', 'control-id': 'ac-1' },
      ],
    },
  },
}

// ============================================================
// Detection Tests
// ============================================================

describe('detectDocumentType', () => {
  it('should detect catalog', () => {
    expect(detectDocumentType(catalogFixture)).toBe('catalog')
  })

  it('should detect profile', () => {
    expect(detectDocumentType(profileFixture)).toBe('profile')
  })

  it('should detect component-definition', () => {
    expect(detectDocumentType(componentDefFixture)).toBe('component-definition')
  })

  it('should detect system-security-plan', () => {
    expect(detectDocumentType(sspFixture)).toBe('system-security-plan')
  })

  it('should return unknown for unrecognized documents', () => {
    expect(detectDocumentType({ foo: {} })).toBe('unknown')
  })

  it('should return unknown for null', () => {
    expect(detectDocumentType(null)).toBe('unknown')
  })

  it('should return unknown for non-objects', () => {
    expect(detectDocumentType('string')).toBe('unknown')
    expect(detectDocumentType(42)).toBe('unknown')
    expect(detectDocumentType(undefined)).toBe('unknown')
  })

  it('should ignore top-level keys that are not objects', () => {
    expect(detectDocumentType({ catalog: 'not-an-object' })).toBe('unknown')
    expect(detectDocumentType({ catalog: null })).toBe('unknown')
  })
})

describe('detectVersion', () => {
  it('should extract version from catalog metadata', () => {
    expect(detectVersion(catalogFixture)).toBe('1.1.2')
  })

  it('should extract version from profile metadata', () => {
    expect(detectVersion(profileFixture)).toBe('1.1.2')
  })

  it('should extract version from component-definition metadata', () => {
    expect(detectVersion(componentDefFixture)).toBe('1.1.2')
  })

  it('should extract version from SSP metadata', () => {
    expect(detectVersion(sspFixture)).toBe('1.1.2')
  })

  it('should return unknown for missing metadata', () => {
    expect(detectVersion({ catalog: { uuid: '123' } })).toBe('unknown')
  })

  it('should return unknown for non-objects', () => {
    expect(detectVersion(null)).toBe('unknown')
    expect(detectVersion('string')).toBe('unknown')
  })

  it('should handle OSCAL 1.0.x versions', () => {
    const doc = {
      catalog: {
        uuid: '123',
        metadata: { ...minimalMetadata, 'oscal-version': '1.0.4' },
      },
    }
    expect(detectVersion(doc)).toBe('1.0.4')
  })
})

// ============================================================
// Catalog Parser Tests
// ============================================================

describe('parseCatalog', () => {
  it('should parse a valid catalog', () => {
    const result = parseCatalog(catalogFixture.catalog)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.uuid).toBe('cat-uuid-001')
      expect(result.data.metadata.title).toBe('Test Document')
      expect(result.data.groups).toHaveLength(2)
    }
  })

  it('should parse groups with nested controls', () => {
    const result = parseCatalog(catalogFixture.catalog)
    expect(result.success).toBe(true)
    if (result.success) {
      const acGroup = result.data.groups![0]
      expect(acGroup.controls).toHaveLength(2)
      expect(acGroup.controls![0].id).toBe('ac-1')
      expect(acGroup.controls![0].controls).toHaveLength(1)
    }
  })

  it('should fail for non-object input', () => {
    const result = parseCatalog('not an object')
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('not an object')
    }
  })

  it('should fail for missing uuid', () => {
    const result = parseCatalog({ metadata: minimalMetadata })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('uuid')
    }
  })

  it('should fail for missing metadata', () => {
    const result = parseCatalog({ uuid: '123' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('metadata')
    }
  })

  it('should handle catalog without groups or controls', () => {
    const result = parseCatalog({
      uuid: 'empty-cat',
      metadata: minimalMetadata,
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.groups).toBeUndefined()
      expect(result.data.controls).toBeUndefined()
    }
  })
})

describe('countControls', () => {
  it('should count all controls including nested', () => {
    const result = parseCatalog(catalogFixture.catalog)
    expect(result.success).toBe(true)
    if (result.success) {
      // ac-1, ac-1.1 (sub), ac-2, au-1 = 4
      expect(countControls(result.data)).toBe(4)
    }
  })

  it('should return 0 for empty catalog', () => {
    expect(countControls({
      uuid: 'empty',
      metadata: minimalMetadata,
    })).toBe(0)
  })
})

// ============================================================
// Profile Parser Tests
// ============================================================

describe('parseProfile', () => {
  it('should parse a valid profile', () => {
    const result = parseProfile(profileFixture.profile)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.uuid).toBe('prof-uuid-001')
      expect(result.data.imports).toHaveLength(1)
      expect(result.data.merge?.['as-is']).toBe(true)
      expect(result.data.modify?.['set-parameters']).toHaveLength(1)
    }
  })

  it('should fail for missing imports', () => {
    const result = parseProfile({
      uuid: '123',
      metadata: minimalMetadata,
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('imports')
    }
  })

  it('should fail for empty imports array', () => {
    const result = parseProfile({
      uuid: '123',
      metadata: minimalMetadata,
      imports: [],
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('imports')
    }
  })

  it('should fail for non-object input', () => {
    const result = parseProfile(null)
    expect(result.success).toBe(false)
  })
})

// ============================================================
// Component Definition Parser Tests
// ============================================================

describe('parseComponentDefinition', () => {
  it('should parse a valid component definition', () => {
    const result = parseComponentDefinition(componentDefFixture['component-definition'])
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.uuid).toBe('comp-uuid-001')
      expect(result.data.components).toHaveLength(1)
      expect(result.data.components![0].type).toBe('software')
    }
  })

  it('should parse component with control implementations', () => {
    const result = parseComponentDefinition(componentDefFixture['component-definition'])
    expect(result.success).toBe(true)
    if (result.success) {
      const comp = result.data.components![0]
      expect(comp['control-implementations']).toHaveLength(1)
      expect(comp['control-implementations']![0]['implemented-requirements']).toHaveLength(1)
    }
  })

  it('should fail for missing uuid', () => {
    const result = parseComponentDefinition({ metadata: minimalMetadata })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('uuid')
    }
  })

  it('should handle component definition without components', () => {
    const result = parseComponentDefinition({
      uuid: 'empty-comp',
      metadata: minimalMetadata,
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.components).toBeUndefined()
    }
  })
})

// ============================================================
// SSP Parser Tests
// ============================================================

describe('parseSSP', () => {
  it('should parse a valid SSP', () => {
    const result = parseSSP(sspFixture['system-security-plan'])
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.uuid).toBe('ssp-uuid-001')
      expect(result.data['system-characteristics']['system-name']).toBe('Test System')
      expect(result.data['system-implementation'].components).toHaveLength(1)
    }
  })

  it('should fail for missing import-profile', () => {
    const result = parseSSP({
      uuid: '123',
      metadata: minimalMetadata,
      'system-characteristics': sspFixture['system-security-plan']['system-characteristics'],
      'system-implementation': sspFixture['system-security-plan']['system-implementation'],
      'control-implementation': sspFixture['system-security-plan']['control-implementation'],
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('import-profile')
    }
  })

  it('should fail for missing system-characteristics', () => {
    const result = parseSSP({
      uuid: '123',
      metadata: minimalMetadata,
      'import-profile': { href: '#profile' },
      'system-implementation': sspFixture['system-security-plan']['system-implementation'],
      'control-implementation': sspFixture['system-security-plan']['control-implementation'],
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('system-characteristics')
    }
  })

  it('should fail for missing system-implementation', () => {
    const result = parseSSP({
      uuid: '123',
      metadata: minimalMetadata,
      'import-profile': { href: '#profile' },
      'system-characteristics': sspFixture['system-security-plan']['system-characteristics'],
      'control-implementation': sspFixture['system-security-plan']['control-implementation'],
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('system-implementation')
    }
  })

  it('should fail for missing control-implementation', () => {
    const result = parseSSP({
      uuid: '123',
      metadata: minimalMetadata,
      'import-profile': { href: '#profile' },
      'system-characteristics': sspFixture['system-security-plan']['system-characteristics'],
      'system-implementation': sspFixture['system-security-plan']['system-implementation'],
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('control-implementation')
    }
  })
})

// ============================================================
// Full Document Parser Tests (parseOscalDocument)
// ============================================================

describe('parseOscalDocument', () => {
  it('should parse a full catalog document', () => {
    const result = parseOscalDocument(catalogFixture)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.type).toBe('catalog')
      expect(result.data.version).toBe('1.1.2')
      expect(result.data.data.type).toBe('catalog')
    }
  })

  it('should parse a full profile document', () => {
    const result = parseOscalDocument(profileFixture)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.type).toBe('profile')
      expect(result.data.version).toBe('1.1.2')
    }
  })

  it('should parse a full component-definition document', () => {
    const result = parseOscalDocument(componentDefFixture)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.type).toBe('component-definition')
    }
  })

  it('should parse a full SSP document', () => {
    const result = parseOscalDocument(sspFixture)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.type).toBe('system-security-plan')
    }
  })

  it('should fail for unknown document types', () => {
    const result = parseOscalDocument({ unknown: {} })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('Unrecognized')
    }
  })

  it('should fail for invalid JSON structure', () => {
    const result = parseOscalDocument(null)
    expect(result.success).toBe(false)
  })

  it('should propagate parser errors', () => {
    const result = parseOscalDocument({ catalog: { uuid: '', metadata: minimalMetadata } })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toContain('uuid')
    }
  })
})

// ============================================================
// Assessment Results Parser
// ============================================================

describe('parseAssessmentResults', () => {
  const validAR = {
    uuid: 'ar-uuid-001',
    metadata: minimalMetadata,
    results: [
      {
        uuid: 'result-001',
        title: 'Test Result',
        description: 'Test assessment result',
        start: '2026-01-01T00:00:00Z',
        findings: [
          {
            uuid: 'finding-001',
            title: 'Test Finding',
            description: 'A test finding',
            target: { type: 'objective-id', 'target-id': 'ac-1', status: { state: 'satisfied' } },
          },
        ],
      },
    ],
  }

  it('parses valid assessment results', () => {
    const result = parseAssessmentResults(validAR)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.uuid).toBe('ar-uuid-001')
      expect(result.data.results).toHaveLength(1)
      expect(result.data.results[0].findings).toHaveLength(1)
    }
  })

  it('rejects non-object input', () => {
    const result = parseAssessmentResults('not-an-object')
    expect(result.success).toBe(false)
  })

  it('rejects missing uuid', () => {
    const result = parseAssessmentResults({ metadata: minimalMetadata, results: [{ uuid: 'r1', title: 't', description: 'd', start: 's' }] })
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error).toContain('uuid')
  })

  it('rejects missing metadata', () => {
    const result = parseAssessmentResults({ uuid: 'test', results: [{ uuid: 'r1', title: 't', description: 'd', start: 's' }] })
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error).toContain('metadata')
  })

  it('rejects missing results', () => {
    const result = parseAssessmentResults({ uuid: 'test', metadata: minimalMetadata })
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error).toContain('results')
  })

  it('rejects empty results array', () => {
    const result = parseAssessmentResults({ uuid: 'test', metadata: minimalMetadata, results: [] })
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error).toContain('results')
  })

  it('parses with optional import-ap', () => {
    const result = parseAssessmentResults({ ...validAR, 'import-ap': { href: 'ap.json' } })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data['import-ap']?.href).toBe('ap.json')
  })

  it('parses with optional back-matter', () => {
    const result = parseAssessmentResults({
      ...validAR,
      'back-matter': { resources: [{ uuid: 'r1', title: 'Evidence' }] },
    })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data['back-matter']?.resources).toHaveLength(1)
  })
})

// ============================================================
// POA&M Parser
// ============================================================

describe('parsePoam', () => {
  const validPoam = {
    uuid: 'poam-uuid-001',
    metadata: minimalMetadata,
    'poam-items': [
      {
        uuid: 'item-001',
        title: 'Remediate Finding',
        description: 'Fix the audit logging issue',
        milestones: [
          { uuid: 'ms-001', title: 'Phase 1' },
        ],
      },
    ],
  }

  it('parses valid POA&M', () => {
    const result = parsePoam(validPoam)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.uuid).toBe('poam-uuid-001')
      expect(result.data['poam-items']).toHaveLength(1)
      expect(result.data['poam-items'][0].milestones).toHaveLength(1)
    }
  })

  it('rejects non-object input', () => {
    const result = parsePoam(null)
    expect(result.success).toBe(false)
  })

  it('rejects missing uuid', () => {
    const result = parsePoam({ metadata: minimalMetadata, 'poam-items': [{ uuid: 'i', title: 't', description: 'd' }] })
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error).toContain('uuid')
  })

  it('rejects missing metadata', () => {
    const result = parsePoam({ uuid: 'test', 'poam-items': [{ uuid: 'i', title: 't', description: 'd' }] })
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error).toContain('metadata')
  })

  it('rejects missing poam-items', () => {
    const result = parsePoam({ uuid: 'test', metadata: minimalMetadata })
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error).toContain('poam-items')
  })

  it('rejects empty poam-items array', () => {
    const result = parsePoam({ uuid: 'test', metadata: minimalMetadata, 'poam-items': [] })
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error).toContain('poam-items')
  })

  it('parses with optional import-ssp', () => {
    const result = parsePoam({ ...validPoam, 'import-ssp': { href: 'ssp.json' } })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data['import-ssp']?.href).toBe('ssp.json')
  })

  it('parses with optional findings and risks', () => {
    const result = parsePoam({
      ...validPoam,
      findings: [{ uuid: 'f1', title: 'F', description: 'D', target: { type: 'objective-id', 'target-id': 'ac-1', status: { state: 'not-satisfied' } } }],
      risks: [{ uuid: 'r1', title: 'R', description: 'D', status: 'open' }],
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.findings).toHaveLength(1)
      expect(result.data.risks).toHaveLength(1)
    }
  })
})

// ============================================================
// Detection — Assessment Results & POA&M
// ============================================================

describe('detectDocumentType — AR & POA&M', () => {
  it('detects assessment-results', () => {
    expect(detectDocumentType({ 'assessment-results': { uuid: 'test' } })).toBe('assessment-results')
  })

  it('detects plan-of-action-and-milestones', () => {
    expect(detectDocumentType({ 'plan-of-action-and-milestones': { uuid: 'test' } })).toBe('plan-of-action-and-milestones')
  })
})

// ============================================================
// End-to-End — parseOscalDocument with AR & POA&M
// ============================================================

describe('parseOscalDocument — AR & POA&M', () => {
  it('parses complete assessment-results document', () => {
    const arDoc = {
      'assessment-results': {
        uuid: 'ar-uuid',
        metadata: { ...minimalMetadata, title: 'Test AR' },
        results: [{ uuid: 'r1', title: 'Result', description: 'Desc', start: '2026-01-01' }],
      },
    }
    const result = parseOscalDocument(arDoc)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.type).toBe('assessment-results')
      expect(result.data.data.type).toBe('assessment-results')
    }
  })

  it('parses complete plan-of-action-and-milestones document', () => {
    const poamDoc = {
      'plan-of-action-and-milestones': {
        uuid: 'poam-uuid',
        metadata: { ...minimalMetadata, title: 'Test POA&M' },
        'poam-items': [{ uuid: 'i1', title: 'Item', description: 'Desc' }],
      },
    }
    const result = parseOscalDocument(poamDoc)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.type).toBe('plan-of-action-and-milestones')
      expect(result.data.data.type).toBe('plan-of-action-and-milestones')
    }
  })
})
