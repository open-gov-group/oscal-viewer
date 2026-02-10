/**
 * XML Adapter — Converts OSCAL XML to JSON-equivalent plain JavaScript objects.
 *
 * Uses browser-native DOMParser (zero dependencies). The output matches the
 * JSON structure expected by parseOscalDocument(), enabling full reuse of
 * all type-specific parsers.
 *
 * Key strategies:
 * - Singular→plural mapping: XML `<control>` → JSON `"controls": [...]`
 * - Prose extraction: XHTML blocks (`<p>`, `<ul>`) → `"prose"` string
 * - Namespace-agnostic: uses localName instead of tagName
 *
 * Domain Layer: no Preact imports, no side effects.
 */

/**
 * Map from XML element name (singular) to JSON property name (plural) for array fields.
 * OSCAL XML uses singular element names; JSON uses plural property names.
 * All entries are always treated as arrays, even with a single child.
 */
const ARRAY_ELEMENT_MAP = new Map<string, string>([
  // Catalog / shared
  ['control', 'controls'],
  ['group', 'groups'],
  ['param', 'params'],
  ['part', 'parts'],
  ['prop', 'props'],
  ['link', 'links'],
  ['resource', 'resources'],
  ['rlink', 'rlinks'],
  ['hash', 'hashes'],
  // Metadata
  ['role', 'roles'],
  ['party', 'parties'],
  ['responsible-party', 'responsible-parties'],
  ['location', 'locations'],
  ['revision', 'revisions'],
  ['document-id', 'document-ids'],
  ['external-id', 'external-ids'],
  ['email-address', 'email-addresses'],
  ['telephone-number', 'telephone-numbers'],
  ['member-of-organization', 'member-of-organizations'],
  ['location-uuid', 'location-uuids'],
  ['party-uuid', 'party-uuids'],
  ['addr-line', 'addr-lines'],
  ['url', 'urls'],
  // Parameter
  ['value', 'values'],
  ['guideline', 'guidelines'],
  ['constraint', 'constraints'],
  ['choice', 'choice'],
  // Profile
  ['import', 'imports'],
  ['include-controls', 'include-controls'],
  ['exclude-controls', 'exclude-controls'],
  ['with-id', 'with-ids'],
  ['set-parameter', 'set-parameters'],
  ['alter', 'alters'],
  ['add', 'adds'],
  ['remove', 'removes'],
  ['matching', 'matching'],
  // SSP
  ['user', 'users'],
  ['component', 'components'],
  ['inventory-item', 'inventory-items'],
  ['implemented-requirement', 'implemented-requirements'],
  ['statement', 'statements'],
  ['by-component', 'by-components'],
  ['system-id', 'system-ids'],
  ['information-type', 'information-types'],
  ['leveraged-authorization', 'leveraged-authorizations'],
  ['diagram', 'diagrams'],
  // Component Definition
  ['control-implementation', 'control-implementations'],
  ['capability', 'capabilities'],
  // Assessment Results
  ['result', 'results'],
  ['finding', 'findings'],
  ['observation', 'observations'],
  ['risk', 'risks'],
  ['origin', 'origins'],
  ['assessment', 'assessments'],
  ['assessment-subject', 'assessment-subjects'],
  ['relevant-evidence', 'relevant-evidence'],
  ['related-observation', 'related-observations'],
  ['related-risk', 'related-risks'],
  // POA&M
  ['poam-item', 'poam-items'],
  ['milestone', 'milestones'],
  ['related-finding', 'related-findings'],
  // Generic
  ['test', 'tests'],
])

/** OSCAL fields whose entire content is XHTML prose (serialized as HTML string). */
const PROSE_FIELDS = new Set(['prose', 'description', 'remarks'])

/** HTML block elements that indicate inline prose content within OSCAL elements. */
const XHTML_BLOCK_ELEMENTS = new Set([
  'p', 'ul', 'ol', 'pre', 'table', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'blockquote', 'img', 'hr',
])

/**
 * Convert OSCAL XML text to a JSON-equivalent plain JavaScript object.
 * The result can be passed directly to parseOscalDocument().
 *
 * @throws {Error} If the XML is malformed or contains parser errors.
 */
export function xmlToJson(xmlText: string): unknown {
  const parser = new DOMParser()
  const doc = parser.parseFromString(xmlText, 'text/xml')

  // DOMParser signals errors via a <parsererror> element
  const parseError = doc.querySelector('parsererror')
  if (parseError) {
    throw new Error(`XML parse error: ${parseError.textContent?.trim() ?? 'unknown'}`)
  }

  const root = doc.documentElement
  // Wrap in top-level key to match JSON format: { "catalog": { ... } }
  return { [root.localName]: elementToJson(root) }
}

/**
 * Recursively convert a DOM Element to a plain JavaScript object.
 * Handles attributes, child elements, text content, prose fields,
 * and OSCAL-specific singular→plural name mapping.
 */
function elementToJson(element: Element): unknown {
  const result: Record<string, unknown> = {}

  // 1. Convert XML attributes to object properties (skip xmlns)
  for (const attr of Array.from(element.attributes)) {
    if (attr.name === 'xmlns' || attr.name.startsWith('xmlns:')) continue
    result[attr.localName] = attr.value
  }

  // 2. Classify children into structural elements and XHTML prose blocks
  const structuralGroups = new Map<string, Element[]>()
  const proseNodes: ChildNode[] = []
  let hasStructural = false
  let hasXhtml = false

  for (const child of Array.from(element.childNodes)) {
    if (child.nodeType === 1 /* ELEMENT_NODE */) {
      const el = child as Element
      if (XHTML_BLOCK_ELEMENTS.has(el.localName)) {
        proseNodes.push(el)
        hasXhtml = true
      } else {
        const name = el.localName
        if (!structuralGroups.has(name)) structuralGroups.set(name, [])
        structuralGroups.get(name)!.push(el)
        hasStructural = true
      }
    } else if (child.nodeType === 3 /* TEXT_NODE */) {
      proseNodes.push(child)
    }
  }

  // 3. Prose-wrapper fields (description, remarks): serialize all content as string
  if (PROSE_FIELDS.has(element.localName)) {
    if (hasXhtml) return serializeNodes(Array.from(element.childNodes))
    // No XHTML children — return text content
    const text = element.textContent?.trim() ?? ''
    if (Object.keys(result).length === 0) return text
    if (text) result['_text'] = text
    return result
  }

  // 4. Leaf element: no child elements at all
  if (!hasStructural && !hasXhtml) {
    const text = element.textContent?.trim() ?? ''
    if (Object.keys(result).length === 0) {
      // Empty element (<include-all/>) → {} ; text element (<title>T</title>) → "T"
      return text || {}
    }
    if (text) result['_text'] = text
    return result
  }

  // 5. Mixed content: XHTML blocks → serialize as "prose" property
  if (hasXhtml) {
    result.prose = serializeNodes(proseNodes)
  }

  // 6. Structural children → object properties (with singular→plural mapping)
  for (const [name, children] of structuralGroups) {
    const jsonName = ARRAY_ELEMENT_MAP.get(name)
    if (jsonName) {
      // Known array field → use JSON name, always array
      result[jsonName] = children.map(c => elementToJson(c))
    } else if (children.length > 1) {
      // Multiple siblings → heuristic: treat as array
      result[name] = children.map(c => elementToJson(c))
    } else {
      // Single non-array child → object
      result[name] = elementToJson(children[0])
    }
  }

  return result
}

/**
 * Serialize a list of DOM nodes as an HTML string.
 * Preserves XHTML markup and converts OSCAL `<insert>` elements.
 */
function serializeNodes(nodes: ChildNode[]): string {
  let html = ''
  for (const node of nodes) {
    if (node.nodeType === 3 /* TEXT_NODE */) {
      const text = node.textContent ?? ''
      if (text.trim()) html += text
    } else if (node.nodeType === 1 /* ELEMENT_NODE */) {
      html += serializeElement(node as Element)
    }
  }
  return html.trim()
}

/**
 * Serialize a single element and its children to an HTML string.
 * Handles `<insert>` conversion to `{{ insert: type, id }}` format.
 */
function serializeElement(element: Element): string {
  // Convert <insert type="param" id-ref="x"/> to {{ insert: param, x }}
  if (element.localName === 'insert') {
    const type = element.getAttribute('type') ?? 'param'
    const idRef = element.getAttribute('id-ref') ?? ''
    return `{{ insert: ${type}, ${idRef} }}`
  }

  const tag = element.localName
  let attrs = ''
  for (const attr of Array.from(element.attributes)) {
    if (attr.name === 'xmlns' || attr.name.startsWith('xmlns:')) continue
    attrs += ` ${attr.localName}="${attr.value}"`
  }

  if (element.childNodes.length === 0) {
    return `<${tag}${attrs}/>`
  }

  let inner = ''
  for (const child of Array.from(element.childNodes)) {
    if (child.nodeType === 3) {
      inner += child.textContent ?? ''
    } else if (child.nodeType === 1) {
      inner += serializeElement(child as Element)
    }
  }

  return `<${tag}${attrs}>${inner}</${tag}>`
}
