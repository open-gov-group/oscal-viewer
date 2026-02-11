/**
 * CompareDropzone — Secondary document loading panel for comparison mode.
 *
 * Provides file drop/browse and URL input to load a second document for comparison.
 */
import type { FunctionComponent } from 'preact'
import { useState } from 'preact/hooks'

interface CompareDropzoneProps {
  onFile: (file: File) => void
  onUrl: (url: string) => void
  loading: boolean
  error: string | null
}

export const CompareDropzone: FunctionComponent<CompareDropzoneProps> = ({ onFile, onUrl, loading, error }) => {
  const [isDragging, setIsDragging] = useState(false)
  const [urlInput, setUrlInput] = useState('')

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer?.files[0]
    if (file) onFile(file)
  }

  const handleFileInput = (e: Event) => {
    const input = e.target as HTMLInputElement
    const file = input.files?.[0]
    if (file) onFile(file)
  }

  const handleUrlSubmit = (e: Event) => {
    e.preventDefault()
    if (urlInput.trim()) onUrl(urlInput.trim())
  }

  return (
    <div
      class={`compare-dropzone ${isDragging ? 'dragging' : ''}`}
      onDrop={handleDrop}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
      onDragLeave={() => setIsDragging(false)}
    >
      {loading ? (
        <div class="loading-indicator" role="status" aria-live="polite">
          <div class="loading-spinner" aria-hidden="true" />
          <span>Loading comparison document...</span>
        </div>
      ) : (
        <div class="compare-dropzone-content">
          <h3 class="compare-dropzone-title">Load Document B for comparison</h3>
          <p class="compare-dropzone-hint">Must be the same document type as Document A</p>

          <label class="file-input-label">
            <input
              type="file"
              accept=".json,.xml"
              onChange={handleFileInput}
            />
            Browse files
          </label>

          <form class="url-input-form" onSubmit={handleUrlSubmit}>
            <input
              type="url"
              class="url-input"
              placeholder="https://example.com/oscal-document.json"
              value={urlInput}
              onInput={(e) => setUrlInput((e.target as HTMLInputElement).value)}
              aria-label="Comparison document URL"
            />
            <button type="submit" class="url-submit-btn" disabled={!urlInput.trim()}>
              Load
            </button>
          </form>

          {error && (
            <div class="compare-error" role="alert">{error}</div>
          )}
        </div>
      )}
    </div>
  )
}
