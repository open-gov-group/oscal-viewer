/**
 * useSspResolver — Hook for resolving an SSP's import-profile chain.
 *
 * Fetches the referenced Profile, then resolves its catalog imports.
 * Maintains a DocumentCache across re-renders via useRef.
 * Application Layer: bridges Domain (services/) with Presentation (components/).
 */
import { useState, useCallback, useRef } from 'preact/hooks'
import type { SystemSecurityPlan, Control } from '@/types/oscal'
import type { ImportSource, ResolvedSsp } from '@/services/resolver'
import { resolveSsp } from '@/services/resolver'
import { DocumentCache } from '@/services/document-cache'

/** Return type of the useSspResolver hook. */
export interface UseSspResolverReturn {
  /** Resolved profile metadata (title, version, import count). Null until resolved. */
  profileMeta: { title: string; version: string; importCount: number } | null
  /** Catalog sources from the resolved profile's imports. */
  catalogSources: ImportSource[]
  /** Whether resolution is currently in progress. */
  loading: boolean
  /** Controls gathered from the full SSP → Profile → Catalog chain. */
  controls: Control[]
  /** Error message if resolution failed. */
  error: string | null
  /** Trigger resolution for an SSP document. */
  resolve: (ssp: SystemSecurityPlan, baseUrl?: string) => Promise<void>
}

/** Hook for resolving an SSP's import-profile chain with caching and loading state. */
export function useSspResolver(): UseSspResolverReturn {
  const [profileMeta, setProfileMeta] = useState<UseSspResolverReturn['profileMeta']>(null)
  const [catalogSources, setCatalogSources] = useState<ImportSource[]>([])
  const [controls, setControls] = useState<Control[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const cacheRef = useRef(new DocumentCache())

  const resolve = useCallback(async (ssp: SystemSecurityPlan, baseUrl?: string) => {
    setLoading(true)
    setError(null)

    try {
      const result: ResolvedSsp = await resolveSsp(ssp, baseUrl, cacheRef.current)
      setProfileMeta(result.profileMeta)
      setCatalogSources(result.catalogSources)
      setControls(result.controls)

      if (result.errors.length > 0) {
        setError(result.errors.join('; '))
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'SSP resolution failed')
      setProfileMeta(null)
      setCatalogSources([])
      setControls([])
    } finally {
      setLoading(false)
    }
  }, [])

  return { profileMeta, catalogSources, controls, loading, error, resolve }
}
