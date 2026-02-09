# Frontend Developer - Briefing & Kommunikation

**Rolle**: Frontend Developer
**Projekt**: OSCAL Viewer
**Stand**: 2026-02-09
**Phase**: Phase 4 — OSCAL Resolution (Import-Ketten, Cross-Referenzen, Profile Resolution)

---

## Projekt-Historie (Phasen 1-3) — Archiv

Vollstaendige Historie: `archive/BRIEFING_PHASE1-4a.md`

| Phase | Ergebnis | Commit | Bundle |
|-------|----------|--------|--------|
| Phase 1 | 4 Parser (43 Tests, 94.78% Cov), Catalog Renderer | `983c8ff` | 12.54 KB |
| Phase 2 | Profile, CompDef, SSP Renderer + useSearch Hook | `759b012` | 14.39 KB |
| UI/UX Overhaul | Material AppBar, CSS-Variablen (31 Token), Responsive, a11y | `a567973` | 20.69 KB |
| UX Redesign | Full-Width, Sticky Sidebar, Page Scroll (CSS-only) | `195b58e` | — |
| Dashboard (3 Sprints) | Accordion, DeepLink, Filter, CopyLink, StatusBadge, Roving Tabindex | Sprint 1-3 | 20.40 KB |
| Stakeholder-Feedback | Nav Multi-Line, Nested Part Accordions, BITV 2.0 | — | 20.56 KB |
| Phase 3 | PWA (vite-plugin-pwa), src/lib/ Package Exports, Offline-UI | `abcf25c` | 28.76 KB |
| Feature-Paket | MetadataPanel++, URL-Loading, Config-Presets, ParameterItem | `4a46e11` | ~30 KB |
| Code-Audit | JSDoc auf Hooks, Shared, Catalog, App (Note A- 7.1%) | `0abd597` | ~30 KB |

### Bestehende Architektur

- **Verzeichnisse**: `types/` → `parser/` → `services/` → `hooks/` → `components/`
- **Shared Components**: MetadataPanel, PropertyBadge, SearchBar, Accordion, StatusBadge, CopyLinkButton, FilterBar, ParameterItem, LinkBadge
- **Hooks**: useSearch, useDeepLink, useFilter (Application Layer)
- **Services**: HrefParser (Domain Layer, reine Funktion)
- **Bestehende Typen** (in `src/types/oscal.ts`): Profile, ProfileImport, Merge, Modify, SetParameter, Alter, Add, Remove, Catalog, Group, Control, Parameter, Part, OscalDocument, ParseResult<T>

---

## Kommunikationslog (Phase 4+)

| Datum | Von | An | Thema | Status |
|-------|-----|-----|-------|--------|
| 2026-02-09 | QA Engineer | Frontend Dev | **Phase 4a QA-Report — Finding F1 (HOCH)**: LinkBadge (`src/components/shared/link-badge.tsx`) fehlt `aria-label` gemaess CODING_STANDARDS v5.0.0 Sektion 12.4 Regel 4. Fix: `<span aria-label={label} ...>`. 531 Tests bestanden, 29 axe-core Tests (inkl. 2 neue LinkBadge). HrefParser 18/18 Tests PASS. Details: `docs/team/qa-engineer/BRIEFING.md` Abschnitt "Phase 4a QA-Report" | Offen |
| 2026-02-09 | Architect | Frontend Dev | **Phase 4a abgeschlossen**: HrefParser (18 Tests), LinkBadge (axe-core PASS), Fragment-Links. Commit `4394bb2`, 531 Tests. QA Finding F1 (LinkBadge aria-label) offen | Erledigt |
| 2026-02-09 | Architect | Frontend Dev | **Phase 4b Briefing**: Profile Resolution — FE-R4 bis FE-R7 + HrefParser Update. Details im Abschnitt "AKTUELLER AUFTRAG Phase 4b" | Aktiv |

---

## NEUER AUFTRAG: Phase 4 — OSCAL Resolution (2026-02-09)

**Prioritaet**: HOCH | **Quelle**: OSCAL Expert Briefing via Hauptprogrammleitung
**Referenz-Dokument**: `docs/architecture/OSCAL_IMPORT_GUIDE.md`
**Leitprinzip**: Leichtgewichtiger Viewer mit vollem Funktionsumfang. "Web"-App (PWA bleibt).

### Kontext

OSCAL-Dokumente bilden eine **hierarchische Referenzkette**:

```
SSP → Profile → Catalog(e)
       ↕              ↕
 Component-Defs    Cross-Refs
```

Der Viewer muss diese Kette clientseitig aufloesen koennen. Es wird ein neuer `src/services/` Ordner im Domain Layer eingefuehrt (reine Funktionen, kein Preact).

### Neue Verzeichnisstruktur

```
src/
├── types/                       # Domain: Interfaces (bestehend)
├── parser/                      # Domain: Dokumentverarbeitung (bestehend)
├── services/                    # Domain: Resolution & Caching (NEU)
│   ├── href-parser.ts           #   HREF-Typ-Erkennung (4 Patterns)
│   ├── document-cache.ts        #   Cache fuer geladene Dokumente
│   └── resolver.ts              #   Resolution Service
├── hooks/                       # Application: State & Logik (bestehend)
│   ├── use-search.ts            #   (bestehend)
│   ├── use-deep-link.ts         #   (bestehend)
│   ├── use-filter.ts            #   (bestehend)
│   └── use-resolver.ts          #   NEU: Hook-Wrapper fuer ResolutionService
├── components/                  # Presentation: UI (bestehend)
│   ├── shared/
│   │   ├── link-badge.tsx       #   NEU: Link-Relation Badges
│   │   └── import-panel.tsx     #   NEU: Import-Visualisierung
│   └── ...
└── ...
```

---

### Sub-Phase 4a: MVP — Catalog Enhancement

#### FE-R1: HrefParser (`src/services/href-parser.ts`) [HOCH]

Reine Funktion zur Erkennung der 4 HREF-Patterns:

```typescript
type HrefType = 'relative' | 'fragment' | 'absolute-url' | 'urn'

interface ParsedHref {
  type: HrefType
  path: string           // Dateipfad oder URL
  fragment?: string      // Control-ID nach #
  isResolvable: boolean  // URNs sind nicht aufloesbar
}

function parseHref(href: string): ParsedHref {
  if (href.startsWith('urn:'))
    return { type: 'urn', path: href, isResolvable: false }

  if (href.startsWith('http://') || href.startsWith('https://')) {
    const [path, fragment] = href.split('#')
    return { type: 'absolute-url', path, fragment, isResolvable: true }
  }

  if (href.startsWith('#'))
    return { type: 'fragment', path: '', fragment: href.slice(1), isResolvable: true }

  const [path, fragment] = href.split('#')
  return { type: 'relative', path, fragment, isResolvable: true }
}
```

**Layer**: Domain (keine Preact-Imports!)
**Tests**: Mindestens 4 Tests (einer pro Pattern) + Edge Cases

---

#### FE-R2: Fragment-ID Aufloesung in Catalog [MITTEL]

Bestehende Links in `control-detail.tsx` (`links[]` mit `href="#CONTROL-ID"`) klickbar machen:

- `parseHref(link.href)` aufrufen
- Bei `type: 'fragment'` → Deep-Link setzen: `location.hash = /catalog/${fragment}`
- Bei `type: 'absolute-url'` → `<a>` mit `target="_blank"` (externer Link)
- Bei `type: 'urn'` → Nur als Label anzeigen (nicht klickbar)

**Betroffene Datei**: `src/components/catalog/control-detail.tsx` (Links-Sektion, ca. Zeile 54-72)

---

#### FE-R3: Link-Relation Badges (`src/components/shared/link-badge.tsx`) [MITTEL]

Neue Shared Component fuer `links[].rel` Werte:

```tsx
interface LinkBadgeProps {
  rel: string
}

const REL_STYLES: Record<string, { label: string; className: string }> = {
  'implements': { label: 'Implementiert', className: 'link-badge--implements' },
  'required': { label: 'Erforderlich', className: 'link-badge--required' },
  'related-control': { label: 'Verwandt', className: 'link-badge--related' },
  'bsi-baustein': { label: 'BSI Baustein', className: 'link-badge--bsi' },
  'template': { label: 'Vorlage', className: 'link-badge--template' },
}

export const LinkBadge: FunctionComponent<LinkBadgeProps> = ({ rel }) => {
  const style = REL_STYLES[rel] ?? { label: rel, className: 'link-badge--default' }
  return <span class={`link-badge ${style.className}`}>{style.label}</span>
}
```

**CSS** (in `base.css`):
- `.link-badge--implements` → `var(--color-success)` (Gruen)
- `.link-badge--required` → `var(--color-error)` (Rot)
- `.link-badge--related` → `var(--color-primary)` (Blau)
- `.link-badge--bsi` → `var(--color-accent)` (Orange)
- `.link-badge--template` → `var(--color-text-secondary)` (Grau)

**Integration**: In `control-detail.tsx` Links-Sektion nach dem `<a>` Tag das `<LinkBadge rel={link.rel} />` anzeigen (nur wenn `link.rel` vorhanden).

---

### Sub-Phase 4b: Profile Resolution

#### FE-R4: DocumentCache (`src/services/document-cache.ts`) [HOCH]

```typescript
class DocumentCache {
  private cache = new Map<string, OscalDocument>()

  get(url: string): OscalDocument | undefined {
    return this.cache.get(this.normalize(url))
  }

  set(url: string, doc: OscalDocument): void {
    this.cache.set(this.normalize(url), doc)
  }

  has(url: string): boolean {
    return this.cache.has(this.normalize(url))
  }

  private normalize(url: string): string {
    return url.split('#')[0].toLowerCase()
  }
}
```

**Layer**: Domain (kein Preact!)
**Session-basiert**: Kein TTL, Reload = frischer Cache

---

#### FE-R5: ResolutionService (`src/services/resolver.ts`) [HOCH]

```typescript
interface ResolvedReference {
  document: OscalDocument
  source: string      // Urspruengliche href
  resolvedUrl: string // Aufgeloeste URL
  fromCache: boolean
}

async function resolveHref(
  href: string,
  baseUrl: string,
  cache: DocumentCache
): Promise<ResolvedReference>

async function resolveProfile(
  profile: Profile,
  baseUrl: string,
  cache: DocumentCache
): Promise<ResolvedCatalog>
```

**Profile Resolution Pipeline**:
1. `imports[].href` → Cataloge laden (parallel mit `Promise.all`)
2. `include-controls.with-ids` → Controls filtern
3. `merge.combine.method` → Controls zusammenfuehren
4. `modify.set-parameters` → Parameter-Werte anwenden
5. `modify.alters` → Controls erweitern/aendern
6. Ergebnis: Resolved Catalog

**CORS-Handling**: GitHub URLs (`github.com`) → `raw.githubusercontent.com` Transformation. Bei CORS-Fehler → `TypeError` fangen, hilfreiche Fehlermeldung anzeigen.

---

#### FE-R6: useResolver Hook (`src/hooks/use-resolver.ts`) [MITTEL]

```typescript
interface UseResolverResult {
  resolve: (href: string, baseUrl: string) => Promise<void>
  resolvedDoc: OscalDocument | null
  loading: boolean
  error: string | null
}

function useResolver(): UseResolverResult
```

**Layer**: Application (Hook-Wrapper um ResolutionService)
**Pattern**: Analog zu bestehenden Hooks (useSearch, useFilter)

---

#### FE-R7: Import-Visualisierung (`src/components/shared/import-panel.tsx`) [MITTEL]

Fuer Profile-Dokumente anzeigen:

```
┌─────────────────────────────────────────┐
│ Importierte Quellen:                     │
│   📁 OPC Privacy Catalog (lokal)         │
│      → 4 Controls ausgewaehlt            │
│   🌐 BSI Grundschutz++ (extern)          │
│      → 2 Controls ausgewaehlt            │
├─────────────────────────────────────────┤
│ Merge-Strategie: merge                   │
│ Modifikationen: 3 Parameter, 1 Alter    │
└─────────────────────────────────────────┘
```

**Integration**: In `profile-view.tsx` als Ersatz/Erweiterung der bestehenden Import-Sektion.

---

### Sub-Phase 4c: SSP + CompDef Resolution

#### FE-R8: SSP Resolution [MITTEL]

```
SSP → import-profile.href → Profile aufloesen (FE-R5)
    → control-implementation → Zeige welche Controls wie umgesetzt
    → by-components → Zeige welche Komponente was implementiert
```

**Betroffene Datei**: `src/components/ssp/ssp-view.tsx`

#### FE-R9: Component-Definition Resolution [MITTEL]

```
Component-Def → source → Catalog aufloesen
              → control-id → Zuordnung Control ↔ Komponente
              → "Welche Komponente implementiert welches Control?"
```

**Betroffene Datei**: `src/components/component-def/component-def-view.tsx`

#### FE-R10: Unaufgeloeste Referenzen UI [NIEDRIG]

Wenn eine Referenz nicht aufgeloest werden kann (CORS, Netzwerk, 404):

```tsx
<div class="unresolved-reference" role="alert">
  <span class="unresolved-icon">⚠</span>
  <div>
    <strong>Externe Referenz nicht verfuegbar</strong>
    <p>href: {href}</p>
    <p>Grund: {error}</p>
  </div>
</div>
```

---

### Umsetzungsreihenfolge

| # | Aufgabe | Sub-Phase | Aufwand | Abhaengigkeit |
|---|---------|-----------|---------|---------------|
| 1 | FE-R1: HrefParser | 4a | Klein | Keine |
| 2 | FE-R2: Fragment-ID Catalog | 4a | Klein | FE-R1 |
| 3 | FE-R3: LinkBadge | 4a | Klein | Keine |
| 4 | FE-R4: DocumentCache | 4b | Klein | Keine |
| 5 | FE-R5: ResolutionService | 4b | Hoch | FE-R1, FE-R4 |
| 6 | FE-R6: useResolver Hook | 4b | Mittel | FE-R5 |
| 7 | FE-R7: Import-Panel | 4b | Mittel | FE-R6 |
| 8 | FE-R8: SSP Resolution | 4c | Mittel | FE-R5 |
| 9 | FE-R9: CompDef Resolution | 4c | Mittel | FE-R5 |
| 10 | FE-R10: Unresolved UI | 4c | Klein | FE-R6 |

### Build-Erwartung Phase 4

- **Neue Dateien**: 3 Services + 1 Hook + 2 UI-Komponenten = 6 Dateien
- **Bundle-Impact**: +1-2 KB gzipped (~400 LOC neuer Code)
- **Tests**: Bestehende 485 + neue Service-Tests + Hook-Tests + Component-Tests
- **Budget**: ~30 KB → ~32 KB gzipped (weiterhin weit unter 100 KB)
- **Keine neuen Dependencies**: Alles mit nativem `fetch()` und TypeScript

---

## Phase 4a — Zusammenfassung (ABGESCHLOSSEN)

| Aufgabe | Ergebnis |
|---------|----------|
| FE-R1: HrefParser | `src/services/href-parser.ts` — 74 LOC, 18 Tests, 4 Patterns |
| FE-R2: Fragment-ID | `control-detail.tsx` erweitert: renderLink() mit Deep-Link Navigation |
| FE-R3: LinkBadge | `src/components/shared/link-badge.tsx` — 45 LOC, 5 Farben |

**Build**: ~30.6 KB gzipped | 531 Tests | Commit: `4394bb2`
**QA Finding F1**: LinkBadge fehlt `aria-label` — Fix in Phase 4b einplanen

---

## AKTUELLER AUFTRAG: Phase 4b — Profile Resolution (2026-02-09)

**Prioritaet**: HOCH | **Quelle**: Architect nach Abschluss Phase 4a
**Vorgaenger**: Phase 4a (Commit `4394bb2`, 531 Tests, ~30.6 KB Bundle)
**Leitprinzip**: Leichtgewichtiger Viewer mit vollem Funktionsumfang.

### Kontext

Phase 4b implementiert die **Profile Resolution Pipeline** — das Kernstueck der OSCAL-Referenzkettenaufloesung. Ein Profile importiert Controls aus einem oder mehreren Catalogen, filtert, mergt und modifiziert sie.

**Bestehender Code (Phase 4a)**:
- `src/services/href-parser.ts` — `parseHref()` (4 Patterns)
- `src/components/shared/link-badge.tsx` — LinkBadge (5 Farben)
- `src/components/catalog/control-detail.tsx` — `renderLink()` mit Fragment-Navigation
- `src/components/profile/profile-view.tsx` — Bestehender Profile Renderer (326 LOC)
- `src/app.tsx` — `handleUrl()` mit CORS-Fehlerbehandlung, `?url=` Parameter

**Bestehende OSCAL-Typen** (in `src/types/oscal.ts`):
- `Profile`, `ProfileImport`, `Merge`, `Modify`, `SetParameter`, `Alter`, `Add`, `Remove`
- `Catalog`, `Group`, `Control`, `Parameter`, `Part`
- `OscalDocument`, `OscalDocumentData`, `ParseResult<T>`

---

### FE-R4b-0: HrefParser Update [KLEIN — Vorbereitung]

**Datei**: `src/services/href-parser.ts` (MODIFIZIERT)

Phase 4a gibt `isResolvable: false` fuer relative Pfade zurueck. Das muss geaendert werden:

```typescript
// VORHER (Phase 4a):
// Relative path: not resolvable in Phase 4a (no base URL context)
return { type: 'relative', path: href, isResolvable: false }

// NACHHER (Phase 4b):
// Relative path: resolvable when a base URL is available
return { type: 'relative', path: href, isResolvable: true }
```

Und mit Fragment:
```typescript
// VORHER:
return { type: 'relative', path: href.slice(0, hashIndex), fragment: href.slice(hashIndex + 1), isResolvable: false }

// NACHHER:
return { type: 'relative', path: href.slice(0, hashIndex), fragment: href.slice(hashIndex + 1), isResolvable: true }
```

**Tests anpassen**: `tests/services/href-parser.test.ts` — relative path Tests von `isResolvable: false` auf `true` aendern.

**Begruendung**: Der ResolutionService kann relative Pfade mit `new URL(path, baseUrl)` aufloesen, wenn ein baseUrl vorhanden ist. Die Entscheidung ob aufgeloest werden kann, liegt beim Caller (Resolver), nicht beim Parser.

---

### FE-R4: DocumentCache (`src/services/document-cache.ts`) [HOCH]

**Neue Datei**: `src/services/document-cache.ts`

```typescript
/**
 * DocumentCache — In-memory cache for loaded OSCAL documents.
 *
 * Prevents duplicate network requests when multiple profiles reference the same catalog.
 * URL normalization: strips fragment (#...), converts to lowercase.
 * Session-based: no TTL, reload = fresh cache.
 *
 * Domain Layer: no Preact imports, no side effects.
 */

import type { OscalDocument } from '@/types/oscal'

export class DocumentCache {
  private cache = new Map<string, OscalDocument>()

  /** Retrieve a cached document by URL. Returns undefined on cache miss. */
  get(url: string): OscalDocument | undefined {
    return this.cache.get(this.normalize(url))
  }

  /** Store a document in the cache, keyed by normalized URL. */
  set(url: string, doc: OscalDocument): void {
    this.cache.set(this.normalize(url), doc)
  }

  /** Check if a document is cached for the given URL. */
  has(url: string): boolean {
    return this.cache.has(this.normalize(url))
  }

  /** Remove all cached documents. */
  clear(): void {
    this.cache.clear()
  }

  /** Number of cached documents. */
  get size(): number {
    return this.cache.size
  }

  /** Normalize URL: strip fragment, lowercase. */
  private normalize(url: string): string {
    const hashIndex = url.indexOf('#')
    const withoutFragment = hashIndex === -1 ? url : url.slice(0, hashIndex)
    return withoutFragment.toLowerCase()
  }
}
```

**Layer**: Domain (kein Preact, kein fetch!)
**Tests**: Mindestens 8 Tests (set/get, has, normalize, fragment-stripping, case-insensitive, clear, size)

---

### FE-R5: ResolutionService (`src/services/resolver.ts`) [HOCH]

**Neue Datei**: `src/services/resolver.ts`

Dies ist die komplexeste Datei der Phase 4b. Der Service implementiert die komplette Profile Resolution Pipeline.

```typescript
/**
 * ResolutionService — Resolves OSCAL reference chains.
 *
 * Handles href resolution (4 patterns), document fetching with CORS handling,
 * and Profile Resolution Pipeline (import → filter → merge → modify).
 *
 * Domain Layer: pure functions + fetch() for external resources.
 */

import type { OscalDocument, Catalog, Profile, Control, Group, SetParameter, Alter } from '@/types/oscal'
import { parseHref } from '@/services/href-parser'
import { DocumentCache } from '@/services/document-cache'
import { parseOscalDocument } from '@/parser'

/** Result of resolving a single href reference. */
export interface ResolvedReference {
  document: OscalDocument
  source: string      // Original href
  resolvedUrl: string // Fully resolved URL
  fromCache: boolean
}

/** Result of resolving a complete profile. */
export interface ResolvedProfile {
  /** The resolved controls (filtered, merged, modified). */
  controls: Control[]
  /** Import sources with resolution status. */
  sources: ImportSource[]
  /** Errors encountered during resolution. */
  errors: string[]
}

/** Status of a single import source. */
export interface ImportSource {
  href: string
  resolvedUrl?: string
  status: 'loaded' | 'cached' | 'error'
  controlCount: number
  error?: string
}
```

**Kernfunktionen**:

1. **`resolveHref(href, baseUrl, cache)`** — Einzelnen HREF aufloesen:
   - URN → `{ error: 'URN not resolvable' }`
   - Fragment → Lookup im aktuellen Dokument (kein fetch)
   - Relative → `new URL(path, baseUrl)` + fetch
   - Absolute → fetch (mit GitHub-URL-Transformation)

2. **`fetchDocument(url, cache)`** — Dokument laden mit Cache:
   - Cache-Check: `cache.has(url)` → return cached
   - GitHub-Transformation: `github.com/.../blob/...` → `raw.githubusercontent.com/...`
   - `fetch()` → `parseOscalDocument()` → `cache.set()`
   - CORS-Fehler: `TypeError` fangen, hilfreiche Meldung

3. **`resolveProfile(profile, baseUrl, cache)`** — Komplette Pipeline:
   ```
   a) imports[].href → Cataloge laden (Promise.all fuer Parallelitaet)
   b) Pro Import: include-controls.with-ids → Controls filtern
      oder include-all → alle Controls uebernehmen
   c) Alle gefilterten Controls sammeln
   d) merge.combine.method anwenden:
      - 'use-first': Bei Duplikaten erste Version behalten
      - 'merge': Bei Duplikaten zusammenfuehren
      - 'keep': Alle Versionen behalten
   e) modify.set-parameters → Parameter in Controls aktualisieren
   f) modify.alters → Controls erweitern/reduzieren
   g) ResolvedProfile zurueckgeben
   ```

**CORS-Handling**:
```typescript
function toRawGithubUrl(url: string): string {
  return url
    .replace('github.com', 'raw.githubusercontent.com')
    .replace('/blob/', '/')
    .replace('/tree/', '/')
}
```

**Layer**: Domain (importiert aus types/, parser/, services/)
**Tests**: Mindestens 12 Tests (resolveHref 4 Patterns, fetchDocument cache-hit/miss/error, resolveProfile filter/merge/modify)

---

### FE-R6: useResolver Hook (`src/hooks/use-resolver.ts`) [MITTEL]

**Neue Datei**: `src/hooks/use-resolver.ts`

```typescript
/**
 * useResolver — Application layer hook for OSCAL reference resolution.
 *
 * Wraps ResolutionService with Preact state management (loading, error, result).
 * Maintains a DocumentCache instance per hook lifecycle.
 *
 * Application Layer: imports from services/, provides state to components.
 */

import { useState, useCallback, useRef } from 'preact/hooks'
import type { ResolvedProfile, ImportSource } from '@/services/resolver'
import { resolveProfile } from '@/services/resolver'
import { DocumentCache } from '@/services/document-cache'
import type { Profile } from '@/types/oscal'

export interface UseResolverResult {
  /** Trigger profile resolution. */
  resolve: (profile: Profile, baseUrl: string) => Promise<void>
  /** Resolved controls (null if not yet resolved). */
  resolved: ResolvedProfile | null
  /** Whether resolution is in progress. */
  loading: boolean
  /** Error message if resolution failed. */
  error: string | null
  /** Import sources with status. */
  sources: ImportSource[]
}

export function useResolver(): UseResolverResult {
  const [resolved, setResolved] = useState<ResolvedProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sources, setSources] = useState<ImportSource[]>([])
  const cacheRef = useRef(new DocumentCache())

  const resolve = useCallback(async (profile: Profile, baseUrl: string) => {
    setLoading(true)
    setError(null)
    try {
      const result = await resolveProfile(profile, baseUrl, cacheRef.current)
      setResolved(result)
      setSources(result.sources)
      if (result.errors.length > 0) {
        setError(result.errors.join('; '))
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Resolution failed')
    } finally {
      setLoading(false)
    }
  }, [])

  return { resolve, resolved, loading, error, sources }
}
```

**Layer**: Application (Hook, importiert aus services/)
**Pattern**: Analog zu useSearch, useFilter (CODING_STANDARDS Pattern 21)
**Tests**: Mindestens 5 Tests (initial state, loading state, success, error, cache reuse)

---

### FE-R7: Import-Panel (`src/components/shared/import-panel.tsx`) [MITTEL]

**Neue Datei**: `src/components/shared/import-panel.tsx`

Visualisiert die Import-Quellen eines Profiles nach Resolution:

```tsx
/**
 * ImportPanel — Visualizes profile import sources and resolution status.
 *
 * Shows each import source with type indicator (local/external), control count,
 * resolution status (loaded/cached/error), merge strategy, and modification summary.
 *
 * Presentation Layer: receives resolved data from useResolver hook.
 */
import type { FunctionComponent } from 'preact'
import type { ImportSource } from '@/services/resolver'
import type { Merge, Modify } from '@/types/oscal'

interface ImportPanelProps {
  sources: ImportSource[]
  merge?: Merge
  modify?: Modify
  loading: boolean
}

export const ImportPanel: FunctionComponent<ImportPanelProps> = ({
  sources, merge, modify, loading
}) => {
  const totalControls = sources.reduce((sum, s) => sum + s.controlCount, 0)
  const setParamCount = modify?.['set-parameters']?.length ?? 0
  const alterCount = modify?.alters?.length ?? 0

  return (
    <div class="import-panel" aria-busy={loading}>
      <h3 class="import-panel-title">Import Sources</h3>

      {loading && (
        <div class="import-panel-loading" role="status" aria-live="polite">
          <span class="loading-pulse" aria-hidden="true" />
          Resolving imports...
        </div>
      )}

      <div class="import-source-list">
        {sources.map((source, i) => (
          <ImportSourceCard key={`${source.href}-${i}`} source={source} />
        ))}
      </div>

      {merge && (
        <div class="import-panel-merge">
          <span class="import-panel-label">Merge:</span>
          <code>{merge.combine?.method ?? 'default'}</code>
        </div>
      )}

      <div class="import-panel-summary">
        <span>{totalControls} controls imported</span>
        {setParamCount > 0 && <span>{setParamCount} parameters modified</span>}
        {alterCount > 0 && <span>{alterCount} alterations</span>}
      </div>
    </div>
  )
}
```

**CSS** (in `base.css`): Nutze bestehende CSS-Variablen. Loading-State: `.loading-pulse` Animation (UX-R6 Spezifikation aus dem UI/UX Briefing).

**Integration in `profile-view.tsx`**:
- ImportPanel als neues Accordion nach MetadataPanel (vor den bestehenden Imports)
- useResolver Hook aufrufen wenn Profile geladen wird
- `baseUrl` aus dem URL-Parameter oder `window.location.href` ableiten
- Bestehende Import-Anzeige bleibt als Fallback wenn Resolution fehlschlaegt

---

### FE-R4b-fix: LinkBadge aria-label Fix [KLEIN — QA Finding F1]

**Datei**: `src/components/shared/link-badge.tsx` (MODIFIZIERT)

QA Finding F1 aus Phase 4a: LinkBadge fehlt `aria-label`.

```tsx
// VORHER:
<span class={`link-badge link-badge--${modifier}`}>
  {label}
</span>

// NACHHER:
<span class={`link-badge link-badge--${modifier}`} aria-label={label}>
  {label}
</span>
```

---

### Umsetzungsreihenfolge

| # | Aufgabe | Aufwand | Abhaengigkeit |
|---|---------|---------|---------------|
| 1 | FE-R4b-fix: LinkBadge aria-label | Klein | Keine |
| 2 | FE-R4b-0: HrefParser Update | Klein | Keine |
| 3 | FE-R4: DocumentCache | Klein | Keine |
| 4 | FE-R5: ResolutionService | Hoch | FE-R4b-0, FE-R4 |
| 5 | FE-R6: useResolver Hook | Mittel | FE-R5 |
| 6 | FE-R7: Import-Panel | Mittel | FE-R6 |
| 7 | Integration in profile-view.tsx | Mittel | FE-R6, FE-R7 |

### Build-Erwartung Phase 4b

- **Neue Dateien**: `document-cache.ts`, `resolver.ts`, `use-resolver.ts`, `import-panel.tsx` = 4 Dateien
- **Modifizierte Dateien**: `href-parser.ts`, `link-badge.tsx`, `profile-view.tsx`, `base.css` = 4 Dateien
- **Bundle-Impact**: +1-1.5 KB gzipped (~300 LOC neuer Code)
- **Tests**: 531 bestehend + ~30-40 neue Tests
- **Budget**: ~31 KB → ~32.5 KB gzipped (weiterhin weit unter 100 KB Limit)
- **Keine neuen Dependencies**: Alles mit nativem `fetch()` und TypeScript
