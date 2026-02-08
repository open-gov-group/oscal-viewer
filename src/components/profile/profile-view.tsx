/**
 * ProfileView — View for OSCAL Profile documents.
 *
 * Displays profile metadata, import sources (with include/exclude control selections),
 * merge strategy (combine method, flat, as-is), and modifications
 * (parameter settings + control alterations with add/remove badges).
 */
import { useMemo } from 'preact/hooks'
import type { FunctionComponent } from 'preact'
import type { Profile, ProfileImport, Modify, Alter, SetParameter } from '@/types/oscal'
import { MetadataPanel } from '@/components/shared/metadata-panel'
import { PropertyList } from '@/components/shared/property-badge'
import { Accordion } from '@/components/shared/accordion'

interface ProfileViewProps {
  profile: Profile
}

/** Renders a complete OSCAL Profile with import sources, merge strategy, and modifications. */
export const ProfileView: FunctionComponent<ProfileViewProps> = ({ profile }) => {
  // Aggregate stats for the profile summary bar (imports, parameter overrides, alterations)
  const stats = useMemo(() => ({
    imports: profile.imports.length,
    setParameters: profile.modify?.['set-parameters']?.length ?? 0,
    alters: profile.modify?.alters?.length ?? 0,
  }), [profile])

  return (
    <div class="profile-view">
      <MetadataPanel metadata={profile.metadata} />

      <div class="profile-stats">
        <span class="stat">
          <strong>{stats.imports}</strong> Import{stats.imports !== 1 ? 's' : ''}
        </span>
        {stats.setParameters > 0 && (
          <span class="stat">
            <strong>{stats.setParameters}</strong> Parameter Settings
          </span>
        )}
        {stats.alters > 0 && (
          <span class="stat">
            <strong>{stats.alters}</strong> Alterations
          </span>
        )}
      </div>

      <Accordion
        id="profile-imports"
        title="Imports"
        count={profile.imports.length}
        defaultOpen={true}
        headingLevel={3}
      >
        <div class="profile-imports">
          {profile.imports.map((imp, i) => (
            <ImportCard key={`${imp.href}-${i}`} import_={imp} index={i} />
          ))}
        </div>
      </Accordion>

      {profile.merge && (
        <div class="content-box">
          <div class="content-box-header">
            <h3>Merge Strategy</h3>
          </div>
          <MergeInfo merge={profile.merge} />
        </div>
      )}

      {profile.modify && (
        <ModifySection modify={profile.modify} />
      )}
    </div>
  )
}

interface ImportCardProps {
  import_: ProfileImport
  index: number
}

/** Renders a single profile import source with href, include/exclude control selections. */
const ImportCard: FunctionComponent<ImportCardProps> = ({ import_, index }) => {
  // OSCAL profiles support three control selection modes: include-all, include by ID/pattern, exclude by ID/pattern
  const hasIncludeAll = import_['include-all'] !== undefined
  const includeControls = import_['include-controls']
  const excludeControls = import_['exclude-controls']

  return (
    <div class="profile-import-card">
      <div class="import-header">
        <span class="import-index">Import #{index + 1}</span>
        <code class="import-href">{import_.href}</code>
      </div>

      {hasIncludeAll && (
        <span class="import-tag import-tag--include">Include All</span>
      )}

      {includeControls && includeControls.length > 0 && (
        <div class="import-controls">
          <span class="import-controls-label">Include Controls:</span>
          {includeControls.map((sel, i) => (
            <ControlSelection key={i} selection={sel} type="include" />
          ))}
        </div>
      )}

      {excludeControls && excludeControls.length > 0 && (
        <div class="import-controls">
          <span class="import-controls-label">Exclude Controls:</span>
          {excludeControls.map((sel, i) => (
            <ControlSelection key={i} selection={sel} type="exclude" />
          ))}
        </div>
      )}
    </div>
  )
}

interface ControlSelectionProps {
  selection: { 'with-ids'?: string[]; matching?: Array<{ pattern: string }>; 'with-child-controls'?: 'yes' | 'no' }
  type: 'include' | 'exclude'
}

/** Renders control selection criteria (by ID or pattern matching) as color-coded tags. */
const ControlSelection: FunctionComponent<ControlSelectionProps> = ({ selection, type }) => {
  return (
    <div class="control-selection">
      {selection['with-ids']?.map(id => (
        <span key={id} class={`import-tag import-tag--${type}`}>{id}</span>
      ))}
      {selection.matching?.map((m, i) => (
        <span key={i} class={`import-tag import-tag--${type}`}>
          pattern: {m.pattern}
        </span>
      ))}
      {/* with-child-controls flag includes all descendant controls of the selected IDs */}
      {selection['with-child-controls'] === 'yes' && (
        <span class="import-tag import-tag--info">+ child controls</span>
      )}
    </div>
  )
}

interface MergeInfoProps {
  merge: Profile['merge']
}

/**
 * Displays the profile merge strategy: combine method (use-first/merge/keep), flat, or as-is.
 * OSCAL profiles use merge to define how imported controls are combined into a single catalog.
 */
const MergeInfo: FunctionComponent<MergeInfoProps> = ({ merge }) => {
  if (!merge) return null

  return (
    <div class="profile-merge-info">
      {merge.combine && (
        <div class="merge-detail">
          <span class="merge-label">Combine Method:</span>
          <code class="merge-value">{merge.combine.method}</code>
        </div>
      )}
      {merge.flat !== undefined && (
        <div class="merge-detail">
          <span class="merge-label">Structure:</span>
          <span class="merge-value">Flat</span>
        </div>
      )}
      {merge['as-is'] !== undefined && (
        <div class="merge-detail">
          <span class="merge-label">Structure:</span>
          <span class="merge-value">As-Is (preserve source structure)</span>
        </div>
      )}
    </div>
  )
}

interface ModifySectionProps {
  modify: Modify
}

/** Renders the modify section: parameter settings and control alterations in Accordions. */
const ModifySection: FunctionComponent<ModifySectionProps> = ({ modify }) => {
  const setParams = modify['set-parameters']
  const alters = modify.alters

  return (
    <>
      {setParams && setParams.length > 0 && (
        <Accordion
          id="profile-params"
          title="Parameter Settings"
          count={setParams.length}
          defaultOpen={true}
          headingLevel={3}
        >
          <div class="profile-params-list">
            {setParams.map(sp => (
              <SetParameterCard key={sp['param-id']} param={sp} />
            ))}
          </div>
        </Accordion>
      )}

      {alters && alters.length > 0 && (
        <Accordion
          id="profile-alters"
          title="Alterations"
          count={alters.length}
          headingLevel={3}
        >
          <div class="profile-alters-list">
            {alters.map((alter, i) => (
              <AlterCard key={`${alter['control-id']}-${i}`} alter={alter} />
            ))}
          </div>
        </Accordion>
      )}
    </>
  )
}

interface SetParameterCardProps {
  param: SetParameter
}

/** Renders a parameter override card with id, label, values, selection, and constraints. */
const SetParameterCard: FunctionComponent<SetParameterCardProps> = ({ param }) => {
  return (
    <div class="profile-param-card">
      <div class="param-header">
        <code class="param-id">{param['param-id']}</code>
        {param.label && <span class="param-label">{param.label}</span>}
      </div>
      {param.props && param.props.length > 0 && (
        <PropertyList props={param.props} />
      )}
      {param.values && param.values.length > 0 && (
        <div class="param-values">
          <span class="param-values-label">Values:</span>
          {param.values.map((v, i) => (
            <code key={i} class="param-value">{v}</code>
          ))}
        </div>
      )}
      {/* OSCAL select.how-many: 'one-or-more' allows multi-select, default is single-select */}
      {param.select && (
        <div class="param-select">
          <span class="param-select-label">
            Select {param.select['how-many'] === 'one-or-more' ? 'one or more' : 'one'}:
          </span>
          {param.select.choice?.map((c, i) => (
            <span key={i} class="param-choice">{c}</span>
          ))}
        </div>
      )}
      {param.constraints && param.constraints.length > 0 && (
        <div class="param-constraints">
          {param.constraints.map((c, i) => (
            <p key={i} class="param-constraint">{c.description ?? 'Constraint defined'}</p>
          ))}
        </div>
      )}
    </div>
  )
}

interface AlterCardProps {
  alter: Alter
}

/**
 * Renders a control alteration card with control-id, removal count, and addition count badges.
 * Removals target parts/props by name, class, id, or namespace. Additions specify position and content.
 */
const AlterCard: FunctionComponent<AlterCardProps> = ({ alter }) => {
  return (
    <div class="profile-alter-card">
      <div class="alter-header">
        <span class="alter-control-id">
          <code>{alter['control-id']}</code>
        </span>
        {alter.removes && alter.removes.length > 0 && (
          <span class="alter-badge alter-badge--remove">
            {alter.removes.length} removal{alter.removes.length !== 1 ? 's' : ''}
          </span>
        )}
        {alter.adds && alter.adds.length > 0 && (
          <span class="alter-badge alter-badge--add">
            {alter.adds.length} addition{alter.adds.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {alter.removes && alter.removes.length > 0 && (
        <div class="alter-details">
          <span class="alter-details-label">Removes:</span>
          {alter.removes.map((r, i) => (
            <span key={i} class="alter-remove-item">
              {r['by-name'] ?? r['by-class'] ?? r['by-id'] ?? r['by-item-name'] ?? r['by-ns'] ?? 'unspecified'}
            </span>
          ))}
        </div>
      )}

      {alter.adds && alter.adds.length > 0 && (
        <div class="alter-details">
          <span class="alter-details-label">Additions:</span>
          {alter.adds.map((a, i) => (
            <span key={i} class="alter-add-item">
              {a.position ?? 'ending'}{a['by-id'] ? ` @${a['by-id']}` : ''}
              {a.parts ? ` (${a.parts.length} part${a.parts.length !== 1 ? 's' : ''})` : ''}
              {a.props ? ` (${a.props.length} prop${a.props.length !== 1 ? 's' : ''})` : ''}
              {a.params ? ` (${a.params.length} param${a.params.length !== 1 ? 's' : ''})` : ''}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
