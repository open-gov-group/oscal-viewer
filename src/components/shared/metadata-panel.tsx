import type { FunctionComponent } from 'preact'
import type { Metadata } from '@/types/oscal'

interface MetadataPanelProps {
  metadata: Metadata
}

export const MetadataPanel: FunctionComponent<MetadataPanelProps> = ({ metadata }) => {
  return (
    <details class="metadata-panel">
      <summary>Metadata</summary>
      <div class="metadata-grid">
        <div class="metadata-field">
          <span class="metadata-label">Title</span>
          <span class="metadata-value">{metadata.title}</span>
        </div>
        <div class="metadata-field">
          <span class="metadata-label">Version</span>
          <span class="metadata-value">{metadata.version}</span>
        </div>
        <div class="metadata-field">
          <span class="metadata-label">OSCAL Version</span>
          <span class="metadata-value">{metadata['oscal-version']}</span>
        </div>
        <div class="metadata-field">
          <span class="metadata-label">Last Modified</span>
          <span class="metadata-value">
            {new Date(metadata['last-modified']).toLocaleDateString()}
          </span>
        </div>
        {metadata.published && (
          <div class="metadata-field">
            <span class="metadata-label">Published</span>
            <span class="metadata-value">
              {new Date(metadata.published).toLocaleDateString()}
            </span>
          </div>
        )}
        {metadata.roles && metadata.roles.length > 0 && (
          <div class="metadata-field">
            <span class="metadata-label">Roles</span>
            <span class="metadata-value">{metadata.roles.map(r => r.title).join(', ')}</span>
          </div>
        )}
        {metadata.parties && metadata.parties.length > 0 && (
          <div class="metadata-field">
            <span class="metadata-label">Parties</span>
            <span class="metadata-value">
              {metadata.parties.map(p => p.name ?? p['short-name'] ?? p.uuid).join(', ')}
            </span>
          </div>
        )}
      </div>
    </details>
  )
}
