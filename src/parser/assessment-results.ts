import type { AssessmentResults, ParseResult } from '@/types/oscal'
import { isObject, extractMetadata } from './detect'

/**
 * Parse a raw OSCAL assessment-results document object.
 * Validates required fields: uuid, metadata, results (non-empty array).
 */
export function parseAssessmentResults(raw: unknown): ParseResult<AssessmentResults> {
  if (!isObject(raw)) {
    return { success: false, error: 'Assessment Results document is not an object' }
  }

  if (typeof raw.uuid !== 'string' || raw.uuid.length === 0) {
    return { success: false, error: 'Assessment Results is missing required field: uuid' }
  }

  const metadata = extractMetadata(raw)
  if (!metadata) {
    return { success: false, error: 'Assessment Results is missing valid metadata (requires title, oscal-version)' }
  }

  if (!Array.isArray(raw.results) || raw.results.length === 0) {
    return { success: false, error: 'Assessment Results is missing required field: results' }
  }

  const ar: AssessmentResults = {
    uuid: raw.uuid as string,
    metadata,
    results: raw.results as unknown as AssessmentResults['results'],
    'import-ap': isObject(raw['import-ap']) ? raw['import-ap'] as unknown as AssessmentResults['import-ap'] : undefined,
    'local-definitions': isObject(raw['local-definitions']) ? raw['local-definitions'] as Record<string, unknown> : undefined,
    'back-matter': isObject(raw['back-matter']) ? raw['back-matter'] as unknown as AssessmentResults['back-matter'] : undefined,
  }

  return { success: true, data: ar }
}
