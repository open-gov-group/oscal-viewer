/**
 * DocumentViewer — Router component that delegates to the correct view
 * based on the OSCAL document type (catalog, profile, component-definition, SSP,
 * assessment-results, plan-of-action-and-milestones).
 *
 * Uses lazy loading so each view is loaded on-demand (code splitting).
 */
import { lazy, Suspense } from 'preact/compat'
import type { FunctionComponent } from 'preact'
import type { OscalDocumentData, Control } from '@/types/oscal'
import { LoadingSpinner } from '@/components/shared/loading-spinner'

const CatalogView = lazy(() =>
  import('@/components/catalog/catalog-view').then(m => ({ default: m.CatalogView }))
)
const ProfileView = lazy(() =>
  import('@/components/profile/profile-view').then(m => ({ default: m.ProfileView }))
)
const ComponentDefView = lazy(() =>
  import('@/components/component-def/component-def-view').then(m => ({ default: m.ComponentDefView }))
)
const SspView = lazy(() =>
  import('@/components/ssp/ssp-view').then(m => ({ default: m.SspView }))
)
const AssessmentResultsView = lazy(() =>
  import('@/components/assessment-results/assessment-results-view').then(m => ({ default: m.AssessmentResultsView }))
)
const PoamView = lazy(() =>
  import('@/components/poam/poam-view').then(m => ({ default: m.PoamView }))
)

interface DocumentViewerProps {
  data: OscalDocumentData
  /** Cross-document navigation callback, passed to views with import resolution (Profile, SSP). */
  onNavigate?: (url: string) => void
  /** Callback when Profile/SSP views resolve imported controls (for cross-document search). */
  onControlsResolved?: (controls: Control[]) => void
}

export const DocumentViewer: FunctionComponent<DocumentViewerProps> = ({ data, onNavigate, onControlsResolved }) => {
  const renderView = () => {
    switch (data.type) {
      case 'catalog':
        return <CatalogView catalog={data.document} />
      case 'profile':
        return <ProfileView profile={data.document} onNavigate={onNavigate} onControlsResolved={onControlsResolved} />
      case 'component-definition':
        return <ComponentDefView componentDef={data.document} />
      case 'system-security-plan':
        return <SspView ssp={data.document} onNavigate={onNavigate} onControlsResolved={onControlsResolved} />
      case 'assessment-results':
        return <AssessmentResultsView assessmentResults={data.document} />
      case 'plan-of-action-and-milestones':
        return <PoamView poam={data.document} onNavigate={onNavigate} />
    }
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      {renderView()}
    </Suspense>
  )
}
