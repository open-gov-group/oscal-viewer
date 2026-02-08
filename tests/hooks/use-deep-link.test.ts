import { renderHook, act } from '@testing-library/preact'
import { useDeepLink } from '@/hooks/use-deep-link'

describe('useDeepLink (QA3)', () => {
  beforeEach(() => {
    history.replaceState(null, '', window.location.pathname)
  })

  it('QA3: returns null when no hash is set', () => {
    const { result } = renderHook(() => useDeepLink('catalog'))
    expect(result.current.selectedId).toBeNull()
  })

  it('QA3: parses initial hash on mount', () => {
    history.replaceState(null, '', '#/catalog/ac-1')
    const { result } = renderHook(() => useDeepLink('catalog'))
    expect(result.current.selectedId).toBe('ac-1')
  })

  it('QA3: ignores hash for different viewType', () => {
    history.replaceState(null, '', '#/compdef/uuid-123')
    const { result } = renderHook(() => useDeepLink('catalog'))
    expect(result.current.selectedId).toBeNull()
  })

  it('QA3: setSelectedId updates URL hash', () => {
    const { result } = renderHook(() => useDeepLink('catalog'))
    act(() => result.current.setSelectedId('ac-2'))
    expect(result.current.selectedId).toBe('ac-2')
    expect(location.hash).toBe('#/catalog/ac-2')
  })

  it('QA3: setSelectedId(null) clears URL hash', () => {
    history.replaceState(null, '', '#/catalog/ac-1')
    const { result } = renderHook(() => useDeepLink('catalog'))
    act(() => result.current.setSelectedId(null))
    expect(result.current.selectedId).toBeNull()
    expect(location.hash).toBe('')
  })

  it('QA3: responds to hashchange events', async () => {
    const { result } = renderHook(() => useDeepLink('catalog'))
    expect(result.current.selectedId).toBeNull()

    // Simulate external hash change (e.g. browser back/forward)
    act(() => {
      history.replaceState(null, '', '#/catalog/ac-3')
      window.dispatchEvent(new HashChangeEvent('hashchange'))
    })
    expect(result.current.selectedId).toBe('ac-3')
  })

  it('QA3: works with SSP view type', () => {
    history.replaceState(null, '', '#/ssp/characteristics')
    const { result } = renderHook(() => useDeepLink('ssp'))
    expect(result.current.selectedId).toBe('characteristics')
  })

  it('QA3: returns null for empty hash after prefix', () => {
    history.replaceState(null, '', '#/catalog/')
    const { result } = renderHook(() => useDeepLink('catalog'))
    expect(result.current.selectedId).toBeNull()
  })
})
