import { render, screen } from '@testing-library/preact'
import { axe } from 'vitest-axe'
import * as axeMatchers from 'vitest-axe/matchers'
import { ImportPanel } from '@/components/shared/import-panel'
import type { ImportSource } from '@/services/resolver'

expect.extend(axeMatchers)

const loadedSources: ImportSource[] = [
  { href: 'https://example.com/catalog.json', resolvedUrl: 'https://example.com/catalog.json', status: 'loaded', controlCount: 10 },
  { href: './other.json', resolvedUrl: 'https://example.com/other.json', status: 'cached', controlCount: 5 },
]

const errorSource: ImportSource[] = [
  { href: 'https://example.com/missing.json', status: 'error', controlCount: 0, error: 'HTTP 404' },
]

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
