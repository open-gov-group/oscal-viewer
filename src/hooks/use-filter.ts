/**
 * useFilter — Combined keyword + chip-based filtering for sidebar navigation.
 *
 * Two filter mechanisms work together:
 * - **Keyword**: Free-text substring match (typed into the input field)
 * - **Chips**: Category-based discrete filters (selected from dropdowns, e.g. "Family: AC")
 *
 * The view component applies both filters to its data list.
 * FilterBar is the corresponding presentation component.
 */
import { useState, useCallback, useMemo } from 'preact/hooks'

/**
 * A discrete filter selection displayed as a removable chip.
 * @example { key: 'family', value: 'ac', label: 'Family: AC' }
 */
export interface FilterChip {
  /** Category key matching a FilterCategory (e.g. 'family', 'type'). */
  key: string
  /** Selected option value within the category. */
  value: string
  /** Human-readable label shown in the chip (e.g. "Family: AC – Access Control"). */
  label: string
}

export interface UseFilterReturn {
  keyword: string
  setKeyword: (v: string) => void
  chips: FilterChip[]
  /** Add a chip. Duplicates (same key+value) are silently ignored. */
  addChip: (chip: FilterChip) => void
  /** Remove a specific chip by its key+value pair. */
  removeChip: (key: string, value: string) => void
  /** Reset all filters (keyword and chips). */
  clearAll: () => void
  /** True when any filter is active (keyword or chips). */
  hasActiveFilters: boolean
}

/**
 * Manages filter state for sidebar list filtering.
 * @returns Filter state and actions. Pair with FilterBar for the UI.
 */
export function useFilter(): UseFilterReturn {
  const [keyword, setKeyword] = useState('')
  const [chips, setChips] = useState<FilterChip[]>([])

  const addChip = useCallback((chip: FilterChip) => {
    setChips(prev => {
      if (prev.some(c => c.key === chip.key && c.value === chip.value)) return prev
      return [...prev, chip]
    })
  }, [])

  const removeChip = useCallback((key: string, value: string) => {
    setChips(prev => prev.filter(c => !(c.key === key && c.value === value)))
  }, [])

  const clearAll = useCallback(() => {
    setKeyword('')
    setChips([])
  }, [])

  const hasActiveFilters = useMemo(
    () => keyword.length > 0 || chips.length > 0,
    [keyword, chips],
  )

  return { keyword, setKeyword, chips, addChip, removeChip, clearAll, hasActiveFilters }
}
