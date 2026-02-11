import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  parseOscalDocument,
  parseCatalog,
  countControls,
  parseProfile,
  parseComponentDefinition,
  parseSSP,
  detectDocumentType,
  detectVersion,
} from '@/lib/index'

// ============================================================
// Package Build Config Tests (QN1-QN3)
// ============================================================

describe('Package Build Config (QN1-QN3)', () => {
  it('QN1: build:lib command is documented in CONTRIBUTING.md', () => {
    const contributing = readFileSync(resolve(process.cwd(), 'CONTRIBUTING.md'), 'utf-8')
    expect(contributing).toContain('build:lib')
  })

  it('QN2: tsconfig.lib.json exists with declaration=true', () => {
    const tsconfigPath = resolve(process.cwd(), 'tsconfig.lib.json')
    expect(existsSync(tsconfigPath)).toBe(true)
    const tsconfig = JSON.parse(readFileSync(tsconfigPath, 'utf-8'))
    expect(tsconfig.compilerOptions.declaration).toBe(true)
  })

  it('QN2: tsconfig.lib.json generates declaration maps', () => {
    const tsconfig = JSON.parse(readFileSync(resolve(process.cwd(), 'tsconfig.lib.json'), 'utf-8'))
    expect(tsconfig.compilerOptions.declarationMap).toBe(true)
  })

  it('QN3: package entry point src/lib/index.ts exists', () => {
    expect(existsSync(resolve(process.cwd(), 'src/lib/index.ts'))).toBe(true)
  })

  it('QN3: tsconfig.lib.json output dir is dist/lib', () => {
    const tsconfig = JSON.parse(readFileSync(resolve(process.cwd(), 'tsconfig.lib.json'), 'utf-8'))
    expect(tsconfig.compilerOptions.outDir).toBe('./dist/lib')
  })
})

// ============================================================
// Package Export Tests (QN4-QN5)
// ============================================================

describe('Package Exports (QN4-QN5)', () => {
  it('QN4: exports all core OSCAL types', () => {
    const content = readFileSync(resolve(process.cwd(), 'src/lib/index.ts'), 'utf-8')
    expect(content).toContain('Catalog')
    expect(content).toContain('Profile')
    expect(content).toContain('ComponentDefinition')
    expect(content).toContain('SystemSecurityPlan')
    expect(content).toContain('ParseResult')
    expect(content).toContain('OscalDocument')
  })

  it('QN4: exports metadata and supporting types', () => {
    const content = readFileSync(resolve(process.cwd(), 'src/lib/index.ts'), 'utf-8')
    expect(content).toContain('Metadata')
    expect(content).toContain('Control')
    expect(content).toContain('Group')
    expect(content).toContain('Parameter')
    expect(content).toContain('Part')
    expect(content).toContain('Property')
    expect(content).toContain('Link')
  })

  it('QN5: parseOscalDocument is a callable function', () => {
    expect(typeof parseOscalDocument).toBe('function')
  })

  it('QN5: parseCatalog is a callable function', () => {
    expect(typeof parseCatalog).toBe('function')
  })

  it('QN5: countControls is a callable function', () => {
    expect(typeof countControls).toBe('function')
  })

  it('QN5: parseProfile is a callable function', () => {
    expect(typeof parseProfile).toBe('function')
  })

  it('QN5: parseComponentDefinition is a callable function', () => {
    expect(typeof parseComponentDefinition).toBe('function')
  })

  it('QN5: parseSSP is a callable function', () => {
    expect(typeof parseSSP).toBe('function')
  })

  it('QN5: detectDocumentType is a callable function', () => {
    expect(typeof detectDocumentType).toBe('function')
  })

  it('QN5: detectVersion is a callable function', () => {
    expect(typeof detectVersion).toBe('function')
  })
})

// ============================================================
// Package Layer Independence Tests (QN6)
// ============================================================

describe('Package Layer Independence (QN6)', () => {
  it('QN6: lib entry point has no Preact imports', () => {
    const content = readFileSync(resolve(process.cwd(), 'src/lib/index.ts'), 'utf-8')
    expect(content).not.toMatch(/from\s+['"]preact/)
    expect(content).not.toMatch(/import\s.*['"]preact/)
  })

  it('QN6: lib entry point only imports from domain layer (types/, parser/, services/)', () => {
    const content = readFileSync(resolve(process.cwd(), 'src/lib/index.ts'), 'utf-8')
    const importLines = content.split('\n').filter(l => l.includes("from '@/"))
    for (const line of importLines) {
      expect(line).toMatch(/from '@\/(types|parser|services)/)
    }
  })

  it('QN6: tsconfig.lib.json only includes domain layer files', () => {
    const tsconfig = JSON.parse(readFileSync(resolve(process.cwd(), 'tsconfig.lib.json'), 'utf-8'))
    const includes = tsconfig.include as string[]
    for (const pattern of includes) {
      expect(pattern).not.toContain('components')
      expect(pattern).not.toContain('hooks')
    }
  })

  it('QN6: tsconfig.lib.json excludes tests', () => {
    const tsconfig = JSON.parse(readFileSync(resolve(process.cwd(), 'tsconfig.lib.json'), 'utf-8'))
    const excludes = tsconfig.exclude as string[]
    expect(excludes.some((e: string) => e.includes('tests'))).toBe(true)
  })
})
