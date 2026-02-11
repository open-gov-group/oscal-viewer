/**
 * Differ Service — Pure functions for comparing two OSCAL documents of the same type.
 *
 * Uses Map-based set operations on stable OSCAL identifiers (control.id, param.id, uuid)
 * to produce semantic diffs. Zero external dependencies.
 */
import type {
  Metadata,
  Catalog,
  Control,
  Group,
  Parameter,
  Profile,
  ProfileImport,
  SetParameter,
  Alter,
  ComponentDefinition,
  DefinedComponent,
  SystemSecurityPlan,
  SystemComponent,
  AssessmentResults,
  AssessmentResult,
  Finding,
  Observation,
  Risk,
  PlanOfActionAndMilestones,
  PoamItem,
} from '@/types/oscal'
import type {
  DiffEntry,
  DiffSummary,
  DiffSection,
  MetadataDiff,
  DocumentDiffResult,
} from '@/types/diff'

// ============================================================
// Generic diffByKey
// ============================================================

/**
 * Generic key-based set diff. Matches items by a stable key, then compares fields.
 * Items only in left are 'removed', only in right are 'added',
 * in both with differences are 'modified', otherwise 'unchanged'.
 */
export function diffByKey<T>(
  leftItems: T[],
  rightItems: T[],
  getKey: (item: T) => string,
  getLabel: (item: T) => string,
  compareFields: (left: T, right: T) => string[]
): DiffEntry<T>[] {
  const leftMap = new Map(leftItems.map(item => [getKey(item), item]))
  const rightMap = new Map(rightItems.map(item => [getKey(item), item]))
  const result: DiffEntry<T>[] = []

  for (const [key, leftItem] of leftMap) {
    const rightItem = rightMap.get(key)
    if (!rightItem) {
      result.push({ status: 'removed', key, label: getLabel(leftItem), left: leftItem })
    } else {
      const changes = compareFields(leftItem, rightItem)
      result.push({
        status: changes.length > 0 ? 'modified' : 'unchanged',
        key,
        label: getLabel(leftItem),
        left: leftItem,
        right: rightItem,
        changes: changes.length > 0 ? changes : undefined,
      })
    }
  }

  for (const [key, rightItem] of rightMap) {
    if (!leftMap.has(key)) {
      result.push({ status: 'added', key, label: getLabel(rightItem), right: rightItem })
    }
  }

  return result
}

/** Build a DiffSummary from a list of DiffEntry items. */
export function buildSummary<T>(entries: DiffEntry<T>[]): DiffSummary {
  const summary: DiffSummary = { added: 0, removed: 0, modified: 0, unchanged: 0, total: entries.length }
  for (const entry of entries) {
    summary[entry.status]++
  }
  return summary
}

/** Merge multiple DiffSummary objects into one. */
function mergeSummaries(summaries: DiffSummary[]): DiffSummary {
  const result: DiffSummary = { added: 0, removed: 0, modified: 0, unchanged: 0, total: 0 }
  for (const s of summaries) {
    result.added += s.added
    result.removed += s.removed
    result.modified += s.modified
    result.unchanged += s.unchanged
    result.total += s.total
  }
  return result
}

// ============================================================
// Metadata Diff
// ============================================================

/** Compare two metadata sections field by field. */
export function diffMetadata(left: Metadata, right: Metadata): MetadataDiff {
  return {
    titleChanged: left.title !== right.title,
    versionChanged: left.version !== right.version,
    oscalVersionChanged: left['oscal-version'] !== right['oscal-version'],
    lastModifiedChanged: left['last-modified'] !== right['last-modified'],
    left: {
      title: left.title,
      version: left.version,
      oscalVersion: left['oscal-version'],
      lastModified: left['last-modified'],
    },
    right: {
      title: right.title,
      version: right.version,
      oscalVersion: right['oscal-version'],
      lastModified: right['last-modified'],
    },
  }
}

// ============================================================
// Helpers
// ============================================================

/** Collect all controls from a catalog, flattening groups recursively. */
export function getAllControls(catalog: Catalog): Control[] {
  const controls: Control[] = []
  const collectFromGroups = (groups?: Group[]) => {
    if (!groups) return
    for (const g of groups) {
      if (g.controls) controls.push(...g.controls)
      collectFromGroups(g.groups)
    }
  }
  if (catalog.controls) controls.push(...catalog.controls)
  collectFromGroups(catalog.groups)
  return controls
}

/** Extract all top-level groups from a catalog (non-recursive). */
function getTopGroups(catalog: Catalog): Group[] {
  return catalog.groups ?? []
}

/** Extract prose text from a control's parts, concatenated. */
function getControlProse(control: Control): string {
  if (!control.parts) return ''
  return control.parts.map(p => p.prose ?? '').filter(Boolean).join('\n')
}

// ============================================================
// Field Comparators
// ============================================================

function compareControlFields(left: Control, right: Control): string[] {
  const changes: string[] = []
  if (left.title !== right.title) changes.push(`Title: "${left.title}" → "${right.title}"`)
  if ((left.class ?? '') !== (right.class ?? '')) changes.push(`Class: "${left.class ?? 'none'}" → "${right.class ?? 'none'}"`)
  if ((left.params?.length ?? 0) !== (right.params?.length ?? 0))
    changes.push(`Parameters: ${left.params?.length ?? 0} → ${right.params?.length ?? 0}`)
  if ((left.props?.length ?? 0) !== (right.props?.length ?? 0))
    changes.push(`Properties: ${left.props?.length ?? 0} → ${right.props?.length ?? 0}`)
  const leftProse = getControlProse(left)
  const rightProse = getControlProse(right)
  if (leftProse !== rightProse) changes.push('Prose content changed')
  if ((left.links?.length ?? 0) !== (right.links?.length ?? 0))
    changes.push(`Links: ${left.links?.length ?? 0} → ${right.links?.length ?? 0}`)
  if ((left.controls?.length ?? 0) !== (right.controls?.length ?? 0))
    changes.push(`Sub-controls: ${left.controls?.length ?? 0} → ${right.controls?.length ?? 0}`)
  return changes
}

function compareGroupFields(left: Group, right: Group): string[] {
  const changes: string[] = []
  if (left.title !== right.title) changes.push(`Title: "${left.title}" → "${right.title}"`)
  if ((left.controls?.length ?? 0) !== (right.controls?.length ?? 0))
    changes.push(`Controls: ${left.controls?.length ?? 0} → ${right.controls?.length ?? 0}`)
  if ((left.groups?.length ?? 0) !== (right.groups?.length ?? 0))
    changes.push(`Sub-groups: ${left.groups?.length ?? 0} → ${right.groups?.length ?? 0}`)
  return changes
}

function compareParameterFields(left: Parameter, right: Parameter): string[] {
  const changes: string[] = []
  if ((left.label ?? '') !== (right.label ?? '')) changes.push(`Label: "${left.label ?? ''}" → "${right.label ?? ''}"`)
  const leftVals = (left.values ?? []).join(', ')
  const rightVals = (right.values ?? []).join(', ')
  if (leftVals !== rightVals) changes.push(`Values: "${leftVals}" → "${rightVals}"`)
  return changes
}

function compareImportFields(left: ProfileImport, right: ProfileImport): string[] {
  const changes: string[] = []
  const leftInc = JSON.stringify(left['include-controls'] ?? left['include-all'] ?? {})
  const rightInc = JSON.stringify(right['include-controls'] ?? right['include-all'] ?? {})
  if (leftInc !== rightInc) changes.push('Include selections changed')
  const leftExc = JSON.stringify(left['exclude-controls'] ?? {})
  const rightExc = JSON.stringify(right['exclude-controls'] ?? {})
  if (leftExc !== rightExc) changes.push('Exclude selections changed')
  return changes
}

function compareSetParameterFields(left: SetParameter, right: SetParameter): string[] {
  const changes: string[] = []
  if ((left.label ?? '') !== (right.label ?? '')) changes.push(`Label: "${left.label ?? ''}" → "${right.label ?? ''}"`)
  const leftVals = (left.values ?? []).join(', ')
  const rightVals = (right.values ?? []).join(', ')
  if (leftVals !== rightVals) changes.push(`Values: "${leftVals}" → "${rightVals}"`)
  if (JSON.stringify(left.select ?? null) !== JSON.stringify(right.select ?? null)) changes.push('Selection changed')
  return changes
}

function compareAlterFields(left: Alter, right: Alter): string[] {
  const changes: string[] = []
  if ((left.removes?.length ?? 0) !== (right.removes?.length ?? 0))
    changes.push(`Removes: ${left.removes?.length ?? 0} → ${right.removes?.length ?? 0}`)
  if ((left.adds?.length ?? 0) !== (right.adds?.length ?? 0))
    changes.push(`Adds: ${left.adds?.length ?? 0} → ${right.adds?.length ?? 0}`)
  return changes
}

function compareComponentFields(left: DefinedComponent, right: DefinedComponent): string[] {
  const changes: string[] = []
  if (left.title !== right.title) changes.push(`Title: "${left.title}" → "${right.title}"`)
  if (left.type !== right.type) changes.push(`Type: "${left.type}" → "${right.type}"`)
  if (left.description !== right.description) changes.push('Description changed')
  const leftImpl = left['control-implementations']?.length ?? 0
  const rightImpl = right['control-implementations']?.length ?? 0
  if (leftImpl !== rightImpl) changes.push(`Control implementations: ${leftImpl} → ${rightImpl}`)
  return changes
}

function compareSspImplReqFields(
  left: { 'control-id': string; 'by-components'?: unknown[]; statements?: unknown[]; remarks?: string },
  right: { 'control-id': string; 'by-components'?: unknown[]; statements?: unknown[]; remarks?: string }
): string[] {
  const changes: string[] = []
  if ((left['by-components']?.length ?? 0) !== (right['by-components']?.length ?? 0))
    changes.push(`By-components: ${left['by-components']?.length ?? 0} → ${right['by-components']?.length ?? 0}`)
  if ((left.statements?.length ?? 0) !== (right.statements?.length ?? 0))
    changes.push(`Statements: ${left.statements?.length ?? 0} → ${right.statements?.length ?? 0}`)
  if ((left.remarks ?? '') !== (right.remarks ?? '')) changes.push('Remarks changed')
  return changes
}

function compareSystemComponentFields(left: SystemComponent, right: SystemComponent): string[] {
  const changes: string[] = []
  if (left.title !== right.title) changes.push(`Title: "${left.title}" → "${right.title}"`)
  if (left.type !== right.type) changes.push(`Type: "${left.type}" → "${right.type}"`)
  if (left.status.state !== right.status.state) changes.push(`Status: "${left.status.state}" → "${right.status.state}"`)
  if (left.description !== right.description) changes.push('Description changed')
  return changes
}

function compareFindingFields(left: Finding, right: Finding): string[] {
  const changes: string[] = []
  if (left.title !== right.title) changes.push(`Title: "${left.title}" → "${right.title}"`)
  if (left.target.status.state !== right.target.status.state)
    changes.push(`Status: "${left.target.status.state}" → "${right.target.status.state}"`)
  if (left.target['target-id'] !== right.target['target-id'])
    changes.push(`Target: "${left.target['target-id']}" → "${right.target['target-id']}"`)
  if (left.description !== right.description) changes.push('Description changed')
  return changes
}

function compareObservationFields(left: Observation, right: Observation): string[] {
  const changes: string[] = []
  if (left.description !== right.description) changes.push('Description changed')
  const leftMethods = (left.methods ?? []).join(', ')
  const rightMethods = (right.methods ?? []).join(', ')
  if (leftMethods !== rightMethods) changes.push(`Methods: "${leftMethods}" → "${rightMethods}"`)
  if (left.collected !== right.collected) changes.push(`Collected: "${left.collected}" → "${right.collected}"`)
  return changes
}

function compareRiskFields(left: Risk, right: Risk): string[] {
  const changes: string[] = []
  if (left.title !== right.title) changes.push(`Title: "${left.title}" → "${right.title}"`)
  if (left.status !== right.status) changes.push(`Status: "${left.status}" → "${right.status}"`)
  if (left.description !== right.description) changes.push('Description changed')
  return changes
}

function comparePoamItemFields(left: PoamItem, right: PoamItem): string[] {
  const changes: string[] = []
  if (left.title !== right.title) changes.push(`Title: "${left.title}" → "${right.title}"`)
  if (left.description !== right.description) changes.push('Description changed')
  if ((left.milestones?.length ?? 0) !== (right.milestones?.length ?? 0))
    changes.push(`Milestones: ${left.milestones?.length ?? 0} → ${right.milestones?.length ?? 0}`)
  return changes
}

// ============================================================
// Document-Type-Specific Diffs
// ============================================================

/** Compare two Catalogs. Sections: Controls, Groups, Parameters. */
export function diffCatalog(left: Catalog, right: Catalog): DocumentDiffResult {
  const metadata = diffMetadata(left.metadata, right.metadata)

  const controlEntries = diffByKey(
    getAllControls(left), getAllControls(right),
    c => c.id, c => `${c.id} — ${c.title}`,
    compareControlFields
  )
  const controlSection: DiffSection = { title: 'Controls', summary: buildSummary(controlEntries), entries: controlEntries }

  const groupEntries = diffByKey(
    getTopGroups(left), getTopGroups(right),
    g => g.id ?? g.title, g => g.id ? `${g.id} — ${g.title}` : g.title,
    compareGroupFields
  )
  const groupSection: DiffSection = { title: 'Groups', summary: buildSummary(groupEntries), entries: groupEntries }

  const paramEntries = diffByKey(
    left.params ?? [], right.params ?? [],
    p => p.id, p => p.id,
    compareParameterFields
  )
  const paramSection: DiffSection = { title: 'Parameters', summary: buildSummary(paramEntries), entries: paramEntries }

  const sections = [controlSection, groupSection, paramSection].filter(s => s.entries.length > 0)
  return { type: 'catalog', metadata, summary: mergeSummaries(sections.map(s => s.summary)), sections }
}

/** Compare two Profiles. Sections: Imports, Set-Parameters, Alterations. */
export function diffProfile(left: Profile, right: Profile): DocumentDiffResult {
  const metadata = diffMetadata(left.metadata, right.metadata)

  const importEntries = diffByKey(
    left.imports ?? [], right.imports ?? [],
    i => i.href, i => i.href,
    compareImportFields
  )
  const importSection: DiffSection = { title: 'Imports', summary: buildSummary(importEntries), entries: importEntries }

  const setParamEntries = diffByKey(
    left.modify?.['set-parameters'] ?? [], right.modify?.['set-parameters'] ?? [],
    sp => sp['param-id'], sp => sp['param-id'],
    compareSetParameterFields
  )
  const setParamSection: DiffSection = { title: 'Set-Parameters', summary: buildSummary(setParamEntries), entries: setParamEntries }

  const alterEntries = diffByKey(
    left.modify?.alters ?? [], right.modify?.alters ?? [],
    a => a['control-id'], a => a['control-id'],
    compareAlterFields
  )
  const alterSection: DiffSection = { title: 'Alterations', summary: buildSummary(alterEntries), entries: alterEntries }

  const sections = [importSection, setParamSection, alterSection].filter(s => s.entries.length > 0)
  return { type: 'profile', metadata, summary: mergeSummaries(sections.map(s => s.summary)), sections }
}

/** Compare two ComponentDefinitions. Section: Components. */
export function diffComponentDef(left: ComponentDefinition, right: ComponentDefinition): DocumentDiffResult {
  const metadata = diffMetadata(left.metadata, right.metadata)

  const compEntries = diffByKey(
    left.components ?? [], right.components ?? [],
    c => c.uuid, c => c.title,
    compareComponentFields
  )
  const compSection: DiffSection = { title: 'Components', summary: buildSummary(compEntries), entries: compEntries }

  const sections = [compSection].filter(s => s.entries.length > 0)
  return { type: 'component-definition', metadata, summary: mergeSummaries(sections.map(s => s.summary)), sections }
}

/** Compare two SSPs. Sections: Implemented Requirements, System Components. */
export function diffSsp(left: SystemSecurityPlan, right: SystemSecurityPlan): DocumentDiffResult {
  const metadata = diffMetadata(left.metadata, right.metadata)

  const implReqEntries = diffByKey(
    left['control-implementation']['implemented-requirements'],
    right['control-implementation']['implemented-requirements'],
    r => r['control-id'], r => r['control-id'],
    compareSspImplReqFields
  )
  const implReqSection: DiffSection = { title: 'Implemented Requirements', summary: buildSummary(implReqEntries), entries: implReqEntries }

  const sysCompEntries = diffByKey(
    left['system-implementation'].components ?? [],
    right['system-implementation'].components ?? [],
    c => c.uuid, c => c.title,
    compareSystemComponentFields
  )
  const sysCompSection: DiffSection = { title: 'System Components', summary: buildSummary(sysCompEntries), entries: sysCompEntries }

  const sections = [implReqSection, sysCompSection].filter(s => s.entries.length > 0)
  return { type: 'system-security-plan', metadata, summary: mergeSummaries(sections.map(s => s.summary)), sections }
}

/** Collect all findings, observations, and risks from all result entries. */
function collectFromResults(results: AssessmentResult[]): { findings: Finding[]; observations: Observation[]; risks: Risk[] } {
  const findings: Finding[] = []
  const observations: Observation[] = []
  const risks: Risk[] = []
  for (const r of results) {
    if (r.findings) findings.push(...r.findings)
    if (r.observations) observations.push(...r.observations)
    if (r.risks) risks.push(...r.risks)
  }
  return { findings, observations, risks }
}

/** Compare two AssessmentResults. Sections: Findings, Observations, Risks. */
export function diffAssessmentResults(left: AssessmentResults, right: AssessmentResults): DocumentDiffResult {
  const metadata = diffMetadata(left.metadata, right.metadata)
  const leftData = collectFromResults(left.results)
  const rightData = collectFromResults(right.results)

  const findingEntries = diffByKey(
    leftData.findings, rightData.findings,
    f => f.uuid, f => f.title,
    compareFindingFields
  )
  const findingSection: DiffSection = { title: 'Findings', summary: buildSummary(findingEntries), entries: findingEntries }

  const obsEntries = diffByKey(
    leftData.observations, rightData.observations,
    o => o.uuid, o => o.title ?? o.uuid.slice(0, 8),
    compareObservationFields
  )
  const obsSection: DiffSection = { title: 'Observations', summary: buildSummary(obsEntries), entries: obsEntries }

  const riskEntries = diffByKey(
    leftData.risks, rightData.risks,
    r => r.uuid, r => r.title,
    compareRiskFields
  )
  const riskSection: DiffSection = { title: 'Risks', summary: buildSummary(riskEntries), entries: riskEntries }

  const sections = [findingSection, obsSection, riskSection].filter(s => s.entries.length > 0)
  return { type: 'assessment-results', metadata, summary: mergeSummaries(sections.map(s => s.summary)), sections }
}

/** Compare two POA&M documents. Section: POA&M Items. */
export function diffPoam(left: PlanOfActionAndMilestones, right: PlanOfActionAndMilestones): DocumentDiffResult {
  const metadata = diffMetadata(left.metadata, right.metadata)

  const itemEntries = diffByKey(
    left['poam-items'] ?? [], right['poam-items'] ?? [],
    i => i.uuid, i => i.title,
    comparePoamItemFields
  )
  const itemSection: DiffSection = { title: 'POA&M Items', summary: buildSummary(itemEntries), entries: itemEntries }

  const sections = [itemSection].filter(s => s.entries.length > 0)
  return { type: 'plan-of-action-and-milestones', metadata, summary: mergeSummaries(sections.map(s => s.summary)), sections }
}

/** Dispatch to the correct type-specific diff function based on document type. */
export function diffDocuments(
  type: string,
  leftDoc: unknown,
  rightDoc: unknown
): DocumentDiffResult {
  switch (type) {
    case 'catalog':
      return diffCatalog(leftDoc as Catalog, rightDoc as Catalog)
    case 'profile':
      return diffProfile(leftDoc as Profile, rightDoc as Profile)
    case 'component-definition':
      return diffComponentDef(leftDoc as ComponentDefinition, rightDoc as ComponentDefinition)
    case 'system-security-plan':
      return diffSsp(leftDoc as SystemSecurityPlan, rightDoc as SystemSecurityPlan)
    case 'assessment-results':
      return diffAssessmentResults(leftDoc as AssessmentResults, rightDoc as AssessmentResults)
    case 'plan-of-action-and-milestones':
      return diffPoam(leftDoc as PlanOfActionAndMilestones, rightDoc as PlanOfActionAndMilestones)
    default:
      throw new Error(`Unsupported document type for comparison: ${type}`)
  }
}
