import { renderHook, act } from '@testing-library/preact'
import { useResolver } from '@/hooks/use-resolver'
import type { Profile, Catalog } from '@/types/oscal'

const mockCatalog: Catalog = {
  uuid: 'cat-uuid',
  metadata: {
    title: 'Test',
    'last-modified': '2026-01-01T00:00:00Z',
    version: '1.0',
    'oscal-version': '1.1.2',
  },
  controls: [
    { id: 'ac-1', title: 'Access Control' },
  ],
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
    { href: 'https://example.com/catalog.json', 'include-all': {} },
  ],
}

describe('useResolver', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('starts with empty state', () => {
    const { result } = renderHook(() => useResolver())
    expect(result.current.controls).toEqual([])
    expect(result.current.sources).toEqual([])
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('resolves a profile successfully', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ catalog: mockCatalog })),
    })

    const { result } = renderHook(() => useResolver())

    await act(async () => {
      await result.current.resolve(mockProfile)
    })

    expect(result.current.controls).toHaveLength(1)
    expect(result.current.sources).toHaveLength(1)
    expect(result.current.loading).toBe(false)
  })

  it('sets error on complete failure', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useResolver())

    await act(async () => {
      await result.current.resolve(mockProfile)
    })

    expect(result.current.sources[0].status).toBe('error')
  })
})
