import { render, screen, fireEvent } from '@testing-library/preact'
import { SearchBar } from '@/components/shared/search-bar'
import type { SearchResult } from '@/hooks/use-search'

// ============================================================
// Test Fixtures
// ============================================================

const mockResults: SearchResult[] = [
  { id: 'ac-1', title: 'Policy and Procedures', type: 'control', context: 'Access Control' },
  { id: 'ac-2', title: 'Account Management', type: 'control', context: 'Access Control' },
  { id: 'au-1', title: 'Audit Policy', type: 'control', context: 'Audit' },
]

// ============================================================
// SearchBar Tests
// ============================================================

describe('SearchBar', () => {
  const onQueryChange = vi.fn()

  beforeEach(() => {
    onQueryChange.mockClear()
  })

  it('renders search input', () => {
    render(<SearchBar query="" onQueryChange={onQueryChange} results={[]} isSearching={false} />)
    expect(screen.getByPlaceholderText('Search controls, components, parameters...')).toBeInTheDocument()
  })

  it('has aria-label for accessibility', () => {
    render(<SearchBar query="" onQueryChange={onQueryChange} results={[]} isSearching={false} />)
    expect(screen.getByLabelText('Search document')).toBeInTheDocument()
  })

  it('shows clear button when query is not empty', () => {
    render(<SearchBar query="test" onQueryChange={onQueryChange} results={[]} isSearching={false} />)
    expect(screen.getByLabelText('Clear search')).toBeInTheDocument()
  })

  it('does not show clear button when query is empty', () => {
    render(<SearchBar query="" onQueryChange={onQueryChange} results={[]} isSearching={false} />)
    expect(screen.queryByLabelText('Clear search')).not.toBeInTheDocument()
  })

  it('calls onQueryChange when clear is clicked', () => {
    render(<SearchBar query="test" onQueryChange={onQueryChange} results={[]} isSearching={false} />)
    fireEvent.click(screen.getByLabelText('Clear search'))
    expect(onQueryChange).toHaveBeenCalledWith('')
  })

  it('calls onQueryChange on input', () => {
    render(<SearchBar query="" onQueryChange={onQueryChange} results={[]} isSearching={false} />)
    const input = screen.getByLabelText('Search document')
    fireEvent.input(input, { target: { value: 'access' } })
    expect(onQueryChange).toHaveBeenCalled()
  })

  it('shows results when isSearching is true', () => {
    render(<SearchBar query="ac" onQueryChange={onQueryChange} results={mockResults} isSearching={true} />)
    expect(screen.getByText('3 results')).toBeInTheDocument()
  })

  it('shows no results message when searching with empty results', () => {
    render(<SearchBar query="zzz" onQueryChange={onQueryChange} results={[]} isSearching={true} />)
    expect(screen.getByText('No results found')).toBeInTheDocument()
  })

  it('does not show results when not searching', () => {
    render(<SearchBar query="" onQueryChange={onQueryChange} results={mockResults} isSearching={false} />)
    expect(screen.queryByText('3 results')).not.toBeInTheDocument()
  })

  it('renders result items with type badges', () => {
    render(<SearchBar query="ac" onQueryChange={onQueryChange} results={mockResults} isSearching={true} />)
    const controlBadges = screen.getAllByText('control')
    expect(controlBadges.length).toBe(3)
  })

  it('renders result titles', () => {
    render(<SearchBar query="ac" onQueryChange={onQueryChange} results={mockResults} isSearching={true} />)
    expect(screen.getByText('Policy and Procedures')).toBeInTheDocument()
    expect(screen.getByText('Account Management')).toBeInTheDocument()
  })

  it('renders result IDs', () => {
    render(<SearchBar query="ac" onQueryChange={onQueryChange} results={mockResults} isSearching={true} />)
    expect(screen.getByText('ac-1')).toBeInTheDocument()
    expect(screen.getByText('ac-2')).toBeInTheDocument()
  })

  it('renders context for results', () => {
    render(<SearchBar query="ac" onQueryChange={onQueryChange} results={mockResults} isSearching={true} />)
    const contexts = screen.getAllByText('Access Control')
    expect(contexts.length).toBeGreaterThan(0)
  })

  it('limits displayed results to 50', () => {
    const manyResults: SearchResult[] = Array.from({ length: 60 }, (_, i) => ({
      id: `ctrl-${i}`,
      title: `Control ${i}`,
      type: 'control',
      context: '',
      searchText: '',
    }))
    render(<SearchBar query="ctrl" onQueryChange={onQueryChange} results={manyResults} isSearching={true} />)
    expect(screen.getByText('60 results')).toBeInTheDocument()
    expect(screen.getByText('...and 10 more results')).toBeInTheDocument()
  })

  it('has listbox role on results container', () => {
    const { container } = render(
      <SearchBar query="ac" onQueryChange={onQueryChange} results={mockResults} isSearching={true} />
    )
    expect(container.querySelector('[role="listbox"]')).toBeTruthy()
  })

  it('has option role on result items', () => {
    const { container } = render(
      <SearchBar query="ac" onQueryChange={onQueryChange} results={mockResults} isSearching={true} />
    )
    const options = container.querySelectorAll('[role="option"]')
    expect(options.length).toBe(3)
  })
})
