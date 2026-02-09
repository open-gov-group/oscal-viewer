import { renderHook, act } from '@testing-library/preact'
import { useSspResolver } from '@/hooks/use-ssp-resolver'
import type { SystemSecurityPlan, Catalog, Profile } from '@/types/oscal'

const mockCatalog: Catalog = {
  uuid: 'cat-uuid',
  metadata: { title: 'Test Catalog', 'last-modified': '2026-01-01T00:00:00Z', version: '1.0', 'oscal-version': '1.1.2' },
  controls: [{ id: 'ac-1', title: 'Access Control' }],
}

const mockProfile: Profile = {
  uuid: 'prof-uuid',
  metadata: { title: 'Test Profile', 'last-modified': '2026-01-01T00:00:00Z', version: '2.0', 'oscal-version': '1.1.2' },
  imports: [{ href: 'https://example.com/catalog.json', 'include-all': {} }],
}

const mockSsp: SystemSecurityPlan = {
  uuid: 'ssp-uuid',
  metadata: { title: 'Test SSP', 'last-modified': '2026-01-01T00:00:00Z', version: '1.0', 'oscal-version': '1.1.2' },
  'import-profile': { href: 'https://example.com/profile.json' },
  'system-characteristics': {
    'system-ids': [{ id: 'sys-1' }],
    'system-name': 'Test System',
    description: 'Test',
    'system-information': { 'information-types': [] },
    status: { state: 'operational' },
    'authorization-boundary': { description: 'Test' },
  },
  'system-implementation': { users: [], components: [] },
  'control-implementation': { description: 'Test', 'implemented-requirements': [] },
}

describe('useSspResolver', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('starts with empty state', () => {
    const { result } = renderHook(() => useSspResolver())
    expect(result.current.profileMeta).toBeNull()
    expect(result.current.catalogSources).toEqual([])
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('resolves SSP successfully', async () => {
    let callCount = 0
    globalThis.fetch = vi.fn().mockImplementation(() => {
      callCount++
      if (callCount === 1) {
        return Promise.resolve({ ok: true, text: () => Promise.resolve(JSON.stringify({ profile: mockProfile })) })
      }
      return Promise.resolve({ ok: true, text: () => Promise.resolve(JSON.stringify({ catalog: mockCatalog })) })
    })

    const { result } = renderHook(() => useSspResolver())

    await act(async () => {
      await result.current.resolve(mockSsp)
    })

    expect(result.current.profileMeta).not.toBeNull()
    expect(result.current.profileMeta!.title).toBe('Test Profile')
    expect(result.current.catalogSources).toHaveLength(1)
    expect(result.current.loading).toBe(false)
  })

  it('handles fetch error', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new TypeError('Failed'))

    const { result } = renderHook(() => useSspResolver())

    await act(async () => {
      await result.current.resolve(mockSsp)
    })

    expect(result.current.profileMeta).toBeNull()
    expect(result.current.error).toBeTruthy()
  })
})
