import { DocumentCache, normalizeUrl } from '@/services/document-cache'
import type { OscalDocument } from '@/types/oscal'

const mockDoc: OscalDocument = {
  type: 'catalog',
  version: '1.1.2',
  data: {
    type: 'catalog',
    document: {
      uuid: 'test-uuid',
      metadata: {
        title: 'Test Catalog',
        'last-modified': '2026-01-01T00:00:00Z',
        version: '1.0',
        'oscal-version': '1.1.2',
      },
    },
  },
}

describe('normalizeUrl', () => {
  it('strips fragment from URL', () => {
    expect(normalizeUrl('https://example.com/doc.json#ac-1')).toBe('https://example.com/doc.json')
  })

  it('lowercases URL', () => {
    expect(normalizeUrl('HTTPS://Example.COM/Doc.JSON')).toBe('https://example.com/doc.json')
  })

  it('handles URL without fragment', () => {
    expect(normalizeUrl('https://example.com/doc.json')).toBe('https://example.com/doc.json')
  })

  it('handles empty string', () => {
    expect(normalizeUrl('')).toBe('')
  })
})

describe('DocumentCache', () => {
  let cache: DocumentCache

  beforeEach(() => {
    cache = new DocumentCache()
  })

  it('starts empty', () => {
    expect(cache.size).toBe(0)
  })

  it('stores and retrieves a document', () => {
    cache.set('https://example.com/doc.json', mockDoc)
    expect(cache.get('https://example.com/doc.json')).toBe(mockDoc)
  })

  it('returns undefined for unknown URL', () => {
    expect(cache.get('https://unknown.com/doc.json')).toBeUndefined()
  })

  it('normalizes URLs for storage', () => {
    cache.set('HTTPS://Example.COM/Doc.JSON#frag', mockDoc)
    expect(cache.has('https://example.com/doc.json')).toBe(true)
  })

  it('reports correct size', () => {
    cache.set('https://a.com/1.json', mockDoc)
    cache.set('https://b.com/2.json', mockDoc)
    expect(cache.size).toBe(2)
  })

  it('deduplicates by normalized URL', () => {
    cache.set('https://example.com/doc.json', mockDoc)
    cache.set('https://example.com/doc.json#frag', mockDoc)
    expect(cache.size).toBe(1)
  })

  it('clears all entries', () => {
    cache.set('https://a.com/1.json', mockDoc)
    cache.set('https://b.com/2.json', mockDoc)
    cache.clear()
    expect(cache.size).toBe(0)
  })

  it('has() returns false after clear', () => {
    cache.set('https://example.com/doc.json', mockDoc)
    cache.clear()
    expect(cache.has('https://example.com/doc.json')).toBe(false)
  })
})
