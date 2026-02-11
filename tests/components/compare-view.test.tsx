/**
 * Tests for the CompareView and related diff UI components.
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/preact'
import * as matchers from '@testing-library/jest-dom/matchers'
import { CompareView } from '@/components/compare/compare-view'
import { CompareDropzone } from '@/components/compare/compare-dropzone'
import { DiffBadge } from '@/components/compare/diff-badge'
import { MetadataDiffView } from '@/components/compare/metadata-diff'
import { DiffEntryCard } from '@/components/compare/diff-entry-card'
import type { OscalDocument } from '@/types/oscal'
import type { DocumentDiffResult, MetadataDiff } from '@/types/diff'

expect.extend(matchers)

// ============================================================
// Test Helpers
// ============================================================

function makeDoc(title: string, version: string): OscalDocument {
  return {
    type: 'catalog',
    version: '1.0.4',
    data: {
      type: 'catalog',
      document: {
        uuid: 'test-uuid',
        metadata: {
          title,
          version,
          'oscal-version': '1.0.4',
          'last-modified': '2024-01-01T00:00:00Z',
        },
      },
    },
  }
}

function makeMetadataDiff(changed = false): MetadataDiff {
  return {
    titleChanged: changed,
    versionChanged: changed,
    oscalVersionChanged: false,
    lastModifiedChanged: false,
    left: { title: 'Doc A', version: '1.0', oscalVersion: '1.0.4', lastModified: '2024-01-01' },
    right: { title: changed ? 'Doc B' : 'Doc A', version: changed ? '2.0' : '1.0', oscalVersion: '1.0.4', lastModified: '2024-01-01' },
  }
}

function makeDiffResult(overrides: Partial<DocumentDiffResult> = {}): DocumentDiffResult {
  return {
    type: 'catalog',
    metadata: makeMetadataDiff(),
    summary: { added: 1, removed: 1, modified: 2, unchanged: 5, total: 9 },
    sections: [{
      title: 'Controls',
      summary: { added: 1, removed: 1, modified: 2, unchanged: 5, total: 9 },
      entries: [
        { status: 'added', key: 'ac-3', label: 'ac-3 — Access Enforcement', right: {} },
        { status: 'removed', key: 'ac-4', label: 'ac-4 — Access Review', left: {} },
        { status: 'modified', key: 'ac-1', label: 'ac-1 — Access Control', left: {}, right: {}, changes: ['Title changed'] },
        { status: 'unchanged', key: 'ac-2', label: 'ac-2 — Account Management', left: {}, right: {} },
      ],
    }],
    ...overrides,
  }
}

// ============================================================
// DiffBadge
// ============================================================

describe('DiffBadge', () => {
  it('renders added badge with correct text', () => {
    render(<DiffBadge status="added" />)
    expect(screen.getByText('Added')).toBeInTheDocument()
  })

  it('renders removed badge with correct text', () => {
    render(<DiffBadge status="removed" />)
    expect(screen.getByText('Removed')).toBeInTheDocument()
  })

  it('renders modified badge with correct text', () => {
    render(<DiffBadge status="modified" />)
    expect(screen.getByText('Modified')).toBeInTheDocument()
  })

  it('renders unchanged badge with correct text', () => {
    render(<DiffBadge status="unchanged" />)
    expect(screen.getByText('Unchanged')).toBeInTheDocument()
  })

  it('has accessible aria-label', () => {
    render(<DiffBadge status="modified" />)
    expect(screen.getByText('Modified')).toHaveAttribute('aria-label', 'Status: modified')
  })

  it('applies correct CSS class', () => {
    render(<DiffBadge status="added" />)
    expect(screen.getByText('Added')).toHaveClass('diff-badge--added')
  })
})

// ============================================================
// MetadataDiffView
// ============================================================

describe('MetadataDiffView', () => {
  it('shows "identical" message when no changes', () => {
    render(<MetadataDiffView diff={makeMetadataDiff(false)} />)
    expect(screen.getByText('Metadata is identical in both documents.')).toBeInTheDocument()
  })

  it('shows table when changes exist', () => {
    render(<MetadataDiffView diff={makeMetadataDiff(true)} />)
    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(screen.getByText('Doc A')).toBeInTheDocument()
    expect(screen.getByText('Doc B')).toBeInTheDocument()
  })

  it('displays field labels', () => {
    render(<MetadataDiffView diff={makeMetadataDiff(true)} />)
    expect(screen.getByText('Title')).toBeInTheDocument()
    expect(screen.getByText('Version')).toBeInTheDocument()
  })
})

// ============================================================
// DiffEntryCard
// ============================================================

describe('DiffEntryCard', () => {
  it('renders entry label and badge', () => {
    render(<DiffEntryCard entry={{ status: 'added', key: 'ac-1', label: 'ac-1 — Access Control' }} />)
    expect(screen.getByText('ac-1 — Access Control')).toBeInTheDocument()
    expect(screen.getByText('Added')).toBeInTheDocument()
  })

  it('shows changes list for modified entries', () => {
    render(<DiffEntryCard entry={{
      status: 'modified', key: 'ac-1', label: 'ac-1',
      changes: ['Title changed', 'Prose content changed'],
    }} />)
    expect(screen.getByText('Title changed')).toBeInTheDocument()
    expect(screen.getByText('Prose content changed')).toBeInTheDocument()
  })

  it('toggle expands/collapses on click', () => {
    render(<DiffEntryCard entry={{ status: 'added', key: 'ac-1', label: 'ac-1' }} />)
    const button = screen.getByRole('button')
    // Initially collapsed for added
    expect(button).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'true')
  })

  it('has accessible aria-label on button', () => {
    render(<DiffEntryCard entry={{ status: 'removed', key: 'ac-1', label: 'ac-1 — Test' }} />)
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'ac-1 — Test, removed')
  })
})

// ============================================================
// CompareView
// ============================================================

describe('CompareView', () => {
  const docA = makeDoc('Catalog v1', '1.0')
  const docB = makeDoc('Catalog v2', '2.0')

  it('renders document titles', () => {
    render(<CompareView docA={docA} docB={docB} diffResult={makeDiffResult()} onExit={() => {}} />)
    expect(screen.getByText(/Catalog v1/)).toBeInTheDocument()
    expect(screen.getByText(/Catalog v2/)).toBeInTheDocument()
  })

  it('renders summary bar with counts', () => {
    render(<CompareView docA={docA} docB={docB} diffResult={makeDiffResult()} onExit={() => {}} />)
    expect(screen.getByText('+1 added')).toBeInTheDocument()
    expect(screen.getByText(/1 removed/)).toBeInTheDocument()
    expect(screen.getByText(/2 modified/)).toBeInTheDocument()
    expect(screen.getByText('5 unchanged')).toBeInTheDocument()
  })

  it('renders diff sections', () => {
    render(<CompareView docA={docA} docB={docB} diffResult={makeDiffResult()} onExit={() => {}} />)
    expect(screen.getByText(/Controls/)).toBeInTheDocument()
  })

  it('calls onExit when exit button is clicked', () => {
    const onExit = vi.fn()
    render(<CompareView docA={docA} docB={docB} diffResult={makeDiffResult()} onExit={onExit} />)
    fireEvent.click(screen.getByText('Exit comparison'))
    expect(onExit).toHaveBeenCalledOnce()
  })

  it('shows no-diff message for identical documents', () => {
    const emptyResult = makeDiffResult({
      summary: { added: 0, removed: 0, modified: 0, unchanged: 0, total: 0 },
      sections: [],
    })
    render(<CompareView docA={docA} docB={docB} diffResult={emptyResult} onExit={() => {}} />)
    expect(screen.getByText('The two documents have identical content structure.')).toBeInTheDocument()
  })

  it('summary bar has role="status"', () => {
    render(<CompareView docA={docA} docB={docB} diffResult={makeDiffResult()} onExit={() => {}} />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })
})

// ============================================================
// CompareDropzone
// ============================================================

describe('CompareDropzone', () => {
  it('renders file input and URL form', () => {
    render(<CompareDropzone onFile={() => {}} onUrl={() => {}} loading={false} error={null} />)
    expect(screen.getByText('Browse files')).toBeInTheDocument()
    expect(screen.getByLabelText('Comparison document URL')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    render(<CompareDropzone onFile={() => {}} onUrl={() => {}} loading={true} error={null} />)
    expect(screen.getByText('Loading comparison document...')).toBeInTheDocument()
  })

  it('shows error message', () => {
    render(<CompareDropzone onFile={() => {}} onUrl={() => {}} loading={false} error="Type mismatch" />)
    expect(screen.getByText('Type mismatch')).toBeInTheDocument()
  })

  it('calls onUrl when form is submitted', () => {
    const onUrl = vi.fn()
    render(<CompareDropzone onFile={() => {}} onUrl={onUrl} loading={false} error={null} />)
    const input = screen.getByLabelText('Comparison document URL')
    fireEvent.input(input, { target: { value: 'https://example.com/doc.json' } })
    fireEvent.submit(input.closest('form')!)
    expect(onUrl).toHaveBeenCalledWith('https://example.com/doc.json')
  })

  it('disables submit button when URL is empty', () => {
    render(<CompareDropzone onFile={() => {}} onUrl={() => {}} loading={false} error={null} />)
    const submitBtn = screen.getByRole('button', { name: 'Load' })
    expect(submitBtn).toBeDisabled()
  })
})
