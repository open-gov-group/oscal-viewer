/**
 * MetadataDiff — Side-by-side comparison of document metadata fields.
 *
 * Highlights fields that differ between the two documents.
 */
import type { FunctionComponent } from 'preact'
import type { MetadataDiff as MetadataDiffType } from '@/types/diff'

interface MetadataDiffProps {
  diff: MetadataDiffType
}

interface FieldRowProps {
  label: string
  left: string
  right: string
  changed: boolean
}

const FieldRow: FunctionComponent<FieldRowProps> = ({ label, left, right, changed }) => (
  <tr class={changed ? 'metadata-diff-row--changed' : ''}>
    <td class="metadata-diff-label">{label}</td>
    <td class="metadata-diff-value">{left}</td>
    <td class="metadata-diff-value">{right}</td>
  </tr>
)

export const MetadataDiffView: FunctionComponent<MetadataDiffProps> = ({ diff }) => {
  const hasChanges = diff.titleChanged || diff.versionChanged || diff.oscalVersionChanged || diff.lastModifiedChanged

  if (!hasChanges) {
    return <p class="metadata-diff-unchanged">Metadata is identical in both documents.</p>
  }

  return (
    <div class="metadata-diff">
      <table class="metadata-diff-table" role="table">
        <thead>
          <tr>
            <th>Field</th>
            <th>Document A</th>
            <th>Document B</th>
          </tr>
        </thead>
        <tbody>
          <FieldRow label="Title" left={diff.left.title} right={diff.right.title} changed={diff.titleChanged} />
          <FieldRow label="Version" left={diff.left.version} right={diff.right.version} changed={diff.versionChanged} />
          <FieldRow label="OSCAL Version" left={diff.left.oscalVersion} right={diff.right.oscalVersion} changed={diff.oscalVersionChanged} />
          <FieldRow label="Last Modified" left={diff.left.lastModified} right={diff.right.lastModified} changed={diff.lastModifiedChanged} />
        </tbody>
      </table>
    </div>
  )
}
