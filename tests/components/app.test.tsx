import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { render, act } from '@testing-library/preact'
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

// ============================================================
// App - Language Attribute Tests (QS13)
// ============================================================

describe('App - Language Attribute (QS13)', () => {
  it('QS13: index.html has lang="en" attribute on html element', () => {
    const indexHtml = readFileSync(resolve(process.cwd(), 'index.html'), 'utf-8')
    expect(indexHtml).toMatch(/<html[^>]*\slang="en"/)
  })
})

// ============================================================
// App - Offline Banner Tests (QP15-QP17)
// ============================================================

describe('App - Offline Banner (QP15-QP17)', () => {
  const originalOnLine = navigator.onLine

  afterEach(() => {
    Object.defineProperty(navigator, 'onLine', { value: originalOnLine, configurable: true })
  })

  it('QP15: offline banner appears when navigator.onLine is false', () => {
    Object.defineProperty(navigator, 'onLine', { value: false, configurable: true })
    const { container } = render(<App />)
    const banner = container.querySelector('.offline-banner')
    expect(banner).toBeTruthy()
    expect(banner?.textContent).toContain('offline')
  })

  it('QP16: offline banner is not shown when online', () => {
    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true })
    const { container } = render(<App />)
    expect(container.querySelector('.offline-banner')).toBeNull()
  })

  it('QP15: offline banner appears on window offline event', async () => {
    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true })
    const { container } = render(<App />)
    expect(container.querySelector('.offline-banner')).toBeNull()

    await act(() => {
      window.dispatchEvent(new Event('offline'))
    })

    expect(container.querySelector('.offline-banner')).toBeTruthy()
  })

  it('QP16: offline banner disappears on window online event', async () => {
    Object.defineProperty(navigator, 'onLine', { value: false, configurable: true })
    const { container } = render(<App />)
    expect(container.querySelector('.offline-banner')).toBeTruthy()

    await act(() => {
      window.dispatchEvent(new Event('online'))
    })

    expect(container.querySelector('.offline-banner')).toBeNull()
  })

  it('QP17: offline banner has role="status" for screen readers', () => {
    Object.defineProperty(navigator, 'onLine', { value: false, configurable: true })
    const { container } = render(<App />)
    const banner = container.querySelector('.offline-banner')
    expect(banner?.getAttribute('role')).toBe('status')
  })
})
