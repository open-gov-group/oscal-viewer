import { useMemo } from 'preact/hooks'
import type { FunctionComponent } from 'preact'
import type { Profile, ProfileImport, Modify, Alter, SetParameter } from '@/types/oscal'
import { MetadataPanel } from '@/components/shared/metadata-panel'
import { PropertyList } from '@/components/shared/property-badge'

interface ProfileViewProps {
  profile: Profile
}

export const ProfileView: FunctionComponent<ProfileViewProps> = ({ profile }) => {
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

      <section class="profile-section" aria-labelledby="profile-imports-heading">
        <h3 id="profile-imports-heading">Imports</h3>
        <div class="profile-imports">
          {profile.imports.map((imp, i) => (
            <ImportCard key={`${imp.href}-${i}`} import_={imp} index={i} />
          ))}
        </div>
      </section>

      {profile.merge && (
        <section class="profile-section" aria-labelledby="profile-merge-heading">
          <h3 id="profile-merge-heading">Merge Strategy</h3>
          <MergeInfo merge={profile.merge} />
        </section>
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

const ImportCard: FunctionComponent<ImportCardProps> = ({ import_, index }) => {
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
      {selection['with-child-controls'] === 'yes' && (
        <span class="import-tag import-tag--info">+ child controls</span>
      )}
    </div>
  )
}

interface MergeInfoProps {
  merge: Profile['merge']
}

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

const ModifySection: FunctionComponent<ModifySectionProps> = ({ modify }) => {
  const setParams = modify['set-parameters']
  const alters = modify.alters

  return (
    <>
      {setParams && setParams.length > 0 && (
        <section class="profile-section" aria-labelledby="profile-params-heading">
          <h3 id="profile-params-heading">Parameter Settings</h3>
          <div class="profile-params-list">
            {setParams.map(sp => (
              <SetParameterCard key={sp['param-id']} param={sp} />
            ))}
          </div>
        </section>
      )}

      {alters && alters.length > 0 && (
        <section class="profile-section" aria-labelledby="profile-alters-heading">
          <h3 id="profile-alters-heading">Alterations</h3>
          <div class="profile-alters-list">
            {alters.map((alter, i) => (
              <AlterCard key={`${alter['control-id']}-${i}`} alter={alter} />
            ))}
          </div>
        </section>
      )}
    </>
  )
}

interface SetParameterCardProps {
  param: SetParameter
}

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
