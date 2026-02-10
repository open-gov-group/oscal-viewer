import type { PlanOfActionAndMilestones, ParseResult } from '@/types/oscal'
import { isObject, extractMetadata } from './detect'

/**
 * Parse a raw OSCAL plan-of-action-and-milestones document object.
 * Validates required fields: uuid, metadata, poam-items (non-empty array).
 */
export function parsePoam(raw: unknown): ParseResult<PlanOfActionAndMilestones> {
  if (!isObject(raw)) {
    return { success: false, error: 'POA&M document is not an object' }
  }

  if (typeof raw.uuid !== 'string' || raw.uuid.length === 0) {
    return { success: false, error: 'POA&M is missing required field: uuid' }
  }

  const metadata = extractMetadata(raw)
  if (!metadata) {
    return { success: false, error: 'POA&M is missing valid metadata (requires title, oscal-version)' }
  }

  if (!Array.isArray(raw['poam-items']) || raw['poam-items'].length === 0) {
    return { success: false, error: 'POA&M is missing required field: poam-items' }
  }

  const poam: PlanOfActionAndMilestones = {
    uuid: raw.uuid as string,
    metadata,
    'poam-items': raw['poam-items'] as unknown as PlanOfActionAndMilestones['poam-items'],
    'import-ssp': isObject(raw['import-ssp']) ? raw['import-ssp'] as unknown as PlanOfActionAndMilestones['import-ssp'] : undefined,
    findings: Array.isArray(raw.findings) ? raw.findings as unknown as PlanOfActionAndMilestones['findings'] : undefined,
    observations: Array.isArray(raw.observations) ? raw.observations as unknown as PlanOfActionAndMilestones['observations'] : undefined,
    risks: Array.isArray(raw.risks) ? raw.risks as unknown as PlanOfActionAndMilestones['risks'] : undefined,
    'local-definitions': isObject(raw['local-definitions']) ? raw['local-definitions'] as Record<string, unknown> : undefined,
    'back-matter': isObject(raw['back-matter']) ? raw['back-matter'] as unknown as PlanOfActionAndMilestones['back-matter'] : undefined,
  }

  return { success: true, data: poam }
}
