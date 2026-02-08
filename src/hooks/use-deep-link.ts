/**
 * useDeepLink — URL hash-based deep linking for OSCAL document views.
 *
 * URL schema: `#/{viewType}/{elementId}`
 * Examples: `#/catalog/ac-1`, `#/compdef/uuid-123`, `#/ssp/characteristics`
 *
 * Uses `history.replaceState` (no new history entries) and listens for
 * `hashchange` events to sync state with the URL.
 */
import { useState, useEffect, useCallback } from 'preact/hooks'

export interface UseDeepLinkReturn {
  /** Currently selected element ID from the URL hash, or null. */
  selectedId: string | null
  /** Update selected ID and sync to URL hash. Pass null to clear. */
  setSelectedId: (id: string | null) => void
}

/**
 * Provides bidirectional sync between a selected element ID and the URL hash.
 * @param viewType - The view prefix used in the hash (e.g. 'catalog', 'compdef', 'ssp').
 * @returns The current selected ID and a setter that updates both state and URL.
 */
export function useDeepLink(viewType: string): UseDeepLinkReturn {
  const [selectedId, setSelectedIdState] = useState<string | null>(() => {
    return parseHash(viewType)
  })

  // Listen for browser back/forward hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const id = parseHash(viewType)
      setSelectedIdState(id)
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [viewType])

  // Update state + URL hash together (replaceState to avoid history pollution)
  const setSelectedId = useCallback((id: string | null) => {
    setSelectedIdState(id)
    if (id) {
      history.replaceState(null, '', `#/${viewType}/${id}`)
    } else {
      history.replaceState(null, '', location.pathname + location.search)
    }
  }, [viewType])

  return { selectedId, setSelectedId }
}

/** Parse the URL hash to extract the element ID for the given view type. */
function parseHash(viewType: string): string | null {
  const hash = location.hash
  if (!hash) return null

  const prefix = `#/${viewType}/`
  if (hash.startsWith(prefix)) {
    const id = hash.slice(prefix.length)
    return id || null
  }
  return null
}
