# ADR-009: Resolved Catalog, Parameter Substitution & Cross-Document Navigation

**Status**: Accepted
**Datum**: 2026-02-10
**Phase**: Phase 5 — Resolved Catalog & Parameter Substitution

---

## Kontext

Phase 4 hat die Resolution-Infrastruktur aufgebaut (ADR-008): HrefParser fuer HREF-Klassifikation, DocumentCache fuer geladene Dokumente, ResolutionService fuer Profile- und SSP-Import-Ketten. Phase 5 macht die Ergebnisse dieser Resolution sichtbar:

1. **Aufgeloeste Controls anzeigen**: Wenn ein Profile Controls aus Catalogen importiert, muessen diese aufgeloesten Controls im Viewer dargestellt werden — nicht nur die Import-Referenzen.
2. **Parameter-Substitution**: OSCAL-Prose enthaelt `{{ insert: param, <id> }}`-Platzhalter, die durch die konkreten Parameter-Werte aus dem Profile/SSP ersetzt werden muessen.
3. **Back-Matter Ressourcen**: OSCAL-Dokumente referenzieren externe Ressourcen ueber `back-matter.resources[]`. Diese muessen angezeigt und als Fragment-Navigationsziele dienen.
4. **Cross-Document Navigation**: Wenn ein Profile auf einen Catalog verweist, soll der Nutzer zwischen den Dokumenten navigieren koennen — mit Browser-Back/Forward-Unterstuetzung.

## Entscheidung

**Wir fuehren drei neue Module (1 Service, 2 Shared Components) und ein Cross-Document Navigationskonzept ein.**

### 1. ParamSubstitutor als Domain Service

**Datei**: `src/services/param-substitutor.ts`

Reine Funktion ohne Seiteneffekte. Verarbeitet OSCAL `{{ insert: param, <id> }}`-Platzhalter in Prose-Texten.

```typescript
/** Segment-Typ fuer substituierte Prose */
interface ProseSegment {
  type: 'text' | 'param'
  value: string
  paramId?: string  // Nur bei type === 'param'
}

/** Erstellt eine ID->Wert-Map aus OSCAL-Parametern */
function buildParamMap(params: Parameter[]): Map<string, string>

/** Substituiert {{ insert: param, <id> }}-Platzhalter in OSCAL-Prose */
function substituteProse(prose: string, paramMap: Map<string, string>): ProseSegment[]
```

**buildParamMap Prioritaet**: `values[0]` > `select.choice[0]` > `label` > `param.id`

**Regex**: `/\{\{\s*insert:\s*param,\s*([^}\s]+)\s*\}\}/g`

### 2. ProseView als Shared Component

**Datei**: `src/components/shared/prose-view.tsx`

Rendert OSCAL-Prose mit optionaler Parameter-Substitution.

```typescript
interface ProseViewProps {
  prose: string
  paramMap?: Map<string, string>
}
```

- **Ohne `paramMap`**: Rendert den Prose-Text direkt (Raw-Darstellung)
- **Mit `paramMap`**: Ruft `substituteProse()` auf, rendert Text-Segmente normal und Parameter-Segmente mit Amber-Highlighting (CSS-Klasse `.param-substitution`)

### 3. ResourcePanel als Shared Component

**Datei**: `src/components/shared/resource-panel.tsx`

Rendert `back-matter.resources[]` eines OSCAL-Dokuments.

```typescript
interface ResourcePanelProps {
  backMatter: BackMatter
}
```

Jede Ressource erhaelt:
- `id="resource-{uuid}"` fuer Fragment-Navigation (`href="#uuid"` Ziele)
- Anzeige von: uuid, title, description, rlinks (klickbare externe Links), citations, document-ids
- JSON-rlinks werden bevorzugt (media-type enthaelt 'json')
- Base64-Daten werden als Marker angezeigt (kein Inline-Rendering)

### 4. Resolved Catalog in ProfileView und SspView

Aufgeloeste Controls aus dem `useResolver()` Hook werden in einem `AccordionGroup` mit `ControlDetail`-Komponenten dargestellt:

- **ProfileView**: Baut `profileParamMap` aus `modify.set-parameters`. Controls erhalten diesen als `paramMap` Prop an `ControlDetail`.
- **SspView**: Nutzt `useSspResolver` fuer die SSP->Profile->Catalog Kette. Exponiert aufgeloeste Controls analog zum ProfileView.

### 5. Cross-Document Navigation

Navigationkonzept fuer dokumentuebergreifende OSCAL-Referenzen:

- **ImportPanel** erhaelt `onSourceClick` Callback. Geladene Quellen werden als klickbare Buttons dargestellt.
- **App.handleUrl(url, pushHistory = true)** erstellt einen `pushState`-Eintrag wenn `pushHistory` true ist.
- **popstate Event Listener** in App stellt das vorherige Dokument wieder her.
- **URL Query Parameter** `?url=<docUrl>` bildet den aktuellen Dokumentzustand ab.

## Begruendung

### Warum ParamSubstitutor als separater Domain Service?

- Konsistent mit ADR-003 Dreischicht-Architektur: ParamSubstitutor liegt im Domain Layer, hat keine Preact-Abhaengigkeit.
- Trennung von Parsing und Darstellung: Der Parser (Domain) kennt keine Darstellungslogik. Die Substitution ist eine Transformation zwischen Parsing und Rendering.
- Testbarkeit: Reine Funktion, einfach mit Unit-Tests abzudecken ohne Browser-Umgebung.

### Warum ProseView als eigene Shared Component?

- OSCAL-Prose kommt in allen vier Dokumenttypen vor (Catalog, Profile, CompDef, SSP).
- Ohne ProseView muesste jede View die Substitution selbst implementieren — Duplikation.
- Die Amber-Highlighting-Logik ist ein Darstellungsdetail, das in den Presentation Layer gehoert.

### Warum Browser History API statt Router-Library?

- ADR-002 (Zero-Backend) verbietet Server-seitige Routing-Abhaengigkeiten.
- Die native `pushState`/`popState` API reicht fuer die einfache Dokumentwechsel-Navigation.
- Keine zusaetzliche Dependency (kein React Router, kein Preact Router) noetig.
- Der bestehende `?url=`-Parameter bildet bereits den Dokumentzustand in der URL ab.

### Warum ResourcePanel als eigene Shared Component?

- Back-Matter ist ein OSCAL-Konzept das in allen Dokumenttypen vorkommt.
- Fragment-Referenzen (`href="#uuid"`) benoetigen ein Navigationsziel mit passender `id`.
- Zentralisierung vermeidet Duplikation ueber die vier View-Komponenten.

## Alternativen

### 1. Markdown-Renderer fuer Prose

- **Pro**: Standardisiertes Rendering
- **Contra**: OSCAL-Prose nutzt `{{ insert: param, <id> }}` Syntax — kein Markdown
- **Abgelehnt weil**: Wuerde eine Markdown-Library benoetigen und die OSCAL-spezifischen Platzhalter nicht kennen

### 2. Inline-Parameter-Substitution im Parser

- **Pro**: Parser gibt bereits substituierte Texte zurueck
- **Contra**: Vermischung von Datenverarbeitung und Darstellungslogik
- **Abgelehnt weil**: Verletzt Separation of Concerns (Parser soll Rohdaten liefern, nicht darstellungsfertigen Text)

### 3. React Router fuer Navigation

- **Pro**: Ausgereifte Routing-Library mit vielen Features
- **Contra**: Zusaetzliche Dependency (~5 KB), Server-seitige Konfiguration wuenschenswert
- **Abgelehnt weil**: Browser History API genuegt fuer einfache Dokumentwechsel, ADR-002 Zero-Backend Constraint

### 4. ResourcePanel als separate Seite

- **Pro**: Saubere URL-Trennung
- **Contra**: Back-Matter ist immer kontextgebunden an das Hauptdokument
- **Abgelehnt weil**: Nutzer muessten zwischen Dokument und Ressourcen hin-und-her navigieren, verschlechtert UX

## Konsequenzen

- 3 neue Dateien: `param-substitutor.ts`, `prose-view.tsx`, `resource-panel.tsx`
- 650 Tests (+67 gegenueber Phase 4 Ende mit 583 Tests)
- Bundle: 36.10 KB gzipped (+2.5 KB gegenueber Phase 4 Ende mit ~33.6 KB)
- Fragment-Referenzen (`#uuid`) sind nun vollstaendig unterstuetzt fuer Profile-Imports und Back-Matter
- Alle 4 Dokumenttyp-Views (Catalog, Profile, CompDef, SSP) zeigen Back-Matter Ressourcen an
- Cross-Document Navigation ermoeglicht das Durchnavigieren von OSCAL-Referenzketten
- `?url=`-Parameter bildet den Navigationszustand ab — Links koennen geteilt werden
- Browser Back/Forward funktioniert fuer Dokumentwechsel
- ParamSubstitutor kann spaeter fuer SSP-spezifische Parameter (responsible-roles, etc.) erweitert werden
