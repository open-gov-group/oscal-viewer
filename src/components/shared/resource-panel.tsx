/**
 * ResourcePanel — Shared component for rendering OSCAL back-matter resources.
 *
 * Displays resources from the back-matter section of any OSCAL document type
 * (Catalog, Profile, Component Definition, SSP). Each resource is rendered as
 * a card with title, description, rlinks, citation, document IDs, base64 info,
 * and remarks. Resources are identified by UUID for fragment-link navigation.
 */
import type { FunctionComponent } from 'preact'
import type { BackMatter, Resource } from '@/types/oscal'
import { Accordion } from '@/components/shared/accordion'

interface ResourcePanelProps {
  backMatter: BackMatter
}

/** Renders all back-matter resources inside a collapsible Accordion. */
export const ResourcePanel: FunctionComponent<ResourcePanelProps> = ({ backMatter }) => {
  const resources = backMatter.resources
  if (!resources || resources.length === 0) return null

  return (
    <Accordion
      id="back-matter-resources"
      title="Resources"
      count={resources.length}
      headingLevel={3}
      defaultOpen={false}
    >
      <div class="resource-list">
        {resources.map(resource => (
          <ResourceCard key={resource.uuid} resource={resource} />
        ))}
      </div>
    </Accordion>
  )
}

interface ResourceCardProps {
  resource: Resource
}

/** Renders a single back-matter resource with all optional fields. */
const ResourceCard: FunctionComponent<ResourceCardProps> = ({ resource }) => {
  return (
    <div class="resource-card" id={`resource-${resource.uuid}`}>
      {resource.title && (
        <h4 class="resource-title">{resource.title}</h4>
      )}

      {resource.description && (
        <p class="resource-description">{resource.description}</p>
      )}

      {resource.rlinks && resource.rlinks.length > 0 && (
        <div class="resource-rlinks">
          {resource.rlinks.map((rlink, i) => (
            <a
              key={`${rlink.href}-${i}`}
              href={rlink.href}
              target="_blank"
              rel="noopener noreferrer"
              class="resource-rlink"
            >
              {rlink.href}
              {rlink['media-type'] && (
                <span class="resource-media-type">{rlink['media-type']}</span>
              )}
            </a>
          ))}
        </div>
      )}

      {resource.citation && (
        <div class="resource-citation">
          <span class="resource-citation-label">Citation:</span> {resource.citation.text}
        </div>
      )}

      {resource['document-ids'] && resource['document-ids'].length > 0 && (
        <div class="resource-doc-ids">
          {resource['document-ids'].map((id, i) => (
            <span key={`${id.identifier}-${i}`}>
              <code>{id.identifier}</code>
              {id.scheme && (
                <span class="resource-doc-id-scheme">{id.scheme}</span>
              )}
            </span>
          ))}
        </div>
      )}

      {resource.base64 && (
        <div class="resource-base64">
          <span class="resource-base64-label">Embedded:</span>{' '}
          {resource.base64.filename ?? 'Binary data'} ({resource.base64['media-type'] ?? 'unknown type'})
        </div>
      )}

      {resource.remarks && (
        <p class="resource-remarks">{resource.remarks}</p>
      )}
    </div>
  )
}
