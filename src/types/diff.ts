/**
 * Diff Type Definitions — Types for OSCAL document comparison results.
 *
 * Used by the differ service to express structural differences
 * between two OSCAL documents of the same type.
 */
import type { DocumentType } from './oscal'

/** Possible diff states for any compared element. */
export type DiffStatus = 'added' | 'removed' | 'modified' | 'unchanged'

/** A single compared element with its status and both versions. */
export interface DiffEntry<T> {
  status: DiffStatus
  key: string
  label: string
  left?: T
  right?: T
  /** Human-readable descriptions of what changed (for 'modified' entries). */
  changes?: string[]
}

/** Summary counts for a diff operation. */
export interface DiffSummary {
  added: number
  removed: number
  modified: number
  unchanged: number
  total: number
}

/** Comparison of two metadata sections. */
export interface MetadataDiff {
  titleChanged: boolean
  versionChanged: boolean
  oscalVersionChanged: boolean
  lastModifiedChanged: boolean
  left: { title: string; version: string; oscalVersion: string; lastModified: string }
  right: { title: string; version: string; oscalVersion: string; lastModified: string }
}

/** A named section of diff entries (e.g. "Controls", "Groups", "Parameters"). */
export interface DiffSection {
  title: string
  summary: DiffSummary
  entries: DiffEntry<unknown>[]
}

/** Complete diff result for any document type. */
export interface DocumentDiffResult {
  type: DocumentType
  metadata: MetadataDiff
  summary: DiffSummary
  sections: DiffSection[]
}
