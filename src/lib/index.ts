// Public API entry point for @open-gov-group/oscal-parser
// Re-exports all types and parser functions as a framework-independent package

// Types
export type {
  DocumentType,
  Property,
  Link,
  DocumentId,
  Role,
  Party,
  ResponsibleParty,
  ResponsibleRole,
  Location,
  Address,
  Resource,
  BackMatter,
  Revision,
  Metadata,
  ParameterSelection,
  ParameterConstraint,
  ParameterGuideline,
  Parameter,
  Part,
  Control,
  Group,
  Catalog,
  SelectControlById,
  ProfileImport,
  Merge,
  SetParameter,
  Remove,
  Add,
  Alter,
  Modify,
  Profile,
  ImplementedRequirement,
  ControlImplementation,
  DefinedComponent,
  Capability,
  ComponentDefinition,
  SystemId,
  SystemInformation,
  SystemStatus,
  Diagram,
  AuthorizationBoundary,
  SystemCharacteristics,
  SystemUser,
  SystemComponent,
  InventoryItem,
  SystemImplementation,
  SspControlImplementation,
  SystemSecurityPlan,
  AssessmentSubject,
  RelevantEvidence,
  Observation,
  FindingTarget,
  Finding,
  RiskCharacterization,
  Risk,
  AssessmentResult,
  AssessmentResults,
  PoamMilestone,
  PoamItem,
  PlanOfActionAndMilestones,
  ParseResult,
  OscalDocumentData,
  OscalDocument,
} from '@/types/oscal'

// Parser functions
export { parseOscalDocument } from '@/parser'
export { parseCatalog, countControls } from '@/parser/catalog'
export { parseProfile } from '@/parser/profile'
export { parseComponentDefinition } from '@/parser/component-definition'
export { parseSSP } from '@/parser/ssp'
export { parseAssessmentResults } from '@/parser/assessment-results'
export { parsePoam } from '@/parser/poam'
export { detectDocumentType, detectVersion } from '@/parser/detect'
