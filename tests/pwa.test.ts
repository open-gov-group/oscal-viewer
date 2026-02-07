import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

// ============================================================
// PWA Manifest Tests (QP7-QP10)
// ============================================================

describe('PWA Manifest (QP7-QP10)', () => {
  const manifestPath = resolve(process.cwd(), 'public/manifest.json')
  let manifest: Record<string, unknown>

  beforeAll(() => {
    const content = readFileSync(manifestPath, 'utf-8')
    manifest = JSON.parse(content)
  })

  it('QP7: manifest.json exists and is valid JSON', () => {
    expect(existsSync(manifestPath)).toBe(true)
    expect(manifest).toBeDefined()
  })

  it('QP7: manifest has required PWA fields', () => {
    expect(manifest.name).toBe('OSCAL Viewer')
    expect(manifest.short_name).toBe('OSCAL')
    expect(manifest.display).toBe('standalone')
    expect(manifest.start_url).toBeDefined()
    expect(manifest.icons).toBeDefined()
  })

  it('QP8: start_url points to /oscal-viewer/', () => {
    expect(manifest.start_url).toBe('/oscal-viewer/')
  })

  it('QP9: manifest references at least 2 icons', () => {
    const icons = manifest.icons as Array<{ src: string }>
    expect(icons.length).toBeGreaterThanOrEqual(2)
  })

  it('QP9: manifest includes maskable icon', () => {
    const icons = manifest.icons as Array<{ purpose?: string }>
    const maskable = icons.find(i => i.purpose === 'maskable')
    expect(maskable).toBeDefined()
  })

  it('QP9: icon files exist on disk', () => {
    const icons = manifest.icons as Array<{ src: string }>
    for (const icon of icons) {
      const iconPath = resolve(process.cwd(), 'public', icon.src)
      expect(existsSync(iconPath)).toBe(true)
    }
  })

  it('QP10: theme_color is a valid hex color', () => {
    expect(manifest.theme_color).toMatch(/^#[0-9a-fA-F]{6}$/)
  })

  it('QP10: background_color is a valid hex color', () => {
    expect(manifest.background_color).toMatch(/^#[0-9a-fA-F]{6}$/)
  })
})

// ============================================================
// PWA HTML Integration
// ============================================================

describe('PWA HTML Integration', () => {
  const html = readFileSync(resolve(process.cwd(), 'index.html'), 'utf-8')

  it('index.html links to manifest.json', () => {
    expect(html).toMatch(/<link[^>]*rel="manifest"/)
  })

  it('index.html has theme-color meta tag', () => {
    expect(html).toMatch(/<meta[^>]*name="theme-color"/)
  })

  it('index.html has description meta tag', () => {
    expect(html).toMatch(/<meta[^>]*name="description"/)
  })
})

// ============================================================
// PWA Vite Configuration
// ============================================================

describe('PWA Vite Configuration', () => {
  const viteConfig = readFileSync(resolve(process.cwd(), 'vite.config.ts'), 'utf-8')

  it('vite.config.ts imports VitePWA', () => {
    expect(viteConfig).toContain("VitePWA")
  })

  it('vite.config.ts uses autoUpdate register type', () => {
    expect(viteConfig).toContain("autoUpdate")
  })

  it('vite.config.ts configures workbox precaching', () => {
    expect(viteConfig).toContain("globPatterns")
  })

  it('vite.config.ts configures Google Fonts runtime caching', () => {
    expect(viteConfig).toMatch(/fonts.*googleapis/)
    expect(viteConfig).toMatch(/fonts.*gstatic/)
  })

  it('vite.config.ts uses custom manifest (manifest: false)', () => {
    expect(viteConfig).toContain("manifest: false")
  })
})
