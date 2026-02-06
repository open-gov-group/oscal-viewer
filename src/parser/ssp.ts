import type { SystemSecurityPlan, ParseResult } from '@/types/oscal'
import { isObject, extractMetadata } from './detect'

/**
 * Parse a raw OSCAL system-security-plan document object (the inner value, not the wrapper).
 * Validates required fields: uuid, metadata, import-profile, system-characteristics,
 * system-implementation, control-implementation.
 */
export function parseSSP(raw: unknown): ParseResult<SystemSecurityPlan> {
  if (!isObject(raw)) {
    return { success: false, error: 'SSP document is not an object' }
  }

  if (typeof raw.uuid !== 'string' || raw.uuid.length === 0) {
    return { success: false, error: 'SSP is missing required field: uuid' }
  }

  const metadata = extractMetadata(raw)
  if (!metadata) {
    return { success: false, error: 'SSP is missing valid metadata (requires title, oscal-version)' }
  }

  if (!isObject(raw['import-profile'])) {
    return { success: false, error: 'SSP is missing required field: import-profile' }
  }

  if (!isObject(raw['system-characteristics'])) {
    return { success: false, error: 'SSP is missing required field: system-characteristics' }
  }

  if (!isObject(raw['system-implementation'])) {
    return { success: false, error: 'SSP is missing required field: system-implementation' }
  }

  if (!isObject(raw['control-implementation'])) {
    return { success: false, error: 'SSP is missing required field: control-implementation' }
  }

  const ssp: SystemSecurityPlan = {
    uuid: raw.uuid as string,
    metadata,
    'import-profile': raw['import-profile'] as unknown as SystemSecurityPlan['import-profile'],
    'system-characteristics': raw['system-characteristics'] as unknown as SystemSecurityPlan['system-characteristics'],
    'system-implementation': raw['system-implementation'] as unknown as SystemSecurityPlan['system-implementation'],
    'control-implementation': raw['control-implementation'] as unknown as SystemSecurityPlan['control-implementation'],
    'back-matter': isObject(raw['back-matter']) ? raw['back-matter'] as unknown as SystemSecurityPlan['back-matter'] : undefined,
  }

  return { success: true, data: ssp }
}
