import type { ComponentDefinition, ParseResult } from '@/types/oscal'
import { isObject, extractMetadata } from './detect'

/**
 * Parse a raw OSCAL component-definition document object (the inner value, not the wrapper).
 * Validates required fields: uuid, metadata.
 */
export function parseComponentDefinition(raw: unknown): ParseResult<ComponentDefinition> {
  if (!isObject(raw)) {
    return { success: false, error: 'Component definition document is not an object' }
  }

  if (typeof raw.uuid !== 'string' || raw.uuid.length === 0) {
    return { success: false, error: 'Component definition is missing required field: uuid' }
  }

  const metadata = extractMetadata(raw)
  if (!metadata) {
    return { success: false, error: 'Component definition is missing valid metadata (requires title, oscal-version)' }
  }

  const componentDef: ComponentDefinition = {
    uuid: raw.uuid as string,
    metadata,
    'import-component-definitions': Array.isArray(raw['import-component-definitions'])
      ? raw['import-component-definitions']
      : undefined,
    components: Array.isArray(raw.components) ? raw.components : undefined,
    capabilities: Array.isArray(raw.capabilities) ? raw.capabilities : undefined,
    'back-matter': isObject(raw['back-matter']) ? raw['back-matter'] as ComponentDefinition['back-matter'] : undefined,
  }

  return { success: true, data: componentDef }
}
