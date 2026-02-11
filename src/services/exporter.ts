/**
 * Exporter — Pure functions to export OSCAL documents as JSON, Markdown, or CSV.
 *
 * All functions are stateless and framework-independent (Domain layer).
 * JSON export produces the standard OSCAL envelope format.
 * Markdown produces a human-readable summary.
 * CSV produces a type-specific tabular representation.
 */
import type {
  OscalDocumentData,
  Catalog,
  Profile,
  ComponentDefinition,
  SystemSecurityPlan,
  AssessmentResults,
  PlanOfActionAndMilestones,
  Control,
  Metadata,
} from '@/types/oscal'

// ============================================================
// JSON Export
// ============================================================

/** Export the OSCAL document as JSON with the standard envelope key. */
export function exportToJson(data: OscalDocumentData): string {
  const envelopeKey = data.type === 'system-security-plan'
    ? 'system-security-plan'
    : data.type === 'component-definition'
      ? 'component-definition'
      : data.type === 'assessment-results'
        ? 'assessment-results'
        : data.type === 'plan-of-action-and-milestones'
          ? 'plan-of-action-and-milestones'
          : data.type
  return JSON.stringify({ [envelopeKey]: data.document }, null, 2)
}

// ============================================================
// Markdown Export
// ============================================================

/** Export the OSCAL document as human-readable Markdown. */
export function exportToMarkdown(data: OscalDocumentData): string {
  const meta = data.document.metadata
  const lines: string[] = [
    `# ${meta.title}`,
    '',
    formatMetadataSection(meta),
    '',
  ]

  switch (data.type) {
    case 'catalog':
      lines.push(...markdownCatalog(data.document))
      break
    case 'profile':
      lines.push(...markdownProfile(data.document))
      break
    case 'component-definition':
      lines.push(...markdownComponentDef(data.document))
      break
    case 'system-security-plan':
      lines.push(...markdownSsp(data.document))
      break
    case 'assessment-results':
      lines.push(...markdownAR(data.document))
      break
    case 'plan-of-action-and-milestones':
      lines.push(...markdownPoam(data.document))
      break
  }

  return lines.join('\n')
}

function formatMetadataSection(meta: Metadata): string {
  const lines = [
    '## Metadata',
    '',
    `- **Version**: ${meta.version}`,
    `- **OSCAL Version**: ${meta['oscal-version']}`,
    `- **Last Modified**: ${meta['last-modified']}`,
  ]
  if (meta.published) lines.push(`- **Published**: ${meta.published}`)
  if (meta.roles?.length) {
    lines.push(`- **Roles**: ${meta.roles.map(r => r.title).join(', ')}`)
  }
  if (meta.parties?.length) {
    lines.push(`- **Parties**: ${meta.parties.map(p => p.name ?? p.uuid).join(', ')}`)
  }
  return lines.join('\n')
}

function markdownControls(controls: Control[], depth = 3): string[] {
  const lines: string[] = []
  const prefix = '#'.repeat(Math.min(depth, 6))
  for (const c of controls) {
    lines.push(`${prefix} ${c.id}: ${c.title}`, '')
    if (c.parts) {
      for (const p of c.parts) {
        if (p.prose) lines.push(p.prose, '')
      }
    }
    if (c.controls) {
      lines.push(...markdownControls(c.controls, depth + 1))
    }
  }
  return lines
}

function markdownCatalog(catalog: Catalog): string[] {
  const lines: string[] = ['## Controls', '']
  if (catalog.groups) {
    for (const group of catalog.groups) {
      lines.push(`### ${group.id ? `${group.id}: ` : ''}${group.title}`, '')
      if (group.controls) {
        lines.push(...markdownControls(group.controls, 4))
      }
    }
  }
  if (catalog.controls) {
    lines.push(...markdownControls(catalog.controls))
  }
  return lines
}

function markdownProfile(profile: Profile): string[] {
  const lines: string[] = ['## Imports', '']
  for (const imp of profile.imports) {
    const ids = imp['include-controls']?.flatMap(s => s['with-ids'] ?? []) ?? []
    lines.push(`- **${imp.href}**${ids.length ? ` (${ids.join(', ')})` : ''}`)
  }
  lines.push('')
  if (profile.modify?.alters?.length) {
    lines.push('## Alterations', '')
    for (const alter of profile.modify.alters) {
      lines.push(`- ${alter['control-id']}`)
    }
    lines.push('')
  }
  if (profile.modify?.['set-parameters']?.length) {
    lines.push('## Parameters', '')
    for (const sp of profile.modify['set-parameters']) {
      lines.push(`- **${sp['param-id']}**: ${sp.values?.join(', ') ?? '(no value)'}`)
    }
    lines.push('')
  }
  return lines
}

function markdownComponentDef(compDef: ComponentDefinition): string[] {
  const lines: string[] = ['## Components', '']
  if (compDef.components) {
    for (const comp of compDef.components) {
      lines.push(`### ${comp.title}`, '', `- **Type**: ${comp.type}`, `- **Description**: ${comp.description}`, '')
      if (comp['control-implementations']) {
        for (const ci of comp['control-implementations']) {
          lines.push(`#### Control Implementations (${ci['implemented-requirements'].length})`, '')
          for (const req of ci['implemented-requirements']) {
            lines.push(`- **${req['control-id']}**: ${req.description}`)
          }
          lines.push('')
        }
      }
    }
  }
  return lines
}

function markdownSsp(ssp: SystemSecurityPlan): string[] {
  const sc = ssp['system-characteristics']
  const lines: string[] = [
    '## System Characteristics', '',
    `- **System Name**: ${sc['system-name']}`,
    `- **Description**: ${sc.description}`,
    `- **Status**: ${sc.status.state}`,
    '',
    '## Implemented Requirements', '',
  ]
  for (const req of ssp['control-implementation']['implemented-requirements']) {
    const desc = req['by-components']?.map(bc => bc.description).join('; ') ?? req.remarks ?? ''
    lines.push(`- **${req['control-id']}**: ${desc}`)
  }
  lines.push('')
  return lines
}

function markdownAR(ar: AssessmentResults): string[] {
  const lines: string[] = []
  for (const result of ar.results) {
    lines.push(`## ${result.title}`, '', `${result.description}`, '')
    if (result.findings?.length) {
      lines.push('### Findings', '')
      for (const f of result.findings) {
        lines.push(`- **${f.target['target-id']}** — ${f.target.status.state}: ${f.title}`)
      }
      lines.push('')
    }
  }
  return lines
}

function markdownPoam(poam: PlanOfActionAndMilestones): string[] {
  const lines: string[] = ['## POA&M Items', '']
  for (const item of poam['poam-items']) {
    lines.push(`### ${item.title}`, '', item.description, '')
    if (item.milestones?.length) {
      for (const m of item.milestones) {
        lines.push(`- Milestone: ${m.title}`)
      }
      lines.push('')
    }
  }
  return lines
}

// ============================================================
// CSV Export
// ============================================================

/** Export the OSCAL document as CSV with type-specific columns. */
export function exportToCsv(data: OscalDocumentData): string {
  switch (data.type) {
    case 'catalog':
      return csvCatalog(data.document)
    case 'profile':
      return csvProfile(data.document)
    case 'component-definition':
      return csvComponentDef(data.document)
    case 'system-security-plan':
      return csvSsp(data.document)
    case 'assessment-results':
      return csvAR(data.document)
    case 'plan-of-action-and-milestones':
      return csvPoam(data.document)
  }
}

/** Escape a CSV field value: wrap in quotes if it contains commas, quotes, or newlines. */
export function csvEscape(value: string): string {
  if (value.includes('"') || value.includes(',') || value.includes('\n') || value.includes('\r')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

function csvRow(fields: string[]): string {
  return fields.map(csvEscape).join(',')
}

function flattenControls(controls: Control[], groupTitle?: string): string[][] {
  const rows: string[][] = []
  for (const c of controls) {
    const prose = c.parts?.map(p => p.prose ?? '').filter(Boolean).join(' ') ?? ''
    rows.push([c.id, c.title, c.class ?? '', groupTitle ?? '', prose])
    if (c.controls) {
      rows.push(...flattenControls(c.controls, groupTitle))
    }
  }
  return rows
}

function csvCatalog(catalog: Catalog): string {
  const header = csvRow(['control-id', 'title', 'class', 'group', 'prose'])
  const rows: string[] = [header]
  if (catalog.groups) {
    for (const g of catalog.groups) {
      if (g.controls) rows.push(...flattenControls(g.controls, g.title).map(csvRow))
    }
  }
  if (catalog.controls) {
    rows.push(...flattenControls(catalog.controls).map(csvRow))
  }
  return rows.join('\n')
}

function csvProfile(profile: Profile): string {
  const header = csvRow(['import-href', 'type', 'control-id', 'action'])
  const rows: string[] = [header]
  for (const imp of profile.imports) {
    const ids = imp['include-controls']?.flatMap(s => s['with-ids'] ?? []) ?? []
    if (ids.length === 0) {
      rows.push(csvRow([imp.href, 'import', '', 'include-all']))
    } else {
      for (const id of ids) {
        rows.push(csvRow([imp.href, 'import', id, 'include']))
      }
    }
  }
  if (profile.modify?.alters) {
    for (const alter of profile.modify.alters) {
      rows.push(csvRow(['', 'alteration', alter['control-id'], alter.removes ? 'remove' : 'add']))
    }
  }
  if (profile.modify?.['set-parameters']) {
    for (const sp of profile.modify['set-parameters']) {
      rows.push(csvRow(['', 'parameter', sp['param-id'], sp.values?.join('; ') ?? '']))
    }
  }
  return rows.join('\n')
}

function csvComponentDef(compDef: ComponentDefinition): string {
  const header = csvRow(['component-title', 'type', 'control-id', 'description'])
  const rows: string[] = [header]
  if (compDef.components) {
    for (const comp of compDef.components) {
      if (comp['control-implementations']) {
        for (const ci of comp['control-implementations']) {
          for (const req of ci['implemented-requirements']) {
            rows.push(csvRow([comp.title, comp.type, req['control-id'], req.description]))
          }
        }
      } else {
        rows.push(csvRow([comp.title, comp.type, '', comp.description]))
      }
    }
  }
  return rows.join('\n')
}

function csvSsp(ssp: SystemSecurityPlan): string {
  const header = csvRow(['control-id', 'implementation-status', 'responsible-role', 'description'])
  const rows: string[] = [header]
  for (const req of ssp['control-implementation']['implemented-requirements']) {
    const desc = req['by-components']?.map(bc => bc.description).join('; ') ?? req.remarks ?? ''
    const status = req['by-components']?.[0]
      ? (req['by-components'][0] as unknown as { 'implementation-status'?: { state: string } })['implementation-status']?.state ?? ''
      : ''
    const roles = req['responsible-roles']?.map(r => r['role-id']).join('; ') ?? ''
    rows.push(csvRow([req['control-id'], status, roles, desc]))
  }
  return rows.join('\n')
}

function csvAR(ar: AssessmentResults): string {
  const header = csvRow(['finding-id', 'target-id', 'status', 'title', 'description'])
  const rows: string[] = [header]
  for (const result of ar.results) {
    if (result.findings) {
      for (const f of result.findings) {
        rows.push(csvRow([f.uuid, f.target['target-id'], f.target.status.state, f.title, f.description]))
      }
    }
  }
  return rows.join('\n')
}

function csvPoam(poam: PlanOfActionAndMilestones): string {
  const header = csvRow(['item-title', 'status', 'milestone', 'due-date', 'description'])
  const rows: string[] = [header]
  for (const item of poam['poam-items']) {
    const statusProp = item.props?.find(p => p.name === 'status')
    const status = statusProp?.value ?? ''
    if (item.milestones?.length) {
      for (const m of item.milestones) {
        const dueDate = m.schedule?.tasks?.[0]?.end ?? ''
        rows.push(csvRow([item.title, status, m.title, dueDate, item.description]))
      }
    } else {
      rows.push(csvRow([item.title, status, '', '', item.description]))
    }
  }
  return rows.join('\n')
}
