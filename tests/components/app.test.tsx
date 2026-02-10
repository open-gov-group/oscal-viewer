import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { render, act, fireEvent, screen, waitFor } from '@testing-library/preact'
import { App } from '@/app'

// URL-based fetch mock: routes by URL pattern
const fetchResponses = new Map<string, () => Promise<unknown>>()

function setFetchResponse(pattern: string, responseFn: () => Promise<unknown>) {
  fetchResponses.set(pattern, responseFn)
}

const mockFetch = vi.fn((url: string | URL) => {
  const urlStr = url.toString()
  for (const [pattern, responseFn] of fetchResponses) {
    if (urlStr.includes(pattern)) return responseFn()
  }
  return Promise.resolve({ ok: false })
})

beforeEach(() => {
  fetchResponses.clear()
  vi.stubGlobal('fetch', mockFetch)
  mockFetch.mockClear()
  // Default: config.json returns nothing
  setFetchResponse('config.json', () => Promise.resolve({ ok: false }))
  // Reset URL state
  history.replaceState(null, '', window.location.pathname)
})

afterEach(() => {
  vi.restoreAllMocks()
})

// Helpers
const validCatalogJson = JSON.stringify({
  catalog: {
    uuid: 'test-uuid',
    metadata: {
      title: 'Test Catalog',
      'last-modified': '2026-01-01T00:00:00Z',
      version: '1.0',
      'oscal-version': '1.1.2',
    },
    groups: [{ id: 'ac', title: 'Access Control', controls: [{ id: 'ac-1', title: 'Test' }] }],
  }
})

async function submitUrl(container: Element, url: string) {
  const urlInput = container.querySelector('.url-input')!
  const form = container.querySelector('.url-input-form')!
  await act(async () => {
    fireEvent.input(urlInput, { target: { value: url } })
  })
  await act(async () => {
    fireEvent.submit(form)
  })
  // Flush async state updates from handleUrl
  await act(async () => {
    await new Promise(r => setTimeout(r, 0))
  })
}

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

// ============================================================
// App - URL Input & Loading Tests
// ============================================================

describe('App - URL Input', () => {
  it('renders URL input form in dropzone', () => {
    const { container } = render(<App />)
    const urlInput = container.querySelector('.url-input')
    expect(urlInput).toBeTruthy()
    expect(urlInput?.getAttribute('type')).toBe('url')
    expect(urlInput?.getAttribute('aria-label')).toBe('OSCAL document URL')
  })

  it('renders URL submit button disabled when input is empty', () => {
    const { container } = render(<App />)
    const submitBtn = container.querySelector('.url-submit-btn') as HTMLButtonElement
    expect(submitBtn).toBeTruthy()
    expect(submitBtn.disabled).toBe(true)
  })

  it('enables submit button when URL is entered', async () => {
    const { container } = render(<App />)
    const urlInput = container.querySelector('.url-input')!
    await act(async () => {
      fireEvent.input(urlInput, { target: { value: 'https://example.com/catalog.json' } })
    })
    const submitBtn = container.querySelector('.url-submit-btn') as HTMLButtonElement
    expect(submitBtn.disabled).toBe(false)
  })

  it('calls fetch with URL on form submit', async () => {
    setFetchResponse('example.com/catalog', () =>
      Promise.resolve({ ok: true, text: () => Promise.resolve(validCatalogJson) })
    )

    const { container } = render(<App />)
    await submitUrl(container, 'https://example.com/catalog.json')

    expect(mockFetch).toHaveBeenCalledWith('https://example.com/catalog.json')
  })

  it('shows loading indicator while fetching URL', async () => {
    let resolveResponse!: (v: unknown) => void
    setFetchResponse('example.com/slow', () =>
      new Promise(r => { resolveResponse = r })
    )

    const { container } = render(<App />)
    const urlInput = container.querySelector('.url-input')!
    const form = container.querySelector('.url-input-form')!

    await act(async () => {
      fireEvent.input(urlInput, { target: { value: 'https://example.com/slow.json' } })
    })
    await act(async () => {
      fireEvent.submit(form)
    })

    expect(container.querySelector('.loading-indicator')).toBeTruthy()
    expect(container.querySelector('.loading-indicator')?.getAttribute('role')).toBe('status')

    // Resolve to clean up
    await act(async () => {
      resolveResponse({ ok: false, status: 500, statusText: 'Error' })
      await new Promise(r => setTimeout(r, 0))
    })
  })

  it('shows error on HTTP failure', async () => {
    setFetchResponse('example.com/missing', () =>
      Promise.resolve({ ok: false, status: 404, statusText: 'Not Found' })
    )

    const { container } = render(<App />)
    await submitUrl(container, 'https://example.com/missing.json')

    await waitFor(() => {
      const errorMsg = container.querySelector('.error-message')
      expect(errorMsg).toBeTruthy()
      expect(errorMsg?.textContent).toContain('404')
    })
  })

  it('shows CORS error message on TypeError', async () => {
    setFetchResponse('example.com/cors', () =>
      Promise.reject(new TypeError('Failed to fetch'))
    )

    const { container } = render(<App />)
    await submitUrl(container, 'https://example.com/cors.json')

    await waitFor(() => {
      const errorMsg = container.querySelector('.error-message')
      expect(errorMsg).toBeTruthy()
      expect(errorMsg?.textContent).toContain('cross-origin')
    })
  })

  it('shows error on unrecognized format response', async () => {
    setFetchResponse('example.com/bad', () =>
      Promise.resolve({ ok: true, text: () => Promise.resolve('not json') })
    )

    const { container } = render(<App />)
    await submitUrl(container, 'https://example.com/bad.json')

    await waitFor(() => {
      const errorMsg = container.querySelector('.error-message')
      expect(errorMsg).toBeTruthy()
      expect(errorMsg?.textContent).toContain('Unrecognized format')
    })
  })

  it('does not submit when URL input is whitespace only', async () => {
    const { container } = render(<App />)
    const urlInput = container.querySelector('.url-input')!
    const form = container.querySelector('.url-input-form')!

    await act(async () => {
      fireEvent.input(urlInput, { target: { value: '   ' } })
    })
    await act(async () => {
      fireEvent.submit(form)
    })

    // Only config.json fetch should have been called
    const urlCalls = mockFetch.mock.calls.filter(
      (c: unknown[]) => !c[0]?.toString().includes('config.json')
    )
    expect(urlCalls.length).toBe(0)
  })
})

// ============================================================
// App - Preset Buttons Tests
// ============================================================

describe('App - Preset Buttons', () => {
  it('renders preset buttons when config.json has presets', async () => {
    const config = {
      presets: [
        { title: 'NIST 800-53', url: 'https://example.com/800-53.json' },
        { title: 'FedRAMP', url: 'https://example.com/fedramp.json' },
      ]
    }
    setFetchResponse('config.json', () =>
      Promise.resolve({ ok: true, json: () => Promise.resolve(config) })
    )

    let container!: Element
    await act(async () => {
      const result = render(<App />)
      container = result.container
      await new Promise(r => setTimeout(r, 0))
    })

    await waitFor(() => {
      expect(container.querySelector('.preset-section')).toBeTruthy()
    })
    expect(screen.getByText('NIST 800-53')).toBeTruthy()
    expect(screen.getByText('FedRAMP')).toBeTruthy()
  })

  it('does not render presets when config.json is missing', async () => {
    let container!: Element
    await act(async () => {
      const result = render(<App />)
      container = result.container
      await new Promise(r => setTimeout(r, 0))
    })

    expect(container.querySelector('.preset-section')).toBeNull()
  })

  it('filters invalid presets from config', async () => {
    const config = {
      presets: [
        { title: 'Valid', url: 'https://example.com/valid.json' },
        { title: '', url: 'https://example.com/no-title.json' },
        { title: 'No URL', url: '' },
      ]
    }
    setFetchResponse('config.json', () =>
      Promise.resolve({ ok: true, json: () => Promise.resolve(config) })
    )

    let container!: Element
    await act(async () => {
      const result = render(<App />)
      container = result.container
      await new Promise(r => setTimeout(r, 0))
    })

    await waitFor(() => {
      const buttons = container.querySelectorAll('.preset-btn')
      expect(buttons.length).toBe(1)
      expect(buttons[0].textContent).toBe('Valid')
    })
  })

  it('clicking preset button calls fetch with preset URL', async () => {
    const config = {
      presets: [{ title: 'Test Preset', url: 'https://example.com/preset.json' }]
    }
    setFetchResponse('config.json', () =>
      Promise.resolve({ ok: true, json: () => Promise.resolve(config) })
    )
    setFetchResponse('example.com/preset', () =>
      Promise.resolve({ ok: false, status: 500, statusText: 'Error' })
    )

    let container!: Element
    await act(async () => {
      const result = render(<App />)
      container = result.container
      await new Promise(r => setTimeout(r, 0))
    })

    await waitFor(() => {
      expect(container.querySelector('.preset-btn')).toBeTruthy()
    })

    await act(async () => {
      const presetBtn = container.querySelector('.preset-btn')!
      fireEvent.click(presetBtn)
      await new Promise(r => setTimeout(r, 0))
    })

    expect(mockFetch).toHaveBeenCalledWith('https://example.com/preset.json')
  })
})

// ============================================================
// App - Document Loading & Clear Tests
// ============================================================

describe('App - Document Loading & Clear', () => {
  it('shows document viewer after successful URL load', async () => {
    setFetchResponse('example.com/catalog', () =>
      Promise.resolve({ ok: true, text: () => Promise.resolve(validCatalogJson) })
    )

    const { container } = render(<App />)
    await submitUrl(container, 'https://example.com/catalog.json')

    await waitFor(() => {
      expect(container.querySelector('.document-view')).toBeTruthy()
      expect(container.querySelector('.dropzone')).toBeNull()
    })
  })

  it('clear button returns to dropzone', async () => {
    setFetchResponse('example.com/catalog', () =>
      Promise.resolve({ ok: true, text: () => Promise.resolve(validCatalogJson) })
    )

    const { container } = render(<App />)
    await submitUrl(container, 'https://example.com/catalog.json')

    await waitFor(() => {
      expect(container.querySelector('.document-view')).toBeTruthy()
    })

    // Click "Load another file" button
    const clearBtn = container.querySelector('.btn-clear')!
    await act(async () => {
      fireEvent.click(clearBtn)
    })

    expect(container.querySelector('.dropzone')).toBeTruthy()
    expect(container.querySelector('.document-view')).toBeNull()
  })

  it('shows error for non-OSCAL JSON response', async () => {
    setFetchResponse('example.com/random', () =>
      Promise.resolve({ ok: true, text: () => Promise.resolve('{"random": "data"}') })
    )

    const { container } = render(<App />)
    await submitUrl(container, 'https://example.com/random.json')

    await waitFor(() => {
      expect(container.querySelector('.error-message')).toBeTruthy()
    })
  })
})
