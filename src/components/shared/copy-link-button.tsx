import { useState, useCallback } from 'preact/hooks'
import type { FunctionComponent } from 'preact'

interface CopyLinkButtonProps {
  viewType: string
  elementId: string
}

export const CopyLinkButton: FunctionComponent<CopyLinkButtonProps> = ({ viewType, elementId }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    const url = `${location.origin}${location.pathname}#/${viewType}/${elementId}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for environments without clipboard API
    }
  }, [viewType, elementId])

  return (
    <button
      class={`copy-link-btn ${copied ? 'copied' : ''}`}
      onClick={handleCopy}
      aria-label={copied ? 'Link copied' : `Copy link to ${elementId}`}
      aria-live="polite"
      title={copied ? 'Link copied!' : 'Copy link'}
    >
      {copied ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      )}
    </button>
  )
}
