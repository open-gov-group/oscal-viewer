import type { FunctionComponent } from 'preact'
import type { OscalDocumentData } from '@/types/oscal'
import { CatalogView } from '@/components/catalog/catalog-view'

interface DocumentViewerProps {
  data: OscalDocumentData
}

export const DocumentViewer: FunctionComponent<DocumentViewerProps> = ({ data }) => {
  switch (data.type) {
    case 'catalog':
      return <CatalogView catalog={data.document} />
    case 'profile':
      return (
        <div class="placeholder-view">
          <h2>Profile Viewer</h2>
          <p>Profile rendering will be implemented in Phase 2 (Issue #4).</p>
          <pre>{JSON.stringify(data.document, null, 2)}</pre>
        </div>
      )
    case 'component-definition':
      return (
        <div class="placeholder-view">
          <h2>Component Definition Viewer</h2>
          <p>Component Definition rendering will be implemented in Phase 2 (Issue #5).</p>
          <pre>{JSON.stringify(data.document, null, 2)}</pre>
        </div>
      )
    case 'system-security-plan':
      return (
        <div class="placeholder-view">
          <h2>System Security Plan Viewer</h2>
          <p>SSP rendering will be implemented in Phase 2 (Issue #6).</p>
          <pre>{JSON.stringify(data.document, null, 2)}</pre>
        </div>
      )
  }
}
