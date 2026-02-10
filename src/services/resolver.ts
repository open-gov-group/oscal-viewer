/**
 * ResolutionService — Resolves OSCAL profile imports to their source catalogs.
 *
 * Pipeline: imports[].href -> fetch catalogs -> filter controls -> merge -> modify.
 * Handles CORS via GitHub raw URL transformation.
 * Domain Layer: no Preact imports, no side effects beyond fetch.
 */
import type { OscalDocument, Profile, Control, Catalog, Group, SetParameter, Alter, SystemSecurityPlan, DocumentType, BackMatter } from '@/types/oscal'
import { parseHref } from '@/services/href-parser'
import type { DocumentCache } from '@/services/document-cache'
import { parseOscalDocument } from '@/parser'

/** Status of a single import source resolution. */
export type ImportStatus = 'loaded' | 'cached' | 'error'

/** Represents a resolved import source with its metadata. */
export interface ImportSource {
  /** The original href from the profile import. */
  href: string
  /** The fully resolved URL used for fetching. */
  resolvedUrl?: string
  /** Resolution status. */
  status: ImportStatus
  /** Number of controls obtained from this source. */
  controlCount: number
  /** Error message if status is 'error'. */
  error?: string
}

/** Result of resolving a complete OSCAL profile. */
export interface ResolvedProfile {
  /** All controls gathered from resolved imports. */
  controls: Control[]
  /** Metadata about each import source. */
  sources: ImportSource[]
  /** Non-fatal errors encountered during resolution. */
  errors: string[]
}

/**
 * Transform a GitHub blob URL to a raw.githubusercontent.com URL for CORS-free fetching.
 * E.g. https://github.com/user/repo/blob/main/file.json
 *   -> https://raw.githubusercontent.com/user/repo/main/file.json
 */
export function toRawGithubUrl(url: string): string {
  const match = url.match(/^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/(.+)$/)
  if (match) {
    return `https://raw.githubusercontent.com/${match[1]}/${match[2]}/${match[3]}`
  }
  return url
}

/**
 * Resolve an href relative to a base URL.
 * @param href - The relative or absolute href.
 * @param baseUrl - The base URL to resolve against (e.g. the profile's source URL).
 * @returns The fully resolved URL string.
 */
export function resolveUrl(href: string, baseUrl?: string): string {
  const parsed = parseHref(href)

  if (parsed.type === 'absolute-url') {
    return toRawGithubUrl(parsed.path)
  }

  if (parsed.type === 'relative' && baseUrl) {
    // Resolve relative to base URL
    try {
      const resolved = new URL(href, baseUrl).toString()
      return toRawGithubUrl(resolved)
    } catch {
      return href
    }
  }

  return href
}

/**
 * Resolve a fragment reference (e.g. "#uuid") to a fetchable URL by looking up
 * the resource in the document's back-matter and selecting a JSON rlink.
 * OSCAL profiles commonly use fragment references to back-matter resources
 * instead of direct URLs (e.g. NIST SP 800-53 baselines).
 */
export function resolveFragmentToUrl(
  fragment: string | undefined,
  backMatter: BackMatter | undefined,
  baseUrl: string | undefined
): string | undefined {
  if (!fragment || !backMatter?.resources) return undefined

  const resource = backMatter.resources.find(r => r.uuid === fragment)
  if (!resource?.rlinks || resource.rlinks.length === 0) return undefined

  // Prefer JSON rlink for our JSON-only parser, fall back to first available
  const jsonRlink = resource.rlinks.find(r =>
    r['media-type']?.includes('json')
  )
  const rlink = jsonRlink ?? resource.rlinks[0]

  return resolveUrl(rlink.href, baseUrl)
}

/**
 * Fetch and parse an OSCAL document from a URL.
 * Uses the cache to avoid redundant fetches.
 */
export async function fetchDocument(
  url: string,
  cache: DocumentCache
): Promise<OscalDocument> {
  // Check cache first
  if (cache.has(url)) {
    return cache.get(url)!
  }

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }

  const text = await response.text()
  const json = JSON.parse(text) as unknown
  const result = parseOscalDocument(json)

  if (!result.success) {
    throw new Error(result.error)
  }

  cache.set(url, result.data)
  return result.data
}

/** Recursively collect all controls from groups. */
function collectControls(groups?: Group[]): Control[] {
  if (!groups) return []
  const controls: Control[] = []
  for (const group of groups) {
    if (group.controls) {
      controls.push(...group.controls)
    }
    if (group.groups) {
      controls.push(...collectControls(group.groups))
    }
  }
  return controls
}

/** Get all controls from a catalog (top-level + nested in groups). */
function getAllControls(catalog: Catalog): Control[] {
  const controls: Control[] = []
  if (catalog.controls) {
    controls.push(...catalog.controls)
  }
  controls.push(...collectControls(catalog.groups))
  return controls
}

/** Filter controls by include-controls with-ids. */
function filterByIds(controls: Control[], ids: string[]): Control[] {
  const idSet = new Set(ids)
  return controls.filter(c => idSet.has(c.id))
}

/** Apply set-parameters modifications to controls. */
function applySetParameters(controls: Control[], setParams: SetParameter[]): Control[] {
  const paramMap = new Map(setParams.map(sp => [sp['param-id'], sp]))

  return controls.map(control => {
    if (!control.params) return control

    const updatedParams = control.params.map(param => {
      const override = paramMap.get(param.id)
      if (!override) return param

      return {
        ...param,
        ...(override.values !== undefined && { values: override.values }),
        ...(override.label !== undefined && { label: override.label }),
        ...(override.select !== undefined && { select: override.select }),
        ...(override.constraints !== undefined && { constraints: override.constraints }),
      }
    })

    return { ...control, params: updatedParams }
  })
}

/** Apply alter modifications (adds/removes) to controls. */
function applyAlters(controls: Control[], alters: Alter[]): Control[] {
  const alterMap = new Map(alters.map(a => [a['control-id'], a]))

  return controls.map(control => {
    const alter = alterMap.get(control.id)
    if (!alter) return control

    let modified = { ...control }

    // Apply removes
    if (alter.removes) {
      for (const remove of alter.removes) {
        if (remove['by-name'] && modified.parts) {
          modified = { ...modified, parts: modified.parts.filter(p => p.name !== remove['by-name']) }
        }
        if (remove['by-id'] && modified.parts) {
          modified = { ...modified, parts: modified.parts.filter(p => p.id !== remove['by-id']) }
        }
      }
    }

    // Apply adds
    if (alter.adds) {
      for (const add of alter.adds) {
        if (add.parts) {
          const position = add.position ?? 'ending'
          const existingParts = modified.parts ?? []
          modified = {
            ...modified,
            parts: position === 'starting'
              ? [...add.parts, ...existingParts]
              : [...existingParts, ...add.parts],
          }
        }
        if (add.props) {
          modified = {
            ...modified,
            props: [...(modified.props ?? []), ...add.props],
          }
        }
      }
    }

    return modified
  })
}

/**
 * Resolve an OSCAL Profile: fetch imported catalogs, filter/merge controls, apply modifications.
 *
 * @param profile - The parsed OSCAL Profile document.
 * @param baseUrl - Optional base URL for resolving relative import hrefs.
 * @param cache - DocumentCache instance for caching fetched documents.
 * @returns ResolvedProfile with controls, sources, and any errors.
 */
export async function resolveProfile(
  profile: Profile,
  baseUrl: string | undefined,
  cache: DocumentCache
): Promise<ResolvedProfile> {
  const allControls: Control[] = []
  const sources: ImportSource[] = []
  const errors: string[] = []

  // Resolve each import in parallel
  const importResults = await Promise.allSettled(
    profile.imports.map(async (imp) => {
      const parsed = parseHref(imp.href)

      // URNs cannot be resolved
      if (parsed.type === 'urn') {
        return {
          source: { href: imp.href, status: 'error' as ImportStatus, controlCount: 0, error: 'URN references cannot be resolved' },
          controls: [] as Control[],
        }
      }

      // Fragment references (#uuid) resolve via back-matter resources
      let resolvedUrl: string
      if (parsed.type === 'fragment') {
        const fragmentUrl = resolveFragmentToUrl(parsed.fragment, profile['back-matter'], baseUrl)
        if (!fragmentUrl) {
          return {
            source: { href: imp.href, status: 'error' as ImportStatus, controlCount: 0, error: 'Back-matter resource not found or has no JSON rlink' },
            controls: [] as Control[],
          }
        }
        resolvedUrl = fragmentUrl
      } else {
        resolvedUrl = resolveUrl(imp.href, baseUrl)
      }

      const fromCache = cache.has(resolvedUrl)

      try {
        const doc = await fetchDocument(resolvedUrl, cache)

        if (doc.data.type !== 'catalog') {
          return {
            source: { href: imp.href, resolvedUrl, status: 'error' as ImportStatus, controlCount: 0, error: `Expected catalog, got ${doc.data.type}` },
            controls: [] as Control[],
          }
        }

        const catalog = doc.data.document as Catalog
        let controls: Control[]

        // Apply include-all or include-controls filter
        if (imp['include-all'] !== undefined) {
          controls = getAllControls(catalog)
        } else if (imp['include-controls'] && imp['include-controls'].length > 0) {
          const allCatalogControls = getAllControls(catalog)
          const ids = imp['include-controls'].flatMap(sel => sel['with-ids'] ?? [])
          controls = ids.length > 0 ? filterByIds(allCatalogControls, ids) : allCatalogControls
        } else {
          controls = getAllControls(catalog)
        }

        // Apply exclude-controls filter
        if (imp['exclude-controls'] && imp['exclude-controls'].length > 0) {
          const excludeIds = new Set(
            imp['exclude-controls'].flatMap(sel => sel['with-ids'] ?? [])
          )
          controls = controls.filter(c => !excludeIds.has(c.id))
        }

        return {
          source: {
            href: imp.href,
            resolvedUrl,
            status: (fromCache ? 'cached' : 'loaded') as ImportStatus,
            controlCount: controls.length,
          },
          controls,
        }
      } catch (e) {
        const errorMsg = e instanceof TypeError
          ? 'CORS error: server does not allow cross-origin requests'
          : e instanceof Error ? e.message : 'Unknown error'

        return {
          source: { href: imp.href, resolvedUrl, status: 'error' as ImportStatus, controlCount: 0, error: errorMsg },
          controls: [] as Control[],
        }
      }
    })
  )

  // Collect results
  for (const result of importResults) {
    if (result.status === 'fulfilled') {
      sources.push(result.value.source)
      allControls.push(...result.value.controls)
    } else {
      errors.push(result.reason?.message ?? 'Unknown import error')
    }
  }

  // Apply modifications
  let finalControls = allControls

  if (profile.modify) {
    if (profile.modify['set-parameters'] && profile.modify['set-parameters'].length > 0) {
      finalControls = applySetParameters(finalControls, profile.modify['set-parameters'])
    }
    if (profile.modify.alters && profile.modify.alters.length > 0) {
      finalControls = applyAlters(finalControls, profile.modify.alters)
    }
  }

  return { controls: finalControls, sources, errors }
}

/** Metadata of a resolved document source (for CompDef source display). */
export interface ResolvedSource {
  /** The original href string. */
  href: string
  /** The fully resolved URL used for fetching. */
  resolvedUrl?: string
  /** Document title from metadata. */
  title: string
  /** Document type (catalog, profile, etc.). */
  type: DocumentType
  /** OSCAL version from metadata. */
  version: string
  /** Resolution status. */
  status: ImportStatus
  /** Error message if resolution failed. */
  error?: string
}

/** Result of resolving an SSP's import-profile chain (SSP -> Profile -> Catalogs). */
export interface ResolvedSsp {
  /** Resolved profile metadata. Null if the profile could not be fetched. */
  profileMeta: { title: string; version: string; importCount: number } | null
  /** Catalog sources from the resolved profile's imports. */
  catalogSources: ImportSource[]
  /** Controls gathered from the full SSP -> Profile -> Catalog chain. */
  controls: Control[]
  /** Profile merge strategy. Undefined when profile is not resolved. */
  merge: Profile['merge']
  /** Profile modifications (set-parameters, alters). Undefined when profile is not resolved. */
  modify: Profile['modify']
  /** Non-fatal errors encountered during resolution. */
  errors: string[]
}

/**
 * Resolve an SSP's import-profile chain: fetch the referenced Profile,
 * then resolve the Profile's catalog imports.
 *
 * @param ssp - The parsed SSP document.
 * @param baseUrl - Optional base URL for resolving relative hrefs.
 * @param cache - DocumentCache instance for caching fetched documents.
 * @returns ResolvedSsp with profile metadata, catalog sources, controls, and errors.
 */
export async function resolveSsp(
  ssp: SystemSecurityPlan,
  baseUrl: string | undefined,
  cache: DocumentCache
): Promise<ResolvedSsp> {
  const href = ssp['import-profile'].href
  const parsed = parseHref(href)

  // URNs cannot be resolved
  if (parsed.type === 'urn') {
    return {
      profileMeta: null,
      catalogSources: [],
      controls: [],
      merge: undefined,
      modify: undefined,
      errors: ['URN references cannot be resolved: ' + href],
    }
  }

  // Fragment references (#uuid) resolve via SSP back-matter resources
  let resolvedUrl: string
  if (parsed.type === 'fragment') {
    const fragmentUrl = resolveFragmentToUrl(parsed.fragment, ssp['back-matter'], baseUrl)
    if (!fragmentUrl) {
      return {
        profileMeta: null,
        catalogSources: [],
        controls: [],
        merge: undefined,
        modify: undefined,
        errors: ['Back-matter resource not found or has no JSON rlink: ' + href],
      }
    }
    resolvedUrl = fragmentUrl
  } else {
    resolvedUrl = resolveUrl(href, baseUrl)
  }

  try {
    const doc = await fetchDocument(resolvedUrl, cache)

    if (doc.data.type !== 'profile') {
      return {
        profileMeta: null,
        catalogSources: [],
        controls: [],
        merge: undefined,
        modify: undefined,
        errors: [`Expected profile, got ${doc.data.type}`],
      }
    }

    const profile = doc.data.document as Profile
    const profileMeta = {
      title: profile.metadata.title,
      version: profile.metadata.version,
      importCount: profile.imports.length,
    }

    // Resolve the profile's imports (Profile -> Catalogs)
    // Use the profile's resolved URL as base for its relative imports
    const profileBaseUrl = resolvedUrl.includes('/')
      ? resolvedUrl.slice(0, resolvedUrl.lastIndexOf('/') + 1)
      : baseUrl

    const resolved = await resolveProfile(profile, profileBaseUrl, cache)

    return {
      profileMeta,
      catalogSources: resolved.sources,
      controls: resolved.controls,
      merge: profile.merge,
      modify: profile.modify,
      errors: resolved.errors,
    }
  } catch (e) {
    const errorMsg = e instanceof TypeError
      ? 'CORS error: server does not allow cross-origin requests'
      : e instanceof Error ? e.message : 'Unknown error'

    return {
      profileMeta: null,
      catalogSources: [],
      controls: [],
      merge: undefined,
      modify: undefined,
      errors: [errorMsg],
    }
  }
}

/**
 * Resolve a single source href to document metadata (title, type, version).
 * Used for CompDef control-implementation source references.
 *
 * @param href - The source href string.
 * @param baseUrl - Optional base URL for resolving relative hrefs.
 * @param cache - DocumentCache instance for caching fetched documents.
 * @returns ResolvedSource with document metadata or error.
 */
export async function resolveSource(
  href: string,
  baseUrl: string | undefined,
  cache: DocumentCache
): Promise<ResolvedSource> {
  const parsed = parseHref(href)

  if (parsed.type === 'urn') {
    return {
      href,
      title: href,
      type: 'catalog',
      version: '',
      status: 'error',
      error: 'URN references cannot be resolved',
    }
  }

  const resolvedUrl = resolveUrl(href, baseUrl)
  const fromCache = cache.has(resolvedUrl)

  try {
    const doc = await fetchDocument(resolvedUrl, cache)
    const metadata = (doc.data.document as { metadata: { title: string; version: string } }).metadata

    return {
      href,
      resolvedUrl,
      title: metadata.title,
      type: doc.data.type,
      version: metadata.version,
      status: fromCache ? 'cached' : 'loaded',
    }
  } catch (e) {
    const errorMsg = e instanceof TypeError
      ? 'CORS error: server does not allow cross-origin requests'
      : e instanceof Error ? e.message : 'Unknown error'

    return {
      href,
      resolvedUrl,
      title: href,
      type: 'catalog',
      version: '',
      status: 'error',
      error: errorMsg,
    }
  }
}
