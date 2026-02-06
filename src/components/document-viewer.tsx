import type { FunctionComponent } from 'preact'
import type { OscalDocumentData } from '@/types/oscal'
import { CatalogView } from '@/components/catalog/catalog-view'
import { ProfileView } from '@/components/profile/profile-view'
import { ComponentDefView } from '@/components/component-def/component-def-view'
import { SspView } from '@/components/ssp/ssp-view'

interface DocumentViewerProps {
  data: OscalDocumentData
}

export const DocumentViewer: FunctionComponent<DocumentViewerProps> = ({ data }) => {
  switch (data.type) {
    case 'catalog':
      return <CatalogView catalog={data.document} />
    case 'profile':
      return <ProfileView profile={data.document} />
    case 'component-definition':
      return <ComponentDefView componentDef={data.document} />
    case 'system-security-plan':
      return <SspView ssp={data.document} />
  }
}
