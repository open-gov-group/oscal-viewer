import { render, screen, fireEvent } from '@testing-library/preact'
import { FilterBar } from '@/components/shared/filter-bar'
import type { FilterChip } from '@/hooks/use-filter'

const noop = () => {}

describe('FilterBar', () => {
  it('renders the filter input', () => {
    render(
      <FilterBar
        keyword=""
        onKeywordChange={noop}
        chips={[]}
        onAddChip={noop}
        onRemoveChip={noop}
        onClearAll={noop}
        hasActiveFilters={false}
      />
    )
    expect(screen.getByPlaceholderText('Filter...')).toBeInTheDocument()
  })

  it('renders custom placeholder', () => {
    render(
      <FilterBar
        keyword=""
        onKeywordChange={noop}
        chips={[]}
        onAddChip={noop}
        onRemoveChip={noop}
        onClearAll={noop}
        hasActiveFilters={false}
        placeholder="Filter controls..."
      />
    )
    expect(screen.getByPlaceholderText('Filter controls...')).toBeInTheDocument()
  })

  it('calls onKeywordChange on input', () => {
    const onChange = vi.fn()
    render(
      <FilterBar
        keyword=""
        onKeywordChange={onChange}
        chips={[]}
        onAddChip={noop}
        onRemoveChip={noop}
        onClearAll={noop}
        hasActiveFilters={false}
      />
    )
    fireEvent.input(screen.getByPlaceholderText('Filter...'), { target: { value: 'test' } })
    expect(onChange).toHaveBeenCalledWith('test')
  })

  it('shows chips when hasActiveFilters is true', () => {
    const chips: FilterChip[] = [{ key: 'family', value: 'ac', label: 'Family: AC' }]
    render(
      <FilterBar
        keyword=""
        onKeywordChange={noop}
        chips={chips}
        onAddChip={noop}
        onRemoveChip={noop}
        onClearAll={noop}
        hasActiveFilters={true}
      />
    )
    expect(screen.getByText('Family: AC')).toBeInTheDocument()
    expect(screen.getByText('Clear all')).toBeInTheDocument()
  })

  it('shows keyword chip when keyword is active', () => {
    render(
      <FilterBar
        keyword="test"
        onKeywordChange={noop}
        chips={[]}
        onAddChip={noop}
        onRemoveChip={noop}
        onClearAll={noop}
        hasActiveFilters={true}
      />
    )
    expect(screen.getByText(/Keyword: test/)).toBeInTheDocument()
  })

  it('does not show chips area when no active filters', () => {
    render(
      <FilterBar
        keyword=""
        onKeywordChange={noop}
        chips={[]}
        onAddChip={noop}
        onRemoveChip={noop}
        onClearAll={noop}
        hasActiveFilters={false}
      />
    )
    expect(screen.queryByText('Clear all')).not.toBeInTheDocument()
  })

  it('calls onRemoveChip when chip remove button clicked', () => {
    const onRemove = vi.fn()
    const chips: FilterChip[] = [{ key: 'family', value: 'ac', label: 'Family: AC' }]
    render(
      <FilterBar
        keyword=""
        onKeywordChange={noop}
        chips={chips}
        onAddChip={noop}
        onRemoveChip={onRemove}
        onClearAll={noop}
        hasActiveFilters={true}
      />
    )
    fireEvent.click(screen.getByLabelText('Remove filter Family: AC'))
    expect(onRemove).toHaveBeenCalledWith('family', 'ac')
  })

  it('calls onClearAll when Clear all clicked', () => {
    const onClear = vi.fn()
    render(
      <FilterBar
        keyword="x"
        onKeywordChange={noop}
        chips={[]}
        onAddChip={noop}
        onRemoveChip={noop}
        onClearAll={onClear}
        hasActiveFilters={true}
      />
    )
    fireEvent.click(screen.getByText('Clear all'))
    expect(onClear).toHaveBeenCalled()
  })

  it('renders category select when categories provided', () => {
    render(
      <FilterBar
        keyword=""
        onKeywordChange={noop}
        chips={[]}
        onAddChip={noop}
        onRemoveChip={noop}
        onClearAll={noop}
        hasActiveFilters={false}
        categories={[{
          key: 'family',
          label: 'Family',
          options: [{ value: 'ac', label: 'AC – Access Control' }],
        }]}
      />
    )
    expect(screen.getByLabelText('Family')).toBeInTheDocument()
  })

  it('calls onAddChip when category option selected', () => {
    const onAdd = vi.fn()
    render(
      <FilterBar
        keyword=""
        onKeywordChange={noop}
        chips={[]}
        onAddChip={onAdd}
        onRemoveChip={noop}
        onClearAll={noop}
        hasActiveFilters={false}
        categories={[{
          key: 'family',
          label: 'Family',
          options: [{ value: 'ac', label: 'AC – Access Control' }],
        }]}
      />
    )
    fireEvent.change(screen.getByLabelText('Family'), { target: { value: 'ac' } })
    expect(onAdd).toHaveBeenCalledWith({ key: 'family', value: 'ac', label: 'Family: AC – Access Control' })
  })

  it('has aria-label on the filter input', () => {
    render(
      <FilterBar
        keyword=""
        onKeywordChange={noop}
        chips={[]}
        onAddChip={noop}
        onRemoveChip={noop}
        onClearAll={noop}
        hasActiveFilters={false}
      />
    )
    expect(screen.getByLabelText('Filter items')).toBeInTheDocument()
  })
})
