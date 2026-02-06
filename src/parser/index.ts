import type { OscalDocument, ParseResult, OscalDocumentData } from '@/types/oscal'
import { detectDocumentType, detectVersion, extractDocument } from './detect'
import { parseCatalog } from './catalog'
import { parseProfile } from './profile'
import { parseComponentDefinition } from './component-definition'
import { parseSSP } from './ssp'

export { detectDocumentType, detectVersion } from './detect'
export { parseCatalog, countControls } from './catalog'
export { parseProfile } from './profile'
export { parseComponentDefinition } from './component-definition'
export { parseSSP } from './ssp'

/**
 * Parse a raw OSCAL JSON object into a typed OscalDocument.
 * This is the main entry point for the parser layer.
 *
 * 1. Detects the document type from the top-level key
 * 2. Extracts the OSCAL version from metadata
 * 3. Delegates to the appropriate type-specific parser
 */
export function parseOscalDocument(json: unknown): ParseResult<OscalDocument> {
  const type = detectDocumentType(json)
  if (type === 'unknown') {
    return {
      success: false,
      error: 'Unrecognized OSCAL document type. Expected top-level key: catalog, profile, component-definition, or system-security-plan',
    }
  }

  const version = detectVersion(json)
  const raw = extractDocument(json, type)

  let dataResult: ParseResult<OscalDocumentData['document']>

  switch (type) {
    case 'catalog':
      dataResult = parseCatalog(raw)
      break
    case 'profile':
      dataResult = parseProfile(raw)
      break
    case 'component-definition':
      dataResult = parseComponentDefinition(raw)
      break
    case 'system-security-plan':
      dataResult = parseSSP(raw)
      break
  }

  if (!dataResult.success) {
    return dataResult
  }

  return {
    success: true,
    data: {
      type,
      version,
      data: { type, document: dataResult.data } as OscalDocumentData,
    },
  }
}
