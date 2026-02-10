/**
 * Integration tests for the @open-gov-group/oscal-parser npm package.
 * Verifies that all exported functions work correctly with real OSCAL data.
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  parseOscalDocument,
  parseOscalText,
  parseCatalog,
  parseProfile,
  parseComponentDefinition,
  parseSSP,
  parseAssessmentResults,
  parsePoam,
  countControls,
  detectDocumentType,
  detectVersion,
  detectFormat,
  xmlToJson,
} from '@/lib/index'

const fixture = (name: string) =>
  readFileSync(resolve(process.cwd(), 'tests/fixtures', name), 'utf-8')

// ============================================================
// parseOscalText — JSON
// ============================================================

describe('parseOscalText (JSON)', () => {
  it('parses a JSON catalog', () => {
    const result = parseOscalText(fixture('catalog-nist-example.json'))
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.type).toBe('catalog')
      expect(result.data.data.type).toBe('catalog')
    }
  })

  it('parses a JSON profile', () => {
    const result = parseOscalText(fixture('profile-nist-example.json'))
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.data.type).toBe('profile')
    }
  })

  it('returns error for empty input', () => {
    const result = parseOscalText('')
    expect(result.success).toBe(false)
  })

  it('returns error for plain text input', () => {
    const result = parseOscalText('Hello World')
    expect(result.success).toBe(false)
  })
})

// ============================================================
// parseOscalText — XML
// ============================================================

describe('parseOscalText (XML)', () => {
  it('parses an XML catalog', () => {
    const result = parseOscalText(fixture('catalog-minimal.xml'))
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.data.type).toBe('catalog')
    }
  })

  it('parses an XML profile', () => {
    const result = parseOscalText(fixture('profile-minimal.xml'))
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.data.type).toBe('profile')
    }
  })
})

// ============================================================
// parseOscalDocument
// ============================================================

describe('parseOscalDocument', () => {
  it('parses a catalog JSON object', () => {
    const json = JSON.parse(fixture('catalog-nist-example.json'))
    const result = parseOscalDocument(json)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.type).toBe('catalog')
    }
  })

  it('returns error for non-object input', () => {
    const result = parseOscalDocument('not an object')
    expect(result.success).toBe(false)
  })
})

// ============================================================
// Individual parsers
// ============================================================

describe('Individual parsers', () => {
  it('parseCatalog parses catalog document', () => {
    const json = JSON.parse(fixture('catalog-nist-example.json'))
    const result = parseCatalog(json.catalog)
    expect(result.success).toBe(true)
  })

  it('parseProfile parses profile document', () => {
    const json = JSON.parse(fixture('profile-nist-example.json'))
    const result = parseProfile(json.profile)
    expect(result.success).toBe(true)
  })

  it('parseComponentDefinition parses component-definition', () => {
    const json = JSON.parse(fixture('component-def-nist-example.json'))
    const result = parseComponentDefinition(json['component-definition'])
    expect(result.success).toBe(true)
  })

  it('parseSSP parses system-security-plan', () => {
    const json = JSON.parse(fixture('ssp-nist-example.json'))
    const result = parseSSP(json['system-security-plan'])
    expect(result.success).toBe(true)
  })

  it('parseAssessmentResults parses assessment-results', () => {
    const json = JSON.parse(fixture('assessment-results-nist-example.json'))
    const result = parseAssessmentResults(json['assessment-results'])
    expect(result.success).toBe(true)
  })

  it('parsePoam parses plan-of-action-and-milestones', () => {
    const json = JSON.parse(fixture('poam-nist-example.json'))
    const result = parsePoam(json['plan-of-action-and-milestones'])
    expect(result.success).toBe(true)
  })
})

// ============================================================
// countControls
// ============================================================

describe('countControls', () => {
  it('counts controls in a catalog', () => {
    const json = JSON.parse(fixture('catalog-nist-example.json'))
    const result = parseCatalog(json.catalog)
    if (result.success) {
      const count = countControls(result.data)
      expect(count).toBeGreaterThan(0)
    }
  })
})

// ============================================================
// detectDocumentType / detectVersion / detectFormat
// ============================================================

describe('Detection functions', () => {
  it('detectDocumentType identifies catalog', () => {
    const json = JSON.parse(fixture('catalog-nist-example.json'))
    expect(detectDocumentType(json)).toBe('catalog')
  })

  it('detectDocumentType identifies profile', () => {
    const json = JSON.parse(fixture('profile-nist-example.json'))
    expect(detectDocumentType(json)).toBe('profile')
  })

  it('detectVersion extracts version', () => {
    const json = JSON.parse(fixture('catalog-nist-example.json'))
    const version = detectVersion(json)
    expect(version).toBeTruthy()
  })

  it('detectFormat identifies JSON', () => {
    expect(detectFormat('{"catalog": {}}')).toBe('json')
  })

  it('detectFormat identifies XML', () => {
    expect(detectFormat('<?xml version="1.0"?><catalog/>')).toBe('xml')
  })

  it('detectFormat returns unknown for plain text', () => {
    expect(detectFormat('hello')).toBe('unknown')
  })
})

// ============================================================
// xmlToJson
// ============================================================

describe('xmlToJson', () => {
  it('converts XML catalog to JSON object', () => {
    const json = xmlToJson(fixture('catalog-minimal.xml')) as Record<string, unknown>
    expect(json).toHaveProperty('catalog')
  })

  it('converts XML profile to JSON object', () => {
    const json = xmlToJson(fixture('profile-minimal.xml')) as Record<string, unknown>
    expect(json).toHaveProperty('profile')
  })
})
