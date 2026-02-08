# OSCAL Import & Referenzierung - Viewer Team Guide

**Version**: 1.0.0
**Stand**: 2026-02-08
**Quelle**: OSCAL Expert Briefing

---

> **Dieses Dokument ist die Viewer-Team-spezifische Aufbereitung des OSCAL Expert Briefings.
> Es beschreibt, was das Viewer Team bei der Implementierung beachten muss.**

---

## 1. Das OSCAL-Referenzmodell

OSCAL definiert eine hierarchische Modellkette. **Jede Schicht importiert die darunter liegende:**

```
┌──────────────────────────────────────────────────────────┐
│  SSP (System Security Plan)                               │
│  → importiert Profile + Component-Definitions             │
├──────────────────────────────────────────────────────────┤
│  Component-Definition                                     │
│  → referenziert Catalog-Controls via source + control-id  │
├──────────────────────────────────────────────────────────┤
│  Profile                                                  │
│  → importiert aus einem oder mehreren Catalogen           │
├──────────────────────────────────────────────────────────┤
│  Catalog (Basis)                                          │
│  → Standalone, wird von allen anderen referenziert        │
└──────────────────────────────────────────────────────────┘
```

**Der Viewer muss diese komplette Kette verstehen und auflösen können.**

---

## 2. Implementierungs-Anforderungen

### 2.1 Vier HREF-Patterns erkennen und auflösen

| Pattern | Beispiel | Viewer-Aktion |
|---------|----------|---------------|
| **Relativer Pfad** | `../catalog/file.json` | Relativ zum aktuellen Dokument auflösen |
| **Fragment-ID** | `catalog.json#GOV-01` | Datei laden, dann Control per ID finden |
| **GitHub-URL** | `https://github.com/.../catalog.json` | Per `fetch()` laden (CORS beachten!) |
| **URN** | `urn:iso:std:iso-iec:27701:ed-2:2025` | Als Referenz-Label anzeigen (nicht auflösbar) |

### 2.2 Profile Resolution (Priorität: Hoch)

Der Viewer muss das Profile-Import-Modell vollständig auflösen:

```
1. Profile laden
2. imports[].href → Catalog(e) laden
3. include-controls → Controls filtern
4. merge → Controls zusammenführen
5. modify.set-parameters → Parameter anwenden
6. modify.alters → Controls erweitern/ändern
7. → Resolved Catalog anzeigen
```

**Konkretes Beispiel aus dem Projekt:**

```json
{
  "imports": [
    {
      "href": "../catalog/open_privacy_catalog_risk.json",
      "include-controls": {
        "with-ids": ["GOV-01", "GOV-02", "ACC-01", "LAW-01"]
      }
    },
    {
      "href": "https://github.com/BSI-Bund/.../catalog.json",
      "include-controls": {
        "with-ids": ["GC.1.1", "GC.2.1"]
      }
    }
  ],
  "merge": {
    "combine": { "method": "merge" },
    "custom": { "groups": [...] }
  },
  "modify": {
    "set-parameters": [...],
    "alters": [...]
  }
}
```

**Was der Viewer anzeigen muss:**
- Welche Cataloge importiert werden (Quellen)
- Welche Controls ausgewählt wurden (`include-controls`)
- Welche Modifikationen vorgenommen wurden (`modify`)
- Das zusammengeführte Ergebnis (`merge`)

### 2.3 Cross-Referenz-Auflösung (Priorität: Mittel)

Cataloge verweisen aufeinander per `links[]`:

```json
{
  "links": [
    {
      "href": "open_privacy_catalog_risk_v0.7.0.json#ACC-01",
      "rel": "implements",
      "text": "SDM: Protokollieren (Nachweisführung)"
    }
  ]
}
```

**Viewer-Verhalten:**
- `rel="implements"` → "Implementiert von" Badge anzeigen
- `rel="required"` → "Abhängigkeit" Warning anzeigen
- `rel="related-control"` → "Verwandte Controls" Sidebar
- `href` mit Fragment → Klickbarer Link zum referenzierten Control

### 2.4 SSP Resolution (Priorität: Phase 2)

```
SSP → import-profile.href → Profile auflösen (siehe 2.2)
    → control-implementation → Zeige welche Controls wie umgesetzt sind
    → by-components → Zeige welche Komponente was implementiert
```

### 2.5 Component-Definition Resolution (Priorität: Phase 2)

```
Component-Def → source → Catalog auflösen
              → control-id → Zuordnung Control ↔ Komponente
              → "Welche Komponente implementiert welches Control?"
```

---

## 3. Technische Implementierung

### 3.1 Resolution Service

```typescript
// src/services/resolver.ts

interface ResolvedReference {
  document: OscalDocument
  source: string      // Ursprüngliche href
  resolvedUrl: string // Aufgelöste URL
  fromCache: boolean
}

interface ResolutionService {
  /**
   * Löst einen HREF relativ zu einem Basisdokument auf
   */
  resolveHref(href: string, baseUrl: string): Promise<ResolvedReference>

  /**
   * Löst ein komplettes Profile auf (imports → merge → modify)
   */
  resolveProfile(profile: Profile): Promise<ResolvedCatalog>

  /**
   * Löst die Import-Kette eines SSP auf
   */
  resolveSSP(ssp: SSP): Promise<ResolvedSSP>
}
```

### 3.2 HREF-Parser

```typescript
// src/services/href-parser.ts

type HrefType = 'relative' | 'fragment' | 'absolute-url' | 'urn'

interface ParsedHref {
  type: HrefType
  path: string           // Dateipfad oder URL
  fragment?: string      // Control-ID nach #
  isResolvable: boolean  // URNs sind nicht auflösbar
}

function parseHref(href: string): ParsedHref {
  // URN: nicht auflösbar
  if (href.startsWith('urn:')) {
    return { type: 'urn', path: href, isResolvable: false }
  }

  // Absolute URL
  if (href.startsWith('http://') || href.startsWith('https://')) {
    const [path, fragment] = href.split('#')
    return { type: 'absolute-url', path, fragment, isResolvable: true }
  }

  // Fragment-only
  if (href.startsWith('#')) {
    return { type: 'fragment', path: '', fragment: href.slice(1), isResolvable: true }
  }

  // Relativer Pfad (mit optionalem Fragment)
  const [path, fragment] = href.split('#')
  return { type: 'relative', path, fragment, isResolvable: true }
}
```

### 3.3 Document Cache

```typescript
// src/services/document-cache.ts

/**
 * Cache für bereits geladene OSCAL-Dokumente.
 * Verhindert doppeltes Laden bei Mehrfach-Referenzen.
 */
class DocumentCache {
  private cache = new Map<string, OscalDocument>()

  get(url: string): OscalDocument | undefined {
    return this.cache.get(this.normalize(url))
  }

  set(url: string, doc: OscalDocument): void {
    this.cache.set(this.normalize(url), doc)
  }

  private normalize(url: string): string {
    // Entferne Fragment, normalisiere Pfad
    return url.split('#')[0].toLowerCase()
  }
}
```

### 3.4 CORS-Handling

```typescript
async function fetchExternal(url: string): Promise<unknown> {
  // GitHub raw URLs funktionieren meist direkt
  const rawUrl = url
    .replace('github.com', 'raw.githubusercontent.com')
    .replace('/blob/', '/')

  try {
    const response = await fetch(rawUrl)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return response.json()
  } catch (error) {
    // Fallback: Dem User mitteilen, dass externe Referenz
    // nicht aufgelöst werden konnte
    return {
      error: true,
      message: `Externe Referenz nicht erreichbar: ${url}`,
      href: url
    }
  }
}
```

---

## 4. UI-Anforderungen

### 4.1 Import-Visualisierung

Bei Profile-Dokumenten anzeigen:

```
┌─────────────────────────────────────────┐
│ Profile: Integrated Privacy & Security   │
├─────────────────────────────────────────┤
│ Importierte Quellen:                     │
│   📁 OPC Privacy Catalog (lokal)         │
│      → 4 Controls ausgewählt            │
│   🌐 BSI Grundschutz++ (extern)          │
│      → 2 Controls ausgewählt            │
├─────────────────────────────────────────┤
│ Merge-Strategie: merge                   │
│ Modifikationen: 3 Parameter, 1 Alter    │
└─────────────────────────────────────────┘
```

### 4.2 Link-Relation-Badges

| `rel` | Badge | Farbe |
|-------|-------|-------|
| `implements` | "Implementiert" | Grün |
| `required` | "Erforderlich" | Rot |
| `related-control` | "Verwandt" | Blau |
| `bsi-baustein` | "BSI Baustein" | Orange |
| `template` | "Vorlage" | Grau |

### 4.3 Unaufgelöste Referenzen

Wenn eine Referenz nicht aufgelöst werden kann:

```
⚠️ Externe Referenz nicht verfügbar
    href: https://github.com/BSI-Bund/.../catalog.json
    Grund: Netzwerkfehler / CORS
    [Manuell laden] [Ignorieren]
```

---

## 5. OSCAL-Validierungsregeln für den Viewer

Der Viewer sollte diese Regeln prüfen und Warnungen anzeigen:

| Regel | Prüfung | Warnung |
|-------|---------|---------|
| Namespace | `ns` muss gültige URI sein | "Ungültiger Namespace" |
| Leere Arrays | `parts`, `props`, `links` dürfen nicht `[]` sein | "Leeres Array gefunden" |
| UUID Format | Muss UUIDv4 sein | "Ungültige UUID" |
| OSCAL Version | `metadata.oscal-version` vorhanden | "Keine Version angegeben" |
| Broken Links | `href`-Ziele müssen existieren | "Referenz nicht gefunden" |

---

## 6. Prioritäten für die Implementierung

### Phase 1 (MVP)
1. Catalog-Anzeige mit Cross-Referenz-Links
2. HREF-Parser für alle vier Patterns
3. Fragment-ID-Auflösung (Klick auf `#CONTROL-ID`)

### Phase 2
4. Profile Resolution (Import → Merge → Modify)
5. Document Cache für Performance
6. Import-Visualisierung (Quellen, Auswahl, Modifikationen)

### Phase 3
7. SSP Resolution (Import-Kette)
8. Component-Definition ↔ Control Mapping
9. Lazy Loading für externe Kataloge

---

## Referenzen

- [OSCAL Expert Briefing](../../../opengov-oscal-privacy-project/docs/team-knowledge/oscal-expert/OSCAL_IMPORT_REFERENCING.md)
- [ADR-002: Zero-Backend](decisions/ADR_002_zero_backend.md)
- [ADR-003: Import Resolution](decisions/ADR_003_import_resolution.md)
- [NIST OSCAL Profile Model](https://pages.nist.gov/OSCAL/concepts/layer/control/profile/)

---

**Letzte Aktualisierung**: 2026-02-08
