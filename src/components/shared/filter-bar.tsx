/**
 * FilterBar — Presentation component for combined keyword + chip filtering.
 *
 * Renders a text input for free-text keyword filtering, optional category dropdowns
 * that add chips, and a chip bar showing active filters with remove buttons.
 * Pairs with the useFilter hook (application layer) for state management.
 */
import type { FunctionComponent } from 'preact'
import type { FilterChip } from '@/hooks/use-filter'

/** A selectable option within a filter category dropdown. */
export interface FilterOption {
  value: string
  label: string
}

/** A filter category rendered as a dropdown (e.g. "Family" for catalog groups). */
export interface FilterCategory {
  key: string
  label: string
  options: FilterOption[]
}

interface FilterBarProps {
  keyword: string
  onKeywordChange: (v: string) => void
  chips: FilterChip[]
  onAddChip: (chip: FilterChip) => void
  onRemoveChip: (key: string, value: string) => void
  onClearAll: () => void
  hasActiveFilters: boolean
  categories?: FilterCategory[]
  placeholder?: string
}

export const FilterBar: FunctionComponent<FilterBarProps> = ({
  keyword,
  onKeywordChange,
  chips,
  onAddChip,
  onRemoveChip,
  onClearAll,
  hasActiveFilters,
  categories,
  placeholder = 'Filter...',
}) => {
  return (
    <div class="filter-bar">
      <div class="filter-bar-row">
        <input
          type="text"
          class="filter-input"
          placeholder={placeholder}
          value={keyword}
          onInput={(e) => onKeywordChange((e.target as HTMLInputElement).value)}
          aria-label="Filter items"
        />
        {categories && categories.map(cat => (
          <select
            key={cat.key}
            class="filter-select"
            aria-label={cat.label}
            onChange={(e) => {
              const select = e.target as HTMLSelectElement
              const val = select.value
              if (!val) return
              const opt = cat.options.find(o => o.value === val)
              if (opt) {
                onAddChip({ key: cat.key, value: opt.value, label: `${cat.label}: ${opt.label}` })
              }
              select.value = ''
            }}
          >
            <option value="">{cat.label}</option>
            {cat.options.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        ))}
      </div>

      {hasActiveFilters && (
        <div class="filter-chips">
          {chips.map(chip => (
            <span key={`${chip.key}-${chip.value}`} class="filter-chip">
              {chip.label}
              <button
                class="filter-chip-remove"
                onClick={() => onRemoveChip(chip.key, chip.value)}
                aria-label={`Remove filter ${chip.label}`}
              >
                &times;
              </button>
            </span>
          ))}
          {keyword && (
            <span class="filter-chip">
              Keyword: {keyword}
              <button
                class="filter-chip-remove"
                onClick={() => onKeywordChange('')}
                aria-label="Remove keyword filter"
              >
                &times;
              </button>
            </span>
          )}
          <button class="filter-clear-all" onClick={onClearAll}>
            Clear all
          </button>
        </div>
      )}
    </div>
  )
}
