/**
 * Tests for the exporter service — JSON, Markdown, and CSV export of all 6 OSCAL document types.
 */
import { exportToJson, exportToMarkdown, exportToCsv, csvEscape } from '@/services/exporter'
import type { OscalDocumentData } from '@/types/oscal'

// ============================================================
// Shared Fixtures
// ============================================================

const minimalMetadata = {
  title: 'Test Document',
  'last-modified': '2026-02-09T00:00:00Z',
  version: '1.0',
  'oscal-version': '1.1.2',
}

const catalogData: OscalDocumentData = {
  type: 'catalog',
  document: {
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
            class: 'SP800-53',
            parts: [{ name: 'statement', prose: 'Develop access control policy.' }],
            controls: [
              { id: 'ac-1.1', title: 'Sub-Control' },
            ],
          },
        ],
      },
    ],
    controls: [
      { id: 'top-1', title: 'Top Level Control' },
    ],
  },
}

const profileData: OscalDocumentData = {
  type: 'profile',
  document: {
    uuid: 'prof-001',
    metadata: { ...minimalMetadata, title: 'Test Profile' },
    imports: [
      {
        href: '#catalog-uuid',
        'include-controls': [{ 'with-ids': ['ac-1', 'ac-2'] }],
      },
      { href: 'https://example.com/catalog.json' },
    ],
    modify: {
      'set-parameters': [
        { 'param-id': 'ac-1_prm_1', values: ['monthly'] },
      ],
      alters: [
        { 'control-id': 'ac-1', adds: [{ position: 'ending', parts: [{ name: 'guidance', prose: 'Extra.' }] }] },
      ],
    },
  },
}

const componentDefData: OscalDocumentData = {
  type: 'component-definition',
  document: {
    uuid: 'comp-001',
    metadata: { ...minimalMetadata, title: 'Test CompDef' },
    components: [
      {
        uuid: 'c1',
        type: 'software',
        title: 'App',
        description: 'Test app',
        'control-implementations': [
          {
            uuid: 'ci-1',
            source: '#cat',
            description: 'CI',
            'implemented-requirements': [
              { uuid: 'ir-1', 'control-id': 'ac-1', description: 'RBAC implemented' },
            ],
          },
        ],
      },
      {
        uuid: 'c2',
        type: 'hardware',
        title: 'Firewall',
        description: 'Network firewall',
      },
    ],
  },
}

const sspData: OscalDocumentData = {
  type: 'system-security-plan',
  document: {
    uuid: 'ssp-001',
    metadata: { ...minimalMetadata, title: 'Test SSP' },
    'import-profile': { href: '#profile' },
    'system-characteristics': {
      'system-ids': [{ id: 'sys-001' }],
      'system-name': 'Portal',
      description: 'Enterprise portal',
      'system-information': { 'information-types': [{ title: 'Info', description: 'General' }] },
      status: { state: 'operational' },
      'authorization-boundary': { description: 'Boundary' },
    },
    'system-implementation': {
      users: [{ uuid: 'u1', title: 'Admin' }],
      components: [{ uuid: 'sc1', type: 'this-system', title: 'System', description: 'The system', status: { state: 'operational' } }],
    },
    'control-implementation': {
      description: 'Controls',
      'implemented-requirements': [
        {
          uuid: 'ir-1',
          'control-id': 'ac-1',
          'by-components': [{ 'component-uuid': 'sc1', uuid: 'bc-1', description: 'Access control via portal' }],
        },
        { uuid: 'ir-2', 'control-id': 'au-1', remarks: 'Audit enabled' },
      ],
    },
  },
}

const arData: OscalDocumentData = {
  type: 'assessment-results',
  document: {
    uuid: 'ar-001',
    metadata: { ...minimalMetadata, title: 'Test AR' },
    results: [
      {
        uuid: 'r1',
        title: 'Assessment Round 1',
        description: 'Initial assessment',
        start: '2026-01-01',
        findings: [
          {
            uuid: 'f1',
            title: 'AC-1 Finding',
            description: 'AC-1 is satisfied',
            target: { type: 'objective-id', 'target-id': 'ac-1', status: { state: 'satisfied' } },
          },
          {
            uuid: 'f2',
            title: 'AU-1 Finding',
            description: 'AU-1 not satisfied',
            target: { type: 'objective-id', 'target-id': 'au-1', status: { state: 'not-satisfied' } },
          },
        ],
      },
    ],
  },
}

const poamData: OscalDocumentData = {
  type: 'plan-of-action-and-milestones',
  document: {
    uuid: 'poam-001',
    metadata: { ...minimalMetadata, title: 'Test POA&M' },
    'poam-items': [
      {
        uuid: 'pi-1',
        title: 'Fix AU-1',
        description: 'Implement audit logging',
        props: [{ name: 'status', value: 'open' }],
        milestones: [
          {
            uuid: 'm1',
            title: 'Deploy logging',
            schedule: { tasks: [{ uuid: 't1', title: 'Deploy', end: '2026-06-30' }] },
          },
        ],
      },
      {
        uuid: 'pi-2',
        title: 'Review access',
        description: 'Review access controls',
      },
    ],
  },
}

// ============================================================
// CSV Escape Tests
// ============================================================

describe('csvEscape', () => {
  it('should return plain values unchanged', () => {
    expect(csvEscape('hello')).toBe('hello')
  })

  it('should escape values with commas', () => {
    expect(csvEscape('a,b')).toBe('"a,b"')
  })

  it('should escape values with quotes by doubling them', () => {
    expect(csvEscape('say "hi"')).toBe('"say ""hi"""')
  })

  it('should escape values with newlines', () => {
    expect(csvEscape('line1\nline2')).toBe('"line1\nline2"')
  })

  it('should handle empty string', () => {
    expect(csvEscape('')).toBe('')
  })
})

// ============================================================
// JSON Export Tests
// ============================================================

describe('exportToJson', () => {
  it('should wrap catalog in correct envelope', () => {
    const json = exportToJson(catalogData)
    const parsed = JSON.parse(json)
    expect(parsed).toHaveProperty('catalog')
    expect(parsed.catalog.uuid).toBe('cat-001')
  })

  it('should wrap profile in correct envelope', () => {
    const json = exportToJson(profileData)
    const parsed = JSON.parse(json)
    expect(parsed).toHaveProperty('profile')
  })

  it('should wrap component-definition in correct envelope', () => {
    const json = exportToJson(componentDefData)
    const parsed = JSON.parse(json)
    expect(parsed).toHaveProperty('component-definition')
  })

  it('should wrap system-security-plan in correct envelope', () => {
    const json = exportToJson(sspData)
    const parsed = JSON.parse(json)
    expect(parsed).toHaveProperty('system-security-plan')
  })

  it('should wrap assessment-results in correct envelope', () => {
    const json = exportToJson(arData)
    const parsed = JSON.parse(json)
    expect(parsed).toHaveProperty('assessment-results')
  })

  it('should wrap plan-of-action-and-milestones in correct envelope', () => {
    const json = exportToJson(poamData)
    const parsed = JSON.parse(json)
    expect(parsed).toHaveProperty('plan-of-action-and-milestones')
  })

  it('should produce valid JSON with indentation', () => {
    const json = exportToJson(catalogData)
    expect(json).toContain('\n')
    expect(() => JSON.parse(json)).not.toThrow()
  })
})

// ============================================================
// Markdown Export Tests
// ============================================================

describe('exportToMarkdown', () => {
  it('should start with document title as h1', () => {
    const md = exportToMarkdown(catalogData)
    expect(md).toMatch(/^# Test Document/)
  })

  it('should include metadata section', () => {
    const md = exportToMarkdown(catalogData)
    expect(md).toContain('## Metadata')
    expect(md).toContain('**Version**: 1.0')
    expect(md).toContain('**OSCAL Version**: 1.1.2')
  })

  it('should export catalog controls with group headings', () => {
    const md = exportToMarkdown(catalogData)
    expect(md).toContain('### ac: Access Control')
    expect(md).toContain('ac-1: Policy and Procedures')
    expect(md).toContain('Develop access control policy.')
  })

  it('should export catalog sub-controls', () => {
    const md = exportToMarkdown(catalogData)
    expect(md).toContain('ac-1.1: Sub-Control')
  })

  it('should export catalog top-level controls', () => {
    const md = exportToMarkdown(catalogData)
    expect(md).toContain('top-1: Top Level Control')
  })

  it('should export profile imports and modifications', () => {
    const md = exportToMarkdown(profileData)
    expect(md).toContain('## Imports')
    expect(md).toContain('#catalog-uuid')
    expect(md).toContain('ac-1, ac-2')
    expect(md).toContain('## Alterations')
    expect(md).toContain('## Parameters')
    expect(md).toContain('**ac-1_prm_1**: monthly')
  })

  it('should export component definition', () => {
    const md = exportToMarkdown(componentDefData)
    expect(md).toContain('### App')
    expect(md).toContain('**Type**: software')
    expect(md).toContain('**ac-1**: RBAC implemented')
  })

  it('should export SSP system characteristics', () => {
    const md = exportToMarkdown(sspData)
    expect(md).toContain('**System Name**: Portal')
    expect(md).toContain('**Status**: operational')
    expect(md).toContain('**ac-1**: Access control via portal')
  })

  it('should export assessment results findings', () => {
    const md = exportToMarkdown(arData)
    expect(md).toContain('## Assessment Round 1')
    expect(md).toContain('### Findings')
    expect(md).toContain('**ac-1** — satisfied')
    expect(md).toContain('**au-1** — not-satisfied')
  })

  it('should export POA&M items with milestones', () => {
    const md = exportToMarkdown(poamData)
    expect(md).toContain('### Fix AU-1')
    expect(md).toContain('Implement audit logging')
    expect(md).toContain('Milestone: Deploy logging')
  })
})

// ============================================================
// CSV Export Tests
// ============================================================

describe('exportToCsv', () => {
  it('should export catalog with correct header', () => {
    const csv = exportToCsv(catalogData)
    const lines = csv.split('\n')
    expect(lines[0]).toBe('control-id,title,class,group,prose')
  })

  it('should export catalog controls as rows', () => {
    const csv = exportToCsv(catalogData)
    expect(csv).toContain('ac-1,Policy and Procedures,SP800-53,Access Control')
    expect(csv).toContain('ac-1.1,Sub-Control,,Access Control,')
  })

  it('should export catalog top-level controls', () => {
    const csv = exportToCsv(catalogData)
    expect(csv).toContain('top-1,Top Level Control,,,')
  })

  it('should export profile with correct header', () => {
    const csv = exportToCsv(profileData)
    const lines = csv.split('\n')
    expect(lines[0]).toBe('import-href,type,control-id,action')
  })

  it('should export profile imports and modifications', () => {
    const csv = exportToCsv(profileData)
    expect(csv).toContain('#catalog-uuid,import,ac-1,include')
    expect(csv).toContain('#catalog-uuid,import,ac-2,include')
    expect(csv).toContain(',alteration,ac-1,add')
    expect(csv).toContain(',parameter,ac-1_prm_1,monthly')
  })

  it('should export profile include-all when no specific controls', () => {
    const csv = exportToCsv(profileData)
    expect(csv).toContain('https://example.com/catalog.json,import,,include-all')
  })

  it('should export component definition with correct header', () => {
    const csv = exportToCsv(componentDefData)
    const lines = csv.split('\n')
    expect(lines[0]).toBe('component-title,type,control-id,description')
  })

  it('should export component requirements and standalone components', () => {
    const csv = exportToCsv(componentDefData)
    expect(csv).toContain('App,software,ac-1,RBAC implemented')
    expect(csv).toContain('Firewall,hardware,,Network firewall')
  })

  it('should export SSP with correct header', () => {
    const csv = exportToCsv(sspData)
    const lines = csv.split('\n')
    expect(lines[0]).toBe('control-id,implementation-status,responsible-role,description')
  })

  it('should export SSP implemented requirements', () => {
    const csv = exportToCsv(sspData)
    expect(csv).toContain('ac-1,,,Access control via portal')
  })

  it('should export SSP requirements with remarks fallback', () => {
    const csv = exportToCsv(sspData)
    expect(csv).toContain('au-1,,,Audit enabled')
  })

  it('should export assessment results with correct header', () => {
    const csv = exportToCsv(arData)
    const lines = csv.split('\n')
    expect(lines[0]).toBe('finding-id,target-id,status,title,description')
  })

  it('should export AR findings', () => {
    const csv = exportToCsv(arData)
    expect(csv).toContain('f1,ac-1,satisfied,AC-1 Finding,AC-1 is satisfied')
    expect(csv).toContain('f2,au-1,not-satisfied,AU-1 Finding,AU-1 not satisfied')
  })

  it('should export POA&M with correct header', () => {
    const csv = exportToCsv(poamData)
    const lines = csv.split('\n')
    expect(lines[0]).toBe('item-title,status,milestone,due-date,description')
  })

  it('should export POA&M items with milestones', () => {
    const csv = exportToCsv(poamData)
    expect(csv).toContain('Fix AU-1,open,Deploy logging,2026-06-30,Implement audit logging')
  })

  it('should export POA&M items without milestones', () => {
    const csv = exportToCsv(poamData)
    expect(csv).toContain('Review access,,,,Review access controls')
  })

  it('should escape CSV fields with special characters', () => {
    const data: OscalDocumentData = {
      type: 'catalog',
      document: {
        uuid: 'csv-test',
        metadata: minimalMetadata,
        controls: [
          { id: 'x-1', title: 'Control with, comma', parts: [{ name: 'stmt', prose: 'Line "one"' }] },
        ],
      },
    }
    const csv = exportToCsv(data)
    expect(csv).toContain('"Control with, comma"')
    expect(csv).toContain('"Line ""one"""')
  })
})
