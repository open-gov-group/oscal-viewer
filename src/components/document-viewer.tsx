/**
 * DocumentViewer — Router component that delegates to the correct view
 * based on the OSCAL document type (catalog, profile, component-definition, SSP,
 * assessment-results, plan-of-action-and-milestones).
 */
import type { FunctionComponent } from 'preact'
import type { OscalDocumentData } from '@/types/oscal'
import { CatalogView } from '@/components/catalog/catalog-view'
import { ProfileView } from '@/components/profile/profile-view'
import { ComponentDefView } from '@/components/component-def/component-def-view'
import { SspView } from '@/components/ssp/ssp-view'
import { AssessmentResultsView } from '@/components/assessment-results/assessment-results-view'
import { PoamView } from '@/components/poam/poam-view'

interface DocumentViewerProps {
  data: OscalDocumentData
  /** Cross-document navigation callback, passed to views with import resolution (Profile, SSP). */
  onNavigate?: (url: string) => void
}

export const DocumentViewer: FunctionComponent<DocumentViewerProps> = ({ data, onNavigate }) => {
  switch (data.type) {
    case 'catalog':
      return <CatalogView catalog={data.document} />
    case 'profile':
      return <ProfileView profile={data.document} onNavigate={onNavigate} />
    case 'component-definition':
      return <ComponentDefView componentDef={data.document} />
    case 'system-security-plan':
      return <SspView ssp={data.document} onNavigate={onNavigate} />
    case 'assessment-results':
      return <AssessmentResultsView assessmentResults={data.document} />
    case 'plan-of-action-and-milestones':
      return <PoamView poam={data.document} onNavigate={onNavigate} />
  }
}
