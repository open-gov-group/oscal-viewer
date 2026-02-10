import { xmlToJson } from '@/parser/xml-adapter'

// ============================================================
// Basic Conversion
// ============================================================

describe('xmlToJson - basic conversion', () => {
  it('converts minimal catalog XML', () => {
    const xml = `<?xml version="1.0"?>
      <catalog xmlns="http://csrc.nist.gov/ns/oscal/1.0" uuid="cat-001">
        <metadata>
          <title>Test Catalog</title>
          <last-modified>2026-01-01T00:00:00Z</last-modified>
          <version>1.0</version>
          <oscal-version>1.1.2</oscal-version>
        </metadata>
      </catalog>`

    const result = xmlToJson(xml) as Record<string, unknown>
    expect(result).toHaveProperty('catalog')
    const catalog = result.catalog as Record<string, unknown>
    expect(catalog.uuid).toBe('cat-001')
  })

  it('extracts metadata fields', () => {
    const xml = `<catalog xmlns="http://csrc.nist.gov/ns/oscal/1.0" uuid="c1">
      <metadata>
        <title>My Catalog</title>
        <last-modified>2026-01-01T00:00:00Z</last-modified>
        <version>2.0</version>
        <oscal-version>1.1.2</oscal-version>
      </metadata>
    </catalog>`

    const result = xmlToJson(xml) as Record<string, unknown>
    const catalog = result.catalog as Record<string, unknown>
    const meta = catalog.metadata as Record<string, unknown>
    expect(meta.title).toBe('My Catalog')
    expect(meta.version).toBe('2.0')
    expect(meta['oscal-version']).toBe('1.1.2')
    expect(meta['last-modified']).toBe('2026-01-01T00:00:00Z')
  })

  it('converts XML attributes to properties', () => {
    const xml = `<catalog xmlns="http://csrc.nist.gov/ns/oscal/1.0" uuid="abc-123">
      <metadata><title>T</title><last-modified>X</last-modified><version>1</version><oscal-version>1.1</oscal-version></metadata>
    </catalog>`

    const result = xmlToJson(xml) as Record<string, unknown>
    const catalog = result.catalog as Record<string, unknown>
    expect(catalog.uuid).toBe('abc-123')
  })

  it('ignores xmlns namespace declarations', () => {
    const xml = `<catalog xmlns="http://csrc.nist.gov/ns/oscal/1.0" uuid="c1">
      <metadata><title>T</title><last-modified>X</last-modified><version>1</version><oscal-version>1.1</oscal-version></metadata>
    </catalog>`

    const result = xmlToJson(xml) as Record<string, unknown>
    const catalog = result.catalog as Record<string, unknown>
    expect(catalog).not.toHaveProperty('xmlns')
  })

  it('converts text-only elements to strings', () => {
    const xml = `<catalog xmlns="http://csrc.nist.gov/ns/oscal/1.0" uuid="c1">
      <metadata><title>Hello World</title><last-modified>X</last-modified><version>1</version><oscal-version>1.1</oscal-version></metadata>
    </catalog>`

    const result = xmlToJson(xml) as Record<string, unknown>
    const catalog = result.catalog as Record<string, unknown>
    const meta = catalog.metadata as Record<string, unknown>
    expect(meta.title).toBe('Hello World')
  })

  it('uses root element localName as top-level key', () => {
    const xml = `<profile xmlns="http://csrc.nist.gov/ns/oscal/1.0" uuid="p1">
      <metadata><title>T</title><last-modified>X</last-modified><version>1</version><oscal-version>1.1</oscal-version></metadata>
      <import href="cat.json"><include-all/></import>
    </profile>`

    const result = xmlToJson(xml) as Record<string, unknown>
    expect(result).toHaveProperty('profile')
    expect(result).not.toHaveProperty('catalog')
  })
})

// ============================================================
// Array Detection
// ============================================================

describe('xmlToJson - array detection', () => {
  it('treats known array fields as arrays (single child)', () => {
    const xml = `<catalog xmlns="http://csrc.nist.gov/ns/oscal/1.0" uuid="c1">
      <metadata><title>T</title><last-modified>X</last-modified><version>1</version><oscal-version>1.1</oscal-version></metadata>
      <control id="ac-1"><title>Access Control</title></control>
    </catalog>`

    const result = xmlToJson(xml) as Record<string, unknown>
    const catalog = result.catalog as Record<string, unknown>
    expect(Array.isArray(catalog.controls)).toBe(true)
    expect((catalog.controls as unknown[]).length).toBe(1)
  })

  it('treats multiple siblings as arrays', () => {
    const xml = `<catalog xmlns="http://csrc.nist.gov/ns/oscal/1.0" uuid="c1">
      <metadata><title>T</title><last-modified>X</last-modified><version>1</version><oscal-version>1.1</oscal-version></metadata>
      <control id="ac-1"><title>A</title></control>
      <control id="ac-2"><title>B</title></control>
    </catalog>`

    const result = xmlToJson(xml) as Record<string, unknown>
    const catalog = result.catalog as Record<string, unknown>
    expect(Array.isArray(catalog.controls)).toBe(true)
    expect((catalog.controls as unknown[]).length).toBe(2)
  })

  it('treats props as array even with single prop', () => {
    const xml = `<catalog xmlns="http://csrc.nist.gov/ns/oscal/1.0" uuid="c1">
      <metadata><title>T</title><last-modified>X</last-modified><version>1</version><oscal-version>1.1</oscal-version></metadata>
      <control id="ac-1">
        <title>AC</title>
        <prop name="label" value="1"/>
      </control>
    </catalog>`

    const result = xmlToJson(xml) as Record<string, unknown>
    const catalog = result.catalog as Record<string, unknown>
    const controls = catalog.controls as Record<string, unknown>[]
    const props = controls[0].props as unknown[]
    expect(Array.isArray(props)).toBe(true)
    expect(props.length).toBe(1)
  })

  it('handles nested array fields', () => {
    const xml = `<catalog xmlns="http://csrc.nist.gov/ns/oscal/1.0" uuid="c1">
      <metadata><title>T</title><last-modified>X</last-modified><version>1</version><oscal-version>1.1</oscal-version></metadata>
      <group id="g1">
        <title>Group 1</title>
        <control id="c1"><title>C1</title></control>
        <control id="c2"><title>C2</title></control>
      </group>
    </catalog>`

    const result = xmlToJson(xml) as Record<string, unknown>
    const catalog = result.catalog as Record<string, unknown>
    const groups = catalog.groups as Record<string, unknown>[]
    expect(Array.isArray(groups)).toBe(true)
    expect(groups[0].id).toBe('g1')
    const controls = groups[0].controls as Record<string, unknown>[]
    expect(Array.isArray(controls)).toBe(true)
    expect(controls.length).toBe(2)
  })

  it('converts single non-array child to object', () => {
    const xml = `<catalog xmlns="http://csrc.nist.gov/ns/oscal/1.0" uuid="c1">
      <metadata><title>T</title><last-modified>X</last-modified><version>1</version><oscal-version>1.1</oscal-version></metadata>
    </catalog>`

    const result = xmlToJson(xml) as Record<string, unknown>
    const catalog = result.catalog as Record<string, unknown>
    expect(Array.isArray(catalog.metadata)).toBe(false)
    expect(typeof catalog.metadata).toBe('object')
  })

  it('handles imports as array in profile', () => {
    const xml = `<profile xmlns="http://csrc.nist.gov/ns/oscal/1.0" uuid="p1">
      <metadata><title>T</title><last-modified>X</last-modified><version>1</version><oscal-version>1.1</oscal-version></metadata>
      <import href="cat.json"><include-all/></import>
    </profile>`

    const result = xmlToJson(xml) as Record<string, unknown>
    const profile = result.profile as Record<string, unknown>
    expect(Array.isArray(profile.imports)).toBe(true)
  })
})

// ============================================================
// Prose / XHTML Handling
// ============================================================

describe('xmlToJson - prose and XHTML', () => {
  it('serializes prose field with <p> tags', () => {
    const xml = `<catalog xmlns="http://csrc.nist.gov/ns/oscal/1.0" uuid="c1">
      <metadata><title>T</title><last-modified>X</last-modified><version>1</version><oscal-version>1.1</oscal-version>
        <remarks><p>This is a remark.</p></remarks>
      </metadata>
    </catalog>`

    const result = xmlToJson(xml) as Record<string, unknown>
    const catalog = result.catalog as Record<string, unknown>
    const meta = catalog.metadata as Record<string, unknown>
    expect(typeof meta.remarks).toBe('string')
    expect(meta.remarks).toContain('<p>')
    expect(meta.remarks).toContain('This is a remark.')
  })

  it('preserves strong, em, code tags in prose', () => {
    const xml = `<catalog xmlns="http://csrc.nist.gov/ns/oscal/1.0" uuid="c1">
      <metadata><title>T</title><last-modified>X</last-modified><version>1</version><oscal-version>1.1</oscal-version></metadata>
      <control id="c1">
        <title>C</title>
        <part name="statement" id="s1">
          <p>Use <strong>bold</strong>, <em>italic</em>, and <code>code</code>.</p>
        </part>
      </control>
    </catalog>`

    const result = xmlToJson(xml) as Record<string, unknown>
    const catalog = result.catalog as Record<string, unknown>
    const controls = catalog.controls as Record<string, unknown>[]
    const parts = controls[0].parts as Record<string, unknown>[]
    const prose = parts[0].prose as string
    expect(prose).toContain('<strong>bold</strong>')
    expect(prose).toContain('<em>italic</em>')
    expect(prose).toContain('<code>code</code>')
  })

  it('preserves list markup in prose', () => {
    const xml = `<catalog xmlns="http://csrc.nist.gov/ns/oscal/1.0" uuid="c1">
      <metadata><title>T</title><last-modified>X</last-modified><version>1</version><oscal-version>1.1</oscal-version></metadata>
      <control id="c1">
        <title>C</title>
        <part name="guidance" id="g1">
          <ul><li>Item A</li><li>Item B</li></ul>
        </part>
      </control>
    </catalog>`

    const result = xmlToJson(xml) as Record<string, unknown>
    const catalog = result.catalog as Record<string, unknown>
    const controls = catalog.controls as Record<string, unknown>[]
    const parts = controls[0].parts as Record<string, unknown>[]
    const prose = parts[0].prose as string
    expect(prose).toContain('<ul>')
    expect(prose).toContain('<li>Item A</li>')
  })

  it('preserves anchor tags in prose', () => {
    const xml = `<catalog xmlns="http://csrc.nist.gov/ns/oscal/1.0" uuid="c1">
      <metadata><title>T</title><last-modified>X</last-modified><version>1</version><oscal-version>1.1</oscal-version></metadata>
      <control id="c1">
        <title>C</title>
        <part name="statement" id="s1">
          <p>See <a href="https://example.com">link</a>.</p>
        </part>
      </control>
    </catalog>`

    const result = xmlToJson(xml) as Record<string, unknown>
    const catalog = result.catalog as Record<string, unknown>
    const controls = catalog.controls as Record<string, unknown>[]
    const parts = controls[0].parts as Record<string, unknown>[]
    const prose = parts[0].prose as string
    expect(prose).toContain('<a href="https://example.com">link</a>')
  })

  it('converts <insert> elements to mustache format', () => {
    const xml = `<catalog xmlns="http://csrc.nist.gov/ns/oscal/1.0" uuid="c1">
      <metadata><title>T</title><last-modified>X</last-modified><version>1</version><oscal-version>1.1</oscal-version></metadata>
      <control id="c1">
        <title>C</title>
        <part name="statement" id="s1">
          <p>Review every <insert type="param" id-ref="ac-1_prm_1"/>.</p>
        </part>
      </control>
    </catalog>`

    const result = xmlToJson(xml) as Record<string, unknown>
    const catalog = result.catalog as Record<string, unknown>
    const controls = catalog.controls as Record<string, unknown>[]
    const parts = controls[0].parts as Record<string, unknown>[]
    const prose = parts[0].prose as string
    expect(prose).toContain('{{ insert: param, ac-1_prm_1 }}')
    expect(prose).not.toContain('<insert')
  })

  it('handles description as prose field', () => {
    const xml = `<catalog xmlns="http://csrc.nist.gov/ns/oscal/1.0" uuid="c1">
      <metadata><title>T</title><last-modified>X</last-modified><version>1</version><oscal-version>1.1</oscal-version>
        <remarks><p>A remark</p></remarks>
      </metadata>
    </catalog>`

    const result = xmlToJson(xml) as Record<string, unknown>
    const catalog = result.catalog as Record<string, unknown>
    const meta = catalog.metadata as Record<string, unknown>
    expect(typeof meta.remarks).toBe('string')
  })

  it('returns plain text for prose fields without XHTML children', () => {
    const xml = `<catalog xmlns="http://csrc.nist.gov/ns/oscal/1.0" uuid="c1">
      <metadata><title>T</title><last-modified>X</last-modified><version>1</version><oscal-version>1.1</oscal-version>
        <remarks>Simple text remark</remarks>
      </metadata>
    </catalog>`

    const result = xmlToJson(xml) as Record<string, unknown>
    const catalog = result.catalog as Record<string, unknown>
    const meta = catalog.metadata as Record<string, unknown>
    // remarks without child elements is treated as plain text
    expect(meta.remarks).toBe('Simple text remark')
  })
})

// ============================================================
// Complex Structures
// ============================================================

describe('xmlToJson - complex structures', () => {
  it('handles parameters with select/choice', () => {
    const xml = `<catalog xmlns="http://csrc.nist.gov/ns/oscal/1.0" uuid="c1">
      <metadata><title>T</title><last-modified>X</last-modified><version>1</version><oscal-version>1.1</oscal-version></metadata>
      <control id="c1">
        <title>C</title>
        <param id="p1">
          <label>Frequency</label>
          <select how-many="one">
            <choice>daily</choice>
            <choice>weekly</choice>
          </select>
        </param>
      </control>
    </catalog>`

    const result = xmlToJson(xml) as Record<string, unknown>
    const catalog = result.catalog as Record<string, unknown>
    const controls = catalog.controls as Record<string, unknown>[]
    const params = controls[0].params as Record<string, unknown>[]
    expect(params[0].id).toBe('p1')
    expect((params[0].label as string)).toBe('Frequency')
    const select = params[0].select as Record<string, unknown>
    expect(select['how-many']).toBe('one')
    const choices = select.choice as string[]
    expect(Array.isArray(choices)).toBe(true)
    expect(choices).toEqual(['daily', 'weekly'])
  })

  it('handles back-matter with resources and rlinks', () => {
    const xml = `<catalog xmlns="http://csrc.nist.gov/ns/oscal/1.0" uuid="c1">
      <metadata><title>T</title><last-modified>X</last-modified><version>1</version><oscal-version>1.1</oscal-version></metadata>
      <back-matter>
        <resource uuid="r1">
          <title>NIST SP 800-53</title>
          <rlink href="catalog.json" media-type="application/json"/>
          <rlink href="catalog.xml" media-type="application/xml"/>
        </resource>
      </back-matter>
    </catalog>`

    const result = xmlToJson(xml) as Record<string, unknown>
    const catalog = result.catalog as Record<string, unknown>
    const bm = catalog['back-matter'] as Record<string, unknown>
    const resources = bm.resources as Record<string, unknown>[]
    expect(Array.isArray(resources)).toBe(true)
    expect(resources[0].uuid).toBe('r1')
    const rlinks = resources[0].rlinks as Record<string, unknown>[]
    expect(Array.isArray(rlinks)).toBe(true)
    expect(rlinks.length).toBe(2)
    expect(rlinks[0].href).toBe('catalog.json')
  })

  it('handles nested groups with controls', () => {
    const xml = `<catalog xmlns="http://csrc.nist.gov/ns/oscal/1.0" uuid="c1">
      <metadata><title>T</title><last-modified>X</last-modified><version>1</version><oscal-version>1.1</oscal-version></metadata>
      <group id="ac">
        <title>Access Control</title>
        <group id="ac.1">
          <title>AC Sub</title>
          <control id="ac-1"><title>Policy</title></control>
        </group>
      </group>
    </catalog>`

    const result = xmlToJson(xml) as Record<string, unknown>
    const catalog = result.catalog as Record<string, unknown>
    const groups = catalog.groups as Record<string, unknown>[]
    const subgroups = groups[0].groups as Record<string, unknown>[]
    expect(Array.isArray(subgroups)).toBe(true)
    const controls = subgroups[0].controls as Record<string, unknown>[]
    expect(controls[0].id).toBe('ac-1')
  })

  it('handles links with rel attribute', () => {
    const xml = `<catalog xmlns="http://csrc.nist.gov/ns/oscal/1.0" uuid="c1">
      <metadata><title>T</title><last-modified>X</last-modified><version>1</version><oscal-version>1.1</oscal-version></metadata>
      <control id="c1">
        <title>C</title>
        <link href="#ac-2" rel="related"/>
        <link href="#ac-3" rel="required"/>
      </control>
    </catalog>`

    const result = xmlToJson(xml) as Record<string, unknown>
    const catalog = result.catalog as Record<string, unknown>
    const controls = catalog.controls as Record<string, unknown>[]
    const links = controls[0].links as Record<string, unknown>[]
    expect(Array.isArray(links)).toBe(true)
    expect(links[0].href).toBe('#ac-2')
    expect(links[0].rel).toBe('related')
  })
})

// ============================================================
// Error Handling
// ============================================================

describe('xmlToJson - error handling', () => {
  it('throws on malformed XML', () => {
    expect(() => xmlToJson('<catalog><unclosed>')).toThrow('XML parse error')
  })

  it('throws on empty string', () => {
    expect(() => xmlToJson('')).toThrow()
  })

  it('handles XML with processing instruction', () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
      <catalog xmlns="http://csrc.nist.gov/ns/oscal/1.0" uuid="c1">
        <metadata><title>T</title><last-modified>X</last-modified><version>1</version><oscal-version>1.1</oscal-version></metadata>
      </catalog>`

    const result = xmlToJson(xml) as Record<string, unknown>
    expect(result).toHaveProperty('catalog')
  })
})
