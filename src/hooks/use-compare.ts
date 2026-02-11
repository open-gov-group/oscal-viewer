/**
 * useCompare — Hook for managing document comparison state.
 *
 * Handles loading a second document, validating type compatibility,
 * computing the diff result, and clearing comparison mode.
 */
import { useState, useCallback } from 'preact/hooks'
import type { OscalDocument } from '@/types/oscal'
import type { DocumentDiffResult } from '@/types/diff'
import { parseOscalText } from '@/parser'
import { diffDocuments } from '@/services/differ'

interface UseCompareReturn {
  compareDocument: OscalDocument | null
  diffResult: DocumentDiffResult | null
  loading: boolean
  error: string | null
  /** Load a comparison document from a File object. */
  loadFile: (file: File, baseDocument: OscalDocument) => void
  /** Load a comparison document from a URL. */
  loadUrl: (url: string, baseDocument: OscalDocument) => void
  /** Exit comparison mode. */
  clear: () => void
}

export function useCompare(): UseCompareReturn {
  const [compareDocument, setCompareDocument] = useState<OscalDocument | null>(null)
  const [diffResult, setDiffResult] = useState<DocumentDiffResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const processDocument = useCallback((doc: OscalDocument, baseDocument: OscalDocument) => {
    if (doc.data.type !== baseDocument.data.type) {
      setError(`Cannot compare ${baseDocument.data.type} with ${doc.data.type}. Documents must be the same type.`)
      setLoading(false)
      return
    }
    const result = diffDocuments(doc.data.type, baseDocument.data.document, doc.data.document)
    setCompareDocument(doc)
    setDiffResult(result)
    setError(null)
    setLoading(false)
  }, [])

  const loadFile = useCallback((file: File, baseDocument: OscalDocument) => {
    setLoading(true)
    setError(null)
    const reader = new FileReader()
    reader.onload = () => {
      const text = reader.result as string
      const parseResult = parseOscalText(text)
      if (!parseResult.success) {
        setError(parseResult.error)
        setLoading(false)
        return
      }
      processDocument(parseResult.data, baseDocument)
    }
    reader.onerror = () => {
      setError('Failed to read comparison file')
      setLoading(false)
    }
    reader.readAsText(file)
  }, [processDocument])

  const loadUrl = useCallback((url: string, baseDocument: OscalDocument) => {
    setLoading(true)
    setError(null)
    fetch(url)
      .then(response => {
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        return response.text()
      })
      .then(text => {
        const parseResult = parseOscalText(text)
        if (!parseResult.success) {
          setError(parseResult.error)
          setLoading(false)
          return
        }
        processDocument(parseResult.data, baseDocument)
      })
      .catch(err => {
        setError(`Failed to load comparison document: ${err.message}`)
        setLoading(false)
      })
  }, [processDocument])

  const clear = useCallback(() => {
    setCompareDocument(null)
    setDiffResult(null)
    setError(null)
    setLoading(false)
  }, [])

  return { compareDocument, diffResult, loading, error, loadFile, loadUrl, clear }
}
