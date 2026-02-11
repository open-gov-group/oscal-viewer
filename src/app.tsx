/**
 * App — Root application component for the OSCAL Viewer.
 *
 * Orchestrates document loading (file drop, file input, URL fetch, query-parameter auto-load),
 * config presets, full-text search, PWA offline detection, and document rendering.
 * No backend — all processing happens client-side.
 */
import { useState, useCallback, useEffect } from 'preact/hooks'
import type { FunctionComponent } from 'preact'
import type { OscalDocument, Control } from '@/types/oscal'
import type { PresetEntry, AppConfig } from '@/types/config'
import { parseOscalText } from '@/parser'
import { useSearch } from '@/hooks/use-search'
import type { SearchResult } from '@/hooks/use-search'
import { DocumentViewer } from '@/components/document-viewer'
import { SearchBar } from '@/components/shared/search-bar'
import { ExportMenu } from '@/components/shared/export-menu'
import { useExport } from '@/hooks/use-export'

/** Root component. Manages global state: loaded document, errors, offline status, presets. */
export const App: FunctionComponent = () => {
  const [document, setDocument] = useState<OscalDocument | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [offline, setOffline] = useState(!navigator.onLine)
  const [loading, setLoading] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const [presets, setPresets] = useState<PresetEntry[]>([])
  const [resolvedControls, setResolvedControls] = useState<Control[]>([])

  // Reset resolved controls when the loaded document changes
  useEffect(() => setResolvedControls([]), [document])

  useEffect(() => {
    const goOffline = () => setOffline(true)
    const goOnline = () => setOffline(false)
    window.addEventListener('offline', goOffline)
    window.addEventListener('online', goOnline)
    return () => {
      window.removeEventListener('offline', goOffline)
      window.removeEventListener('online', goOnline)
    }
  }, [])

  // Load preset entries from public/config.json (max 5 quick-load buttons on the dropzone)
  useEffect(() => {
    fetch(new URL('config.json', window.location.href).toString())
      .then(r => r.ok ? r.json() as Promise<AppConfig> : null)
      .then(config => {
        if (config?.presets) {
          setPresets(
            config.presets
              .filter(p => typeof p.title === 'string' && typeof p.url === 'string' && p.title && p.url)
              .slice(0, 5)
          )
        }
      })
      .catch(() => { /* Graceful: no config = no presets */ })
  }, [])

  const { query, setQuery, results, isSearching } = useSearch(document?.data ?? null, resolvedControls)
  const exportActions = useExport(document?.data ?? null)

  /** Navigate to a search result by setting the URL hash to the appropriate deep-link. */
  const handleSearchSelect = useCallback((result: SearchResult) => {
    if (!document) return
    let hash = ''
    switch (document.data.type) {
      case 'catalog':
        if (result.type === 'control') hash = `/catalog/${result.id}`
        break
      case 'component-definition':
        if (result.type !== 'requirement') hash = `/compdef/${result.id}`
        break
      case 'system-security-plan':
        if (result.type === 'system') hash = '/ssp/characteristics'
        else if (result.type === 'requirement') hash = '/ssp/controls'
        else hash = '/ssp/implementation'
        break
      case 'assessment-results':
        if (result.type === 'finding') hash = '/ar/findings'
        else hash = '/ar/results'
        break
      case 'plan-of-action-and-milestones':
        hash = `/poam/${result.id}`
        break
    }
    // Resolved controls from Profile/SSP resolution navigate to the control's detail view
    if (result.type === 'resolved-control') {
      if (document.data.type === 'profile') hash = `/profile/resolved/${result.id}`
      else if (document.data.type === 'system-security-plan') hash = `/ssp/controls`
    }
    if (hash) location.hash = hash
  }, [document])

  /** Parse a local OSCAL file (JSON or XML, from drop or file input) and set it as the active document. */
  const handleFile = async (file: File) => {
    try {
      const text = await file.text()
      const result = parseOscalText(text)
      if (!result.success) {
        setError(result.error)
        setDocument(null)
        return
      }

      setDocument(result.data)
      setError(null)
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.delete('url')
      newUrl.hash = ''
      history.replaceState(null, '', newUrl.toString())
    } catch (e) {
      setError(`Failed to parse file: ${e instanceof Error ? e.message : 'Unknown error'}`)
      setDocument(null)
    }
  }

  /** Fetch an OSCAL document from a remote URL, parse it, and update the ?url= query parameter.
   *  When pushHistory is true, a new browser history entry is created (for cross-document navigation). */
  const handleUrl = async (url: string, pushHistory = false) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      const text = await response.text()
      const result = parseOscalText(text)
      if (!result.success) {
        setError(result.error)
        setDocument(null)
        return
      }

      setDocument(result.data)
      setError(null)
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.set('url', url)
      newUrl.hash = ''
      // Push a new history entry for cross-document navigation (Back/Forward support)
      if (pushHistory) {
        history.pushState({ url }, '', newUrl.toString())
      } else {
        history.replaceState(null, '', newUrl.toString())
      }
    } catch (e) {
      if (e instanceof TypeError) {
        setError('Could not fetch URL. The server may not allow cross-origin requests. Download the file and load it locally.')
      } else {
        setError(`Failed to load from URL: ${e instanceof Error ? e.message : 'Unknown error'}`)
      }
      setDocument(null)
    } finally {
      setLoading(false)
    }
  }

  // Auto-load: if ?url=<docUrl> is present, fetch the document on first mount
  useEffect(() => {
    const urlParam = new URLSearchParams(window.location.search).get('url')
    if (urlParam) {
      handleUrl(urlParam)
    }
  }, [])

  /** Cross-document navigation: load a new OSCAL document and push browser history. */
  const handleNavigate = useCallback((url: string) => {
    handleUrl(url, true)
  }, [])

  // Browser Back/Forward support: listen for popstate events to restore previous documents
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      const state = e.state as { url?: string } | null
      if (state?.url) {
        handleUrl(state.url)
      } else {
        // No state = check for ?url= param, otherwise return to dropzone
        const urlParam = new URLSearchParams(window.location.search).get('url')
        if (urlParam) {
          handleUrl(urlParam)
        } else {
          setDocument(null)
        }
      }
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer?.files[0]
    if (file) {
      handleFile(file)
    }
  }

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleFileInput = (e: Event) => {
    const input = e.target as HTMLInputElement
    const file = input.files?.[0]
    if (file) {
      handleFile(file)
    }
  }

  const handleUrlSubmit = (e: Event) => {
    e.preventDefault()
    if (urlInput.trim()) {
      handleUrl(urlInput.trim())
    }
  }

  /** Reset to the dropzone: clear loaded document, URL input, and ?url= query parameter. */
  const handleClear = () => {
    setDocument(null)
    setUrlInput('')
    const newUrl = new URL(window.location.href)
    newUrl.searchParams.delete('url')
    newUrl.hash = ''
    history.replaceState(null, '', newUrl.toString())
  }

  return (
    <div class="app">
      <a href="#main-content" class="skip-link">Skip to main content</a>
      <header class="header" role="banner">
        <div class="header-content">
          <h1 class="header-title">OSCAL Viewer</h1>
          <span class="header-subtitle">Universal viewer for OSCAL 1.0.x to latest</span>
        </div>
        {document && (
          <div class="header-actions">
            <span class="document-type">{document.type}</span>
            <span class="document-version">OSCAL {document.version}</span>
            <SearchBar
              query={query}
              onQueryChange={setQuery}
              results={results}
              isSearching={isSearching}
              onSelect={handleSearchSelect}
            />
            <ExportMenu exportActions={exportActions} />
            <button class="btn-clear" onClick={handleClear}>
              Load another file
            </button>
          </div>
        )}
      </header>

      {offline && (
        <div class="offline-banner" role="status">
          You are offline. Previously loaded documents are still available.
        </div>
      )}

      <main id="main-content" class="main">
        {!document ? (
          <div
            class={`dropzone ${isDragging ? 'dragging' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            {loading ? (
              <div class="loading-indicator" role="status" aria-live="polite">
                <div class="loading-spinner" aria-hidden="true" />
                <span>Loading OSCAL document...</span>
              </div>
            ) : (
              <div class="dropzone-content">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <h2>Drop OSCAL file here</h2>
                <p>or</p>
                <label class="file-input-label">
                  <input
                    type="file"
                    accept=".json,.xml"
                    onChange={handleFileInput}
                  />
                  Browse files
                </label>

                {presets.length > 0 && (
                  <div class="preset-section">
                    <p class="preset-label">Quick Load</p>
                    <div class="preset-buttons">
                      {presets.map((preset, i) => (
                        <button
                          key={i}
                          class="preset-btn"
                          onClick={() => handleUrl(preset.url)}
                          title={preset.url}
                        >
                          {preset.title}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div class="url-input-section">
                  <p class="url-divider">or enter a URL</p>
                  <form class="url-input-form" onSubmit={handleUrlSubmit}>
                    <input
                      type="url"
                      class="url-input"
                      placeholder="https://example.com/oscal-catalog.json or .xml"
                      value={urlInput}
                      onInput={(e) => setUrlInput((e.target as HTMLInputElement).value)}
                      aria-label="OSCAL document URL"
                    />
                    <button
                      type="submit"
                      class="url-submit-btn"
                      disabled={!urlInput.trim()}
                    >
                      Load
                    </button>
                  </form>
                </div>

                <p class="supported-types">
                  Supports: Catalog, Profile, Component-Definition, SSP, Assessment Results, POA&M (JSON & XML)
                </p>
              </div>
            )}
          </div>
        ) : (
          <div class="document-view">
            <div class="document-content">
              <DocumentViewer data={document.data} onNavigate={handleNavigate} onControlsResolved={setResolvedControls} />
            </div>
          </div>
        )}

        {error && (
          <div class="error-message" role="alert">
            {error}
          </div>
        )}
      </main>

      <footer class="footer">
        <p>
          Part of the <a href="https://github.com/open-gov-group/opengov-oscal-privacy-project">OpenGov Privacy Ecosystem</a>
        </p>
      </footer>
    </div>
  )
}
