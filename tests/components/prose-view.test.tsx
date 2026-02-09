import { render, screen } from '@testing-library/preact'
import * as jestDomMatchers from '@testing-library/jest-dom/matchers'
import { axe } from 'vitest-axe'
import * as axeMatchers from 'vitest-axe/matchers'
import { ProseView } from '@/components/shared/prose-view'

expect.extend(jestDomMatchers)
expect.extend(axeMatchers)

// ============================================================
// ProseView Tests
// ============================================================

describe('ProseView', () => {
  it('renders raw prose when no paramMap', () => {
    render(<ProseView prose="Some plain text without parameters" />)
    expect(screen.getByText('Some plain text without parameters')).toBeInTheDocument()
  })

  it('renders raw prose when paramMap is empty', () => {
    const paramMap = new Map<string, string>()
    render(
      <ProseView prose="Text with {{ insert: param, missing-param }} here" paramMap={paramMap} />,
    )
    // Without a matching param, the raw placeholder is shown as text
    expect(screen.getByText(/Text with/)).toBeInTheDocument()
  })

  it('renders substituted parameter with amber highlight', () => {
    const paramMap = new Map([['test-param', 'substituted value']])
    const { container } = render(
      <ProseView prose="Before {{ insert: param, test-param }} after" paramMap={paramMap} />,
    )
    // Check the substituted span has the correct class
    const paramSpan = container.querySelector('.param-substitution')
    expect(paramSpan).toBeTruthy()
    expect(paramSpan?.textContent).toBe('substituted value')
    // Check title attribute for parameter identification
    expect(paramSpan?.getAttribute('title')).toBe('Parameter: test-param')
  })

  it('handles missing parameter gracefully (shows raw placeholder)', () => {
    const paramMap = new Map([['other-param', 'other value']])
    render(
      <ProseView prose="Value is {{ insert: param, nonexistent }} here" paramMap={paramMap} />,
    )
    // The raw placeholder should be rendered as plain text
    expect(screen.getByText(/Value is/)).toBeInTheDocument()
    expect(screen.queryByTitle('Parameter: nonexistent')).not.toBeInTheDocument()
  })

  it('renders multiple substitutions', () => {
    const paramMap = new Map([
      ['param-a', 'Alpha'],
      ['param-b', 'Beta'],
    ])
    const { container } = render(
      <ProseView
        prose="Start {{ insert: param, param-a }} middle {{ insert: param, param-b }} end"
        paramMap={paramMap}
      />,
    )
    const paramSpans = container.querySelectorAll('.param-substitution')
    expect(paramSpans).toHaveLength(2)
    expect(paramSpans[0].textContent).toBe('Alpha')
    expect(paramSpans[0].getAttribute('title')).toBe('Parameter: param-a')
    expect(paramSpans[1].textContent).toBe('Beta')
    expect(paramSpans[1].getAttribute('title')).toBe('Parameter: param-b')
  })

  it('has no accessibility violations', async () => {
    const paramMap = new Map([['test-param', 'test value']])
    const { container } = render(
      <ProseView prose="Text with {{ insert: param, test-param }} here" paramMap={paramMap} />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
