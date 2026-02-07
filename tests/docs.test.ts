import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

// ============================================================
// Documentation Review Tests (QD1-QD5)
// ============================================================

describe('Documentation Review (QD1-QD5)', () => {
  it('QD1: CONTRIBUTING.md has Getting Started section', () => {
    const content = readFileSync(resolve(process.cwd(), 'CONTRIBUTING.md'), 'utf-8')
    expect(content).toContain('## Getting Started')
    expect(content).toContain('npm install')
    expect(content).toContain('npm run dev')
  })

  it('QD1: CONTRIBUTING.md lists prerequisites', () => {
    const content = readFileSync(resolve(process.cwd(), 'CONTRIBUTING.md'), 'utf-8')
    expect(content).toContain('Node.js')
  })

  it('QD2: CONTRIBUTING.md has renderer guide with all steps', () => {
    const content = readFileSync(resolve(process.cwd(), 'CONTRIBUTING.md'), 'utf-8')
    expect(content).toContain('How to Add a New OSCAL Renderer')
    expect(content).toContain('Define types')
    expect(content).toContain('Create a parser')
    expect(content).toContain('Create the view component')
    expect(content).toContain('Register in DocumentViewer')
    expect(content).toContain('Write tests')
    expect(content).toContain('Add styles')
  })

  it('QD3: CHANGELOG.md follows Keep a Changelog format', () => {
    const content = readFileSync(resolve(process.cwd(), 'CHANGELOG.md'), 'utf-8')
    expect(content).toContain('# Changelog')
    expect(content).toContain('Keep a Changelog')
    expect(content).toContain('Semantic Versioning')
  })

  it('QD3: CHANGELOG.md has versioned entries', () => {
    const content = readFileSync(resolve(process.cwd(), 'CHANGELOG.md'), 'utf-8')
    expect(content).toMatch(/## \[\d+\.\d+\.\d+\]/)
    expect(content).toContain('[Unreleased]')
  })

  it('QD3: CHANGELOG.md entries use standard change types', () => {
    const content = readFileSync(resolve(process.cwd(), 'CHANGELOG.md'), 'utf-8')
    expect(content).toMatch(/### (Added|Changed|Fixed|Removed)/)
  })

  it('QD4: README.md links to CONTRIBUTING.md', () => {
    const content = readFileSync(resolve(process.cwd(), 'README.md'), 'utf-8')
    expect(content).toContain('CONTRIBUTING.md')
  })

  it('QD4: README.md referenced local files exist', () => {
    const readme = readFileSync(resolve(process.cwd(), 'README.md'), 'utf-8')
    // Extract markdown links to local files (not URLs)
    const localLinks = readme.match(/\]\(([^)]+)\)/g)
      ?.map(m => m.slice(2, -1))
      .filter(l => !l.startsWith('http') && !l.startsWith('#') && !l.startsWith('mailto'))
    if (localLinks) {
      for (const link of localLinks) {
        expect(existsSync(resolve(process.cwd(), link))).toBe(true)
      }
    }
  })

  it('QD5: accessibility guidelines document exists', () => {
    expect(existsSync(resolve(process.cwd(), 'docs/guidelines/ACCESSIBILITY.md'))).toBe(true)
  })
})

// ============================================================
// BITV 2.0 Accessibility Statement Tests (QD6-QD9)
// ============================================================

describe('BITV 2.0 Accessibility Statement (QD6-QD9)', () => {
  let a11yDoc: string

  beforeAll(() => {
    a11yDoc = readFileSync(resolve(process.cwd(), 'docs/guidelines/ACCESSIBILITY.md'), 'utf-8')
  })

  it('QD6: accessibility document describes WCAG conformance level', () => {
    expect(a11yDoc).toMatch(/WCAG/)
  })

  it('QD6: accessibility document describes accessibility principles', () => {
    expect(a11yDoc).toMatch(/Barrierefreiheit|[Aa]ccessib/)
  })

  it('QD7: accessibility document describes testing methodology', () => {
    expect(a11yDoc).toMatch(/axe-core|Testing|Checkliste|automatisiert/)
  })

  it('QD8: accessibility document describes contrast requirements', () => {
    expect(a11yDoc).toMatch(/[Kk]ontrast|4\.5:1|3:1/)
  })

  it('QD9: CONTRIBUTING.md references accessibility/BITV requirements', () => {
    const contributing = readFileSync(resolve(process.cwd(), 'CONTRIBUTING.md'), 'utf-8')
    expect(contributing).toMatch(/BITV|WCAG|[Aa]ccessibility/)
  })
})
