/**
 * useSourceResolver — Hook for resolving multiple source hrefs to document metadata.
 *
 * Used by CompDef views to resolve control-implementation source references.
 * Resolves all unique hrefs in parallel via Promise.allSettled.
 * Application Layer: bridges Domain (services/) with Presentation (components/).
 */
import { useState, useCallback, useRef } from 'preact/hooks'
import type { ResolvedSource } from '@/services/resolver'
import { resolveSource } from '@/services/resolver'
import { DocumentCache } from '@/services/document-cache'

/** Return type of the useSourceResolver hook. */
export interface UseSourceResolverReturn {
  /** Map from original href to resolved source metadata. */
  sources: Map<string, ResolvedSource>
  /** Whether resolution is currently in progress. */
  loading: boolean
  /** Error message if resolution failed completely. */
  error: string | null
  /** Trigger resolution for an array of source hrefs. */
  resolve: (hrefs: string[], baseUrl?: string) => Promise<void>
}

/** Hook for resolving multiple source hrefs with caching and parallel fetching. */
export function useSourceResolver(): UseSourceResolverReturn {
  const [sources, setSources] = useState<Map<string, ResolvedSource>>(new Map())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const cacheRef = useRef(new DocumentCache())

  const resolve = useCallback(async (hrefs: string[], baseUrl?: string) => {
    if (hrefs.length === 0) return

    setLoading(true)
    setError(null)

    try {
      // Deduplicate hrefs
      const unique = [...new Set(hrefs)]

      const results = await Promise.allSettled(
        unique.map(href => resolveSource(href, baseUrl, cacheRef.current))
      )

      const sourceMap = new Map<string, ResolvedSource>()
      const errors: string[] = []

      for (let i = 0; i < results.length; i++) {
        const result = results[i]
        if (result.status === 'fulfilled') {
          sourceMap.set(unique[i], result.value)
          if (result.value.error) {
            errors.push(`${unique[i]}: ${result.value.error}`)
          }
        } else {
          errors.push(`${unique[i]}: ${result.reason?.message ?? 'Unknown error'}`)
        }
      }

      setSources(sourceMap)
      if (errors.length > 0) {
        setError(errors.join('; '))
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Source resolution failed')
      setSources(new Map())
    } finally {
      setLoading(false)
    }
  }, [])

  return { sources, loading, error, resolve }
}
