/**
 * useSearch — Full-text search hook for OSCAL documents.
 *
 * Builds a search index from the loaded document (per document type),
 * then performs case-insensitive substring matching with 200ms debounce.
 * Minimum query length: 2 characters.
 */
import { useState, useMemo, useCallback, useEffect, useRef } from 'preact/hooks'
import type { OscalDocumentData, Catalog, Profile, ComponentDefinition, SystemSecurityPlan, AssessmentResults, PlanOfActionAndMilestones } from '@/types/oscal'

/** A single search result shown in the SearchBar dropdown. */
export interface SearchResult {
  id: string
  title: string
  /** Result category: 'control', 'group', 'import', 'parameter', 'requirement', 'user', 'system', etc. */
  type: string
  /** Additional context shown below the title (e.g. group name, description snippet). */
  context?: string
}

export interface UseSearchReturn {
  query: string
  setQuery: (q: string) => void
  results: SearchResult[]
  /** True when the debounced query has >= 2 characters. */
  isSearching: boolean
}

/**
 * Provides full-text search over a loaded OSCAL document.
 * @param data - The parsed document data, or null if no document is loaded.
 * @returns Search state with query, results, and setter.
 */
export function useSearch(data: OscalDocumentData | null): UseSearchReturn {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Debounce: delay search execution by 200ms after last keystroke
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setDebouncedQuery(query)
    }, 200)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [query])

  // Build flat search index when document changes (memoized)
  const index = useMemo(() => {
    if (!data) return []
    return buildIndex(data)
  }, [data])

  // Filter index entries by debounced query (case-insensitive substring match)
  const results = useMemo(() => {
    const trimmed = debouncedQuery.trim().toLowerCase()
    if (trimmed.length < 2 || index.length === 0) return []
    return index.filter(entry =>
      entry.searchText.includes(trimmed)
    ).map(({ searchText: _, ...rest }) => rest)
  }, [debouncedQuery, index])

  const wrappedSetQuery = useCallback((q: string) => {
    setQuery(q)
  }, [])

  return {
    query,
    setQuery: wrappedSetQuery,
    results,
    isSearching: debouncedQuery.trim().length >= 2,
  }
}

/** Internal index entry with pre-computed lowercase searchText for fast matching. */
export interface IndexEntry extends SearchResult {
  searchText: string
}

/**
 * Builds a flat search index from the document data.
 * Delegates to type-specific indexers (catalog, profile, compdef, ssp).
 * @param data - The typed document data to index.
 * @returns Flat array of IndexEntry with concatenated searchText fields.
 */
export function buildIndex(data: OscalDocumentData): IndexEntry[] {
  switch (data.type) {
    case 'catalog':
      return indexCatalog(data.document)
    case 'profile':
      return indexProfile(data.document)
    case 'component-definition':
      return indexComponentDef(data.document)
    case 'system-security-plan':
      return indexSSP(data.document)
    case 'assessment-results':
      return indexAssessmentResults(data.document)
    case 'plan-of-action-and-milestones':
      return indexPoam(data.document)
  }
}

/** Index catalog groups and controls (recursively), including control prose text. */
function indexCatalog(catalog: Catalog): IndexEntry[] {
  const entries: IndexEntry[] = []

  function addControls(controls?: Catalog['controls'], groupTitle?: string): void {
    if (!controls) return
    for (const control of controls) {
      const prose = control.parts?.map(p => p.prose ?? '').join(' ') ?? ''
      entries.push({
        id: control.id,
        title: control.title,
        type: 'control',
        context: groupTitle,
        searchText: `${control.id} ${control.title} ${prose}`.toLowerCase(),
      })
      if (control.controls) {
        addControls(control.controls, groupTitle)
      }
    }
  }

  function addGroups(groups?: Catalog['groups']): void {
    if (!groups) return
    for (const group of groups) {
      entries.push({
        id: group.id ?? group.title,
        title: group.title,
        type: 'group',
        searchText: `${group.id ?? ''} ${group.title}`.toLowerCase(),
      })
      addControls(group.controls, group.title)
      if (group.groups) {
        addGroups(group.groups)
      }
    }
  }

  addControls(catalog.controls)
  addGroups(catalog.groups)
  return entries
}

/** Index profile imports, alterations, and set-parameters. */
function indexProfile(profile: Profile): IndexEntry[] {
  const entries: IndexEntry[] = []

  for (const imp of profile.imports) {
    entries.push({
      id: imp.href,
      title: `Import: ${imp.href}`,
      type: 'import',
      searchText: imp.href.toLowerCase(),
    })
  }

  if (profile.modify?.alters) {
    for (const alter of profile.modify.alters) {
      entries.push({
        id: alter['control-id'],
        title: `Alteration: ${alter['control-id']}`,
        type: 'alteration',
        searchText: alter['control-id'].toLowerCase(),
      })
    }
  }

  if (profile.modify?.['set-parameters']) {
    for (const sp of profile.modify['set-parameters']) {
      const values = sp.values?.join(', ') ?? ''
      entries.push({
        id: sp['param-id'],
        title: `Parameter: ${sp['param-id']}`,
        type: 'parameter',
        context: values,
        searchText: `${sp['param-id']} ${sp.label ?? ''} ${values}`.toLowerCase(),
      })
    }
  }

  return entries
}

/** Index components and their implemented requirements. */
function indexComponentDef(compDef: ComponentDefinition): IndexEntry[] {
  const entries: IndexEntry[] = []

  if (compDef.components) {
    for (const comp of compDef.components) {
      entries.push({
        id: comp.uuid,
        title: comp.title,
        type: comp.type,
        context: comp.description,
        searchText: `${comp.title} ${comp.type} ${comp.description} ${comp.purpose ?? ''}`.toLowerCase(),
      })

      if (comp['control-implementations']) {
        for (const ci of comp['control-implementations']) {
          for (const req of ci['implemented-requirements']) {
            entries.push({
              id: req['control-id'],
              title: `${req['control-id']} (${comp.title})`,
              type: 'requirement',
              context: req.description,
              searchText: `${req['control-id']} ${req.description} ${comp.title}`.toLowerCase(),
            })
          }
        }
      }
    }
  }

  return entries
}

/** Index SSP system characteristics, components, users, and implemented requirements. */
function indexSSP(ssp: SystemSecurityPlan): IndexEntry[] {
  const entries: IndexEntry[] = []

  const sc = ssp['system-characteristics']
  entries.push({
    id: 'system',
    title: sc['system-name'],
    type: 'system',
    context: sc.description,
    searchText: `${sc['system-name']} ${sc['system-name-short'] ?? ''} ${sc.description}`.toLowerCase(),
  })

  for (const comp of ssp['system-implementation'].components) {
    entries.push({
      id: comp.uuid,
      title: comp.title,
      type: comp.type,
      context: comp.description,
      searchText: `${comp.title} ${comp.type} ${comp.description}`.toLowerCase(),
    })
  }

  for (const user of ssp['system-implementation'].users) {
    entries.push({
      id: user.uuid,
      title: user.title ?? user.uuid.slice(0, 8),
      type: 'user',
      searchText: `${user.title ?? ''} ${user.description ?? ''} ${user['role-ids']?.join(' ') ?? ''}`.toLowerCase(),
    })
  }

  for (const req of ssp['control-implementation']['implemented-requirements']) {
    const descriptions = req['by-components']?.map(bc => bc.description).join(' ') ?? ''
    entries.push({
      id: req['control-id'],
      title: `Control: ${req['control-id']}`,
      type: 'requirement',
      searchText: `${req['control-id']} ${descriptions} ${req.remarks ?? ''}`.toLowerCase(),
    })
  }

  return entries
}

/** Index assessment results findings, observations, and risks. */
function indexAssessmentResults(ar: AssessmentResults): IndexEntry[] {
  const entries: IndexEntry[] = []
  for (const result of ar.results) {
    entries.push({
      id: result.uuid,
      title: result.title,
      type: 'result',
      context: result.description,
      searchText: `${result.title} ${result.description}`.toLowerCase(),
    })
    if (result.findings) {
      for (const finding of result.findings) {
        entries.push({
          id: finding.uuid,
          title: `Finding: ${finding.target['target-id']}`,
          type: 'finding',
          context: `${finding.target.status.state} — ${finding.title}`,
          searchText: `${finding.target['target-id']} ${finding.title} ${finding.description} ${finding.target.status.state}`.toLowerCase(),
        })
      }
    }
  }
  return entries
}

/** Index POA&M items and milestones. */
function indexPoam(poam: PlanOfActionAndMilestones): IndexEntry[] {
  const entries: IndexEntry[] = []
  for (const item of poam['poam-items']) {
    const milestoneText = item.milestones?.map(m => m.title).join(' ') ?? ''
    entries.push({
      id: item.uuid,
      title: item.title,
      type: 'poam-item',
      context: item.description,
      searchText: `${item.title} ${item.description} ${milestoneText}`.toLowerCase(),
    })
  }
  return entries
}
