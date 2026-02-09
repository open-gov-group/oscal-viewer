import { parseHref } from '@/services/href-parser'

describe('parseHref', () => {
  describe('URN patterns', () => {
    it('detects urn: prefix', () => {
      const result = parseHref('urn:iso:std:27001:2022')
      expect(result.type).toBe('urn')
    })

    it('returns full URN as path', () => {
      const result = parseHref('urn:iso:std:27001:2022')
      expect(result.path).toBe('urn:iso:std:27001:2022')
    })

    it('has no fragment', () => {
      const result = parseHref('urn:iso:std:27001:2022')
      expect(result.fragment).toBeUndefined()
    })

    it('is not resolvable', () => {
      const result = parseHref('urn:iso:std:27001:2022')
      expect(result.isResolvable).toBe(false)
    })

    it('handles URN with special characters', () => {
      const result = parseHref('urn:example:a-b.c_d')
      expect(result.type).toBe('urn')
      expect(result.path).toBe('urn:example:a-b.c_d')
    })
  })

  describe('absolute URL patterns', () => {
    it('detects https:// prefix', () => {
      const result = parseHref('https://example.com/catalog.json')
      expect(result.type).toBe('absolute-url')
    })

    it('detects http:// prefix', () => {
      const result = parseHref('http://example.com/catalog.json')
      expect(result.type).toBe('absolute-url')
    })

    it('is resolvable', () => {
      const result = parseHref('https://example.com/doc')
      expect(result.isResolvable).toBe(true)
    })

    it('splits path and fragment', () => {
      const result = parseHref('https://example.com/doc.json#ac-1')
      expect(result.path).toBe('https://example.com/doc.json')
      expect(result.fragment).toBe('ac-1')
    })

    it('has no fragment when # absent', () => {
      const result = parseHref('https://example.com/doc.json')
      expect(result.fragment).toBeUndefined()
    })

    it('handles multiple # characters', () => {
      const result = parseHref('https://example.com/doc#part1#sub')
      expect(result.path).toBe('https://example.com/doc')
      expect(result.fragment).toBe('part1#sub')
    })
  })

  describe('fragment patterns', () => {
    it('detects # prefix', () => {
      const result = parseHref('#ac-1')
      expect(result.type).toBe('fragment')
    })

    it('path is empty string', () => {
      const result = parseHref('#ac-1')
      expect(result.path).toBe('')
    })

    it('fragment is id after #', () => {
      const result = parseHref('#ac-1')
      expect(result.fragment).toBe('ac-1')
    })

    it('is resolvable', () => {
      const result = parseHref('#ac-1')
      expect(result.isResolvable).toBe(true)
    })

    it('handles empty fragment', () => {
      const result = parseHref('#')
      expect(result.type).toBe('fragment')
      expect(result.fragment).toBe('')
    })
  })

  describe('relative path patterns', () => {
    it('detects non-matching pattern as relative', () => {
      const result = parseHref('./other-catalog.json')
      expect(result.type).toBe('relative')
    })

    it('is not resolvable', () => {
      const result = parseHref('../catalog/file.json')
      expect(result.isResolvable).toBe(false)
    })

    it('splits path and fragment', () => {
      const result = parseHref('./doc.json#ctrl-1')
      expect(result.path).toBe('./doc.json')
      expect(result.fragment).toBe('ctrl-1')
    })

    it('handles path without fragment', () => {
      const result = parseHref('../catalog.json')
      expect(result.fragment).toBeUndefined()
    })
  })

  describe('edge cases', () => {
    it('handles empty string', () => {
      const result = parseHref('')
      expect(result.type).toBe('relative')
      expect(result.path).toBe('')
      expect(result.isResolvable).toBe(false)
    })

    it('handles plain filename', () => {
      const result = parseHref('catalog.json')
      expect(result.type).toBe('relative')
      expect(result.path).toBe('catalog.json')
    })
  })
})
