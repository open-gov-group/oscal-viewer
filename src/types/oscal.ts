/**
 * OSCAL Type Definitions — TypeScript interfaces for all six OSCAL model types.
 *
 * Based on NIST OSCAL v1.0.x – v1.1.2+ JSON Schema.
 * All property names use kebab-case matching the official OSCAL JSON format.
 * Optional fields with `?` are present in some but not all OSCAL versions.
 */

// ============================================================
// Common / Shared Types
// ============================================================

export type DocumentType = 'catalog' | 'profile' | 'component-definition' | 'system-security-plan' | 'assessment-results' | 'plan-of-action-and-milestones'

export interface Property {
  name: string
  value: string
  uuid?: string
  ns?: string
  class?: string
  group?: string // Added in 1.1.x
  remarks?: string
}

export interface Link {
  href: string
  rel?: string
  'media-type'?: string
  text?: string
  'resource-fragment'?: string // Added in 1.1.x
}

export interface DocumentId {
  scheme?: string
  identifier: string
}

export interface Role {
  id: string
  title: string
  'short-name'?: string
  description?: string
  props?: Property[]
  links?: Link[]
  remarks?: string
}

export interface Party {
  uuid: string
  type: 'person' | 'organization'
  name?: string
  'short-name'?: string
  'external-ids'?: Array<{ scheme: string; id: string }>
  'email-addresses'?: string[]
  'telephone-numbers'?: Array<{ type?: string; number: string }>
  'member-of-organizations'?: string[]
  'location-uuids'?: string[]
  props?: Property[]
  links?: Link[]
  remarks?: string
}

export interface ResponsibleParty {
  'role-id': string
  'party-uuids': string[]
  props?: Property[]
  links?: Link[]
  remarks?: string
}

export interface ResponsibleRole {
  'role-id': string
  'party-uuids'?: string[]
  props?: Property[]
  links?: Link[]
  remarks?: string
}

export interface Location {
  uuid: string
  title?: string
  address?: Address
  'email-addresses'?: string[]
  'telephone-numbers'?: Array<{ type?: string; number: string }>
  urls?: string[]
  props?: Property[]
  links?: Link[]
  remarks?: string
}

export interface Address {
  type?: string
  'addr-lines'?: string[]
  city?: string
  state?: string
  'postal-code'?: string
  country?: string
}

export interface Resource {
  uuid: string
  title?: string
  description?: string
  props?: Property[]
  'document-ids'?: DocumentId[]
  citation?: { text: string; props?: Property[]; links?: Link[] }
  rlinks?: Array<{ href: string; 'media-type'?: string; hashes?: Array<{ algorithm: string; value: string }> }>
  base64?: { filename?: string; 'media-type'?: string; value: string }
  remarks?: string
}

export interface BackMatter {
  resources?: Resource[]
}

export interface Revision {
  version: string
  title?: string
  'last-modified'?: string
  'oscal-version'?: string
  published?: string
  props?: Property[]
  links?: Link[]
  remarks?: string
}

export interface Metadata {
  title: string
  'last-modified': string
  version: string
  'oscal-version': string
  published?: string
  revisions?: Revision[]
  'document-ids'?: DocumentId[]
  props?: Property[]
  links?: Link[]
  roles?: Role[]
  locations?: Location[]
  parties?: Party[]
  'responsible-parties'?: ResponsibleParty[]
  remarks?: string
}

// ============================================================
// Catalog Types
// ============================================================

export interface ParameterSelection {
  'how-many'?: 'one' | 'one-or-more'
  choice?: string[]
}

export interface ParameterConstraint {
  description?: string
  tests?: Array<{ expression: string; remarks?: string }>
}

export interface ParameterGuideline {
  prose: string
}

export interface Parameter {
  id: string
  class?: string
  'depends-on'?: string // Deprecated in 1.1.x
  props?: Property[]
  links?: Link[]
  label?: string
  usage?: string
  constraints?: ParameterConstraint[]
  guidelines?: ParameterGuideline[]
  values?: string[]
  select?: ParameterSelection
  remarks?: string
}

export interface Part {
  name: string
  id?: string
  ns?: string
  class?: string
  title?: string
  props?: Property[]
  prose?: string
  parts?: Part[]
  links?: Link[]
}

export interface Control {
  id: string
  title: string
  class?: string
  params?: Parameter[]
  props?: Property[]
  links?: Link[]
  parts?: Part[]
  controls?: Control[] // Nested sub-controls
}

export interface Group {
  title: string
  id?: string
  class?: string
  params?: Parameter[]
  props?: Property[]
  links?: Link[]
  parts?: Part[]
  groups?: Group[] // Nested sub-groups
  controls?: Control[]
}

export interface Catalog {
  uuid: string
  metadata: Metadata
  params?: Parameter[]
  controls?: Control[]
  groups?: Group[]
  'back-matter'?: BackMatter
}

// ============================================================
// Profile Types
// ============================================================

export interface SelectControlById {
  'with-ids'?: string[]
  matching?: Array<{ pattern: string }>
  'with-child-controls'?: 'yes' | 'no'
}

export interface ProfileImport {
  href: string
  'include-all'?: Record<string, never>
  'include-controls'?: SelectControlById[]
  'exclude-controls'?: SelectControlById[]
}

export interface Merge {
  combine?: { method: 'use-first' | 'merge' | 'keep' }
  flat?: Record<string, never>
  'as-is'?: boolean
  custom?: { groups?: Group[]; 'insert-controls'?: unknown[] }
}

export interface SetParameter {
  'param-id': string
  class?: string
  props?: Property[]
  links?: Link[]
  label?: string
  usage?: string
  constraints?: ParameterConstraint[]
  guidelines?: ParameterGuideline[]
  values?: string[]
  select?: ParameterSelection
}

export interface Remove {
  'by-name'?: string
  'by-class'?: string
  'by-id'?: string
  'by-item-name'?: string
  'by-ns'?: string
}

export interface Add {
  position?: 'before' | 'after' | 'starting' | 'ending'
  'by-id'?: string
  title?: string
  params?: Parameter[]
  props?: Property[]
  links?: Link[]
  parts?: Part[]
}

export interface Alter {
  'control-id': string
  removes?: Remove[]
  adds?: Add[]
}

export interface Modify {
  'set-parameters'?: SetParameter[]
  alters?: Alter[]
}

export interface Profile {
  uuid: string
  metadata: Metadata
  imports: ProfileImport[]
  merge?: Merge
  modify?: Modify
  'back-matter'?: BackMatter
}

// ============================================================
// Component Definition Types
// ============================================================

export interface ImplementedRequirement {
  uuid: string
  'control-id': string
  description: string
  props?: Property[]
  links?: Link[]
  'set-parameters'?: SetParameter[]
  'responsible-roles'?: ResponsibleRole[]
  statements?: Array<{
    'statement-id': string
    uuid: string
    description: string
    props?: Property[]
    links?: Link[]
    'responsible-roles'?: ResponsibleRole[]
    remarks?: string
  }>
  remarks?: string
}

export interface ControlImplementation {
  uuid: string
  source: string
  description: string
  'implemented-requirements': ImplementedRequirement[]
  props?: Property[]
  links?: Link[]
  'set-parameters'?: SetParameter[]
}

export interface DefinedComponent {
  uuid: string
  type: string
  title: string
  description: string
  purpose?: string
  props?: Property[]
  links?: Link[]
  'responsible-roles'?: ResponsibleRole[]
  protocols?: Array<{ uuid: string; name: string; title?: string; 'port-ranges'?: unknown[] }>
  'control-implementations'?: ControlImplementation[]
  remarks?: string
}

export interface Capability {
  uuid: string
  name: string
  description: string
  props?: Property[]
  links?: Link[]
  'incorporates-components'?: Array<{ 'component-uuid': string; description: string }>
  'control-implementations'?: ControlImplementation[]
  remarks?: string
}

export interface ComponentDefinition {
  uuid: string
  metadata: Metadata
  'import-component-definitions'?: Array<{ href: string }>
  components?: DefinedComponent[]
  capabilities?: Capability[]
  'back-matter'?: BackMatter
}

// ============================================================
// System Security Plan (SSP) Types
// ============================================================

export interface SystemId {
  'identifier-type'?: string
  id: string
}

export interface SystemInformation {
  'information-types': Array<{
    uuid?: string
    title: string
    description: string
    categorizations?: Array<{ system: string; 'information-type-ids'?: string[] }>
    'confidentiality-impact'?: { base: string; selected?: string; 'adjustment-justification'?: string }
    'integrity-impact'?: { base: string; selected?: string; 'adjustment-justification'?: string }
    'availability-impact'?: { base: string; selected?: string; 'adjustment-justification'?: string }
    props?: Property[]
    links?: Link[]
  }>
  props?: Property[]
  links?: Link[]
}

export interface SystemStatus {
  state: 'operational' | 'under-development' | 'under-major-modification' | 'disposition' | 'other'
  remarks?: string
}

export interface Diagram {
  uuid: string
  description?: string
  caption?: string
  links?: Link[]
  props?: Property[]
  remarks?: string
}

export interface AuthorizationBoundary {
  description: string
  diagrams?: Diagram[]
  links?: Link[]
  props?: Property[]
  remarks?: string
}

export interface SystemCharacteristics {
  'system-ids': SystemId[]
  'system-name': string
  'system-name-short'?: string
  description: string
  'security-sensitivity-level'?: string
  'system-information': SystemInformation
  'security-impact-level'?: {
    'security-objective-confidentiality': string
    'security-objective-integrity': string
    'security-objective-availability': string
  }
  status: SystemStatus
  'authorization-boundary': AuthorizationBoundary
  'date-authorized'?: string
  props?: Property[]
  links?: Link[]
  'responsible-parties'?: ResponsibleParty[]
  remarks?: string
}

export interface SystemUser {
  uuid: string
  title?: string
  'short-name'?: string
  description?: string
  props?: Property[]
  links?: Link[]
  'role-ids'?: string[]
  'authorized-privileges'?: Array<{ title: string; description?: string; 'functions-performed': string[] }>
  remarks?: string
}

export interface SystemComponent {
  uuid: string
  type: string
  title: string
  description: string
  status: SystemStatus
  purpose?: string
  props?: Property[]
  links?: Link[]
  'responsible-roles'?: ResponsibleRole[]
  protocols?: Array<{ uuid: string; name: string; title?: string }>
  remarks?: string
}

export interface InventoryItem {
  uuid: string
  description: string
  props?: Property[]
  links?: Link[]
  'responsible-parties'?: ResponsibleParty[]
  'implemented-components'?: Array<{
    'component-uuid': string
    props?: Property[]
    links?: Link[]
    'responsible-parties'?: ResponsibleParty[]
    remarks?: string
  }>
  remarks?: string
}

export interface SystemImplementation {
  users: SystemUser[]
  components: SystemComponent[]
  'inventory-items'?: InventoryItem[]
  'leveraged-authorizations'?: Array<{
    uuid: string
    title: string
    'party-uuid': string
    'date-authorized': string
    props?: Property[]
    links?: Link[]
    remarks?: string
  }>
  props?: Property[]
  links?: Link[]
  remarks?: string
}

export interface SspControlImplementation {
  description: string
  'set-parameters'?: SetParameter[]
  'implemented-requirements': Array<{
    uuid: string
    'control-id': string
    props?: Property[]
    links?: Link[]
    'set-parameters'?: SetParameter[]
    'responsible-roles'?: ResponsibleRole[]
    statements?: Array<{
      'statement-id': string
      uuid: string
      props?: Property[]
      links?: Link[]
      'responsible-roles'?: ResponsibleRole[]
      'by-components'?: Array<{
        'component-uuid': string
        uuid: string
        description: string
        props?: Property[]
        links?: Link[]
        'set-parameters'?: SetParameter[]
        'implementation-status'?: { state: string; remarks?: string }
        'responsible-roles'?: ResponsibleRole[]
        remarks?: string
      }>
      remarks?: string
    }>
    'by-components'?: Array<{
      'component-uuid': string
      uuid: string
      description: string
      props?: Property[]
      links?: Link[]
      remarks?: string
    }>
    remarks?: string
  }>
}

export interface SystemSecurityPlan {
  uuid: string
  metadata: Metadata
  'import-profile': { href: string; remarks?: string }
  'system-characteristics': SystemCharacteristics
  'system-implementation': SystemImplementation
  'control-implementation': SspControlImplementation
  'back-matter'?: BackMatter
}

// ============================================================
// Assessment Results Types
// ============================================================

/** Subject of an assessment activity (component, inventory-item, party, etc.). */
export interface AssessmentSubject {
  type: 'component' | 'inventory-item' | 'location' | 'party' | 'user'
  description?: string
  props?: Property[]
  links?: Link[]
  'include-all'?: Record<string, never>
  'include-subjects'?: Array<{ 'subject-uuid': string; type: string }>
  'exclude-subjects'?: Array<{ 'subject-uuid': string; type: string }>
}

/** Evidence supporting an observation. */
export interface RelevantEvidence {
  href?: string
  description: string
  props?: Property[]
  links?: Link[]
  remarks?: string
}

/** An observation made during an assessment. */
export interface Observation {
  uuid: string
  title?: string
  description: string
  methods: string[]
  types?: string[]
  subjects?: AssessmentSubject[]
  'relevant-evidence'?: RelevantEvidence[]
  collected: string
  expires?: string
  props?: Property[]
  links?: Link[]
  remarks?: string
}

/** Target of a finding — identifies the assessed control and its satisfaction status. */
export interface FindingTarget {
  type: 'statement-id' | 'objective-id'
  'target-id': string
  title?: string
  description?: string
  status: { state: 'satisfied' | 'not-satisfied' }
  props?: Property[]
  links?: Link[]
  remarks?: string
}

/** A finding from an assessment — links a control to its satisfaction status. */
export interface Finding {
  uuid: string
  title: string
  description: string
  target: FindingTarget
  'related-observations'?: Array<{ 'observation-uuid': string }>
  'related-risks'?: Array<{ 'risk-uuid': string }>
  'implementation-statement-uuid'?: string
  props?: Property[]
  links?: Link[]
  remarks?: string
}

/** Characterization facet for risk analysis. */
export interface RiskCharacterization {
  props: Property[]
  links?: Link[]
  facets?: Array<{ name: string; system: string; value: string; props?: Property[] }>
}

/** A risk identified during assessment. */
export interface Risk {
  uuid: string
  title: string
  description: string
  statement?: string
  status: string
  characterizations?: RiskCharacterization[]
  'mitigating-factors'?: Array<{ uuid: string; description: string }>
  props?: Property[]
  links?: Link[]
  remarks?: string
}

/** A single assessment result entry with findings, observations, and risks. */
export interface AssessmentResult {
  uuid: string
  title: string
  description: string
  start: string
  end?: string
  props?: Property[]
  links?: Link[]
  'reviewed-controls'?: {
    'control-selections': Array<{
      'include-all'?: Record<string, never>
      'include-controls'?: SelectControlById[]
    }>
  }
  findings?: Finding[]
  observations?: Observation[]
  risks?: Risk[]
  remarks?: string
}

/** OSCAL Assessment Results document. */
export interface AssessmentResults {
  uuid: string
  metadata: Metadata
  'import-ap'?: { href: string }
  'local-definitions'?: Record<string, unknown>
  results: AssessmentResult[]
  'back-matter'?: BackMatter
}

// ============================================================
// Plan of Action and Milestones (POA&M) Types
// ============================================================

/** A milestone in a POA&M remediation plan. */
export interface PoamMilestone {
  uuid: string
  title: string
  description?: string
  schedule?: {
    tasks?: Array<{
      uuid: string
      title: string
      description?: string
      start?: string
      end?: string
    }>
  }
  props?: Property[]
  links?: Link[]
  remarks?: string
}

/** A POA&M item representing a remediation action. */
export interface PoamItem {
  uuid: string
  title: string
  description: string
  'related-findings'?: Array<{ 'finding-uuid': string }>
  'related-observations'?: Array<{ 'observation-uuid': string }>
  'related-risks'?: Array<{ 'risk-uuid': string }>
  origins?: Array<{ actors: Array<{ type: string; 'actor-uuid': string }> }>
  milestones?: PoamMilestone[]
  props?: Property[]
  links?: Link[]
  remarks?: string
}

/** OSCAL Plan of Action and Milestones document. */
export interface PlanOfActionAndMilestones {
  uuid: string
  metadata: Metadata
  'import-ssp'?: { href: string; remarks?: string }
  'local-definitions'?: Record<string, unknown>
  findings?: Finding[]
  observations?: Observation[]
  risks?: Risk[]
  'poam-items': PoamItem[]
  'back-matter'?: BackMatter
}

// ============================================================
// Parse Result & Document Wrapper
// ============================================================

export type ParseResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }

export type OscalDocumentData =
  | { type: 'catalog'; document: Catalog }
  | { type: 'profile'; document: Profile }
  | { type: 'component-definition'; document: ComponentDefinition }
  | { type: 'system-security-plan'; document: SystemSecurityPlan }
  | { type: 'assessment-results'; document: AssessmentResults }
  | { type: 'plan-of-action-and-milestones'; document: PlanOfActionAndMilestones }

export interface OscalDocument {
  type: DocumentType
  version: string
  data: OscalDocumentData
}
