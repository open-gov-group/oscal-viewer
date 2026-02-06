import type { Catalog, ParseResult } from '@/types/oscal'
import { isObject, extractMetadata } from './detect'

/**
 * Parse a raw OSCAL catalog document object (the inner value, not the wrapper).
 * Validates required fields: uuid, metadata.
 */
export function parseCatalog(raw: unknown): ParseResult<Catalog> {
  if (!isObject(raw)) {
    return { success: false, error: 'Catalog document is not an object' }
  }

  if (typeof raw.uuid !== 'string' || raw.uuid.length === 0) {
    return { success: false, error: 'Catalog is missing required field: uuid' }
  }

  const metadata = extractMetadata(raw)
  if (!metadata) {
    return { success: false, error: 'Catalog is missing valid metadata (requires title, oscal-version)' }
  }

  const catalog: Catalog = {
    uuid: raw.uuid as string,
    metadata,
    groups: Array.isArray(raw.groups) ? raw.groups : undefined,
    controls: Array.isArray(raw.controls) ? raw.controls : undefined,
    params: Array.isArray(raw.params) ? raw.params : undefined,
    'back-matter': isObject(raw['back-matter']) ? raw['back-matter'] as Catalog['back-matter'] : undefined,
  }

  return { success: true, data: catalog }
}

/**
 * Count total controls in a catalog (including nested sub-controls and group controls).
 */
export function countControls(catalog: Catalog): number {
  let count = 0

  function countInControls(controls?: Catalog['controls']): void {
    if (!controls) return
    for (const control of controls) {
      count++
      if (control.controls) {
        countInControls(control.controls)
      }
    }
  }

  function countInGroups(groups?: Catalog['groups']): void {
    if (!groups) return
    for (const group of groups) {
      countInControls(group.controls)
      if (group.groups) {
        countInGroups(group.groups)
      }
    }
  }

  countInControls(catalog.controls)
  countInGroups(catalog.groups)

  return count
}
