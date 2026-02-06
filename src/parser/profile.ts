import type { Profile, ParseResult } from '@/types/oscal'
import { isObject, extractMetadata } from './detect'

/**
 * Parse a raw OSCAL profile document object (the inner value, not the wrapper).
 * Validates required fields: uuid, metadata, imports.
 */
export function parseProfile(raw: unknown): ParseResult<Profile> {
  if (!isObject(raw)) {
    return { success: false, error: 'Profile document is not an object' }
  }

  if (typeof raw.uuid !== 'string' || raw.uuid.length === 0) {
    return { success: false, error: 'Profile is missing required field: uuid' }
  }

  const metadata = extractMetadata(raw)
  if (!metadata) {
    return { success: false, error: 'Profile is missing valid metadata (requires title, oscal-version)' }
  }

  if (!Array.isArray(raw.imports) || raw.imports.length === 0) {
    return { success: false, error: 'Profile is missing required field: imports (must be a non-empty array)' }
  }

  const profile: Profile = {
    uuid: raw.uuid as string,
    metadata,
    imports: raw.imports,
    merge: isObject(raw.merge) ? raw.merge as Profile['merge'] : undefined,
    modify: isObject(raw.modify) ? raw.modify as Profile['modify'] : undefined,
    'back-matter': isObject(raw['back-matter']) ? raw['back-matter'] as Profile['back-matter'] : undefined,
  }

  return { success: true, data: profile }
}
