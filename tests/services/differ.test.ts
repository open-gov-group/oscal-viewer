/**
 * Tests for the differ service — structural comparison of OSCAL documents.
 */
import { describe, it, expect } from 'vitest'
import {
  diffByKey,
  buildSummary,
  diffMetadata,
  diffCatalog,
  diffProfile,
  diffComponentDef,
  diffSsp,
  diffAssessmentResults,
  diffPoam,
  diffDocuments,
  getAllControls,
} from '@/services/differ'
import type { DiffEntry } from '@/types/diff'
import type {
  Metadata,
  Catalog,
  Control,
  Profile,
  ComponentDefinition,
  SystemSecurityPlan,
  AssessmentResults,
  PlanOfActionAndMilestones,
} from '@/types/oscal'

// ============================================================
// Test Helpers
// ============================================================

function makeMetadata(overrides: Partial<Metadata> = {}): Metadata {
  return {
    title: 'Test Document',
    version: '1.0',
    'oscal-version': '1.0.4',
    'last-modified': '2024-01-01T00:00:00Z',
    ...overrides,
  }
}

function makeControl(id: string, title: string, extra: Partial<Control> = {}): Control {
  return { id, title, ...extra }
}

function makeCatalog(overrides: Partial<Catalog> = {}): Catalog {
  return {
    uuid: 'cat-uuid-1',
    metadata: makeMetadata(),
    ...overrides,
  }
}

// ============================================================
// diffByKey — Generic
// ============================================================

describe('diffByKey', () => {
  const getKey = (item: { id: string }) => item.id
  const getLabel = (item: { id: string; name: string }) => item.name
  const compareFields = (left: { id: string; name: string }, right: { id: string; name: string }) => {
    const changes: string[] = []
    if (left.name !== right.name) changes.push(`Name: "${left.name}" → "${right.name}"`)
    return changes
  }

  it('returns empty array for two empty arrays', () => {
    const result = diffByKey([], [], getKey, getLabel, compareFields)
    expect(result).toEqual([])
  })

  it('marks all as removed when right is empty', () => {
    const left = [{ id: 'a', name: 'Alpha' }, { id: 'b', name: 'Beta' }]
    const result = diffByKey(left, [], getKey, getLabel, compareFields)
    expect(result).toHaveLength(2)
    expect(result.every(e => e.status === 'removed')).toBe(true)
  })

  it('marks all as added when left is empty', () => {
    const right = [{ id: 'a', name: 'Alpha' }]
    const result = diffByKey([], right, getKey, getLabel, compareFields)
    expect(result).toHaveLength(1)
    expect(result[0].status).toBe('added')
    expect(result[0].right).toEqual({ id: 'a', name: 'Alpha' })
  })

  it('marks identical items as unchanged', () => {
    const items = [{ id: 'a', name: 'Alpha' }]
    const result = diffByKey(items, [...items], getKey, getLabel, compareFields)
    expect(result).toHaveLength(1)
    expect(result[0].status).toBe('unchanged')
    expect(result[0].changes).toBeUndefined()
  })

  it('marks items with changed fields as modified', () => {
    const left = [{ id: 'a', name: 'Alpha' }]
    const right = [{ id: 'a', name: 'Alpha Updated' }]
    const result = diffByKey(left, right, getKey, getLabel, compareFields)
    expect(result).toHaveLength(1)
    expect(result[0].status).toBe('modified')
    expect(result[0].changes).toEqual(['Name: "Alpha" → "Alpha Updated"'])
  })

  it('handles mixed added, removed, modified, unchanged', () => {
    const left = [
      { id: 'a', name: 'Alpha' },
      { id: 'b', name: 'Beta' },
      { id: 'c', name: 'Gamma' },
    ]
    const right = [
      { id: 'a', name: 'Alpha' },       // unchanged
      { id: 'b', name: 'Beta Updated' }, // modified
      { id: 'd', name: 'Delta' },        // added
    ]
    const result = diffByKey(left, right, getKey, getLabel, compareFields)
    expect(result).toHaveLength(4)

    const byKey = new Map(result.map(e => [e.key, e]))
    expect(byKey.get('a')!.status).toBe('unchanged')
    expect(byKey.get('b')!.status).toBe('modified')
    expect(byKey.get('c')!.status).toBe('removed')
    expect(byKey.get('d')!.status).toBe('added')
  })

  it('uses label from getLabel callback', () => {
    const left = [{ id: 'x', name: 'X-Ray' }]
    const result = diffByKey(left, [], getKey, getLabel, compareFields)
    expect(result[0].label).toBe('X-Ray')
  })
})

// ============================================================
// buildSummary
// ============================================================

describe('buildSummary', () => {
  it('counts each status correctly', () => {
    const entries: DiffEntry<unknown>[] = [
      { status: 'added', key: '1', label: '' },
      { status: 'added', key: '2', label: '' },
      { status: 'removed', key: '3', label: '' },
      { status: 'modified', key: '4', label: '' },
      { status: 'unchanged', key: '5', label: '' },
    ]
    const summary = buildSummary(entries)
    expect(summary).toEqual({ added: 2, removed: 1, modified: 1, unchanged: 1, total: 5 })
  })

  it('returns zeros for empty input', () => {
    const summary = buildSummary([])
    expect(summary).toEqual({ added: 0, removed: 0, modified: 0, unchanged: 0, total: 0 })
  })
})

// ============================================================
// diffMetadata
// ============================================================

describe('diffMetadata', () => {
  it('detects no changes for identical metadata', () => {
    const meta = makeMetadata()
    const result = diffMetadata(meta, { ...meta })
    expect(result.titleChanged).toBe(false)
    expect(result.versionChanged).toBe(false)
    expect(result.oscalVersionChanged).toBe(false)
    expect(result.lastModifiedChanged).toBe(false)
  })

  it('detects title change', () => {
    const left = makeMetadata({ title: 'Old Title' })
    const right = makeMetadata({ title: 'New Title' })
    const result = diffMetadata(left, right)
    expect(result.titleChanged).toBe(true)
    expect(result.left.title).toBe('Old Title')
    expect(result.right.title).toBe('New Title')
  })

  it('detects version change', () => {
    const result = diffMetadata(makeMetadata({ version: '1.0' }), makeMetadata({ version: '2.0' }))
    expect(result.versionChanged).toBe(true)
  })

  it('detects oscal-version change', () => {
    const result = diffMetadata(
      makeMetadata({ 'oscal-version': '1.0.4' }),
      makeMetadata({ 'oscal-version': '1.1.2' })
    )
    expect(result.oscalVersionChanged).toBe(true)
  })

  it('detects last-modified change', () => {
    const result = diffMetadata(
      makeMetadata({ 'last-modified': '2024-01-01T00:00:00Z' }),
      makeMetadata({ 'last-modified': '2025-06-01T00:00:00Z' })
    )
    expect(result.lastModifiedChanged).toBe(true)
  })
})

// ============================================================
// getAllControls
// ============================================================

describe('getAllControls', () => {
  it('returns empty for catalog without controls or groups', () => {
    expect(getAllControls(makeCatalog())).toEqual([])
  })

  it('returns top-level controls', () => {
    const cat = makeCatalog({ controls: [makeControl('ac-1', 'AC-1')] })
    expect(getAllControls(cat)).toHaveLength(1)
  })

  it('collects controls from groups', () => {
    const cat = makeCatalog({
      groups: [{ title: 'AC', id: 'ac', controls: [makeControl('ac-1', 'AC-1'), makeControl('ac-2', 'AC-2')] }],
    })
    expect(getAllControls(cat)).toHaveLength(2)
  })

  it('collects controls from nested groups', () => {
    const cat = makeCatalog({
      groups: [{
        title: 'AC',
        id: 'ac',
        groups: [{ title: 'Sub', id: 'sub', controls: [makeControl('ac-1', 'AC-1')] }],
      }],
    })
    expect(getAllControls(cat)).toHaveLength(1)
  })
})

// ============================================================
// diffCatalog
// ============================================================

describe('diffCatalog', () => {
  it('returns empty sections for two identical empty catalogs', () => {
    const cat = makeCatalog()
    const result = diffCatalog(cat, { ...cat })
    expect(result.type).toBe('catalog')
    expect(result.sections).toHaveLength(0)
    expect(result.summary.total).toBe(0)
  })

  it('detects added controls', () => {
    const left = makeCatalog()
    const right = makeCatalog({ controls: [makeControl('ac-1', 'Access Control')] })
    const result = diffCatalog(left, right)
    const controlSection = result.sections.find(s => s.title === 'Controls')!
    expect(controlSection.summary.added).toBe(1)
    expect(controlSection.entries[0].status).toBe('added')
  })

  it('detects removed controls', () => {
    const left = makeCatalog({ controls: [makeControl('ac-1', 'Access Control')] })
    const right = makeCatalog()
    const result = diffCatalog(left, right)
    const controlSection = result.sections.find(s => s.title === 'Controls')!
    expect(controlSection.summary.removed).toBe(1)
  })

  it('detects modified controls (title change)', () => {
    const left = makeCatalog({ controls: [makeControl('ac-1', 'Access Control')] })
    const right = makeCatalog({ controls: [makeControl('ac-1', 'Access Control Policy')] })
    const result = diffCatalog(left, right)
    const controlSection = result.sections.find(s => s.title === 'Controls')!
    expect(controlSection.summary.modified).toBe(1)
    expect(controlSection.entries[0].changes).toContain('Title: "Access Control" → "Access Control Policy"')
  })

  it('detects unchanged controls', () => {
    const controls = [makeControl('ac-1', 'Access Control')]
    const result = diffCatalog(makeCatalog({ controls }), makeCatalog({ controls: [...controls] }))
    const controlSection = result.sections.find(s => s.title === 'Controls')!
    expect(controlSection.summary.unchanged).toBe(1)
  })

  it('detects group changes', () => {
    const left = makeCatalog({ groups: [{ title: 'Access Control', id: 'ac' }] })
    const right = makeCatalog({ groups: [{ title: 'Access Control', id: 'ac' }, { title: 'Audit', id: 'au' }] })
    const result = diffCatalog(left, right)
    const groupSection = result.sections.find(s => s.title === 'Groups')!
    expect(groupSection.summary.unchanged).toBe(1)
    expect(groupSection.summary.added).toBe(1)
  })

  it('detects parameter changes', () => {
    const left = makeCatalog({ params: [{ id: 'p1', values: ['daily'] }] })
    const right = makeCatalog({ params: [{ id: 'p1', values: ['weekly'] }] })
    const result = diffCatalog(left, right)
    const paramSection = result.sections.find(s => s.title === 'Parameters')!
    expect(paramSection.summary.modified).toBe(1)
    expect(paramSection.entries[0].changes).toContain('Values: "daily" → "weekly"')
  })

  it('detects prose content changes', () => {
    const left = makeCatalog({ controls: [makeControl('ac-1', 'AC-1', { parts: [{ name: 'statement', prose: 'Old text' }] })] })
    const right = makeCatalog({ controls: [makeControl('ac-1', 'AC-1', { parts: [{ name: 'statement', prose: 'New text' }] })] })
    const result = diffCatalog(left, right)
    const controlSection = result.sections.find(s => s.title === 'Controls')!
    expect(controlSection.entries[0].changes).toContain('Prose content changed')
  })

  it('detects sub-control count changes', () => {
    const left = makeCatalog({ controls: [makeControl('ac-1', 'AC-1', { controls: [makeControl('ac-1.1', 'sub')] })] })
    const right = makeCatalog({ controls: [makeControl('ac-1', 'AC-1')] })
    const result = diffCatalog(left, right)
    const controlSection = result.sections.find(s => s.title === 'Controls')!
    expect(controlSection.entries[0].changes).toContain('Sub-controls: 1 → 0')
  })

  it('produces correct overall summary', () => {
    const left = makeCatalog({ controls: [makeControl('ac-1', 'AC-1'), makeControl('ac-2', 'AC-2')] })
    const right = makeCatalog({ controls: [makeControl('ac-1', 'AC-1 Updated'), makeControl('ac-3', 'AC-3')] })
    const result = diffCatalog(left, right)
    expect(result.summary.modified).toBe(1)
    expect(result.summary.removed).toBe(1)
    expect(result.summary.added).toBe(1)
  })
})

// ============================================================
// diffProfile
// ============================================================

describe('diffProfile', () => {
  function makeProfile(overrides: Partial<Profile> = {}): Profile {
    return {
      uuid: 'prof-uuid-1',
      metadata: makeMetadata(),
      imports: [],
      ...overrides,
    }
  }

  it('returns empty sections for identical profiles', () => {
    const prof = makeProfile()
    const result = diffProfile(prof, { ...prof })
    expect(result.type).toBe('profile')
    expect(result.sections).toHaveLength(0)
  })

  it('detects added imports', () => {
    const left = makeProfile()
    const right = makeProfile({ imports: [{ href: 'catalog.json' }] })
    const result = diffProfile(left, right)
    const section = result.sections.find(s => s.title === 'Imports')!
    expect(section.summary.added).toBe(1)
  })

  it('detects modified imports (include changed)', () => {
    const left = makeProfile({ imports: [{ href: 'cat.json', 'include-all': {} }] })
    const right = makeProfile({ imports: [{ href: 'cat.json', 'include-controls': [{ 'with-ids': ['ac-1'] }] }] })
    const result = diffProfile(left, right)
    const section = result.sections.find(s => s.title === 'Imports')!
    expect(section.summary.modified).toBe(1)
  })

  it('detects set-parameter changes', () => {
    const left = makeProfile({ modify: { 'set-parameters': [{ 'param-id': 'p1', values: ['v1'] }] } })
    const right = makeProfile({ modify: { 'set-parameters': [{ 'param-id': 'p1', values: ['v2'] }] } })
    const result = diffProfile(left, right)
    const section = result.sections.find(s => s.title === 'Set-Parameters')!
    expect(section.summary.modified).toBe(1)
    expect(section.entries[0].changes).toContain('Values: "v1" → "v2"')
  })

  it('detects alter changes', () => {
    const left = makeProfile({ modify: { alters: [{ 'control-id': 'ac-1', adds: [{ position: 'ending' }] }] } })
    const right = makeProfile({ modify: { alters: [{ 'control-id': 'ac-1' }] } })
    const result = diffProfile(left, right)
    const section = result.sections.find(s => s.title === 'Alterations')!
    expect(section.summary.modified).toBe(1)
    expect(section.entries[0].changes).toContain('Adds: 1 → 0')
  })
})

// ============================================================
// diffComponentDef
// ============================================================

describe('diffComponentDef', () => {
  function makeCompDef(overrides: Partial<ComponentDefinition> = {}): ComponentDefinition {
    return {
      uuid: 'compdef-uuid-1',
      metadata: makeMetadata(),
      ...overrides,
    }
  }

  it('returns empty sections for identical component definitions', () => {
    const cd = makeCompDef()
    const result = diffComponentDef(cd, { ...cd })
    expect(result.sections).toHaveLength(0)
  })

  it('detects added components', () => {
    const left = makeCompDef()
    const right = makeCompDef({
      components: [{ uuid: 'c1', type: 'software', title: 'App', description: 'An app' }],
    })
    const result = diffComponentDef(left, right)
    expect(result.sections[0].summary.added).toBe(1)
  })

  it('detects modified component title', () => {
    const left = makeCompDef({
      components: [{ uuid: 'c1', type: 'software', title: 'App v1', description: 'An app' }],
    })
    const right = makeCompDef({
      components: [{ uuid: 'c1', type: 'software', title: 'App v2', description: 'An app' }],
    })
    const result = diffComponentDef(left, right)
    expect(result.sections[0].summary.modified).toBe(1)
    expect(result.sections[0].entries[0].changes).toContain('Title: "App v1" → "App v2"')
  })

  it('detects component type change', () => {
    const left = makeCompDef({
      components: [{ uuid: 'c1', type: 'software', title: 'App', description: 'desc' }],
    })
    const right = makeCompDef({
      components: [{ uuid: 'c1', type: 'service', title: 'App', description: 'desc' }],
    })
    const result = diffComponentDef(left, right)
    expect(result.sections[0].entries[0].changes).toContain('Type: "software" → "service"')
  })
})

// ============================================================
// diffSsp
// ============================================================

describe('diffSsp', () => {
  function makeSsp(overrides: Partial<SystemSecurityPlan> = {}): SystemSecurityPlan {
    return {
      uuid: 'ssp-uuid-1',
      metadata: makeMetadata(),
      'import-profile': { href: 'profile.json' },
      'system-characteristics': {
        'system-ids': [{ id: 'sys-1' }],
        'system-name': 'Test System',
        description: 'A test system',
        'system-information': { 'information-types': [] },
        status: { state: 'operational' },
        'authorization-boundary': { description: 'boundary' },
      },
      'system-implementation': {
        users: [],
        components: [],
      },
      'control-implementation': {
        description: 'Control implementation',
        'implemented-requirements': [],
      },
      ...overrides,
    }
  }

  it('returns empty sections for identical SSPs', () => {
    const ssp = makeSsp()
    const result = diffSsp(ssp, { ...ssp, 'control-implementation': { ...ssp['control-implementation'] }, 'system-implementation': { ...ssp['system-implementation'] } })
    expect(result.type).toBe('system-security-plan')
    expect(result.sections).toHaveLength(0)
  })

  it('detects added implemented requirements', () => {
    const left = makeSsp()
    const right = makeSsp({
      'control-implementation': {
        description: 'CI',
        'implemented-requirements': [{ uuid: 'ir-1', 'control-id': 'ac-1', props: [] }],
      },
    })
    const result = diffSsp(left, right)
    const section = result.sections.find(s => s.title === 'Implemented Requirements')!
    expect(section.summary.added).toBe(1)
  })

  it('detects modified system components', () => {
    const comp = { uuid: 'sc-1', type: 'software', title: 'App', description: 'desc', status: { state: 'operational' as const } }
    const left = makeSsp({ 'system-implementation': { users: [], components: [comp] } })
    const right = makeSsp({
      'system-implementation': { users: [], components: [{ ...comp, status: { state: 'under-development' as const } }] },
    })
    const result = diffSsp(left, right)
    const section = result.sections.find(s => s.title === 'System Components')!
    expect(section.summary.modified).toBe(1)
    expect(section.entries[0].changes).toContain('Status: "operational" → "under-development"')
  })
})

// ============================================================
// diffAssessmentResults
// ============================================================

describe('diffAssessmentResults', () => {
  function makeAR(overrides: Partial<AssessmentResults> = {}): AssessmentResults {
    return {
      uuid: 'ar-uuid-1',
      metadata: makeMetadata(),
      results: [],
      ...overrides,
    }
  }

  it('returns empty sections for identical ARs', () => {
    const ar = makeAR()
    const result = diffAssessmentResults(ar, { ...ar })
    expect(result.sections).toHaveLength(0)
  })

  it('detects added findings', () => {
    const left = makeAR()
    const right = makeAR({
      results: [{
        uuid: 'r1', title: 'Result', description: '', start: '2024-01-01',
        findings: [{
          uuid: 'f1', title: 'Finding 1', description: 'desc',
          target: { type: 'objective-id', 'target-id': 'ac-1', status: { state: 'not-satisfied' } },
        }],
      }],
    })
    const result = diffAssessmentResults(left, right)
    const section = result.sections.find(s => s.title === 'Findings')!
    expect(section.summary.added).toBe(1)
  })

  it('detects modified finding status', () => {
    const makeFinding = (state: 'satisfied' | 'not-satisfied') => ({
      uuid: 'f1', title: 'Finding', description: 'desc',
      target: { type: 'objective-id' as const, 'target-id': 'ac-1', status: { state } },
    })
    const left = makeAR({ results: [{ uuid: 'r1', title: 'R', description: '', start: '2024-01-01', findings: [makeFinding('not-satisfied')] }] })
    const right = makeAR({ results: [{ uuid: 'r1', title: 'R', description: '', start: '2024-01-01', findings: [makeFinding('satisfied')] }] })
    const result = diffAssessmentResults(left, right)
    const section = result.sections.find(s => s.title === 'Findings')!
    expect(section.summary.modified).toBe(1)
    expect(section.entries[0].changes).toContain('Status: "not-satisfied" → "satisfied"')
  })

  it('detects risk changes', () => {
    const left = makeAR({
      results: [{ uuid: 'r1', title: 'R', description: '', start: '2024-01-01',
        risks: [{ uuid: 'risk-1', title: 'Risk A', description: 'desc', status: 'open' }],
      }],
    })
    const right = makeAR({
      results: [{ uuid: 'r1', title: 'R', description: '', start: '2024-01-01',
        risks: [{ uuid: 'risk-1', title: 'Risk A', description: 'desc', status: 'closed' }],
      }],
    })
    const result = diffAssessmentResults(left, right)
    const section = result.sections.find(s => s.title === 'Risks')!
    expect(section.summary.modified).toBe(1)
    expect(section.entries[0].changes).toContain('Status: "open" → "closed"')
  })
})

// ============================================================
// diffPoam
// ============================================================

describe('diffPoam', () => {
  function makePoam(overrides: Partial<PlanOfActionAndMilestones> = {}): PlanOfActionAndMilestones {
    return {
      uuid: 'poam-uuid-1',
      metadata: makeMetadata(),
      'poam-items': [],
      ...overrides,
    }
  }

  it('returns empty sections for identical POA&Ms', () => {
    const poam = makePoam()
    const result = diffPoam(poam, { ...poam })
    expect(result.sections).toHaveLength(0)
  })

  it('detects added poam-items', () => {
    const left = makePoam()
    const right = makePoam({ 'poam-items': [{ uuid: 'pi-1', title: 'Item 1', description: 'desc' }] })
    const result = diffPoam(left, right)
    expect(result.sections[0].summary.added).toBe(1)
  })

  it('detects modified poam-items (title change)', () => {
    const left = makePoam({ 'poam-items': [{ uuid: 'pi-1', title: 'Old Title', description: 'desc' }] })
    const right = makePoam({ 'poam-items': [{ uuid: 'pi-1', title: 'New Title', description: 'desc' }] })
    const result = diffPoam(left, right)
    expect(result.sections[0].summary.modified).toBe(1)
    expect(result.sections[0].entries[0].changes).toContain('Title: "Old Title" → "New Title"')
  })

  it('detects milestone count changes', () => {
    const left = makePoam({
      'poam-items': [{ uuid: 'pi-1', title: 'Item', description: 'desc', milestones: [{ uuid: 'm1', title: 'M1' }] }],
    })
    const right = makePoam({
      'poam-items': [{ uuid: 'pi-1', title: 'Item', description: 'desc' }],
    })
    const result = diffPoam(left, right)
    expect(result.sections[0].entries[0].changes).toContain('Milestones: 1 → 0')
  })
})

// ============================================================
// diffDocuments — Dispatcher
// ============================================================

describe('diffDocuments', () => {
  it('dispatches to diffCatalog for type "catalog"', () => {
    const cat = makeCatalog()
    const result = diffDocuments('catalog', cat, cat)
    expect(result.type).toBe('catalog')
  })

  it('dispatches to diffProfile for type "profile"', () => {
    const prof: Profile = { uuid: 'p1', metadata: makeMetadata(), imports: [] }
    const result = diffDocuments('profile', prof, prof)
    expect(result.type).toBe('profile')
  })

  it('throws for unsupported type', () => {
    expect(() => diffDocuments('unknown', {}, {})).toThrow('Unsupported document type')
  })
})
