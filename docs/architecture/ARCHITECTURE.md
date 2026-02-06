# System Architecture - OSCAL Viewer

**Version**: 1.0.0

---

## 1. Übersicht

### 1.1 Mission

Der OSCAL Viewer ermöglicht die Anzeige von OSCAL-Dokumenten (Catalog, Profile, Component Definition, SSP) aller Versionen von 1.0.x bis zur aktuellen Version im Browser - ohne Backend.

### 1.2 Architektur-Prinzipien

| Prinzip | Beschreibung |
|---------|--------------|
| **Zero Backend** | Alle Logik läuft im Browser |
| **Privacy by Design** | Keine Daten verlassen den Client |
| **Offline-Capable** | Kernfunktionalität ohne Internet |
| **Multi-Version Support** | OSCAL 1.0.x bis 1.1.2+ |

---

## 2. System Context

```
┌─────────────────────────────────────────────────────┐
│                       User                           │
│          (Uploads OSCAL JSON/XML Files)             │
└────────────────────────┬────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────┐
│                   OSCAL Viewer                       │
│              (Client-Side Web App)                   │
│  ┌─────────────────────────────────────────────┐   │
│  │              Browser                         │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐      │   │
│  │  │ Parser  │ │ Renderer│ │ Storage │      │   │
│  │  │  Layer  │ │  Layer  │ │ (local) │      │   │
│  │  └─────────┘ └─────────┘ └─────────┘      │   │
│  └─────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────┐
│                  GitHub Pages                        │
│            (Static File Hosting)                     │
└─────────────────────────────────────────────────────┘
```

---

## 3. Component Architecture

```
┌─────────────────────────────────────────────────────┐
│                 Presentation Layer                   │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐  │
│  │FileDropZone │ │DocumentView │ │  Navigation │  │
│  └─────────────┘ └─────────────┘ └─────────────┘  │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐  │
│  │ ControlList │ │ GroupTree   │ │ SearchPanel │  │
│  └─────────────┘ └─────────────┘ └─────────────┘  │
└─────────────────────────────────────────────────────┘
                         │
┌─────────────────────────────────────────────────────┐
│                 Application Layer                    │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐  │
│  │useDocument  │ │ useParser   │ │  useSearch  │  │
│  └─────────────┘ └─────────────┘ └─────────────┘  │
│  ┌─────────────────────────────────────────────┐  │
│  │              State Management                │  │
│  └─────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
                         │
┌─────────────────────────────────────────────────────┐
│                   Domain Layer                       │
│  ┌─────────────────────────────────────────────┐  │
│  │                OSCAL Parsers                  │  │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────────┐   │  │
│  │  │ Catalog │ │ Profile │ │ComponentDef │   │  │
│  │  └─────────┘ └─────────┘ └─────────────┘   │  │
│  │  ┌─────────┐ ┌───────────────────────────┐ │  │
│  │  │   SSP   │ │  Version Detector        │ │  │
│  │  └─────────┘ └───────────────────────────┘ │  │
│  └─────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────┐  │
│  │            Type Definitions                  │  │
│  │  OscalDocument, Catalog, Profile, SSP, etc. │  │
│  └─────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

---

## 4. Datenfluss

### 4.1 File Upload Flow

```
User          FileDropZone      Parser         State         UI
 │                 │              │               │           │
 │  Drop File      │              │               │           │
 ├────────────────►│              │               │           │
 │                 │ readFile()   │               │           │
 │                 ├─────────────►│               │           │
 │                 │              │ detectType()  │           │
 │                 │              ├──────────────►│           │
 │                 │              │ detectVersion │           │
 │                 │              ├──────────────►│           │
 │                 │              │ parse()       │           │
 │                 │              ├──────────────►│           │
 │                 │              │               │           │
 │                 │              │ OscalDocument │           │
 │                 │              │◄──────────────┤           │
 │                 │ setDocument()│               │           │
 │                 │──────────────┼──────────────►│           │
 │                 │              │               │ render()  │
 │                 │              │               ├──────────►│
 │  Display        │              │               │           │
 │◄────────────────┼──────────────┼───────────────┼───────────┤
```

### 4.2 OSCAL Version Detection

```typescript
// Automatische Versionserkennung
function detectVersion(json: unknown): string {
  // 1. Prüfe metadata.oscal-version
  if (metadata['oscal-version']) {
    return metadata['oscal-version']
  }

  // 2. Fallback: Struktur-basierte Erkennung
  if (hasProperty(doc, 'id') && !hasProperty(doc, 'uuid')) {
    return '1.0.x'  // Vor 1.1.0
  }

  return '1.1.0+'
}
```

---

## 5. OSCAL Document Types

### 5.1 Type Hierarchy

```typescript
interface OscalDocument {
  uuid: string
  metadata: Metadata
}

interface Catalog extends OscalDocument {
  groups?: Group[]
  controls?: Control[]
}

interface Profile extends OscalDocument {
  imports: Import[]
  merge?: Merge
  modify?: Modify
}

interface ComponentDefinition extends OscalDocument {
  components: Component[]
}

interface SystemSecurityPlan extends OscalDocument {
  'import-profile': ImportProfile
  'system-characteristics': SystemCharacteristics
  'system-implementation': SystemImplementation
  'control-implementation': ControlImplementation
}
```

### 5.2 Parser Strategy

```
                    ┌──────────────────┐
                    │  Document Type   │
                    │    Detector      │
                    └────────┬─────────┘
                             │
         ┌───────────────────┼───────────────────┐
         ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ Catalog Parser  │ │ Profile Parser  │ │   SSP Parser    │
│   - Groups      │ │   - Imports     │ │   - Impl. Status│
│   - Controls    │ │   - Merge       │ │   - Components  │
│   - Parameters  │ │   - Modify      │ │   - Inventory   │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

---

## 6. UI Component Tree

```
App
├── Header
│   └── ThemeToggle
├── FileDropZone
│   └── DropArea
├── DocumentViewer (conditional)
│   ├── DocumentHeader
│   │   ├── DocumentTitle
│   │   ├── VersionBadge
│   │   └── MetadataPanel
│   ├── Navigation
│   │   ├── GroupTree (Catalog)
│   │   ├── ImportList (Profile)
│   │   └── ComponentList (CD)
│   ├── ContentArea
│   │   ├── ControlView
│   │   ├── GroupView
│   │   └── ParameterView
│   └── SearchPanel
└── Footer
```

---

## 7. Performance Considerations

### 7.1 Große Dokumente

OSCAL-Kataloge können 1000+ Controls enthalten:

```typescript
// Virtualisierung für große Listen
<VirtualList
  items={controls}
  itemHeight={80}
  renderItem={(control) => <ControlRow data={control} />}
/>

// Lazy Loading für Gruppen
const ExpandableGroup = lazy(() => import('./ExpandableGroup'))
```

### 7.2 Memoization

```typescript
// Teure Berechnungen cachen
const filteredControls = useMemo(
  () => controls.filter(c => c.title.includes(search)),
  [controls, search]
)

// Stabile Callbacks
const handleSelect = useCallback(
  (id) => dispatch({ type: 'SELECT', payload: id }),
  []
)
```

---

## 8. Accessibility

### 8.1 Navigation

- Keyboard-navigierbare Baumstruktur
- Skip Links zum Hauptinhalt
- ARIA Landmarks für Sections

### 8.2 Screen Reader

```tsx
<section aria-labelledby="controls-heading">
  <h2 id="controls-heading">Controls</h2>
  <ul role="tree" aria-label="Control hierarchy">
    {controls.map(c => (
      <li role="treeitem" aria-expanded={expanded[c.id]}>
        {c.title}
      </li>
    ))}
  </ul>
</section>
```

---

## 9. Security

### 9.1 Input Validation

```typescript
// Alle Uploads validieren
function validateOscalDocument(json: unknown): Result<OscalDocument> {
  // 1. Typ-Prüfung
  if (!isObject(json)) {
    return { success: false, error: 'Invalid JSON' }
  }

  // 2. Dokument-Typ erkennen
  const type = detectDocumentType(json)
  if (type === 'unknown') {
    return { success: false, error: 'Unknown document type' }
  }

  // 3. Schema-Validierung (optional)
  return { success: true, data: json as OscalDocument }
}
```

### 9.2 Content Security

- Strikte CSP Headers
- Keine dynamische Script-Ausführung
- Kein innerHTML ohne Sanitization

---

## 10. Deployment

```
┌─────────────────────────────────────────────────────┐
│                 GitHub Repository                    │
│                    main branch                       │
└────────────────────────┬────────────────────────────┘
                         │ push
                         ▼
┌─────────────────────────────────────────────────────┐
│                  GitHub Actions                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐ │
│  │   Test   │→ │  Build   │→ │ Deploy to Pages  │ │
│  └──────────┘  └──────────┘  └──────────────────┘ │
└────────────────────────┬────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────┐
│                  GitHub Pages                        │
│      https://open-gov-group.github.io/oscal-viewer  │
└─────────────────────────────────────────────────────┘
```

---

**Letzte Aktualisierung**: 2024
