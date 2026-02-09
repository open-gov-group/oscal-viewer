/**
 * ParamSubstitutor — Replaces OSCAL parameter insertion placeholders in prose text.
 *
 * OSCAL prose may contain `{{ insert: param, <param-id> }}` placeholders.
 * This service substitutes them with the parameter's resolved value.
 * Domain Layer: no Preact imports, no side effects.
 */
import type { Parameter } from '@/types/oscal'

/** Result segment from substitution — either literal text or a substituted parameter. */
export interface ProseSegment {
  /** Segment type: 'text' for literal prose, 'param' for a substituted parameter value. */
  type: 'text' | 'param'
  /** The display content — either raw text or the resolved parameter value. */
  content: string
  /** The OSCAL parameter ID, present only for 'param' segments. */
  paramId?: string
}

/** Regex for OSCAL parameter placeholders: {{ insert: param, <param-id> }} */
const PARAM_PLACEHOLDER = /\{\{\s*insert:\s*param,\s*([^}\s]+)\s*\}\}/g

/**
 * Parse prose text into segments, replacing parameter placeholders with values.
 *
 * Splits the prose at each `{{ insert: param, id }}` placeholder and produces
 * an array of ProseSegment objects. Matched parameters are resolved via paramMap;
 * unmatched parameters emit the raw placeholder as a text segment (graceful degradation).
 *
 * @param prose - The OSCAL prose string potentially containing placeholders.
 * @param paramMap - Map of parameter ID to display value.
 * @returns Array of ProseSegment objects for rendering.
 */
export function substituteProse(prose: string, paramMap: Map<string, string>): ProseSegment[] {
  const segments: ProseSegment[] = []
  let lastIndex = 0

  // Reset regex state for reuse
  PARAM_PLACEHOLDER.lastIndex = 0

  let match: RegExpExecArray | null
  while ((match = PARAM_PLACEHOLDER.exec(prose)) !== null) {
    // Emit text before this match
    if (match.index > lastIndex) {
      segments.push({ type: 'text', content: prose.slice(lastIndex, match.index) })
    }

    const paramId = match[1]
    const resolved = paramMap.get(paramId)

    if (resolved !== undefined) {
      segments.push({ type: 'param', content: resolved, paramId })
    } else {
      // Graceful degradation: emit raw placeholder as text
      segments.push({ type: 'text', content: match[0] })
    }

    lastIndex = PARAM_PLACEHOLDER.lastIndex
  }

  // Emit trailing text after last match
  if (lastIndex < prose.length) {
    segments.push({ type: 'text', content: prose.slice(lastIndex) })
  }

  return segments
}

/**
 * Build a parameter value map from OSCAL Parameters.
 *
 * Priority: values[0] > select.choice (joined with " | ") > label > "[param-id]" fallback.
 *
 * @param params - Array of OSCAL Parameter objects.
 * @returns Map of parameter ID to display value string.
 */
export function buildParamMap(params: Parameter[]): Map<string, string> {
  const map = new Map<string, string>()

  for (const param of params) {
    let value: string

    if (param.values && param.values.length > 0) {
      value = param.values[0]
    } else if (param.select?.choice && param.select.choice.length > 0) {
      value = param.select.choice.join(' | ')
    } else if (param.label) {
      value = param.label
    } else {
      value = `[${param.id}]`
    }

    map.set(param.id, value)
  }

  return map
}
