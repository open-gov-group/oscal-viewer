/**
 * useResolver — Hook for resolving OSCAL Profile imports.
 *
 * Wraps the ResolutionService with Preact state management.
 * Maintains a DocumentCache across re-renders via useRef.
 * Application Layer: bridges Domain (services/) with Presentation (components/).
 */
import { useState, useCallback, useRef } from 'preact/hooks'
import type { Profile, Control } from '@/types/oscal'
import type { ImportSource, ResolvedProfile } from '@/services/resolver'
import { resolveProfile } from '@/services/resolver'
import { DocumentCache } from '@/services/document-cache'

/** Return type of the useResolver hook. */
export interface UseResolverReturn {
  /** Resolved controls from all import sources. */
  controls: Control[]
  /** Metadata about each import source. */
  sources: ImportSource[]
  /** Whether resolution is currently in progress. */
  loading: boolean
  /** Error message if resolution failed completely. */
  error: string | null
  /** Trigger resolution for a profile. */
  resolve: (profile: Profile, baseUrl?: string) => Promise<void>
}

/** Hook for resolving OSCAL Profile imports with caching and loading state. */
export function useResolver(): UseResolverReturn {
  const [controls, setControls] = useState<Control[]>([])
  const [sources, setSources] = useState<ImportSource[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const cacheRef = useRef(new DocumentCache())

  const resolve = useCallback(async (profile: Profile, baseUrl?: string) => {
    setLoading(true)
    setError(null)

    try {
      const result: ResolvedProfile = await resolveProfile(profile, baseUrl, cacheRef.current)
      setControls(result.controls)
      setSources(result.sources)

      if (result.errors.length > 0) {
        setError(result.errors.join('; '))
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Resolution failed')
      setControls([])
      setSources([])
    } finally {
      setLoading(false)
    }
  }, [])

  return { controls, sources, loading, error, resolve }
}
