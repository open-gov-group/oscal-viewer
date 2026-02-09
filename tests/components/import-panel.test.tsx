import { render, screen, fireEvent } from '@testing-library/preact'
import * as jestDomMatchers from '@testing-library/jest-dom/matchers'
import { axe } from 'vitest-axe'
import * as axeMatchers from 'vitest-axe/matchers'
import { ImportPanel } from '@/components/shared/import-panel'
import type { ImportSource } from '@/services/resolver'

expect.extend(jestDomMatchers)
expect.extend(axeMatchers)

// ============================================================
// Test Fixtures
// ============================================================

const loadedSources: ImportSource[] = [
  { href: 'https://example.com/catalog.json', resolvedUrl: 'https://example.com/catalog.json', status: 'loaded', controlCount: 10 },
  { href: './other.json', resolvedUrl: 'https://example.com/other.json', status: 'cached', controlCount: 5 },
]

const errorSource: ImportSource[] = [
  { href: 'https://example.com/missing.json', status: 'error', controlCount: 0, error: 'HTTP 404' },
]

/** Loaded source with resolvedUrl — eligible for navigation. */
const navigableSource: ImportSource = {
  href: 'catalog.json',
  resolvedUrl: 'https://example.com/catalog.json',
  status: 'loaded',
  controlCount: 5,
}

/** Error source — not eligible for navigation. */
const failedSource: ImportSource = {
  href: 'missing.json',
  status: 'error',
  controlCount: 0,
  error: 'Network error',
}

/** Cached source with resolvedUrl — eligible for navigation. */
const cachedSource: ImportSource = {
  href: 'other-catalog.json',
  resolvedUrl: 'https://example.com/other-catalog.json',
  status: 'cached',
  controlCount: 3,
}

/** Loaded source without resolvedUrl — not eligible for navigation. */
const loadedNoUrl: ImportSource = {
  href: 'local-ref.json',
  status: 'loaded',
  controlCount: 2,
}

// ============================================================
// Existing ImportPanel Tests
// ============================================================

describe('ImportPanel', () => {
  it('renders resolved import sources', () => {
    render(<ImportPanel sources={loadedSources} loading={false} />)
    expect(screen.getByText('Resolved Imports')).toBeInTheDocument()
    expect(screen.getByText('2/2 sources, 15 controls')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    render(<ImportPanel sources={[]} loading={true} />)
    expect(screen.getByText('Resolving imports...')).toBeInTheDocument()
  })

  it('shows error message', () => {
    render(<ImportPanel sources={errorSource} loading={false} error="Failed to resolve" />)
    expect(screen.getByText('Failed to resolve')).toBeInTheDocument()
  })

  it('shows source href', () => {
    render(<ImportPanel sources={loadedSources} loading={false} />)
    expect(screen.getByText('https://example.com/catalog.json')).toBeInTheDocument()
  })

  it('shows control count per source', () => {
    render(<ImportPanel sources={loadedSources} loading={false} />)
    expect(screen.getByText('10 controls')).toBeInTheDocument()
    expect(screen.getByText('5 controls')).toBeInTheDocument()
  })

  it('shows error for failed source', () => {
    render(<ImportPanel sources={errorSource} loading={false} />)
    expect(screen.getByText('HTTP 404')).toBeInTheDocument()
  })

  it('shows merge strategy', () => {
    render(<ImportPanel sources={loadedSources} loading={false} merge={{ combine: { method: 'use-first' } }} />)
    expect(screen.getByText('use-first')).toBeInTheDocument()
  })

  it('has no a11y violations when loaded', async () => {
    const { container } = render(<ImportPanel sources={loadedSources} loading={false} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('has no a11y violations when loading', async () => {
    const { container } = render(<ImportPanel sources={[]} loading={true} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})

// ============================================================
// Phase 5c — Cross-Document Navigation Tests
// ============================================================

describe('ImportPanel — Cross-Document Navigation', () => {
  it('renders sources without navigate buttons when onSourceClick is not provided', () => {
    const { container } = render(
      <ImportPanel sources={[navigableSource]} loading={false} />
    )
    const navButtons = container.querySelectorAll('.import-source-navigate')
    expect(navButtons.length).toBe(0)
  })

  it('renders navigate button for loaded source when onSourceClick provided', () => {
    const { container } = render(
      <ImportPanel
        sources={[navigableSource]}
        loading={false}
        onSourceClick={vi.fn()}
      />
    )
    const navButtons = container.querySelectorAll('.import-source-navigate')
    expect(navButtons.length).toBe(1)
  })

  it('does not render navigate button for error source', () => {
    const { container } = render(
      <ImportPanel
        sources={[failedSource]}
        loading={false}
        onSourceClick={vi.fn()}
      />
    )
    const navButtons = container.querySelectorAll('.import-source-navigate')
    expect(navButtons.length).toBe(0)
  })

  it('calls onSourceClick with resolvedUrl when navigate button clicked', () => {
    const handleClick = vi.fn()
    const { container } = render(
      <ImportPanel
        sources={[navigableSource]}
        loading={false}
        onSourceClick={handleClick}
      />
    )
    const button = container.querySelector('.import-source-navigate') as HTMLButtonElement
    expect(button).not.toBeNull()
    fireEvent.click(button)
    expect(handleClick).toHaveBeenCalledTimes(1)
    expect(handleClick).toHaveBeenCalledWith('https://example.com/catalog.json')
  })

  it('does not render navigate button when source has no resolvedUrl', () => {
    const { container } = render(
      <ImportPanel
        sources={[loadedNoUrl]}
        loading={false}
        onSourceClick={vi.fn()}
      />
    )
    const navButtons = container.querySelectorAll('.import-source-navigate')
    expect(navButtons.length).toBe(0)
  })

  it('renders multiple sources with navigate buttons for successful ones only', () => {
    const mixedSources: ImportSource[] = [navigableSource, failedSource, cachedSource]
    const { container } = render(
      <ImportPanel
        sources={mixedSources}
        loading={false}
        onSourceClick={vi.fn()}
      />
    )
    const navButtons = container.querySelectorAll('.import-source-navigate')
    expect(navButtons.length).toBe(2)
  })

  it('navigate button has accessible label', () => {
    const { container } = render(
      <ImportPanel
        sources={[navigableSource]}
        loading={false}
        onSourceClick={vi.fn()}
      />
    )
    const button = container.querySelector('.import-source-navigate') as HTMLButtonElement
    expect(button).not.toBeNull()
    expect(button.getAttribute('aria-label')).toBeTruthy()
    expect(button.getAttribute('aria-label')).toContain(navigableSource.href)
  })

  it('still renders loading state correctly with onSourceClick', () => {
    const { container } = render(
      <ImportPanel
        sources={[]}
        loading={true}
        onSourceClick={vi.fn()}
      />
    )
    expect(screen.getByText('Resolving imports...')).toBeInTheDocument()
    const navButtons = container.querySelectorAll('.import-source-navigate')
    expect(navButtons.length).toBe(0)
  })

  it('still renders error state correctly with onSourceClick', () => {
    render(
      <ImportPanel
        sources={errorSource}
        loading={false}
        error="Resolution failed"
        onSourceClick={vi.fn()}
      />
    )
    expect(screen.getByText('Resolution failed')).toBeInTheDocument()
  })

  it('has no accessibility violations with navigate buttons', async () => {
    const mixedSources: ImportSource[] = [navigableSource, failedSource, cachedSource]
    const { container } = render(
      <ImportPanel
        sources={mixedSources}
        loading={false}
        onSourceClick={vi.fn()}
      />
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
