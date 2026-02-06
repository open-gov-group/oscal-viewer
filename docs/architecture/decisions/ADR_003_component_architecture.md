# ADR-003: Komponentenarchitektur

**Status**: Accepted
**Datum**: 2026-02-06
**Issue**: #1

---

## Kontext

Der OSCAL Viewer muss vier verschiedene Dokumenttypen (Catalog, Profile, Component-Definition, SSP) darstellen. Jeder Typ hat eine eigene Struktur, teilt aber gemeinsame Elemente (Metadata, Properties, Links). Die Architektur muss erweiterbar sein, ohne bestehenden Code zu brechen.

## Entscheidung

**Wir verwenden eine dreischichtige Architektur mit strikter Trennung von Domain (Parser), Application (State/Hooks) und Presentation (UI-Komponenten).**

## Architektur

### Schichtenmodell

```
┌─────────────────────────────────────────────────────┐
│                 Presentation Layer                    │
│  Preact-Komponenten (.tsx)                           │
│  Rein visuell, keine Geschaeftslogik                 │
├─────────────────────────────────────────────────────┤
│                 Application Layer                     │
│  Hooks (useDocument, useParser, useSearch)            │
│  State Management, Side Effects                      │
├─────────────────────────────────────────────────────┤
│                   Domain Layer                        │
│  Parser, Types, Validators                           │
│  Framework-unabhaengig, reine Funktionen             │
└─────────────────────────────────────────────────────┘
```

### Verzeichnisstruktur

```
src/
├── types/                    # Domain: TypeScript-Interfaces
│   └── oscal.ts              #   Alle OSCAL-Typen
├── parser/                   # Domain: Dokumentverarbeitung
│   ├── index.ts              #   Oeffentliche API
│   ├── detect.ts             #   Typ- und Versionserkennung
│   ├── catalog.ts            #   Catalog Parser
│   ├── profile.ts            #   Profile Parser
│   ├── component-definition.ts  # Component-Def Parser
│   └── ssp.ts                #   SSP Parser
├── hooks/                    # Application: State & Logik
│   ├── use-document.ts       #   Dokument laden/verwalten
│   ├── use-parser.ts         #   Parser-Orchestrierung
│   └── use-search.ts         #   Suche & Filter
├── components/               # Presentation: UI
│   ├── shared/               #   Geteilte Komponenten
│   │   ├── metadata-panel.tsx
│   │   ├── property-badge.tsx
│   │   └── search-bar.tsx
│   ├── catalog/              #   Catalog-spezifisch
│   │   ├── catalog-view.tsx
│   │   ├── group-tree.tsx
│   │   ├── control-card.tsx
│   │   └── control-detail.tsx
│   ├── profile/              #   Profile-spezifisch
│   │   └── profile-view.tsx
│   ├── component-def/        #   Component-Def-spezifisch
│   │   └── component-def-view.tsx
│   ├── ssp/                  #   SSP-spezifisch
│   │   └── ssp-view.tsx
│   ├── file-drop-zone.tsx    #   Upload-Bereich
│   └── document-viewer.tsx   #   Router zu Typ-Views
└── styles/
    └── base.css              #   CSS Custom Properties
```

### Komponentenhierarchie

```
App
├── Header
├── FileDropZone                     # Upload (wenn kein Dokument)
└── DocumentViewer                   # Anzeige (wenn Dokument geladen)
    ├── DocumentHeader
    │   ├── TypeBadge
    │   ├── VersionBadge
    │   └── MetadataPanel
    ├── [CatalogView]                # Conditional nach Typ
    │   ├── GroupTree (Sidebar)
    │   └── ControlList
    │       └── ControlCard
    │           ├── ParameterList
    │           ├── PropertyBadges
    │           └── PartContent
    ├── [ProfileView]
    │   ├── ImportList
    │   └── ModificationView
    ├── [ComponentDefView]
    │   ├── ComponentList
    │   └── ControlMappings
    └── [SSPView]
        ├── SystemCharacteristics
        ├── SystemImplementation
        └── ControlImplementation
```

### Parser-Pattern

Jeder Parser ist eine reine Funktion ohne Seiteneffekte:

```typescript
// Generisches Parser-Interface
type ParseResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }

// Pro Dokumenttyp ein spezialisierter Parser
function parseCatalog(raw: unknown): ParseResult<Catalog>
function parseProfile(raw: unknown): ParseResult<Profile>
function parseComponentDefinition(raw: unknown): ParseResult<ComponentDefinition>
function parseSSP(raw: unknown): ParseResult<SystemSecurityPlan>

// Orchestrierung ueber den Document Hook
function useDocument() {
  // 1. detect type  -> parser/detect.ts
  // 2. parse        -> parser/<type>.ts
  // 3. set state    -> Preact useState
}
```

## Begruendung

### Vorteile

- **Testbarkeit**: Domain Layer ist framework-unabhaengig, unit-testbar ohne Browser
- **Erweiterbarkeit**: Neuer Dokumenttyp = neuer Parser + neuer View, kein bestehender Code aendert sich
- **Wiederverwendbarkeit**: Shared Components (MetadataPanel, PropertyBadge) ueber alle Typen nutzbar
- **Trennung der Zustaendigkeiten**: Designer arbeiten an Presentation, Entwickler an Domain
- **Bundle Size**: Typ-spezifische Views koennen lazy-loaded werden

### Nachteile

- Mehr Dateien als ein monolithischer Ansatz
- Initiale Boilerplate fuer neue Dokumenttypen

## Alternativen

### Monolithischer Ansatz (ein grosser Parser + ein grosser Renderer)
- **Pro**: Weniger Dateien
- **Contra**: Schwer wartbar bei 4+ Dokumenttypen, nicht testbar in Isolation
- **Abgelehnt weil**: Skaliert nicht mit wachsender OSCAL-Komplexitaet

### Plugin-System (dynamisches Laden von Parsern)
- **Pro**: Maximal erweiterbar
- **Contra**: Over-Engineering fuer 4 bekannte Typen
- **Abgelehnt weil**: YAGNI - Wir kennen alle Dokumenttypen im Voraus

## Konsequenzen

- Alle Parser muessen das `ParseResult<T>` Pattern verwenden
- Neue Dokumenttypen folgen dem Muster: types -> parser -> hook -> view
- Shared Components werden in `components/shared/` gesammelt
- Jeder View bekommt sein eigenes Unterverzeichnis
- Domain Layer (`types/`, `parser/`) importiert niemals aus `components/` oder `hooks/`
