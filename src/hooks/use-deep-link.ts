import { useState, useEffect, useCallback } from 'preact/hooks'

export interface UseDeepLinkReturn {
  selectedId: string | null
  setSelectedId: (id: string | null) => void
}

export function useDeepLink(viewType: string): UseDeepLinkReturn {
  const [selectedId, setSelectedIdState] = useState<string | null>(() => {
    return parseHash(viewType)
  })

  useEffect(() => {
    const handleHashChange = () => {
      const id = parseHash(viewType)
      setSelectedIdState(id)
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [viewType])

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
