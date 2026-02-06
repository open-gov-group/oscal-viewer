import type { DocumentType, Metadata } from '@/types/oscal'

const DOCUMENT_TYPE_KEYS: readonly DocumentType[] = [
  'catalog',
  'profile',
  'component-definition',
  'system-security-plan',
] as const

/**
 * Detect the OSCAL document type from the top-level JSON key.
 * OSCAL JSON always wraps the document in a single key (e.g. { "catalog": { ... } }).
 */
export function detectDocumentType(json: unknown): DocumentType | 'unknown' {
  if (typeof json !== 'object' || json === null) return 'unknown'

  const obj = json as Record<string, unknown>

  for (const key of DOCUMENT_TYPE_KEYS) {
    if (key in obj && typeof obj[key] === 'object' && obj[key] !== null) {
      return key
    }
  }

  return 'unknown'
}

/**
 * Extract the OSCAL version string from the document metadata.
 * Falls back to structure-based heuristic if metadata is absent.
 */
export function detectVersion(json: unknown): string {
  if (typeof json !== 'object' || json === null) return 'unknown'

  const obj = json as Record<string, unknown>

  for (const key of DOCUMENT_TYPE_KEYS) {
    const doc = obj[key]
    if (typeof doc === 'object' && doc !== null) {
      const metadata = (doc as Record<string, unknown>).metadata
      if (typeof metadata === 'object' && metadata !== null) {
        const oscalVersion = (metadata as Record<string, unknown>)['oscal-version']
        if (typeof oscalVersion === 'string') {
          return oscalVersion
        }
      }
    }
  }

  return 'unknown'
}

/**
 * Extract the inner document object from the OSCAL JSON wrapper.
 * Returns null if the document type is unrecognized.
 */
export function extractDocument(json: unknown, type: DocumentType): unknown {
  if (typeof json !== 'object' || json === null) return null
  return (json as Record<string, unknown>)[type] ?? null
}

/**
 * Validate that a value is a non-null object.
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Safely extract metadata from a raw document object.
 */
export function extractMetadata(doc: unknown): Metadata | null {
  if (!isObject(doc)) return null
  const metadata = doc.metadata
  if (!isObject(metadata)) return null
  if (typeof metadata.title !== 'string') return null
  if (typeof metadata['oscal-version'] !== 'string') return null
  return metadata as unknown as Metadata
}
