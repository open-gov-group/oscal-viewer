import { useState, useCallback } from 'preact/hooks'
import type { FunctionComponent } from 'preact'
import type { OscalDocument } from '@/types/oscal'
import { parseOscalDocument } from '@/parser'
import { useSearch } from '@/hooks/use-search'
import type { SearchResult } from '@/hooks/use-search'
import { DocumentViewer } from '@/components/document-viewer'
import { SearchBar } from '@/components/shared/search-bar'

export const App: FunctionComponent = () => {
  const [document, setDocument] = useState<OscalDocument | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
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
      history.replaceState(null, '', location.pathname + location.search)
    } catch (e) {
      setError(`Failed to parse file: ${e instanceof Error ? e.message : 'Unknown error'}`)
      setDocument(null)
    }
  }

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
            <button
              class="btn-clear"
              onClick={() => {
                setDocument(null)
                history.replaceState(null, '', location.pathname + location.search)
              }}
            >
              Load another file
            </button>
          </div>
        )}
      </header>

      <main id="main-content" class="main">
        {!document ? (
          <div
            class={`dropzone ${isDragging ? 'dragging' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
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
              <p class="supported-types">
                Supports: Catalog, Profile, Component-Definition, SSP
              </p>
            </div>
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
