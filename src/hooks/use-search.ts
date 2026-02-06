import { useState, useMemo, useCallback } from 'preact/hooks'
import type { OscalDocumentData, Catalog, Profile, ComponentDefinition, SystemSecurityPlan } from '@/types/oscal'

export interface SearchResult {
  id: string
  title: string
  type: string
  context?: string
}

export interface UseSearchReturn {
  query: string
  setQuery: (q: string) => void
  results: SearchResult[]
  isSearching: boolean
}

export function useSearch(data: OscalDocumentData | null): UseSearchReturn {
  const [query, setQuery] = useState('')

  const index = useMemo(() => {
    if (!data) return []
    return buildIndex(data)
  }, [data])

  const results = useMemo(() => {
    const trimmed = query.trim().toLowerCase()
    if (trimmed.length < 2 || index.length === 0) return []
    return index.filter(entry =>
      entry.searchText.includes(trimmed)
    ).map(({ searchText: _, ...rest }) => rest)
  }, [query, index])

  const wrappedSetQuery = useCallback((q: string) => {
    setQuery(q)
  }, [])

  return {
    query,
    setQuery: wrappedSetQuery,
    results,
    isSearching: query.trim().length >= 2,
  }
}

export interface IndexEntry extends SearchResult {
  searchText: string
}

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
  }
}

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
