import { render, screen } from '@testing-library/preact'
import { ProfileView } from '@/components/profile/profile-view'
import type { Profile } from '@/types/oscal'

// ============================================================
// Test Fixtures
// ============================================================

const minimalMetadata = {
  title: 'Test Profile',
  'last-modified': '2026-02-06T00:00:00Z',
  version: '1.0',
  'oscal-version': '1.1.2',
}

const fullProfile: Profile = {
  uuid: 'prof-001',
  metadata: minimalMetadata,
  imports: [
    {
      href: '#catalog-uuid',
      'include-controls': [
        { 'with-ids': ['ac-1', 'ac-2'] },
        { matching: [{ pattern: 'au-*' }] },
      ],
      'exclude-controls': [
        { 'with-ids': ['ac-3'] },
      ],
    },
    {
      href: 'https://example.com/catalog.json',
      'include-all': {},
    },
  ],
  merge: { 'as-is': true },
  modify: {
    'set-parameters': [
      {
        'param-id': 'ac-1_prm_1',
        values: ['monthly'],
        label: 'Frequency',
      },
    ],
    alters: [
      {
        'control-id': 'ac-1',
        adds: [
          {
            position: 'ending',
            parts: [{ name: 'guidance', prose: 'Additional guidance.' }],
          },
        ],
      },
      {
        'control-id': 'ac-2',
        removes: [
          { 'by-name': 'old-guidance' },
        ],
        adds: [
          {
            position: 'starting',
            'by-id': 'ac-2_stmt',
            props: [{ name: 'priority', value: 'high', uuid: 'p1' }],
          },
        ],
      },
    ],
  },
}

const minimalProfile: Profile = {
  uuid: 'prof-002',
  metadata: minimalMetadata,
  imports: [
    { href: '#cat-1' },
  ],
}

// ============================================================
// ProfileView Tests
// ============================================================

describe('ProfileView', () => {
  it('renders metadata panel', () => {
    render(<ProfileView profile={fullProfile} />)
    expect(screen.getByText('Metadata')).toBeInTheDocument()
  })

  it('renders import count', () => {
    const { container } = render(<ProfileView profile={fullProfile} />)
    const stats = container.querySelector('.profile-stats')
    expect(stats?.textContent).toContain('2')
    expect(stats?.textContent).toContain('Imports')
  })

  it('renders singular "Import" for one import', () => {
    const { container } = render(<ProfileView profile={minimalProfile} />)
    const stats = container.querySelector('.profile-stats')
    expect(stats?.textContent).toContain('1')
    expect(stats?.textContent).toMatch(/\bImport\b/)
  })

  it('renders parameter settings count', () => {
    const { container } = render(<ProfileView profile={fullProfile} />)
    const stats = container.querySelector('.profile-stats')
    expect(stats?.textContent).toContain('Parameter Settings')
  })

  it('renders alterations count', () => {
    const { container } = render(<ProfileView profile={fullProfile} />)
    const stats = container.querySelector('.profile-stats')
    expect(stats?.textContent).toContain('Alteration')
  })

  it('does not render parameter stats when none exist', () => {
    render(<ProfileView profile={minimalProfile} />)
    expect(screen.queryByText('Parameter Settings')).not.toBeInTheDocument()
    expect(screen.queryByText('Alterations')).not.toBeInTheDocument()
  })
})

describe('ProfileView - Imports', () => {
  it('renders import hrefs', () => {
    render(<ProfileView profile={fullProfile} />)
    expect(screen.getByText('#catalog-uuid')).toBeInTheDocument()
    expect(screen.getByText('https://example.com/catalog.json')).toBeInTheDocument()
  })

  it('renders import index labels', () => {
    render(<ProfileView profile={fullProfile} />)
    expect(screen.getByText('Import #1')).toBeInTheDocument()
    expect(screen.getByText('Import #2')).toBeInTheDocument()
  })

  it('renders include-controls with-ids', () => {
    render(<ProfileView profile={fullProfile} />)
    // ac-1 appears in both imports and alters, so use getAllByText
    const ac1Elements = screen.getAllByText('ac-1')
    expect(ac1Elements.length).toBeGreaterThan(0)
    // ac-2 appears in imports and alters
    const ac2Elements = screen.getAllByText('ac-2')
    expect(ac2Elements.length).toBeGreaterThan(0)
  })

  it('renders include-controls matching patterns', () => {
    render(<ProfileView profile={fullProfile} />)
    expect(screen.getByText('pattern: au-*')).toBeInTheDocument()
  })

  it('renders exclude-controls', () => {
    render(<ProfileView profile={fullProfile} />)
    expect(screen.getByText('ac-3')).toBeInTheDocument()
  })

  it('renders include-all tag', () => {
    render(<ProfileView profile={fullProfile} />)
    expect(screen.getByText('Include All')).toBeInTheDocument()
  })

  it('has proper section heading for imports', () => {
    render(<ProfileView profile={fullProfile} />)
    const headings = screen.getAllByRole('heading', { name: /Imports/ })
    expect(headings.length).toBeGreaterThanOrEqual(1)
  })
})

describe('ProfileView - Merge', () => {
  it('renders merge strategy as-is', () => {
    render(<ProfileView profile={fullProfile} />)
    expect(screen.getByText('Merge Strategy')).toBeInTheDocument()
    expect(screen.getByText('As-Is (preserve source structure)')).toBeInTheDocument()
  })

  it('renders flat merge strategy', () => {
    const profile: Profile = {
      ...minimalProfile,
      merge: { flat: {} },
    }
    render(<ProfileView profile={profile} />)
    expect(screen.getByText('Flat')).toBeInTheDocument()
  })

  it('does not render merge section when absent', () => {
    render(<ProfileView profile={minimalProfile} />)
    expect(screen.queryByText('Merge Strategy')).not.toBeInTheDocument()
  })
})

describe('ProfileView - Modifications', () => {
  it('renders set-parameters section', () => {
    render(<ProfileView profile={fullProfile} />)
    expect(screen.getByRole('heading', { name: /Parameter Settings/ })).toBeInTheDocument()
    expect(screen.getByText('ac-1_prm_1')).toBeInTheDocument()
  })

  it('renders parameter label', () => {
    render(<ProfileView profile={fullProfile} />)
    expect(screen.getByText('Frequency')).toBeInTheDocument()
  })

  it('renders parameter values', () => {
    render(<ProfileView profile={fullProfile} />)
    expect(screen.getByText('monthly')).toBeInTheDocument()
  })

  it('renders alterations section', () => {
    render(<ProfileView profile={fullProfile} />)
    expect(screen.getByRole('heading', { name: /Alterations/ })).toBeInTheDocument()
  })

  it('renders alter control-ids', () => {
    render(<ProfileView profile={fullProfile} />)
    // The alter card shows the control-id as code
    const codeElements = screen.getAllByText('ac-1')
    expect(codeElements.length).toBeGreaterThan(0)
  })

  it('renders alter additions info', () => {
    render(<ProfileView profile={fullProfile} />)
    const additions = screen.getAllByText(/1 addition/)
    expect(additions.length).toBeGreaterThan(0)
  })

  it('renders alter removals info', () => {
    render(<ProfileView profile={fullProfile} />)
    expect(screen.getByText(/1 removal/)).toBeInTheDocument()
  })

  it('does not render modify sections when absent', () => {
    render(<ProfileView profile={minimalProfile} />)
    expect(screen.queryByText('Parameter Settings')).not.toBeInTheDocument()
    expect(screen.queryByText('Alterations')).not.toBeInTheDocument()
  })
})
