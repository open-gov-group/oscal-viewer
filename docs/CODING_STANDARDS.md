# OSCAL Viewer - Coding Standards

**Version**: 1.0.0
**Gueltig ab**: Phase 2

---

## 1. Architektur-Schichten (ADR-003)

```
Domain (types/, parser/)  ->  Application (hooks/)  ->  Presentation (components/)
```

**Import-Regeln** (durch ESLint erzwungen):
- `types/` importiert NUR aus externen Packages
- `parser/` importiert aus `types/` und externen Packages
- `hooks/` importiert aus `types/`, `parser/` und externen Packages
- `components/` importiert aus allen Layern

Verletzungen werden durch `.eslintrc.cjs` als Fehler erkannt.

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

- Alle Styles in `src/styles/base.css` (kein CSS-in-JS)
- BEM-aehnliche Namensgebung: `.profile-view`, `.profile-sidebar`, `.profile-content`
- Komponenten-Prefix: `.catalog-*`, `.profile-*`, `.compdef-*`, `.ssp-*`
- Responsive Design mit CSS Grid/Flexbox
- Accessibility: Fokus-Styles nicht entfernen

---

## 5. Branch & Commit Conventions

- Branch-Naming: `feature/<issue-nr>-<beschreibung>` (z.B. `feature/4-profile-renderer`)
- Commit-Messages: `<type>: <beschreibung>` (z.B. `feat: implement profile renderer`)
  - Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`
- Kleine, fokussierte Commits
