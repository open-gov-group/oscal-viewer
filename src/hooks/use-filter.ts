import { useState, useCallback, useMemo } from 'preact/hooks'

export interface FilterChip {
  key: string
  value: string
  label: string
}

export interface UseFilterReturn {
  keyword: string
  setKeyword: (v: string) => void
  chips: FilterChip[]
  addChip: (chip: FilterChip) => void
  removeChip: (key: string, value: string) => void
  clearAll: () => void
  hasActiveFilters: boolean
}

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
