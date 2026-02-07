import { render } from '@testing-library/preact'
import { App } from '@/app'

// ============================================================
// App - Skip Link Tests
// ============================================================

describe('App - Skip Link', () => {
  it('renders skip-link as first anchor element', () => {
    const { container } = render(<App />)
    const skipLink = container.querySelector('.skip-link')
    expect(skipLink).toBeTruthy()
    expect(skipLink?.textContent).toBe('Skip to main content')
    expect(skipLink?.getAttribute('href')).toBe('#main-content')
  })

  it('skip-link target main-content exists', () => {
    const { container } = render(<App />)
    expect(container.querySelector('#main-content')).toBeTruthy()
  })

  it('main element has correct role', () => {
    const { container } = render(<App />)
    const main = container.querySelector('#main-content')
    expect(main?.tagName.toLowerCase()).toBe('main')
  })

  it('header has banner role', () => {
    const { container } = render(<App />)
    const header = container.querySelector('[role="banner"]')
    expect(header).toBeTruthy()
  })
})
