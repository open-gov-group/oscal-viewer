# OSCAL Viewer - Coding Standards

**Version**: 5.0.0
**Gueltig ab**: Phase 4 (OSCAL Resolution, Services Layer, Link-Badges)

---

## 1. Architektur-Schichten (ADR-003 + ADR-008)

```
Domain (types/, parser/, services/, lib/)  ->  Application (hooks/)  ->  Presentation (components/)
```

**Import-Regeln** (durch ESLint erzwungen in `eslint.config.js`):
- `types/` importiert NUR aus externen Packages
- `parser/` importiert aus `types/` und externen Packages
- `services/` importiert aus `types/`, `parser/` und externen Packages (KEIN Preact)
- `lib/` importiert aus `types/`, `parser/` und externen Packages
- `hooks/` importiert aus `types/`, `parser/`, `services/` und externen Packages
- `components/` importiert aus allen Layern

Verletzungen werden durch `eslint.config.js` als Fehler erkannt.

---

## 2. Neue Renderer implementieren (Phase 2 Pattern)

Jeder Renderer folgt dem gleichen Pattern wie `CatalogView`.

### 2.1 Verzeichnisstruktur

```
src/components/<type>/
├── <type>-view.tsx        # Hauptkomponente (z.B. ProfileView)
├── <sub-component>.tsx    # Spezialisierte Unterkomponenten
└── ...
```

### 2.2 Hauptkomponente - Template

```tsx
import { useState, useMemo } from 'preact/hooks'
import type { FunctionComponent } from 'preact'
import type { Profile } from '@/types/oscal'              // Domain-Typ
import { MetadataPanel } from '@/components/shared/metadata-panel'  // Shared Component

interface ProfileViewProps {
  profile: Profile          // Typisierte Prop, KEIN `any`
}

export const ProfileView: FunctionComponent<ProfileViewProps> = ({ profile }) => {
  // useMemo fuer teure Berechnungen
  const stats = useMemo(() => computeStats(profile), [profile])

  return (
    <div class="profile-view">
      <MetadataPanel metadata={profile.metadata} />
      {/* ... typ-spezifischer Inhalt ... */}
    </div>
  )
}
```

### 2.3 Integration in DocumentViewer

Neuen `case` im Switch von `src/components/document-viewer.tsx`:

```tsx
case 'profile':
  return <ProfileView profile={data.document} />
```

### 2.4 Checkliste fuer neue Renderer

- [ ] Verzeichnis `src/components/<type>/` angelegt
- [ ] Hauptkomponente `<Type>View` mit typisierter Props-Interface
- [ ] `MetadataPanel` fuer Metadata-Anzeige genutzt
- [ ] `PropertyList`/`PropertyBadge` fuer Properties genutzt
- [ ] `StatusBadge` fuer Status-Anzeige genutzt (z.B. operational, under-development)
- [ ] `Accordion` fuer auf-/zuklappbare Sektionen genutzt
- [ ] `useDeepLink` fuer URL-Hash-Synchronisation integriert
- [ ] `useFilter` + `FilterBar` fuer Filterung in Sidebar integriert (falls Listen vorhanden)
- [ ] Integration in `DocumentViewer` (neuer `case`)
- [ ] CSS-Klassen in `src/styles/base.css` ergaenzt
- [ ] `useMemo` fuer teure Berechnungen (z.B. Listen-Aufbereitung)
- [ ] ARIA-Labels fuer Navigation und Listen
- [ ] Tests geschrieben (min. 80% Coverage)

---

## 3. TypeScript Conventions

### 3.1 Imports

```tsx
// 1. Preact-Imports
import { useState, useMemo } from 'preact/hooks'
import type { FunctionComponent } from 'preact'

// 2. Domain-Types (type-only Import)
import type { Catalog, Control } from '@/types/oscal'

// 3. Parser-Funktionen (nur in components/ und hooks/)
import { countControls } from '@/parser/catalog'

// 4. Shared Components
import { MetadataPanel } from '@/components/shared/metadata-panel'

// 5. Lokale Imports
import { GroupTree } from './group-tree'
```

**Regeln:**
- `type` Keyword fuer reine Typ-Imports (`import type { ... }`)
- Path Alias `@/` statt relativer Pfade fuer Cross-Directory-Imports
- Relative Pfade (`./`) nur innerhalb des gleichen Verzeichnisses

### 3.2 Komponenten

- Immer `FunctionComponent<Props>` mit expliziter Props-Interface
- Props-Interface direkt ueber der Komponente definieren
- Kein `any` - strikte Typisierung
- Destructuring in Funktionsparametern

### 3.3 OSCAL-spezifisch

- Property-Namen in kebab-case (OSCAL-Standard): `metadata['last-modified']`
- Optionale Felder immer mit `?.` oder `?? default` behandeln
- Arrays immer auf Existenz pruefen: `items?.length > 0`

---

## 4. CSS Conventions

### 4.1 Grundregeln

- Alle Styles in `src/styles/base.css` (kein CSS-in-JS)
- BEM-aehnliche Namensgebung: `.profile-view`, `.profile-sidebar`, `.profile-content`
- Komponenten-Prefix: `.catalog-*`, `.profile-*`, `.compdef-*`, `.ssp-*`
- Responsive Design mit CSS Grid/Flexbox
- Accessibility: `:focus-visible` Styles nie entfernen

### 4.2 CSS-Variablen-Pflicht

Keine hardcoded Farbwerte ausserhalb `:root`. Immer `var(--color-...)` nutzen.
21 semantische Variablen sind in `base.css:3-51` definiert, jeweils mit Dark Mode Variante
im `@media (prefers-color-scheme: dark)` Block.

```css
/* KORREKT */
color: var(--color-text);
background: var(--color-bg-secondary);
border: 1px solid var(--color-border);

/* FALSCH - hardcoded Farbe */
color: #1f2937;
background: #f9fafb;
```

### 4.3 Layout-Patterns

**Full-Width Layout**: Kein `max-width` auf View-Container. Inhalte nutzen vollen Viewport.

```css
.document-view { width: 100%; }   /* NICHT max-width: 1200px */
```

**Full-Bleed Grid** (Referenz: `.catalog-layout` in base.css):

```css
.catalog-layout {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 0;
  margin: 0 -2.5rem;
  width: calc(100% + 5rem);
  min-height: calc(100vh - 64px);
}
```

**Sticky Sidebar** (Referenz: `.catalog-sidebar`, `.compdef-sidebar`):

```css
.catalog-sidebar {
  position: sticky;
  top: 64px;                              /* Header-Hoehe */
  height: calc(100vh - 64px);
  overflow-y: auto;
  border-right: 1px solid var(--color-border);  /* Divider statt Box-Border */
}
```

**Page Scroll statt Container Scroll**: Content scrollt natuerlich mit der Seite.
Kein `max-height` + `overflow-y: auto` auf Content-Bereichen.

**Borderless Desktop Design**: Subtile Divider statt Box-Borders.
- Sidebar: `border-right` statt `border` + `border-radius`
- Metadata: `border-bottom` only

### 4.4 Transitions

Material Design Easing verwenden:

```css
transition: background-color 0.15s cubic-bezier(0.4, 0, 0.2, 1);
/* NICHT: transition: background 0.3s ease; */
```

---

## 5. Accessibility & Interaction Patterns

### 5.1 WAI-ARIA Tabs Pattern (Referenz: `ssp-view.tsx`)

```tsx
// Tab-Definitionen AUSSERHALB der Komponente (keine Re-Allokation)
const tabDefs: Array<{ id: TabId; label: string }> = [
  { id: 'tab-a', label: 'Tab A' },
  { id: 'tab-b', label: 'Tab B' },
]

// Keyboard-Handler fuer Pfeiltasten + Home/End
const handleTabKeyDown = (e: KeyboardEvent, currentTab: TabId) => {
  const tabIds = tabDefs.map(t => t.id)
  const idx = tabIds.indexOf(currentTab)
  let next = idx

  if (e.key === 'ArrowRight') next = (idx + 1) % tabIds.length
  else if (e.key === 'ArrowLeft') next = (idx - 1 + tabIds.length) % tabIds.length
  else if (e.key === 'Home') next = 0
  else if (e.key === 'End') next = tabIds.length - 1
  else return

  e.preventDefault()
  setActiveTab(tabIds[next])
  document.getElementById(`tab-${tabIds[next]}`)?.focus()
}

// JSX: role="tablist", role="tab", aria-selected, aria-controls, tabIndex-Roving
<nav role="tablist" aria-label="Sections">
  {tabDefs.map(tab => (
    <button
      role="tab"
      id={`tab-${tab.id}`}
      aria-selected={activeTab === tab.id}
      aria-controls={`panel-${tab.id}`}
      tabIndex={activeTab === tab.id ? 0 : -1}
      onClick={() => setActiveTab(tab.id)}
      onKeyDown={(e) => handleTabKeyDown(e as unknown as KeyboardEvent, tab.id)}
    >{tab.label}</button>
  ))}
</nav>
<div role="tabpanel" id={`panel-${activeTab}`} aria-labelledby={`tab-${activeTab}`}>
  {/* Panel-Inhalt */}
</div>
```

### 5.2 Combobox / Search Pattern (Referenz: `search-bar.tsx`)

```tsx
<input
  type="search"
  role="combobox"
  aria-haspopup="listbox"
  aria-expanded={showResults}
  aria-controls={showResults ? 'results-listbox' : undefined}
  aria-activedescendant={activeIndex >= 0 ? `result-${activeIndex}` : undefined}
  autocomplete="off"
/>
{showResults && (
  <div id="results-listbox" role="listbox">
    {results.map((r, i) => (
      <div role="option" id={`result-${i}`} aria-selected={i === activeIndex}>
        {r.title}
      </div>
    ))}
  </div>
)}
```

Keyboard: ArrowUp/Down fuer Navigation, Escape zum Schliessen.
`activeIndex` als `useState<number>(-1)` tracken.

### 5.3 Mobile Sidebar Toggle Pattern (Referenz: `catalog-view.tsx`)

```tsx
const [sidebarOpen, setSidebarOpen] = useState(false)

// Handler schliesst Sidebar nach Auswahl
const handleSelect = (id: string) => {
  setSelectedId(id)
  setSidebarOpen(false)
}

return (
  <>
    {/* Backdrop */}
    <div class={`sidebar-backdrop ${sidebarOpen ? 'visible' : ''}`}
         onClick={() => setSidebarOpen(false)} />

    {/* Sidebar mit .open Klasse */}
    <aside class={`sidebar ${sidebarOpen ? 'open' : ''}`}>
      {/* Navigation */}
    </aside>

    {/* FAB-Button: display:none auf Desktop, flex auf Mobile */}
    <button
      class="sidebar-toggle"
      onClick={() => setSidebarOpen(!sidebarOpen)}
      aria-label={sidebarOpen ? 'Close navigation' : 'Open navigation'}
      aria-expanded={sidebarOpen}
    >
      {/* Icon */}
    </button>
  </>
)
```

### 5.4 Deep-Link Pattern (Referenz: `use-deep-link.ts`, `catalog-view.tsx`)

URL-Hash-basierte Navigation fuer direktes Ansteuern von Elementen.
Hook lebt im Application Layer, URL-Format: `#/<viewType>/<id>`.

```tsx
import { useDeepLink } from '@/hooks/use-deep-link'

const { selectedId, setSelectedId } = useDeepLink('catalog')
// URL wird automatisch zu #/catalog/<id> synchronisiert

// In Kombination mit CopyLinkButton (shared Component):
import { CopyLinkButton } from '@/components/shared/copy-link-button'
<CopyLinkButton viewType="catalog" elementId={control.id} />
```

Jeder Renderer SOLL `useDeepLink` integrieren, damit Nutzer Links auf
spezifische Elemente teilen koennen.

### 5.5 Filter Pattern (Referenz: `use-filter.ts`, `filter-bar.tsx`, `catalog-view.tsx`)

Generisches Filter-System mit Keyword + Chip-Filtern.
Hook (`useFilter`) im Application Layer, UI (`FilterBar`) im Presentation Layer.

```tsx
import { useFilter } from '@/hooks/use-filter'
import { FilterBar } from '@/components/shared/filter-bar'
import type { FilterCategory } from '@/components/shared/filter-bar'

const filter = useFilter()

// Kategorien fuer Chip-Filter aus Daten ableiten (useMemo!)
const categories = useMemo((): FilterCategory[] => {
  return [{ key: 'family', label: 'Family', options: [...] }]
}, [data])

// Gefilterte Daten mit useMemo (WICHTIG: nicht bei jedem Render neu berechnen)
const filtered = useMemo(() => {
  if (!filter.hasActiveFilters) return data
  return applyFilters(data, filter.keyword, filter.chips)
}, [data, filter.keyword, filter.chips, filter.hasActiveFilters])

// JSX
<FilterBar
  keyword={filter.keyword}
  onKeywordChange={filter.setKeyword}
  chips={filter.chips}
  onAddChip={filter.addChip}
  onRemoveChip={filter.removeChip}
  onClearAll={filter.clearAll}
  hasActiveFilters={filter.hasActiveFilters}
  categories={categories}
  placeholder="Filter controls..."
/>
```

### 5.6 Accordion Pattern (Referenz: `accordion.tsx`)

Auf-/zuklappbare Sektionen mit Session-Persistenz und Expand/Collapse All.
WAI-ARIA konform (`aria-expanded`, `aria-controls`, `role="region"`).

```tsx
import { Accordion, AccordionGroup } from '@/components/shared/accordion'

// Einzelnes Accordion
<Accordion id="section-1" title="Details" count={5} defaultOpen={true} headingLevel={3}>
  {/* Inhalt */}
</Accordion>

// Gruppe mit Expand/Collapse All Buttons
<AccordionGroup>
  <Accordion id="sec-a" title="Section A">...</Accordion>
  <Accordion id="sec-b" title="Section B">...</Accordion>
</AccordionGroup>
```

- `id` muss eindeutig sein (wird fuer SessionStorage-Key verwendet)
- `headingLevel` optional: erzeugt semantisches `<h2>`-`<h6>` Element
- `count` optional: zeigt Zaehler neben dem Titel
- Zustand wird in `sessionStorage` persistiert (bleibt innerhalb Tab-Sitzung)

### 5.7 Nested Accordion Pattern (Referenz: `control-detail.tsx`, PartView)

Rekursive Verschachtelung von Accordions fuer hierarchische OSCAL-Parts.
Heading-Level steigt automatisch mit der Tiefe (h4 -> h5 -> h6, max h6).

```tsx
interface PartViewProps {
  part: Part
  depth?: number
}

const PartView: FunctionComponent<PartViewProps> = ({ part, depth = 0 }) => {
  const title = part.title ?? formatPartName(part.name)
  const hasChildren = part.parts && part.parts.length > 0

  // Flache Darstellung fuer Parts ohne Titel und ohne Kinder
  if (!title && !hasChildren) {
    return (
      <div class={`part-view part-${part.name}`}>
        {part.prose && <div class="part-prose">{part.prose}</div>}
      </div>
    )
  }

  // Heading-Level: h4 bei depth=0, h5 bei depth=1, max h6
  const headingLevel = Math.min(4 + depth, 6) as 4 | 5 | 6

  return (
    <div class={`part-view part-${part.name}`} data-depth={depth}>
      <Accordion
        id={`${part.id ?? part.name}-${depth}`}
        title={title || part.name}
        defaultOpen={depth === 0}
        headingLevel={headingLevel}
      >
        {part.prose && <div class="part-prose">{part.prose}</div>}
        {hasChildren && (
          <div class="part-children">
            {part.parts!.map((child, i) => (
              <PartView key={child.id ?? `${child.name}-${i}`} part={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </Accordion>
    </div>
  )
}
```

**Regeln:**
- Heading-Hierarchie darf keine Ebene ueberspringen (h2 -> h3 -> h4, nicht h2 -> h4)
- Maximale Tiefe: h6 (depth >= 3 bleibt bei h6)
- `depth=0` standardmaessig geoeffnet (`defaultOpen={true}`), tiefere Ebenen geschlossen
- Parts ohne Titel UND ohne Kinder werden flach (ohne Accordion) gerendert
- CSS: `.part-children` hat `border-left: 2px dotted var(--color-border)` als visuelle Verschachtelung

### 5.8 CSS fuer verschachtelte Parts

```css
.part-children {
  margin-left: 0.5rem;
  padding-left: 1rem;
  border-left: 2px dotted var(--color-border);
}

.part-prose {
  line-height: 1.6;
  white-space: pre-wrap;
}
```

---

## 6. Shared Components Uebersicht

| Component | Datei | Zweck |
|-----------|-------|-------|
| `MetadataPanel` | `shared/metadata-panel.tsx` | OSCAL Metadata (Titel, Version, Rollen) |
| `PropertyBadge` | `shared/property-badge.tsx` | Einzelne Property als Badge |
| `PropertyList` | `shared/property-badge.tsx` | Liste von Properties |
| `StatusBadge` | `shared/status-badge.tsx` | Status mit Icon (operational, etc.) |
| `Accordion` | `shared/accordion.tsx` | Auf-/zuklappbare Sektion mit Persistenz |
| `AccordionGroup` | `shared/accordion.tsx` | Expand/Collapse All Steuerung |
| `SearchBar` | `shared/search-bar.tsx` | Combobox-Suche mit Keyboard-Navigation |
| `FilterBar` | `shared/filter-bar.tsx` | Keyword + Chip-Filter-Leiste |
| `CopyLinkButton` | `shared/copy-link-button.tsx` | URL in Zwischenablage kopieren |

---

## 7. Branch & Commit Conventions

- Branch-Naming: `feature/<issue-nr>-<beschreibung>` (z.B. `feature/4-profile-renderer`)
- Commit-Messages: `<type>: <beschreibung>` (z.B. `feat: implement profile renderer`)
  - Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`
- Kleine, fokussierte Commits

---

## 8. Barrierefreiheit / BITV 2.0

Der OSCAL Viewer erfuellt die Anforderungen der BITV 2.0 (basierend auf WCAG 2.1 AA).

### 8.1 Sprache (WCAG 3.1.1)

Die Dokumentsprache MUSS in `index.html` gesetzt sein:

```html
<html lang="en">
```

### 8.2 Heading-Hierarchie (WCAG 1.3.1)

- Headings MUESSEN eine lueckenlose Hierarchie bilden: h1 -> h2 -> h3 -> h4 -> h5 -> h6
- Keine Ebene ueberspringen (z.B. h2 -> h4 ist ein Verstoss)
- `Accordion`-Komponente: `headingLevel` Prop bestimmt das semantische Level
- Verschachtelte Accordions: `Math.min(4 + depth, 6)` garantiert korrekte Hierarchie

### 8.3 Kontrast (WCAG 1.4.3 / 1.4.11)

- Normaler Text: Kontrast >= 4.5:1 gegen Hintergrund
- Grosser Text (>= 18pt / >= 14pt bold): Kontrast >= 3:1
- UI-Komponenten und Grafiken: Kontrast >= 3:1
- Alle Farbwerte MUESSEN ueber CSS-Variablen definiert sein (siehe 4.2)
- Kontrast-Audit: 22/22 relevante Paarungen bestehen (Stand: Stakeholder-Feedback)
- Ausnahme: Deaktivierter Text (`--color-text-disabled`) ist bewusst kontrastarm (WCAG 1.4.3 Ausnahme fuer inaktive Elemente)

### 8.4 Status-Nachrichten (WCAG 4.1.3)

Dynamische Statusaenderungen MUESSEN per `aria-live` angekuendigt werden:

```tsx
// Korrekt: CopyLinkButton mit aria-live
<span class="copy-link-feedback" aria-live="polite">Copied!</span>

// Korrekt: Suchresultate mit aria-live
<div aria-live="polite">{count} results found</div>
```

- `aria-live="polite"` fuer nicht-dringende Updates (Kopier-Feedback, Filterergebnisse)
- `aria-live="assertive"` nur fuer kritische Fehler

### 8.5 Tastaturbedienbarkeit (WCAG 2.1.1 / 2.4.7)

- Alle interaktiven Elemente MUESSEN per Tastatur erreichbar sein
- `:focus-visible` Styles DUERFEN NICHT entfernt werden
- Roving Tabindex fuer Tab-Listen (siehe 5.1)
- ArrowUp/ArrowDown fuer Combobox-Navigation (siehe 5.2)
- Enter/Space fuer Accordion-Toggle (nativ durch `<button>`)

### 8.6 Checkliste fuer BITV 2.0 Konformitaet

- [ ] `lang` Attribut auf `<html>` gesetzt
- [ ] Heading-Hierarchie lueckenlos (h1 -> h2 -> ... -> h6)
- [ ] Alle Farben ueber CSS-Variablen (keine hardcoded Werte)
- [ ] Kontrast >= 4.5:1 fuer normalen Text
- [ ] `aria-live` fuer dynamische Statusaenderungen
- [ ] `:focus-visible` Styles vorhanden
- [ ] Tastaturnavigation fuer alle interaktiven Elemente
- [ ] axe-core Tests in der Testsuite

---

## 9. PWA / Service Worker (ADR-006)

### 9.1 Grundregeln

- Service Worker wird durch `vite-plugin-pwa` automatisch generiert
- **KEIN** manueller Service-Worker-Code in `src/`
- Caching-Konfiguration ausschliesslich in `vite.config.ts`
- App-Code bleibt SW-unabhaengig (Graceful Degradation)

### 9.2 Caching-Strategie

| Ressource | Strategie | Ort |
|-----------|-----------|-----|
| App Shell (JS, CSS, HTML) | Precache | `workbox.globPatterns` in vite.config.ts |
| Google Fonts Stylesheets | StaleWhileRevalidate | `workbox.runtimeCaching` in vite.config.ts |
| Google Fonts Webfonts | CacheFirst (365d) | `workbox.runtimeCaching` in vite.config.ts |
| OSCAL-Dateien | NICHT gecacht | User laedt lokal per File API |

### 9.3 Update-Strategie

`registerType: 'autoUpdate'` — kein User-Prompt noetig, da die App keinen persistierten State hat (Zero-Backend, ADR-002).

### 9.4 Manifest

Eigene `public/manifest.json` (nicht auto-generiert). Aenderungen am Manifest erfordern:
- Korrekten `start_url` (muss `base` aus vite.config.ts entsprechen)
- Icons in mindestens 192x192 und 512x512
- `display: "standalone"`

---

## 10. npm Package Exports (ADR-007)

### 10.1 Package-Architektur

Das npm Package `@open-gov-group/oscal-parser` exportiert **ausschliesslich** den Domain Layer:

```
src/lib/index.ts  →  src/types/*    ✅  (Domain → Domain)
src/lib/index.ts  →  src/parser/*   ✅  (Domain → Domain)
src/lib/index.ts  →  src/hooks/*    ❌  (ESLint Error)
src/lib/index.ts  →  src/components/* ❌  (ESLint Error)
```

### 10.2 Entry-Point

```typescript
// src/lib/index.ts — Public API
export type { Catalog, Profile, ... } from '@/types/oscal'
export { parseOscalDocument, parseCatalog, ... } from '@/parser/index'
```

**Regeln:**
- NUR `export` und `export type` — keine Logik im Entry-Point
- Alle Typ-Exports mit `export type` (Tree-Shaking)
- Neue Parser MUESSEN hier re-exportiert werden

### 10.3 Build

```bash
npm run build:lib    # Separater Build mit tsconfig.lib.json
```

- **Target**: ES2020 (breitere Kompatibilitaet)
- **Module**: ESNext (Tree-Shaking-faehig)
- **Declaration**: true (TypeScript .d.ts mitliefern)
- Build-Artefakte in `dist/lib/` (nicht `dist/` der App)

### 10.4 Versionierung

App und Package haben **unabhaengige** Versionen:
- App-Aenderungen (UI, CSS, Hooks) erhoehen NICHT die Package-Version
- Parser/Types-Aenderungen erhoehen die Package-Version (SemVer)

---

## 11. Code-Kommentierung & JSDoc

Basierend auf dem QA-Kommentierungs-Audit (Note C-, 2.6% Kommentierungsquote).
Ziel: >= 8% Kommentierungsquote, 100% JSDoc auf exportierten Funktionen und Hooks.

### 11.1 File-Level-Kommentar (PFLICHT)

Jede Datei in `src/` MUSS einen einzeiligen Kommentar am Dateianfang haben, der den Zweck der Datei beschreibt:

```typescript
/** Catalog-View: Hauptkomponente fuer Katalog-Anzeige mit Sidebar-Navigation und Filter */
```

Ausnahme: `main.tsx` und reine Re-Export-Dateien (z.B. `index.ts` mit nur `export` Statements).

### 11.2 JSDoc auf exportierte Funktionen und Hooks (PFLICHT)

Alle exportierten Funktionen, Hooks und Komponenten MUESSEN JSDoc haben:

```typescript
/**
 * Parse a raw OSCAL JSON object into a typed OscalDocument.
 * Detects document type, extracts version, delegates to type-specific parser.
 *
 * @param json - Raw JSON object (unknown type, validated internally)
 * @returns ParseResult with typed OscalDocument on success, error message on failure
 */
export function parseOscalDocument(json: unknown): ParseResult<OscalDocument> {
```

**Hooks** muessen Return-Werte und Seiteneffekte dokumentieren:

```typescript
/**
 * URL-Hash-basierte Navigation fuer Deep-Linking.
 * Synchronisiert selectedId mit dem URL-Hash im Format #/<viewType>/<id>.
 * Nutzt history.replaceState (kein Browser-Back-Effekt).
 *
 * @param viewType - Dokumenttyp-Prefix fuer den Hash (z.B. 'catalog', 'profile')
 * @returns { selectedId, setSelectedId } - Aktueller Hash-Wert und Setter
 */
export function useDeepLink(viewType: string) {
```

### 11.3 JSDoc auf Interfaces (>3 Felder, EMPFOHLEN)

Interfaces mit nicht-offensichtlichen Feldern SOLLEN dokumentiert werden:

```typescript
/** OSCAL Merge-Strategie: Bestimmt wie importierte Controls zusammengefuehrt werden */
interface Merge {
  /** Kombinations-Methode: 'merge', 'use-first', 'keep' */
  combine?: string
  /** Flach-Darstellung: alle Controls auf einer Ebene */
  flat?: boolean
  /** Strukturerhalt: Gruppen-Hierarchie beibehalten */
  'as-is'?: boolean
}
```

**Ausnahmen**: Props-Interfaces, deren Felder durch den Komponentennamen offensichtlich sind (z.B. `CatalogViewProps.catalog`).

### 11.4 Inline-Kommentare (PFLICHT bei Komplexitaet)

Inline-Kommentare sind PFLICHT fuer:
- Komplexe Algorithmen (z.B. Indexierungs-Logik in `use-search.ts`)
- OSCAL-spezifische Business-Regeln
- Workarounds und Browser-Kompatibilitaet
- WCAG/BITV-Compliance-Gruende (z.B. `// WCAG 1.3.1: Heading-Level cap bei h6`)
- Nicht-offensichtliche Typecasts (z.B. `as unknown as Type`)

```typescript
// URL-Hash Schema: #/<viewType>/<elementId> — ermoeglicht Deep-Links zu Controls
// history.replaceState statt pushState: verhindert Browser-Back-Pollution
```

**VERBOTEN**: Triviale Kommentare die den Code wiederholen:

```typescript
// FALSCH:
const count = items.length  // Anzahl der Items zaehlen

// KORREKT (nur wenn nicht-offensichtlich):
// Rekursiv alle Controls in verschachtelten Gruppen zaehlen (inkl. Sub-Controls)
const count = countControls(catalog)
```

### 11.5 Kommentierungsquoten-Ziele

| Layer | Ziel | Aktuell (Re-Audit) | Status |
|-------|------|--------------------|--------|
| Parser | >= 12% | 11.4% | PASS |
| Types | >= 5% | 2.6% | PASS (LOC korrigiert) |
| Hooks | >= 8% | 9.8% | PASS |
| Shared Components | >= 5% | 9.2% | PASS |
| Catalog Components | >= 5% | 6.9% | PASS |
| Profile Components | >= 5% | 0% | FAIL |
| CompDef Components | >= 5% | 0% | FAIL |
| SSP Components | >= 5% | 4.4% | WARN |
| App | >= 5% | 5.6% | PASS |
| **Gesamt** | **>= 8%** | **5.9%** | **FAIL (C+)** |

> **Stand**: Re-Audit 2026-02-08. Blocker: `profile-view.tsx` und `component-def-view.tsx` (599 LOC, 0%).

### 11.6 Checkliste fuer Code-Kommentierung

- [ ] File-Level-Kommentar vorhanden (einzeilig, Dateizweck)
- [ ] JSDoc auf allen exportierten Funktionen (`@param`, `@returns`)
- [ ] JSDoc auf allen Custom Hooks (Return-Werte, Seiteneffekte)
- [ ] Inline-Kommentare fuer komplexe Logik und OSCAL-Spezifika
- [ ] Keine trivialen Kommentare (Code-Wiederholung)
- [ ] ESLint `jsdoc/require-jsdoc` zeigt keine neuen Warnungen fuer eigenen Code

### 11.7 ESLint-Enforcement (`eslint-plugin-jsdoc`)

JSDoc-Pflicht wird durch `eslint-plugin-jsdoc` automatisch geprueft:

```javascript
// eslint.config.js — jsdoc/require-jsdoc Konfiguration
{
  files: ['src/**/*.{ts,tsx}'],
  ignores: ['src/main.tsx'],
  plugins: { jsdoc },
  rules: {
    'jsdoc/require-jsdoc': ['warn', {
      publicOnly: true,         // Nur exportierte Funktionen
      require: {
        FunctionDeclaration: true,
        FunctionExpression: true,
        ArrowFunctionExpression: true,
      },
    }],
  },
}
```

**Regeln**:
1. **Scope**: Nur `src/` Dateien (nicht Tests, nicht `main.tsx`)
2. **`publicOnly: true`**: Nur exportierte Funktionen/Komponenten — interne Helper sind ausgenommen
3. **Level `warn`**: Warnungen in IDE und `npm run lint`, aber kein CI-Fehler
4. **Eskalation zu `error`**: Wenn Gesamtquote >= 8% erreicht und alle Exports JSDoc haben, wird `warn` zu `error` hochgestuft
5. **Neuer Code**: Ab sofort MUSS jede neue exportierte Funktion JSDoc haben (0 neue Warnungen erlaubt)

---

## 12. OSCAL Resolution — Services Layer (ADR-008)

Phase 4 fuehrt `src/services/` als neuen Domain-Layer-Ordner ein. Services loesen OSCAL-Import- und Referenzierungsketten clientseitig auf.

### 12.1 HREF Resolution (Pattern 19)

Alle `href`-Attribute in OSCAL-Dokumenten MUESSEN ueber `parseHref()` klassifiziert werden:

```typescript
import { parseHref } from '@/services/href-parser'

const parsed = parseHref(link.href)
// parsed.type: 'relative' | 'fragment' | 'absolute-url' | 'urn'
// parsed.path: Dateipfad oder URL
// parsed.fragment: Control-ID nach # (ohne #-Zeichen)
// parsed.isResolvable: false bei URNs
```

**Regeln**:
1. **Kein manuelles String-Parsing** von `href`-Werten — immer `parseHref()` verwenden
2. **URNs** (`urn:...`) als nicht-aufloesbar markieren, Referenz-Label anzeigen
3. **Fragment-IDs** (`#ID`) intern im geladenen Dokument aufloesen, KEIN Netzwerk-Request
4. **Relative Pfade** relativ zum Basisdokument aufloesen (nicht relativ zur App-URL)
5. **Absolute URLs**: `fetch()` mit CORS-Fehlerbehandlung

### 12.2 Document Cache (Pattern 20)

Alle extern geladenen OSCAL-Dokumente MUESSEN im `DocumentCache` registriert werden:

```typescript
import { DocumentCache } from '@/services/document-cache'

const cache = new DocumentCache()
cache.set('https://example.com/catalog.json', parsedDoc)
const doc = cache.get('https://example.com/catalog.json#GOV-01') // Fragment wird ignoriert
```

**Regeln**:
1. Cache-Key ist die **normalisierte URL** (Fragment entfernt, lowercase)
2. **Cache-Miss** → `fetch()` → `parse()` → `cache.set()` → return
3. **Kein TTL** — Cache ist Session-basiert, Browser-Reload = frischer Cache
4. Cache wird als expliziter Parameter an Resolver-Funktionen uebergeben (kein Singleton)

### 12.3 Resolution Hooks (Pattern 21)

Die Dreischicht-Trennung MUSS auch fuer Resolution eingehalten werden:

```
src/services/resolver.ts     → Domain Layer (reine async Funktionen)
src/hooks/use-resolver.ts    → Application Layer (State + Loading + Error)
src/components/*/             → Presentation Layer (nutzt nur den Hook)
```

**Regeln**:
1. **Services** sind reine Funktionen mit expliziten Parametern (kein versteckter State)
2. **Hooks** wrappen Services mit Preact-State (`loading`, `error`, `resolvedDoc`)
3. **Components** rufen NUR den Hook auf, NIEMALS den Service direkt
4. `fetch()`-Aufrufe geschehen NUR in Services, NIE in Hooks oder Components

### 12.4 Link-Relation Badges (Pattern 22)

OSCAL `links[].rel`-Werte werden als farbcodierte Badges dargestellt:

| `rel`-Wert | Badge-Label | Farbe | CSS-Klasse |
|------------|-------------|-------|------------|
| `implements` | "Implementiert" | Gruen | `.link-badge--implements` |
| `required` | "Erforderlich" | Rot | `.link-badge--required` |
| `related-control` | "Verwandt" | Blau | `.link-badge--related` |
| `bsi-baustein` | "BSI Baustein" | Orange | `.link-badge--bsi` |
| `template` | "Vorlage" | Grau | `.link-badge--template` |
| (unbekannt) | rel-Wert als Label | Standard | `.link-badge--default` |

**Regeln**:
1. CSS-Klassen mit Prefix `.link-badge--` (Komponenten-Prefix-Konvention)
2. Unbekannte `rel`-Werte werden mit dem Originalwert als Label und Default-Styling angezeigt
3. Farben ueber CSS-Variablen definieren (keine hardcoded Werte, s. Sektion 4)
4. Badges muessen `aria-label` fuer Screenreader haben (z.B. `aria-label="Beziehung: Implementiert"`)
