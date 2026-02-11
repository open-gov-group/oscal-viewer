/**
 * useExport — Hook for exporting OSCAL documents as JSON, Markdown, CSV, or Print/PDF.
 *
 * Wraps the exporter service functions with Blob creation and download triggering.
 * The exportPdf function invokes the browser's native print dialog.
 */
import { useCallback } from 'preact/hooks'
import type { OscalDocumentData } from '@/types/oscal'
import { exportToJson, exportToMarkdown, exportToCsv } from '@/services/exporter'

/** Sanitize a document title for use as a filename: lowercase, spaces to dashes, strip special chars. */
export function sanitizeFilename(title: string): string {
  return title
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9_-]/g, '')
    .slice(0, 80) || 'oscal-document'
}

/** Create a Blob and trigger a browser download. */
function triggerDownload(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export interface UseExportReturn {
  exportJson: () => void
  exportMarkdown: () => void
  exportCsv: () => void
  exportPdf: () => void
}

/** Provides export actions for the currently loaded OSCAL document. */
export function useExport(data: OscalDocumentData | null): UseExportReturn {
  const baseName = data ? sanitizeFilename(data.document.metadata.title) : 'oscal-document'

  const exportJson = useCallback(() => {
    if (!data) return
    triggerDownload(exportToJson(data), `${baseName}.json`, 'application/json')
  }, [data, baseName])

  const exportMarkdown = useCallback(() => {
    if (!data) return
    triggerDownload(exportToMarkdown(data), `${baseName}.md`, 'text/markdown')
  }, [data, baseName])

  const exportCsv = useCallback(() => {
    if (!data) return
    triggerDownload(exportToCsv(data), `${baseName}.csv`, 'text/csv')
  }, [data, baseName])

  const exportPdf = useCallback(() => {
    window.print()
  }, [])

  return { exportJson, exportMarkdown, exportCsv, exportPdf }
}
