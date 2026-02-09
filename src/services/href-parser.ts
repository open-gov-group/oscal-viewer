/**
 * HrefParser — Pure function to classify OSCAL href strings into four patterns.
 *
 * OSCAL documents use hrefs in links[], imports[], and cross-references.
 * This parser detects the type (URN, absolute URL, fragment, relative path)
 * and extracts path and fragment components for downstream resolution.
 *
 * Domain Layer: no Preact imports, no side effects.
 */

/** The four OSCAL href pattern types. */
export type HrefType = 'urn' | 'absolute-url' | 'fragment' | 'relative'

/** Result of parsing an OSCAL href string. */
export interface ParsedHref {
  /** The detected href pattern type. */
  type: HrefType
  /** The path portion (URL or file path). Empty string for fragment-only hrefs. */
  path: string
  /** The fragment identifier (portion after '#'), if present. */
  fragment?: string
  /** Whether this href can be resolved to a navigable target in the viewer. */
  isResolvable: boolean
}

/**
 * Parse an OSCAL href string into its constituent parts.
 *
 * Detects four patterns:
 * - `urn:...` — URN identifier (not resolvable)
 * - `http(s)://...` — Absolute URL, optionally with fragment
 * - `#...` — Fragment reference to same-document element
 * - anything else — Relative path, optionally with fragment
 *
 * @param href - The raw href string from an OSCAL Link or Import object.
 * @returns Parsed href with type, path, fragment, and resolvability flag.
 */
export function parseHref(href: string): ParsedHref {
  // URN: not resolvable, treated as opaque identifier
  if (href.startsWith('urn:')) {
    return { type: 'urn', path: href, isResolvable: false }
  }

  // Absolute URL: resolvable via fetch or external link
  if (href.startsWith('http://') || href.startsWith('https://')) {
    const hashIndex = href.indexOf('#')
    if (hashIndex === -1) {
      return { type: 'absolute-url', path: href, isResolvable: true }
    }
    return {
      type: 'absolute-url',
      path: href.slice(0, hashIndex),
      fragment: href.slice(hashIndex + 1),
      isResolvable: true,
    }
  }

  // Fragment: same-document reference, resolvable via deep-link
  if (href.startsWith('#')) {
    return { type: 'fragment', path: '', fragment: href.slice(1), isResolvable: true }
  }

  // Relative path: not resolvable in Phase 4a (no base URL context)
  const hashIndex = href.indexOf('#')
  if (hashIndex === -1) {
    return { type: 'relative', path: href, isResolvable: false }
  }
  return {
    type: 'relative',
    path: href.slice(0, hashIndex),
    fragment: href.slice(hashIndex + 1),
    isResolvable: false,
  }
}
