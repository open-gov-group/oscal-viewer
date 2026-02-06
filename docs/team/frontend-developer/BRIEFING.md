# Frontend Developer - Briefing & Kommunikation

**Rolle**: Frontend Developer
**Projekt**: OSCAL Viewer
**Stand**: 2026-02-06
**Phase**: 2 - Erweiterung (KW 10-12)

---

## Deine Verantwortlichkeiten

- UI-Komponenten fuer alle OSCAL-Dokumenttypen implementieren
- Performance optimieren (grosse OSCAL-Dokumente)
- Unit und Integration Tests schreiben
- Accessibility in Code umsetzen

## Phase 1 - Zusammenfassung (ABGESCHLOSSEN)

| Issue | Titel | Ergebnis |
|-------|-------|----------|
| #2 | OSCAL Parser | 4 Parser, 43 Tests, 94.78% Coverage, 100% Functions |
| #3 | Catalog Renderer | Hierarchische Navigation, Control-Detail, Shared Components |

### Phase 1 Build-Ergebnis
- Bundle: 12.54 KB gzipped (Budget: < 100KB)
- TypeScript: 0 Errors (strict mode)
- Tests: 43 bestanden

---

## Aktueller Auftrag - Phase 2

### Issue #4 - Profile Renderer [HIGH - Woche 10]

**Ziel**: OSCAL Profile-Dokumente visuell darstellen

**Was ein Profile ist**: Ein Profile definiert eine Baseline durch Import und Modifikation von Controls aus Catalogs. Wichtige Sektionen:
- `imports`: Welche Catalogs/Profiles importiert werden (mit `include-controls`/`exclude-controls`)
- `merge`: Wie importierte Controls zusammengefuehrt werden
- `modify`: Welche Controls angepasst werden (Parameter-Werte, zusaetzliche Parts)

**Aufgaben**:
1. Erstelle `src/components/profile/profile-view.tsx` - Hauptkomponente
2. Zeige Import-Quellen visuell an (welche Catalogs referenziert werden)
3. Zeige Modifikationen an (geaenderte Parameter, zusaetzliche Controls)
4. Nutze `MetadataPanel` und `PropertyBadge` aus Shared Components
5. Registriere in `document-viewer.tsx` unter `case 'profile':`
6. Tests in `tests/` Verzeichnis

**Referenz**: `src/components/catalog/catalog-view.tsx` als Pattern-Vorlage
**Parser**: `src/parser/profile.ts` - `parseProfile()` ist bereits implementiert
**Typen**: `Profile` Interface in `src/types/oscal.ts`

---

### Issue #5 - Component Definition Renderer [HIGH - Woche 10]

**Ziel**: OSCAL Component-Definition-Dokumente visuell darstellen

**Was eine Component-Definition ist**: Beschreibt wie Komponenten (Software, Hardware, Services) Security Controls implementieren. Wichtige Sektionen:
- `components`: Liste von Komponenten mit Typ, Beschreibung, Properties
- `control-implementations`: Welche Controls implementiert werden und wie
- `capabilities`: Optionale Faehigkeiten der Komponenten

**Aufgaben**:
1. Erstelle `src/components/component-def/component-def-view.tsx`
2. Zeige Komponenten-Liste mit Typ-Badge (software, hardware, service, etc.)
3. Zeige Control-Implementations pro Komponente
4. Nutze Shared Components (MetadataPanel, PropertyBadge)
5. Registriere in `document-viewer.tsx` unter `case 'component-definition':`
6. Tests schreiben

**Parser**: `src/parser/component-definition.ts` - `parseComponentDefinition()` ist implementiert
**Typen**: `ComponentDefinition` Interface in `src/types/oscal.ts`

---

### Issue #6 - SSP Renderer [HIGH - Woche 11]

**Ziel**: OSCAL System Security Plan visuell darstellen

**Was ein SSP ist**: Der komplexeste OSCAL-Dokumenttyp. Beschreibt ein IT-System und dessen Sicherheitsmassnahmen. Wichtige Sektionen:
- `import-profile`: Referenz auf die verwendete Baseline
- `system-characteristics`: Name, Beschreibung, Security-Kategorisierung
- `system-implementation`: Benutzer, Komponenten, Services
- `control-implementation`: Wie jeder Control implementiert wird

**Aufgaben**:
1. Erstelle `src/components/ssp/ssp-view.tsx` - Hauptkomponente
2. Zeige System-Characteristics prominent (Name, Beschreibung, Kategorisierung)
3. Zeige System-Implementation (Users, Components, Services als Listen)
4. Zeige Control-Implementation (pro Control die Beschreibung der Umsetzung)
5. Nutze Tab- oder Accordion-Navigation fuer die vielen Sektionen
6. Nutze Shared Components
7. Registriere in `document-viewer.tsx` unter `case 'system-security-plan':`

**Achtung**: SSP ist der komplexeste Typ - plane genuegend Zeit ein!
**Parser**: `src/parser/ssp.ts` - `parseSSP()` ist implementiert
**Typen**: `SystemSecurityPlan` Interface in `src/types/oscal.ts`

---

### Issue #7 - Suchfunktion [HIGH - Woche 12]

**Ziel**: Controls und Inhalte durchsuchbar machen

**Anforderungen**:
1. Suchfeld im Header oder als eigene Komponente
2. Suche ueber Control-ID, Titel, Prose-Text
3. Funktioniert fuer alle Dokumenttypen
4. Live-Filterung waehrend der Eingabe (debounced)
5. Ergebnis-Highlighting

**Architektur-Empfehlung**:
- `src/hooks/use-search.ts` - Custom Hook fuer Suchlogik (Application Layer)
- Generisches Such-Interface das pro Dokumenttyp eine Index-Funktion erhaelt
- Keine externe Bibliothek noetig fuer clientseitige Textsuche

---

## Bestehende Code-Struktur

```
src/
├── types/
│   └── oscal.ts              # Alle OSCAL TypeScript-Interfaces
├── parser/
│   ├── index.ts              # parseOscalDocument() - Haupteinstieg
│   ├── detect.ts             # Erkennung: Typ + Version
│   ├── catalog.ts            # parseCatalog(), countControls()
│   ├── profile.ts            # parseProfile()
│   ├── component-definition.ts  # parseComponentDefinition()
│   └── ssp.ts                # parseSSP()
├── components/
│   ├── document-viewer.tsx   # Router - HIER neue cases registrieren
│   ├── shared/
│   │   ├── metadata-panel.tsx   # <MetadataPanel metadata={...} />
│   │   └── property-badge.tsx   # <PropertyBadge> + <PropertyList>
│   └── catalog/
│       ├── catalog-view.tsx     # Referenz-Implementation
│       ├── group-tree.tsx       # Baum-Navigation Pattern
│       └── control-detail.tsx   # Detail-Ansicht Pattern
├── styles/
│   └── base.css              # Styles hier ergaenzen
├── app.tsx                   # Hauptapp - normalerweise kein Aenderungsbedarf
└── main.tsx
```

### Wichtige Patterns

**Neuen Renderer registrieren** in `document-viewer.tsx`:
```tsx
case 'profile':
  return <ProfileView profile={data.document} />
```

**Shared Components nutzen**:
```tsx
import { MetadataPanel } from '@/components/shared/metadata-panel'
import { PropertyList } from '@/components/shared/property-badge'
```

**Test-Pattern** (siehe `tests/parser.test.ts`):
```tsx
import { describe, it, expect } from 'vitest'
```

---

## Zusammenarbeit

| Mit | Thema |
|-----|-------|
| Tech Lead | Code Reviews, Coding Standards |
| UI/UX Designer | Komponentenspezifikation, Design-Umsetzung |
| QA Engineer | Test-Strategie, Testdaten |

---

## Kommunikationslog

| Datum | Von | An | Thema | Status |
|-------|-----|-----|-------|--------|
| 2026-02-06 | Architect | Frontend Developer | Initiales Briefing | Erstellt |
| 2026-02-06 | Architect | Frontend Developer | Issue #2: Parser komplett (4 Typen, 43 Tests) | Erledigt |
| 2026-02-06 | Architect | Frontend Developer | Issue #3: Catalog Renderer komplett | Erledigt |
| 2026-02-06 | Architect | Frontend Developer | Phase 2 Briefing: Issues #4-#7 | Aktiv |
