import { render, screen } from '@testing-library/preact'
import * as jestDomMatchers from '@testing-library/jest-dom/matchers'
import { axe } from 'vitest-axe'
import * as axeMatchers from 'vitest-axe/matchers'
import { ResourcePanel } from '@/components/shared/resource-panel'
import type { BackMatter } from '@/types/oscal'

expect.extend(jestDomMatchers)
expect.extend(axeMatchers)

// ============================================================
// Test Fixtures
// ============================================================

const fullResource: BackMatter = {
  resources: [{
    uuid: 'res-001',
    title: 'NIST SP 800-53',
    description: 'Security and Privacy Controls',
    'document-ids': [{ identifier: 'SP800-53', scheme: 'https://doi.org' }],
    citation: { text: 'Joint Task Force' },
    rlinks: [
      { href: 'https://example.com/sp800-53.json', 'media-type': 'application/json' },
      { href: 'https://example.com/sp800-53.xml', 'media-type': 'application/xml' },
    ],
    remarks: 'Rev 5 baseline',
  }],
}



const multiResource: BackMatter = {
  resources: [
    { uuid: 'res-a', title: 'Resource A', description: 'First' },
    { uuid: 'res-b', title: 'Resource B', description: 'Second' },
    { uuid: 'res-c', title: 'Resource C', description: 'Third' },
  ],
}

const base64Resource: BackMatter = {
  resources: [{
    uuid: 'res-b64',
    title: 'Embedded Logo',
    base64: { filename: 'logo.png', 'media-type': 'image/png', value: 'iVBOR...' },
  }],
}

// ============================================================
// ResourcePanel Tests
// ============================================================

describe('ResourcePanel', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('renders Resources accordion with correct count', () => {
    render(<ResourcePanel backMatter={fullResource} />)
    expect(screen.getByText('Resources')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('renders resource title', () => {
    render(<ResourcePanel backMatter={fullResource} />)
    expect(screen.getByText('NIST SP 800-53')).toBeInTheDocument()
  })

  it('renders resource description', () => {
    render(<ResourcePanel backMatter={fullResource} />)
    expect(screen.getByText('Security and Privacy Controls')).toBeInTheDocument()
  })

  it('renders rlinks as external links', () => {
    const { container } = render(<ResourcePanel backMatter={fullResource} />)
    // Accordion is defaultOpen=false, so we need to open it first
    const trigger = container.querySelector('#back-matter-resources-trigger')!
    trigger.dispatchEvent(new Event('click', { bubbles: true }))
    const links = container.querySelectorAll('a.resource-rlink')
    expect(links.length).toBe(2)
    expect(links[0].getAttribute('href')).toBe('https://example.com/sp800-53.json')
    expect(links[0].getAttribute('target')).toBe('_blank')
    expect(links[1].getAttribute('href')).toBe('https://example.com/sp800-53.xml')
    expect(links[1].getAttribute('target')).toBe('_blank')
  })

  it('renders media-type badges for rlinks', () => {
    const { container } = render(<ResourcePanel backMatter={fullResource} />)
    const trigger = container.querySelector('#back-matter-resources-trigger')!
    trigger.dispatchEvent(new Event('click', { bubbles: true }))
    expect(screen.getByText('application/json')).toBeInTheDocument()
    expect(screen.getByText('application/xml')).toBeInTheDocument()
  })

  it('renders citation text', () => {
    const { container } = render(<ResourcePanel backMatter={fullResource} />)
    const trigger = container.querySelector('#back-matter-resources-trigger')!
    trigger.dispatchEvent(new Event('click', { bubbles: true }))
    expect(screen.getByText('Joint Task Force')).toBeInTheDocument()
  })

  it('renders document IDs', () => {
    const { container } = render(<ResourcePanel backMatter={fullResource} />)
    const trigger = container.querySelector('#back-matter-resources-trigger')!
    trigger.dispatchEvent(new Event('click', { bubbles: true }))
    expect(screen.getByText('SP800-53')).toBeInTheDocument()
  })

  it('renders base64 indicator without value', () => {
    const { container } = render(<ResourcePanel backMatter={base64Resource} />)
    const trigger = container.querySelector('#back-matter-resources-trigger')!
    trigger.dispatchEvent(new Event('click', { bubbles: true }))
    expect(screen.getByText(/logo\.png/)).toBeInTheDocument()
    expect(container.textContent).not.toContain('iVBOR')
  })

  it('renders remarks', () => {
    const { container } = render(<ResourcePanel backMatter={fullResource} />)
    const trigger = container.querySelector('#back-matter-resources-trigger')!
    trigger.dispatchEvent(new Event('click', { bubbles: true }))
    expect(screen.getByText('Rev 5 baseline')).toBeInTheDocument()
  })

  it('renders multiple resources', () => {
    const { container } = render(<ResourcePanel backMatter={multiResource} />)
    const trigger = container.querySelector('#back-matter-resources-trigger')!
    trigger.dispatchEvent(new Event('click', { bubbles: true }))
    const cards = container.querySelectorAll('.resource-card')
    expect(cards.length).toBe(3)
  })

  it('sets resource card id for fragment navigation', () => {
    const { container } = render(<ResourcePanel backMatter={fullResource} />)
    const trigger = container.querySelector('#back-matter-resources-trigger')!
    trigger.dispatchEvent(new Event('click', { bubbles: true }))
    expect(document.getElementById('resource-res-001')).toBeTruthy()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<ResourcePanel backMatter={fullResource} />)
    const trigger = container.querySelector('#back-matter-resources-trigger')!
    trigger.dispatchEvent(new Event('click', { bubbles: true }))
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
