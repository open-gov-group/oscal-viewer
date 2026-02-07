import { useState, useCallback, useEffect } from 'preact/hooks'
import type { FunctionComponent } from 'preact'
import type { OscalDocument } from '@/types/oscal'
import type { PresetEntry, AppConfig } from '@/types/config'
import { parseOscalDocument } from '@/parser'
import { useSearch } from '@/hooks/use-search'
import type { SearchResult } from '@/hooks/use-search'
import { DocumentViewer } from '@/components/document-viewer'
import { SearchBar } from '@/components/shared/search-bar'

export const App: FunctionComponent = () => {
  const [document, setDocument] = useState<OscalDocument | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [offline, setOffline] = useState(!navigator.onLine)
  const [loading, setLoading] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const [presets, setPresets] = useState<PresetEntry[]>([])

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

  // Load config presets
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

  const { query, setQuery, results, isSearching } = useSearch(document?.data ?? null)

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
    }
    if (hash) location.hash = hash
  }, [document])

  const handleFile = async (file: File) => {
    try {
      const text = await file.text()
      const json = JSON.parse(text)

      const result = parseOscalDocument(json)
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

  const handleUrl = async (url: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      const text = await response.text()
      const json = JSON.parse(text)

      const result = parseOscalDocument(json)
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
      history.replaceState(null, '', newUrl.toString())
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

  // Auto-load from ?url= query parameter
  useEffect(() => {
    const urlParam = new URLSearchParams(window.location.search).get('url')
    if (urlParam) {
      handleUrl(urlParam)
    }
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
                      placeholder="https://example.com/oscal-catalog.json"
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
                  Supports: Catalog, Profile, Component-Definition, SSP
                </p>
              </div>
            )}
          </div>
        ) : (
          <div class="document-view">
            <div class="document-content">
              <DocumentViewer data={document.data} />
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
