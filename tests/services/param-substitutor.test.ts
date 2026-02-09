import { substituteProse, buildParamMap } from '@/services/param-substitutor'
import type { Parameter } from '@/types/oscal'

// ============================================================
// substituteProse Tests
// ============================================================

describe('substituteProse', () => {
  const paramMap = new Map<string, string>([
    ['param1', 'Value1'],
    ['param2', 'Value2'],
  ])

  it('returns single text segment when no placeholders', () => {
    const segments = substituteProse('plain text without placeholders', paramMap)
    expect(segments).toHaveLength(1)
    expect(segments[0].type).toBe('text')
    expect(segments[0].content).toBe('plain text without placeholders')
  })

  it('substitutes single parameter', () => {
    const segments = substituteProse('before {{ insert: param, param1 }} after', paramMap)
    expect(segments).toHaveLength(3)
    expect(segments[0]).toEqual({ type: 'text', content: 'before ' })
    expect(segments[1]).toEqual({ type: 'param', content: 'Value1', paramId: 'param1' })
    expect(segments[2]).toEqual({ type: 'text', content: ' after' })
  })

  it('substitutes multiple different parameters', () => {
    const segments = substituteProse(
      '{{ insert: param, param1 }} and {{ insert: param, param2 }}',
      paramMap,
    )
    expect(segments).toHaveLength(3)
    expect(segments[0]).toEqual({ type: 'param', content: 'Value1', paramId: 'param1' })
    expect(segments[1]).toEqual({ type: 'text', content: ' and ' })
    expect(segments[2]).toEqual({ type: 'param', content: 'Value2', paramId: 'param2' })
  })

  it('handles unknown parameter (returns raw placeholder text)', () => {
    const segments = substituteProse('value is {{ insert: param, unknown-id }}', paramMap)
    expect(segments).toHaveLength(2)
    expect(segments[0]).toEqual({ type: 'text', content: 'value is ' })
    expect(segments[1]).toEqual({ type: 'text', content: '{{ insert: param, unknown-id }}' })
  })

  it('handles adjacent parameters (no text between)', () => {
    const segments = substituteProse(
      '{{ insert: param, param1 }}{{ insert: param, param2 }}',
      paramMap,
    )
    expect(segments).toHaveLength(2)
    expect(segments[0]).toEqual({ type: 'param', content: 'Value1', paramId: 'param1' })
    expect(segments[1]).toEqual({ type: 'param', content: 'Value2', paramId: 'param2' })
  })

  it('handles empty string', () => {
    const segments = substituteProse('', paramMap)
    expect(segments).toHaveLength(0)
  })

  it('handles prose with only a placeholder', () => {
    const segments = substituteProse('{{ insert: param, param1 }}', paramMap)
    expect(segments).toHaveLength(1)
    expect(segments[0]).toEqual({ type: 'param', content: 'Value1', paramId: 'param1' })
  })

  it('handles placeholder at start of string', () => {
    const segments = substituteProse('{{ insert: param, param1 }} trailing text', paramMap)
    expect(segments).toHaveLength(2)
    expect(segments[0]).toEqual({ type: 'param', content: 'Value1', paramId: 'param1' })
    expect(segments[1]).toEqual({ type: 'text', content: ' trailing text' })
  })

  it('handles placeholder at end of string', () => {
    const segments = substituteProse('leading text {{ insert: param, param2 }}', paramMap)
    expect(segments).toHaveLength(2)
    expect(segments[0]).toEqual({ type: 'text', content: 'leading text ' })
    expect(segments[1]).toEqual({ type: 'param', content: 'Value2', paramId: 'param2' })
  })

  it('handles placeholder with extra spaces', () => {
    const segments = substituteProse('text {{  insert:  param,  param1  }} end', paramMap)
    expect(segments).toHaveLength(3)
    expect(segments[1].type).toBe('param')
    expect(segments[1].content).toBe('Value1')
    expect(segments[1].paramId).toBe('param1')
  })
})

// ============================================================
// buildParamMap Tests
// ============================================================

describe('buildParamMap', () => {
  it('uses values[0] as highest priority', () => {
    const params: Parameter[] = [
      { id: 'p1', values: ['first-value', 'second'], label: 'My Label', select: { choice: ['a', 'b'] } },
    ]
    const map = buildParamMap(params)
    expect(map.get('p1')).toBe('first-value')
  })

  it('uses select.choice joined with " | " when no values', () => {
    const params: Parameter[] = [
      { id: 'p1', select: { choice: ['option-a', 'option-b', 'option-c'] } },
    ]
    const map = buildParamMap(params)
    expect(map.get('p1')).toBe('option-a | option-b | option-c')
  })

  it('uses label when no values and no select', () => {
    const params: Parameter[] = [
      { id: 'p1', label: 'assignment: frequency' },
    ]
    const map = buildParamMap(params)
    expect(map.get('p1')).toBe('assignment: frequency')
  })

  it('uses [param-id] fallback when nothing else', () => {
    const params: Parameter[] = [
      { id: 'lonely-param' },
    ]
    const map = buildParamMap(params)
    expect(map.get('lonely-param')).toBe('[lonely-param]')
  })

  it('handles empty params array', () => {
    const map = buildParamMap([])
    expect(map.size).toBe(0)
  })

  it('handles multiple parameters', () => {
    const params: Parameter[] = [
      { id: 'p1', values: ['val1'] },
      { id: 'p2', label: 'Label 2' },
      { id: 'p3', select: { choice: ['x', 'y'] } },
    ]
    const map = buildParamMap(params)
    expect(map.size).toBe(3)
    expect(map.get('p1')).toBe('val1')
    expect(map.get('p2')).toBe('Label 2')
    expect(map.get('p3')).toBe('x | y')
  })

  it('ignores undefined values/select/label gracefully', () => {
    const params: Parameter[] = [
      { id: 'p1', values: undefined, select: undefined, label: undefined },
    ]
    const map = buildParamMap(params)
    expect(map.get('p1')).toBe('[p1]')
  })

  it('uses first value only when multiple values exist', () => {
    const params: Parameter[] = [
      { id: 'p1', values: ['primary', 'secondary', 'tertiary'] },
    ]
    const map = buildParamMap(params)
    expect(map.get('p1')).toBe('primary')
  })
})
