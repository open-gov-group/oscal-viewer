import { renderHook, act } from '@testing-library/preact'
import { useFilter } from '@/hooks/use-filter'

describe('useFilter', () => {
  it('starts with empty state', () => {
    const { result } = renderHook(() => useFilter())
    expect(result.current.keyword).toBe('')
    expect(result.current.chips).toEqual([])
    expect(result.current.hasActiveFilters).toBe(false)
  })

  it('sets keyword', () => {
    const { result } = renderHook(() => useFilter())
    act(() => result.current.setKeyword('test'))
    expect(result.current.keyword).toBe('test')
    expect(result.current.hasActiveFilters).toBe(true)
  })

  it('adds a chip', () => {
    const { result } = renderHook(() => useFilter())
    act(() => result.current.addChip({ key: 'family', value: 'ac', label: 'Family: AC' }))
    expect(result.current.chips).toHaveLength(1)
    expect(result.current.chips[0]).toEqual({ key: 'family', value: 'ac', label: 'Family: AC' })
    expect(result.current.hasActiveFilters).toBe(true)
  })

  it('does not add duplicate chip', () => {
    const { result } = renderHook(() => useFilter())
    act(() => result.current.addChip({ key: 'family', value: 'ac', label: 'Family: AC' }))
    act(() => result.current.addChip({ key: 'family', value: 'ac', label: 'Family: AC' }))
    expect(result.current.chips).toHaveLength(1)
  })

  it('allows different chips with same key but different value', () => {
    const { result } = renderHook(() => useFilter())
    act(() => result.current.addChip({ key: 'family', value: 'ac', label: 'Family: AC' }))
    act(() => result.current.addChip({ key: 'family', value: 'au', label: 'Family: AU' }))
    expect(result.current.chips).toHaveLength(2)
  })

  it('removes a chip', () => {
    const { result } = renderHook(() => useFilter())
    act(() => result.current.addChip({ key: 'family', value: 'ac', label: 'Family: AC' }))
    act(() => result.current.removeChip('family', 'ac'))
    expect(result.current.chips).toHaveLength(0)
    expect(result.current.hasActiveFilters).toBe(false)
  })

  it('clearAll resets keyword and chips', () => {
    const { result } = renderHook(() => useFilter())
    act(() => {
      result.current.setKeyword('test')
      result.current.addChip({ key: 'family', value: 'ac', label: 'Family: AC' })
    })
    act(() => result.current.clearAll())
    expect(result.current.keyword).toBe('')
    expect(result.current.chips).toHaveLength(0)
    expect(result.current.hasActiveFilters).toBe(false)
  })
})
