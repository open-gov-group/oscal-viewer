import { toRawGithubUrl, resolveUrl, resolveFragmentToUrl, fetchDocument, resolveProfile, resolveSsp, resolveSource } from '@/services/resolver'
import { DocumentCache } from '@/services/document-cache'
import type { OscalDocument, Profile, Catalog, SystemSecurityPlan } from '@/types/oscal'

const mockCatalog: Catalog = {
  uuid: 'cat-uuid',
  metadata: {
    title: 'Test Catalog',
    'last-modified': '2026-01-01T00:00:00Z',
    version: '1.0',
    'oscal-version': '1.1.2',
  },
  controls: [
    { id: 'ac-1', title: 'Access Control Policy' },
    { id: 'ac-2', title: 'Account Management' },
    { id: 'si-1', title: 'System Integrity Policy' },
  ],
}

const mockCatalogDoc: OscalDocument = {
  type: 'catalog',
  version: '1.1.2',
  data: { type: 'catalog', document: mockCatalog },
}

const mockProfile: Profile = {
  uuid: 'prof-uuid',
  metadata: {
    title: 'Test Profile',
    'last-modified': '2026-01-01T00:00:00Z',
    version: '1.0',
    'oscal-version': '1.1.2',
  },
  imports: [
    {
      href: 'https://example.com/catalog.json',
      'include-controls': [{ 'with-ids': ['ac-1', 'ac-2'] }],
    },
  ],
}

describe('toRawGithubUrl', () => {
  it('transforms GitHub blob URL to raw URL', () => {
    const url = 'https://github.com/user/repo/blob/main/catalog.json'
    expect(toRawGithubUrl(url)).toBe('https://raw.githubusercontent.com/user/repo/main/catalog.json')
  })

  it('returns non-GitHub URL unchanged', () => {
    const url = 'https://example.com/catalog.json'
    expect(toRawGithubUrl(url)).toBe(url)
  })

  it('handles nested paths', () => {
    const url = 'https://github.com/org/repo/blob/v1.0/path/to/file.json'
    expect(toRawGithubUrl(url)).toBe('https://raw.githubusercontent.com/org/repo/v1.0/path/to/file.json')
  })
})

describe('resolveUrl', () => {
  it('returns absolute URL as-is (with GitHub transform)', () => {
    expect(resolveUrl('https://example.com/doc.json')).toBe('https://example.com/doc.json')
  })

  it('resolves relative URL with base', () => {
    const result = resolveUrl('./catalog.json', 'https://example.com/profiles/')
    expect(result).toBe('https://example.com/profiles/catalog.json')
  })

  it('returns relative URL as-is without base', () => {
    expect(resolveUrl('./catalog.json')).toBe('./catalog.json')
  })
})

describe('resolveFragmentToUrl', () => {
  const backMatter = {
    resources: [
      {
        uuid: '84cbf061-eb87-4ec1-8112-1f529232e907',
        description: 'NIST SP 800-53',
        rlinks: [
          { href: '../../../../catalog.xml', 'media-type': 'application/oscal.catalog+xml' },
          { href: '../../../../catalog.json', 'media-type': 'application/oscal.catalog+json' },
        ],
      },
    ],
  }

  it('resolves fragment to JSON rlink URL', () => {
    const result = resolveFragmentToUrl('84cbf061-eb87-4ec1-8112-1f529232e907', backMatter, 'https://example.com/profiles/')
    expect(result).toBe('https://example.com/catalog.json')
  })

  it('returns undefined for unknown fragment', () => {
    const result = resolveFragmentToUrl('unknown-uuid', backMatter, undefined)
    expect(result).toBeUndefined()
  })

  it('returns undefined for undefined fragment', () => {
    const result = resolveFragmentToUrl(undefined, backMatter, undefined)
    expect(result).toBeUndefined()
  })

  it('returns undefined for undefined back-matter', () => {
    const result = resolveFragmentToUrl('84cbf061-eb87-4ec1-8112-1f529232e907', undefined, undefined)
    expect(result).toBeUndefined()
  })

  it('returns undefined for resource with no rlinks', () => {
    const bmNoRlinks = { resources: [{ uuid: 'test-uuid', description: 'No rlinks' }] }
    const result = resolveFragmentToUrl('test-uuid', bmNoRlinks, undefined)
    expect(result).toBeUndefined()
  })

  it('falls back to first rlink when no JSON rlink exists', () => {
    const bmXmlOnly = {
      resources: [{
        uuid: 'xml-only',
        rlinks: [{ href: 'catalog.xml', 'media-type': 'application/xml' }],
      }],
    }
    const result = resolveFragmentToUrl('xml-only', bmXmlOnly, 'https://example.com/')
    expect(result).toBe('https://example.com/catalog.xml')
  })
})

describe('fetchDocument', () => {
  let cache: DocumentCache

  beforeEach(() => {
    cache = new DocumentCache()
    vi.restoreAllMocks()
  })

  it('returns cached document without fetching', async () => {
    cache.set('https://example.com/doc.json', mockCatalogDoc)
    const fetchSpy = vi.fn()
    globalThis.fetch = fetchSpy

    const result = await fetchDocument('https://example.com/doc.json', cache)
    expect(result).toBe(mockCatalogDoc)
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('fetches and parses document', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ catalog: mockCatalog })),
    })

    const result = await fetchDocument('https://example.com/doc.json', cache)
    expect(result.type).toBe('catalog')
    expect(cache.has('https://example.com/doc.json')).toBe(true)
  })

  it('throws on HTTP error', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    })

    await expect(fetchDocument('https://example.com/doc.json', cache)).rejects.toThrow('HTTP 404')
  })
})

describe('resolveProfile', () => {
  let cache: DocumentCache

  beforeEach(() => {
    cache = new DocumentCache()
    vi.restoreAllMocks()
  })

  it('resolves profile with include-controls filter', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ catalog: mockCatalog })),
    })

    const result = await resolveProfile(mockProfile, undefined, cache)
    expect(result.controls).toHaveLength(2)
    expect(result.controls.map(c => c.id)).toEqual(['ac-1', 'ac-2'])
    expect(result.sources).toHaveLength(1)
    expect(result.sources[0].status).toBe('loaded')
  })

  it('resolves profile with include-all', async () => {
    const profileAll: Profile = {
      ...mockProfile,
      imports: [{ href: 'https://example.com/catalog.json', 'include-all': {} }],
    }

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ catalog: mockCatalog })),
    })

    const result = await resolveProfile(profileAll, undefined, cache)
    expect(result.controls).toHaveLength(3)
  })

  it('handles fetch error gracefully', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'))

    const result = await resolveProfile(mockProfile, undefined, cache)
    expect(result.sources[0].status).toBe('error')
    expect(result.sources[0].error).toContain('CORS')
    expect(result.controls).toHaveLength(0)
  })

  it('handles URN imports', async () => {
    const profileUrn: Profile = {
      ...mockProfile,
      imports: [{ href: 'urn:example:catalog', 'include-all': {} }],
    }

    const result = await resolveProfile(profileUrn, undefined, cache)
    expect(result.sources[0].status).toBe('error')
    expect(result.sources[0].error).toContain('URN')
  })

  it('resolves fragment import via back-matter resource', async () => {
    const profileWithFragment: Profile = {
      ...mockProfile,
      imports: [
        { href: '#84cbf061-eb87-4ec1-8112-1f529232e907', 'include-all': {} },
      ],
      'back-matter': {
        resources: [{
          uuid: '84cbf061-eb87-4ec1-8112-1f529232e907',
          description: 'Source catalog',
          rlinks: [
            { href: 'catalog.json', 'media-type': 'application/oscal.catalog+json' },
          ],
        }],
      },
    }

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ catalog: mockCatalog })),
    })

    const result = await resolveProfile(profileWithFragment, 'https://example.com/profiles/', cache)
    expect(result.controls).toHaveLength(3)
    expect(result.sources[0].status).toBe('loaded')
    expect(result.sources[0].resolvedUrl).toBe('https://example.com/profiles/catalog.json')
  })

  it('returns error for fragment with missing back-matter resource', async () => {
    const profileBadFragment: Profile = {
      ...mockProfile,
      imports: [
        { href: '#nonexistent-uuid', 'include-all': {} },
      ],
    }

    const result = await resolveProfile(profileBadFragment, undefined, cache)
    expect(result.sources[0].status).toBe('error')
    expect(result.sources[0].error).toContain('Back-matter')
    expect(result.controls).toHaveLength(0)
  })

  it('applies set-parameters modifications', async () => {
    const profileWithModify: Profile = {
      ...mockProfile,
      imports: [{ href: 'https://example.com/catalog.json', 'include-all': {} }],
      modify: {
        'set-parameters': [
          { 'param-id': 'ac-1_prm_1', values: ['modified-value'] },
        ],
      },
    }

    const catalogWithParams: Catalog = {
      ...mockCatalog,
      controls: [
        { id: 'ac-1', title: 'AC-1', params: [{ id: 'ac-1_prm_1', values: ['original'] }] },
      ],
    }

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ catalog: catalogWithParams })),
    })

    const result = await resolveProfile(profileWithModify, undefined, cache)
    expect(result.controls[0].params?.[0].values).toEqual(['modified-value'])
  })
})

describe('resolveSsp', () => {
  let cache: DocumentCache

  const mockCatalog: Catalog = {
    uuid: 'cat-uuid',
    metadata: {
      title: 'Test Catalog',
      'last-modified': '2026-01-01T00:00:00Z',
      version: '1.0',
      'oscal-version': '1.1.2',
    },
    controls: [
      { id: 'ac-1', title: 'Access Control Policy' },
      { id: 'ac-2', title: 'Account Management' },
    ],
  }

  const mockProfile: Profile = {
    uuid: 'prof-uuid',
    metadata: {
      title: 'Test Profile',
      'last-modified': '2026-01-01T00:00:00Z',
      version: '2.0',
      'oscal-version': '1.1.2',
    },
    imports: [
      { href: 'https://example.com/catalog.json', 'include-all': {} },
    ],
  }

  const mockSsp: SystemSecurityPlan = {
    uuid: 'ssp-uuid',
    metadata: {
      title: 'Test SSP',
      'last-modified': '2026-01-01T00:00:00Z',
      version: '1.0',
      'oscal-version': '1.1.2',
    },
    'import-profile': { href: 'https://example.com/profile.json' },
    'system-characteristics': {
      'system-ids': [{ id: 'sys-1' }],
      'system-name': 'Test System',
      description: 'A test system',
      'system-information': { 'information-types': [] },
      status: { state: 'operational' },
      'authorization-boundary': { description: 'Test boundary' },
    },
    'system-implementation': {
      users: [],
      components: [],
    },
    'control-implementation': {
      description: 'Test controls',
      'implemented-requirements': [],
    },
  }

  beforeEach(() => {
    cache = new DocumentCache()
    vi.restoreAllMocks()
  })

  it('resolves SSP → Profile → Catalog chain', async () => {
    let callCount = 0
    globalThis.fetch = vi.fn().mockImplementation(() => {
      callCount++
      if (callCount === 1) {
        // First call: fetch profile
        return Promise.resolve({
          ok: true,
          text: () => Promise.resolve(JSON.stringify({ profile: mockProfile })),
        })
      }
      // Second call: fetch catalog
      return Promise.resolve({
        ok: true,
        text: () => Promise.resolve(JSON.stringify({ catalog: mockCatalog })),
      })
    })

    const result = await resolveSsp(mockSsp, undefined, cache)
    expect(result.profileMeta).not.toBeNull()
    expect(result.profileMeta!.title).toBe('Test Profile')
    expect(result.profileMeta!.version).toBe('2.0')
    expect(result.profileMeta!.importCount).toBe(1)
    expect(result.catalogSources).toHaveLength(1)
    expect(result.catalogSources[0].status).toBe('loaded')
    expect(result.controls).toHaveLength(2)
  })

  it('returns error for URN import-profile', async () => {
    const sspWithUrn = {
      ...mockSsp,
      'import-profile': { href: 'urn:example:profile' },
    }

    const result = await resolveSsp(sspWithUrn, undefined, cache)
    expect(result.profileMeta).toBeNull()
    expect(result.errors).toHaveLength(1)
    expect(result.errors[0]).toContain('URN')
  })

  it('handles CORS error gracefully', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'))

    const result = await resolveSsp(mockSsp, undefined, cache)
    expect(result.profileMeta).toBeNull()
    expect(result.errors[0]).toContain('CORS')
  })

  it('handles non-profile document type', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ catalog: mockCatalog })),
    })

    const result = await resolveSsp(mockSsp, undefined, cache)
    expect(result.profileMeta).toBeNull()
    expect(result.errors[0]).toContain('Expected profile')
  })
})

describe('resolveSource', () => {
  let cache: DocumentCache

  beforeEach(() => {
    cache = new DocumentCache()
    vi.restoreAllMocks()
  })

  it('resolves a catalog source', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({
        catalog: {
          uuid: 'cat-uuid',
          metadata: { title: 'My Catalog', 'last-modified': '2026-01-01T00:00:00Z', version: '3.0', 'oscal-version': '1.1.2' },
        },
      })),
    })

    const result = await resolveSource('https://example.com/catalog.json', undefined, cache)
    expect(result.title).toBe('My Catalog')
    expect(result.type).toBe('catalog')
    expect(result.version).toBe('3.0')
    expect(result.status).toBe('loaded')
    expect(result.error).toBeUndefined()
  })

  it('returns cached status for cached source', async () => {
    // Pre-populate cache
    const mockDoc = {
      type: 'catalog' as const,
      version: '1.1.2',
      data: {
        type: 'catalog' as const,
        document: {
          uuid: 'cat-uuid',
          metadata: { title: 'Cached Catalog', 'last-modified': '2026-01-01T00:00:00Z', version: '1.0', 'oscal-version': '1.1.2' },
        },
      },
    }
    cache.set('https://example.com/cached.json', mockDoc)

    const result = await resolveSource('https://example.com/cached.json', undefined, cache)
    expect(result.status).toBe('cached')
    expect(result.title).toBe('Cached Catalog')
  })

  it('returns error for URN', async () => {
    const result = await resolveSource('urn:example:catalog', undefined, cache)
    expect(result.status).toBe('error')
    expect(result.error).toContain('URN')
  })

  it('handles HTTP error', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    })

    const result = await resolveSource('https://example.com/missing.json', undefined, cache)
    expect(result.status).toBe('error')
    expect(result.error).toContain('404')
  })
})
