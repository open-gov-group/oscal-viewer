import type { FunctionComponent } from 'preact'
import type { Metadata, Party } from '@/types/oscal'

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
      </div>

      {metadata.parties && metadata.parties.length > 0 && (
        <div class="metadata-parties">
          <h4 class="metadata-section-title">Parties ({metadata.parties.length})</h4>
          {metadata.parties.map(party => (
            <PartyCard key={party.uuid} party={party} />
          ))}
        </div>
      )}

      {metadata.links && metadata.links.length > 0 && (
        <div class="metadata-links">
          <h4 class="metadata-section-title">Links ({metadata.links.length})</h4>
          <ul class="links-list">
            {metadata.links.map((link, i) => (
              <li key={`${link.href}-${i}`}>
                <a href={link.href} target="_blank" rel="noopener noreferrer">
                  {link.text ?? link.href}
                </a>
                {link.rel && <span class="link-rel">{link.rel}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {metadata.remarks && (
        <div class="metadata-remarks">
          <h4 class="metadata-section-title">Remarks</h4>
          <p>{metadata.remarks}</p>
        </div>
      )}
    </details>
  )
}

interface PartyCardProps {
  party: Party
}

const PartyCard: FunctionComponent<PartyCardProps> = ({ party }) => {
  const name = party.name ?? party['short-name'] ?? party.uuid

  return (
    <div class="metadata-party-card">
      <div class="party-header">
        <span class="party-name">{name}</span>
        <span class={`party-type-badge party-type-${party.type}`}>{party.type}</span>
      </div>
      {party['email-addresses'] && party['email-addresses'].length > 0 && (
        <div class="party-contact">
          {party['email-addresses'].map(email => (
            <a key={email} href={`mailto:${email}`} class="party-email">{email}</a>
          ))}
        </div>
      )}
      {party['telephone-numbers'] && party['telephone-numbers'].length > 0 && (
        <div class="party-contact">
          {party['telephone-numbers'].map((tel, i) => (
            <span key={i} class="party-phone">
              {tel.number}{tel.type && <span class="party-phone-type"> ({tel.type})</span>}
            </span>
          ))}
        </div>
      )}
      {party.remarks && (
        <p class="party-remarks">{party.remarks}</p>
      )}
    </div>
  )
}
