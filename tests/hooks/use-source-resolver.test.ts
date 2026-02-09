import { renderHook, act } from '@testing-library/preact'
import { useSourceResolver } from '@/hooks/use-source-resolver'

const mockCatalogJson = JSON.stringify({
  catalog: {
    uuid: 'cat-uuid',
    metadata: { title: 'Source Catalog', 'last-modified': '2026-01-01T00:00:00Z', version: '1.0', 'oscal-version': '1.1.2' },
  },
})

describe('useSourceResolver', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('starts with empty state', () => {
    const { result } = renderHook(() => useSourceResolver())
    expect(result.current.sources.size).toBe(0)
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('resolves multiple sources in parallel', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(mockCatalogJson),
    })

    const { result } = renderHook(() => useSourceResolver())

    await act(async () => {
      await result.current.resolve([
        'https://example.com/cat1.json',
        'https://example.com/cat2.json',
      ])
    })

    expect(result.current.sources.size).toBe(2)
    expect(result.current.sources.get('https://example.com/cat1.json')?.title).toBe('Source Catalog')
    expect(result.current.loading).toBe(false)
  })

  it('handles mixed success and failure', async () => {
    let callCount = 0
    globalThis.fetch = vi.fn().mockImplementation(() => {
      callCount++
      if (callCount === 1) {
        return Promise.resolve({ ok: true, text: () => Promise.resolve(mockCatalogJson) })
      }
      return Promise.resolve({ ok: false, status: 404, statusText: 'Not Found' })
    })

    const { result } = renderHook(() => useSourceResolver())

    await act(async () => {
      await result.current.resolve([
        'https://example.com/good.json',
        'https://example.com/bad.json',
      ])
    })

    expect(result.current.sources.size).toBe(2)
    expect(result.current.sources.get('https://example.com/good.json')?.status).toBe('loaded')
    expect(result.current.sources.get('https://example.com/bad.json')?.status).toBe('error')
  })
})
