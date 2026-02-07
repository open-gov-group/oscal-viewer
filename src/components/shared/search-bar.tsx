import { useState, useEffect } from 'preact/hooks'
import type { FunctionComponent } from 'preact'
import type { SearchResult } from '@/hooks/use-search'

interface SearchBarProps {
  query: string
  onQueryChange: (q: string) => void
  results: SearchResult[]
  isSearching: boolean
  onSelect?: (result: SearchResult) => void
}

export const SearchBar: FunctionComponent<SearchBarProps> = ({ query, onQueryChange, results, isSearching, onSelect }) => {
  const [activeIndex, setActiveIndex] = useState(-1)

  useEffect(() => {
    if (!isSearching) setActiveIndex(-1)
  }, [isSearching])

  const handleSelect = (result: SearchResult) => {
    onSelect?.(result)
    onQueryChange('')
    setActiveIndex(-1)
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isSearching || results.length === 0) return
    const max = Math.min(results.length, 50) - 1

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex(prev => Math.min(prev + 1, max))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex(prev => Math.max(prev - 1, -1))
    } else if (e.key === 'Escape') {
      onQueryChange('')
      setActiveIndex(-1)
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault()
      handleSelect(results[activeIndex])
    }
  }

  const showResults = isSearching && results.length > 0

  return (
    <div class="search-bar">
      <div class="search-input-wrapper">
        <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="search"
          role="combobox"
          class="search-input"
          placeholder="Search controls, components, parameters..."
          value={query}
          onInput={(e) => {
            onQueryChange((e.target as HTMLInputElement).value)
            setActiveIndex(-1)
          }}
          onKeyDown={(e) => handleKeyDown(e as unknown as KeyboardEvent)}
          aria-label="Search document"
          aria-haspopup="listbox"
          aria-expanded={showResults}
          aria-controls={showResults ? 'search-results-listbox' : undefined}
          aria-activedescendant={activeIndex >= 0 ? `search-result-${activeIndex}` : undefined}
          autocomplete="off"
        />
        {query && (
          <button
            class="search-clear"
            onClick={() => onQueryChange('')}
            aria-label="Clear search"
          >
            &times;
          </button>
        )}
      </div>

      {isSearching && (
        <div id="search-results-listbox" class="search-results" role="listbox" aria-label="Search results">
          {results.length === 0 ? (
            <div class="search-no-results">No results found</div>
          ) : (
            <>
              <div class="search-results-count">{results.length} result{results.length !== 1 ? 's' : ''}</div>
              {results.slice(0, 50).map((result, i) => (
                <div
                  key={`${result.id}-${i}`}
                  id={`search-result-${i}`}
                  class={`search-result-item ${i === activeIndex ? 'search-result-active' : ''}`}
                  role="option"
                  aria-selected={i === activeIndex}
                  onClick={() => handleSelect(result)}
                >
                  <span class="search-result-type">{result.type}</span>
                  <div class="search-result-content">
                    <span class="search-result-id">{result.id}</span>
                    <span class="search-result-title">{result.title}</span>
                  </div>
                  {result.context && (
                    <span class="search-result-context">{result.context.slice(0, 100)}{result.context.length > 100 ? '...' : ''}</span>
                  )}
                </div>
              ))}
              {results.length > 50 && (
                <div class="search-more">...and {results.length - 50} more results</div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
