import { readFileSync } from 'fs'
import { resolve } from 'path'
import { parseOscalDocument, parseOscalText } from '@/parser'
import { detectDocumentType, detectVersion, detectFormat } from '@/parser/detect'
import type { Catalog, Profile } from '@/types/oscal'

// ============================================================
// Helper: Load fixture from disk
// ============================================================

function loadFixture(filename: string): unknown {
  const path = resolve(__dirname, 'fixtures', filename)
  const raw = readFileSync(path, 'utf-8')
  return JSON.parse(raw)
}

// ============================================================
// NIST Catalog Fixture Tests
// ============================================================

describe('NIST OSCAL Catalog Fixture', () => {
  const json = loadFixture('catalog-nist-example.json')

  it('should detect document type as catalog', () => {
    expect(detectDocumentType(json)).toBe('catalog')
  })

  it('should detect OSCAL version', () => {
    const version = detectVersion(json)
    expect(version).toMatch(/^1\.\d+\.\d+$/)
  })

  it('should parse successfully', () => {
    const result = parseOscalDocument(json)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.type).toBe('catalog')
      expect(result.data.version).toBeDefined()
    }
  })

  it('should have groups with controls', () => {
    const result = parseOscalDocument(json)
    expect(result.success).toBe(true)
    if (result.success) {
      const doc = result.data.data.document as unknown as Record<string, unknown>
      const groups = doc.groups as Array<Record<string, unknown>>
      expect(groups).toBeDefined()
      expect(groups.length).toBeGreaterThan(0)
    }
  })

  it('should have valid metadata', () => {
    const result = parseOscalDocument(json)
    expect(result.success).toBe(true)
    if (result.success) {
      const doc = result.data.data.document as unknown as Record<string, unknown>
      const metadata = doc.metadata as Record<string, unknown>
      expect(metadata.title).toBeDefined()
      expect(typeof metadata.title).toBe('string')
      expect(metadata['oscal-version']).toBeDefined()
    }
  })
})

// ============================================================
// NIST Profile Fixture Tests
// ============================================================

describe('NIST OSCAL Profile Fixture', () => {
  const json = loadFixture('profile-nist-example.json')

  it('should detect document type as profile', () => {
    expect(detectDocumentType(json)).toBe('profile')
  })

  it('should parse successfully', () => {
    const result = parseOscalDocument(json)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.type).toBe('profile')
    }
  })

  it('should have imports', () => {
    const result = parseOscalDocument(json)
    expect(result.success).toBe(true)
    if (result.success) {
      const doc = result.data.data.document as unknown as Record<string, unknown>
      const imports = doc.imports as Array<Record<string, unknown>>
      expect(imports).toBeDefined()
      expect(imports.length).toBeGreaterThan(0)
    }
  })

  it('should have merge strategy', () => {
    const result = parseOscalDocument(json)
    expect(result.success).toBe(true)
    if (result.success) {
      const doc = result.data.data.document as unknown as Record<string, unknown>
      expect(doc.merge).toBeDefined()
    }
  })

  it('should have modify section', () => {
    const result = parseOscalDocument(json)
    expect(result.success).toBe(true)
    if (result.success) {
      const doc = result.data.data.document as unknown as Record<string, unknown>
      expect(doc.modify).toBeDefined()
    }
  })
})

// ============================================================
// NIST Component Definition Fixture Tests
// ============================================================

describe('NIST OSCAL Component Definition Fixture', () => {
  const json = loadFixture('component-def-nist-example.json')

  it('should detect document type as component-definition', () => {
    expect(detectDocumentType(json)).toBe('component-definition')
  })

  it('should parse successfully', () => {
    const result = parseOscalDocument(json)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.type).toBe('component-definition')
    }
  })

  it('should have components', () => {
    const result = parseOscalDocument(json)
    expect(result.success).toBe(true)
    if (result.success) {
      const doc = result.data.data.document as unknown as Record<string, unknown>
      const components = doc.components as Array<Record<string, unknown>>
      expect(components).toBeDefined()
      expect(components.length).toBeGreaterThan(0)
    }
  })

  it('should have control implementations', () => {
    const result = parseOscalDocument(json)
    expect(result.success).toBe(true)
    if (result.success) {
      const doc = result.data.data.document as unknown as Record<string, unknown>
      const components = doc.components as Array<Record<string, unknown>>
      const firstComp = components[0]
      const cis = firstComp['control-implementations'] as Array<Record<string, unknown>>
      expect(cis).toBeDefined()
      expect(cis.length).toBeGreaterThan(0)
    }
  })
})

// ============================================================
// NIST SSP Fixture Tests
// ============================================================

describe('NIST OSCAL SSP Fixture', () => {
  const json = loadFixture('ssp-nist-example.json')

  it('should detect document type as system-security-plan', () => {
    expect(detectDocumentType(json)).toBe('system-security-plan')
  })

  it('should parse successfully', () => {
    const result = parseOscalDocument(json)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.type).toBe('system-security-plan')
    }
  })

  it('should have system-characteristics', () => {
    const result = parseOscalDocument(json)
    expect(result.success).toBe(true)
    if (result.success) {
      const doc = result.data.data.document as unknown as Record<string, unknown>
      expect(doc['system-characteristics']).toBeDefined()
    }
  })

  it('should have system-implementation', () => {
    const result = parseOscalDocument(json)
    expect(result.success).toBe(true)
    if (result.success) {
      const doc = result.data.data.document as unknown as Record<string, unknown>
      expect(doc['system-implementation']).toBeDefined()
    }
  })

  it('should have control-implementation', () => {
    const result = parseOscalDocument(json)
    expect(result.success).toBe(true)
    if (result.success) {
      const doc = result.data.data.document as unknown as Record<string, unknown>
      expect(doc['control-implementation']).toBeDefined()
    }
  })
})

// ============================================================
// NIST Assessment Results Fixture Tests
// ============================================================

describe('NIST OSCAL Assessment Results Fixture', () => {
  const json = loadFixture('assessment-results-nist-example.json')

  it('should detect document type as assessment-results', () => {
    expect(detectDocumentType(json)).toBe('assessment-results')
  })

  it('should detect OSCAL version', () => {
    const version = detectVersion(json)
    expect(version).toMatch(/^1\.\d+\.\d+$/)
  })

  it('should parse successfully', () => {
    const result = parseOscalDocument(json)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.type).toBe('assessment-results')
      expect(result.data.version).toBeDefined()
    }
  })

  it('should have results with findings', () => {
    const result = parseOscalDocument(json)
    expect(result.success).toBe(true)
    if (result.success) {
      const doc = result.data.data.document as unknown as Record<string, unknown>
      const results = doc.results as Array<Record<string, unknown>>
      expect(results).toBeDefined()
      expect(results.length).toBeGreaterThan(0)
      const findings = results[0].findings as Array<Record<string, unknown>>
      expect(findings).toBeDefined()
      expect(findings.length).toBeGreaterThan(0)
    }
  })

  it('should have valid metadata', () => {
    const result = parseOscalDocument(json)
    expect(result.success).toBe(true)
    if (result.success) {
      const doc = result.data.data.document as unknown as Record<string, unknown>
      const metadata = doc.metadata as Record<string, unknown>
      expect(metadata.title).toBeDefined()
      expect(typeof metadata.title).toBe('string')
      expect(metadata['oscal-version']).toBeDefined()
    }
  })
})

// ============================================================
// NIST POA&M Fixture Tests
// ============================================================

describe('NIST OSCAL POA&M Fixture', () => {
  const json = loadFixture('poam-nist-example.json')

  it('should detect document type as plan-of-action-and-milestones', () => {
    expect(detectDocumentType(json)).toBe('plan-of-action-and-milestones')
  })

  it('should detect OSCAL version', () => {
    const version = detectVersion(json)
    expect(version).toMatch(/^1\.\d+\.\d+$/)
  })

  it('should parse successfully', () => {
    const result = parseOscalDocument(json)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.type).toBe('plan-of-action-and-milestones')
      expect(result.data.version).toBeDefined()
    }
  })

  it('should have poam-items', () => {
    const result = parseOscalDocument(json)
    expect(result.success).toBe(true)
    if (result.success) {
      const doc = result.data.data.document as unknown as Record<string, unknown>
      const items = doc['poam-items'] as Array<Record<string, unknown>>
      expect(items).toBeDefined()
      expect(items.length).toBeGreaterThan(0)
    }
  })

  it('should have findings and risks', () => {
    const result = parseOscalDocument(json)
    expect(result.success).toBe(true)
    if (result.success) {
      const doc = result.data.data.document as unknown as Record<string, unknown>
      const findings = doc.findings as Array<Record<string, unknown>>
      const risks = doc.risks as Array<Record<string, unknown>>
      expect(findings).toBeDefined()
      expect(findings.length).toBeGreaterThan(0)
      expect(risks).toBeDefined()
      expect(risks.length).toBeGreaterThan(0)
    }
  })

  it('should have valid metadata', () => {
    const result = parseOscalDocument(json)
    expect(result.success).toBe(true)
    if (result.success) {
      const doc = result.data.data.document as unknown as Record<string, unknown>
      const metadata = doc.metadata as Record<string, unknown>
      expect(metadata.title).toBeDefined()
      expect(typeof metadata.title).toBe('string')
      expect(metadata['oscal-version']).toBeDefined()
    }
  })
})

// ============================================================
// Cross-version compatibility tests
// ============================================================

describe('OSCAL Version Compatibility', () => {
  it('should parse all NIST fixtures without error', () => {
    const fixtures = [
      'catalog-nist-example.json',
      'profile-nist-example.json',
      'component-def-nist-example.json',
      'ssp-nist-example.json',
      'assessment-results-nist-example.json',
      'poam-nist-example.json',
    ]

    for (const fixture of fixtures) {
      const json = loadFixture(fixture)
      const result = parseOscalDocument(json)
      expect(result.success).toBe(true)
    }
  })

  it('should handle OSCAL 1.1.x version documents', () => {
    const fixtures = [
      'catalog-nist-example.json',
      'profile-nist-example.json',
      'component-def-nist-example.json',
      'ssp-nist-example.json',
      'assessment-results-nist-example.json',
      'poam-nist-example.json',
    ]

    for (const fixture of fixtures) {
      const json = loadFixture(fixture)
      const version = detectVersion(json)
      expect(version).toMatch(/^1\.1\.\d+$/)
    }
  })
})

// ============================================================
// Edge Cases: Malformed / Unusual Input
// ============================================================

describe('Edge Cases - Malformed Input', () => {
  it('should reject empty object', () => {
    const result = parseOscalDocument({})
    expect(result.success).toBe(false)
  })

  it('should reject array input', () => {
    const result = parseOscalDocument([])
    expect(result.success).toBe(false)
  })

  it('should reject number input', () => {
    const result = parseOscalDocument(42)
    expect(result.success).toBe(false)
  })

  it('should reject boolean input', () => {
    const result = parseOscalDocument(true)
    expect(result.success).toBe(false)
  })

  it('should reject string input', () => {
    const result = parseOscalDocument('not json')
    expect(result.success).toBe(false)
  })

  it('should reject document with unknown top-level key', () => {
    const result = parseOscalDocument({ 'plan-of-action-and-milestones': {} })
    expect(result.success).toBe(false)
  })

  it('should reject catalog with empty uuid', () => {
    const result = parseOscalDocument({
      catalog: {
        uuid: '',
        metadata: {
          title: 'Test',
          'last-modified': '2026-01-01T00:00:00Z',
          version: '1.0',
          'oscal-version': '1.1.2',
        },
      },
    })
    expect(result.success).toBe(false)
  })

  it('should reject catalog with missing metadata title', () => {
    const result = parseOscalDocument({
      catalog: {
        uuid: 'valid-uuid',
        metadata: {
          'last-modified': '2026-01-01T00:00:00Z',
          version: '1.0',
          'oscal-version': '1.1.2',
        },
      },
    })
    expect(result.success).toBe(false)
  })

  it('should reject catalog with missing oscal-version', () => {
    const result = parseOscalDocument({
      catalog: {
        uuid: 'valid-uuid',
        metadata: {
          title: 'Test',
          'last-modified': '2026-01-01T00:00:00Z',
          version: '1.0',
        },
      },
    })
    expect(result.success).toBe(false)
  })

  it('should handle deeply nested null values gracefully', () => {
    const result = parseOscalDocument({
      catalog: {
        uuid: 'test-uuid',
        metadata: {
          title: 'Test',
          'last-modified': '2026-01-01T00:00:00Z',
          version: '1.0',
          'oscal-version': '1.1.2',
        },
        groups: null,
        controls: null,
      },
    })
    expect(result.success).toBe(true)
  })
})

// ============================================================
// XML Fixture Integration Tests
// ============================================================

/** Load raw text from a fixture file (for XML or other formats). */
function loadFixtureText(filename: string): string {
  const path = resolve(__dirname, 'fixtures', filename)
  return readFileSync(path, 'utf-8')
}

describe('XML Catalog Fixture (catalog-minimal.xml)', () => {
  const xml = loadFixtureText('catalog-minimal.xml')

  it('detects XML format', () => {
    expect(detectFormat(xml)).toBe('xml')
  })

  it('parses via parseOscalText successfully', () => {
    const result = parseOscalText(xml)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.type).toBe('catalog')
      expect(result.data.version).toBe('1.1.2')
    }
  })

  it('extracts metadata correctly', () => {
    const result = parseOscalText(xml)
    expect(result.success).toBe(true)
    if (result.success) {
      const doc = result.data.data.document as Catalog
      expect(doc.metadata.title).toBe('Minimal XML Catalog')
      expect(doc.metadata['oscal-version']).toBe('1.1.2')
      expect(doc.uuid).toBe('cat-xml-001')
    }
  })

  it('parses groups with controls', () => {
    const result = parseOscalText(xml)
    expect(result.success).toBe(true)
    if (result.success) {
      const doc = result.data.data.document as Catalog
      expect(doc.groups).toHaveLength(1)
      expect(doc.groups![0].id).toBe('ac')
      expect(doc.groups![0].controls).toHaveLength(2)
      expect(doc.groups![0].controls![0].id).toBe('ac-1')
      expect(doc.groups![0].controls![1].id).toBe('ac-2')
    }
  })

  it('parses params with select/choice', () => {
    const result = parseOscalText(xml)
    expect(result.success).toBe(true)
    if (result.success) {
      const doc = result.data.data.document as Catalog
      const control = doc.groups![0].controls![0]
      expect(control.params).toHaveLength(1)
      expect(control.params![0].id).toBe('ac-1_prm_1')
      expect(control.params![0].select?.choice).toEqual(['monthly', 'quarterly'])
    }
  })

  it('preserves prose with XHTML and <insert> conversion', () => {
    const result = parseOscalText(xml)
    expect(result.success).toBe(true)
    if (result.success) {
      const doc = result.data.data.document as Catalog
      const parts = doc.groups![0].controls![0].parts!
      // Statement part has nested parts with prose
      const stmtA = parts[0].parts![0]
      expect(stmtA.prose).toContain('{{ insert: param, ac-1_prm_1 }}')
      // Guidance part has <strong> tag
      const guidance = parts[1]
      expect(guidance.prose).toContain('<strong>controls</strong>')
    }
  })

  it('parses props and links', () => {
    const result = parseOscalText(xml)
    expect(result.success).toBe(true)
    if (result.success) {
      const doc = result.data.data.document as Catalog
      const control = doc.groups![0].controls![0]
      expect(control.props).toHaveLength(1)
      expect(control.props![0].name).toBe('label')
      expect(control.props![0].value).toBe('AC-1')
      expect(control.links).toHaveLength(1)
      expect(control.links![0].href).toBe('#ac-2')
      expect(control.links![0].rel).toBe('related')
    }
  })

  it('parses back-matter resources', () => {
    const result = parseOscalText(xml)
    expect(result.success).toBe(true)
    if (result.success) {
      const doc = result.data.data.document as Catalog
      expect(doc['back-matter']?.resources).toHaveLength(1)
      expect(doc['back-matter']!.resources![0].uuid).toBe('res-001')
    }
  })

  it('parses metadata roles and parties', () => {
    const result = parseOscalText(xml)
    expect(result.success).toBe(true)
    if (result.success) {
      const doc = result.data.data.document as Catalog
      expect(doc.metadata.roles).toHaveLength(1)
      expect(doc.metadata.roles![0].id).toBe('author')
      expect(doc.metadata.parties).toHaveLength(1)
      expect(doc.metadata.parties![0].type).toBe('organization')
    }
  })
})

describe('XML Profile Fixture (profile-minimal.xml)', () => {
  const xml = loadFixtureText('profile-minimal.xml')

  it('detects XML format', () => {
    expect(detectFormat(xml)).toBe('xml')
  })

  it('parses via parseOscalText successfully', () => {
    const result = parseOscalText(xml)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.type).toBe('profile')
      expect(result.data.version).toBe('1.1.2')
    }
  })

  it('extracts imports with include-controls', () => {
    const result = parseOscalText(xml)
    expect(result.success).toBe(true)
    if (result.success) {
      const doc = result.data.data.document as Profile
      expect(doc.imports).toHaveLength(1)
      expect(doc.imports[0].href).toBe('https://example.com/catalog.json')
      const ic = doc.imports[0]['include-controls']
      expect(ic).toBeDefined()
      expect(ic![0]['with-ids']).toEqual(['ac-1', 'ac-2'])
    }
  })

  it('extracts merge strategy', () => {
    const result = parseOscalText(xml)
    expect(result.success).toBe(true)
    if (result.success) {
      const doc = result.data.data.document as Profile
      expect(doc.merge).toBeDefined()
    }
  })

  it('extracts modify with set-parameters', () => {
    const result = parseOscalText(xml)
    expect(result.success).toBe(true)
    if (result.success) {
      const doc = result.data.data.document as Profile
      expect(doc.modify).toBeDefined()
      expect(doc.modify!['set-parameters']).toHaveLength(1)
      expect(doc.modify!['set-parameters']![0]['param-id']).toBe('ac-1_prm_1')
    }
  })
})

// ============================================================
// Cross-format compatibility
// ============================================================

describe('Cross-format compatibility (JSON & XML)', () => {
  it('parseOscalText handles JSON fixtures identical to parseOscalDocument', () => {
    const jsonText = loadFixtureText('catalog-nist-example.json')
    const jsonResult = parseOscalText(jsonText)
    const directResult = parseOscalDocument(JSON.parse(jsonText))
    expect(jsonResult.success).toBe(true)
    expect(directResult.success).toBe(true)
    if (jsonResult.success && directResult.success) {
      expect(jsonResult.data.type).toBe(directResult.data.type)
      expect(jsonResult.data.version).toBe(directResult.data.version)
    }
  })
})
