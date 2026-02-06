import { useState } from 'preact/hooks'
import type { FunctionComponent } from 'preact'

interface OscalDocument {
  type: 'catalog' | 'profile' | 'component-definition' | 'system-security-plan' | 'unknown'
  version: string
  data: unknown
}

export const App: FunctionComponent = () => {
  const [document, setDocument] = useState<OscalDocument | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFile = async (file: File) => {
    try {
      const text = await file.text()
      const json = JSON.parse(text)

      // Detect document type
      const type = detectDocumentType(json)
      const version = detectVersion(json)

      setDocument({ type, version, data: json })
      setError(null)
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
      <header class="header">
        <h1>OSCAL Viewer</h1>
        <p>Universal viewer for OSCAL 1.0.x to latest</p>
      </header>

      <main class="main">
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
            <div class="document-header">
              <span class="document-type">{document.type}</span>
              <span class="document-version">OSCAL {document.version}</span>
              <button
                class="btn-clear"
                onClick={() => setDocument(null)}
              >
                Load another file
              </button>
            </div>
            <div class="document-content">
              {/* Renderer will go here based on document type */}
              <pre>{JSON.stringify(document.data, null, 2)}</pre>
            </div>
          </div>
        )}

        {error && (
          <div class="error-message">
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

function detectDocumentType(json: unknown): OscalDocument['type'] {
  if (typeof json !== 'object' || json === null) return 'unknown'

  const obj = json as Record<string, unknown>

  if ('catalog' in obj) return 'catalog'
  if ('profile' in obj) return 'profile'
  if ('component-definition' in obj) return 'component-definition'
  if ('system-security-plan' in obj) return 'system-security-plan'

  return 'unknown'
}

function detectVersion(json: unknown): string {
  if (typeof json !== 'object' || json === null) return 'unknown'

  const obj = json as Record<string, unknown>

  // Try to find version in common locations
  for (const key of ['catalog', 'profile', 'component-definition', 'system-security-plan']) {
    const doc = obj[key] as Record<string, unknown> | undefined
    if (doc?.metadata) {
      const metadata = doc.metadata as Record<string, unknown>
      if (metadata['oscal-version']) {
        return String(metadata['oscal-version'])
      }
    }
  }

  return 'unknown'
}
