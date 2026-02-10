# Orchestrierungsplan - OSCAL Viewer

**Erstellt von**: Architect
**Datum**: 2026-02-10
**Version**: 3.0 (Phase 7-10 Planung)

---

## Projektstatus

| Aspekt | Status |
|--------|--------|
| Repository | https://github.com/open-gov-group/oscal-viewer |
| Deployment | https://open-gov-group.github.io/oscal-viewer/ |
| Tech Stack | Preact + TypeScript + Vite |
| Phase | **Phase 6 ABGESCHLOSSEN, Phase 7-10 GEPLANT** |
| Bundle Size | 38.36 KB gzipped (Budget: < 100KB) |
| Tests | 759 bestanden (30 Dateien) |
| Dokumenttypen | 6 (Catalog, Profile, CompDef, SSP, AR, POA&M) |

---

## Phasen-Zusammenfassung (Phase 1-6)

### Phase 1: Foundation (ABGESCHLOSSEN)

ADR-001 bis ADR-004 finalisiert, dreischichtige Architektur etabliert. 4 Parser (Catalog, Profile, CompDef, SSP) mit ParseResult<T> Pattern implementiert. Catalog Renderer mit hierarchischer Navigation und Sidebar.
**43 Tests, 12.54 KB gzipped** | Commit: `983c8ff`

### Phase 2: Erweiterung (ABGESCHLOSSEN)

Profile-, ComponentDefinition- und SSP-Renderer implementiert. Suchfunktion, ESLint Layer-Regeln, CODING_STANDARDS, Dashboard-Redesign (Accordion, Deep-Linking, Filter), Stakeholder-Feedback (BITV 2.0, Nested Parts).
**254 Tests** | Commits: `7e4068e` .. `759b012`

### Phase 3: Deploy & Polish (ABGESCHLOSSEN)

PWA mit vite-plugin-pwa (Precache, Offline-UI, Install-Prompt). Dokumentation (CONTRIBUTING, CHANGELOG). npm Package Infrastructure (src/lib/, tsconfig.lib.json, publish.yml). Dependency-Upgrade (Vite 7, Vitest 4, ESLint 9).
**444 Tests, 28.76 KB gzipped** | Commit: `abcf25c`

### Phase 4: OSCAL Resolution (ABGESCHLOSSEN)

HrefParser (4 URL-Patterns), DocumentCache (URL-Normalisierung), ResolutionService (Profile Resolution Pipeline), ImportPanel, LinkBadge (5 Farben). ADR-008, CODING_STANDARDS v5.0.0 (Patterns 19-22). ESLint services/ Layer-Regeln.
**583 Tests, 33.58 KB gzipped** | Commit: `4394bb2`

### Phase 5: Resolved Catalog (ABGESCHLOSSEN)

ParamSubstitutor (Parameter-Ersetzung in Prosa-Texten), ProseView (Markdown-aehnliche Darstellung), ResourcePanel (Backmatter-Ressourcen), Cross-Document Navigation. ADR-009, CODING_STANDARDS v5.1.0 (Patterns 23-27).
**650 Tests, 36.10 KB gzipped**

### Phase 6: Assessment & E2E (ABGESCHLOSSEN)

Assessment Results (AR) und Plan of Action & Milestones (POA&M) Parser und Views. Playwright End-to-End Tests. Housekeeping und Stabilisierung.
**759 Tests, 38.36 KB gzipped**

---

## Phase 7: XML Parser (2-3 Sprints)

### Ziel

OSCAL XML-Dokumente nativ im Browser parsen. Bisher unterstuetzt der Viewer ausschliesslich JSON-Importe. Da viele Organisationen OSCAL in XML vorhalten, ist native XML-Unterstuetzung ein haeufig angefragtes Feature.

### Scope

- **`src/parser/xml-adapter.ts`**: DOMParser-basierter Adapter (~200 LOC), der XML-Eingabe in die bestehenden TypeScript-Typen transformiert. Nutzt die Browser-native DOMParser API (kein externer Dependency).
- **`detect.ts` Erweiterung**: Content-Type-Erkennung um XML-Heuristik erweitern (XML-Prolog `<?xml`, Root-Element-Name).
- **`app.tsx`**: Datei-Upload `accept` Attribut auf `.xml,.json` erweitern.

### Neue Dateien

| Datei | Beschreibung |
|-------|-------------|
| `src/parser/xml-adapter.ts` | XML-zu-Objekt Adapter (DOMParser) |
| `tests/parser/xml-adapter.test.ts` | Unit Tests fuer XML-Adapter |
| `tests/fixtures/xml/` | XML-Testdokumente (Catalog, Profile, SSP etc.) |
| `docs/architecture/decisions/ADR_010_xml_parser.md` | ADR-010: XML Parser Strategy |

### Modifizierte Dateien

| Datei | Aenderung |
|-------|-----------|
| `src/parser/detect.ts` | XML Content-Type Erkennung |
| `src/parser/index.ts` | XML-Adapter Export |
| `src/lib/index.ts` | XML-Adapter im npm Package exponieren |

### Herausforderungen

1. **XML Namespaces**: OSCAL XML nutzt `xmlns="http://csrc.nist.gov/ns/oscal/1.0"`. Der Adapter muss Namespace-agnostisch parsen (localName statt tagName).
2. **Array-Erkennung**: In JSON sind Arrays explizit, in XML muessen gleichnamige Geschwister-Elemente als Arrays erkannt werden.
3. **XHTML Mixed Content**: Prose-Felder in OSCAL koennen XHTML enthalten (z.B. `<p>`, `<a>`). Diese muessen als String erhalten bleiben, nicht als Objekt geparst werden.
4. **Performance bei grossen Dokumenten**: DOMParser laedt das gesamte Dokument in den Speicher. Bei sehr grossen Dateien (>10 MB) koennte dies problematisch werden.

### Abhaengigkeiten

- Keine blockierenden Abhaengigkeiten. Phase 6 ist abgeschlossen.
- **ADR-010** muss vor der Implementierung erstellt und reviewed werden.

### Risiken

| Risiko | Wahrscheinlichkeit | Auswirkung | Massnahme |
|--------|-------------------|------------|-----------|
| XHTML Parsing (Mixed Content vs. Strukturdaten) | Hoch | Hoch | Whitelist bekannter Prose-Felder, Fallback auf innerHTML |
| Namespace-Varianten (verschiedene OSCAL-Versionen) | Mittel | Mittel | localName-basiertes Parsing, Namespace-Pruefung optional |
| Bundle-Size Zuwachs > 5 KB | Niedrig | Mittel | Tree Shaking, XML-Adapter als separaten Chunk |

### Aufwand

2-3 Sprints (Frontend Dev + QA + Tech Lead)

### Aufgabenverteilung

| Rolle | Aufgabe |
|-------|---------|
| Tech Lead | ADR-010 erstellen, XML-Adapter Code Review, Array-Heuristik Design |
| Frontend Dev | xml-adapter.ts, detect.ts Erweiterung, app.tsx Accept, Integration |
| QA | XML Fixtures beschaffen, Unit Tests, Cross-Browser DOMParser Verifikation |
| DevOps | Bundle Size Monitoring, ggf. Chunk-Splitting |
| UI/UX | Keine UI-Aenderungen erwartet (transparent fuer Nutzer) |

---

## Phase 8: npm Package Publish (1 Sprint)

### Ziel

`@open-gov-group/oscal-parser` auf npm veroeffentlichen. Die bestehende Infrastruktur (publish.yml, lib/index.ts, tsconfig.lib.json) wird finalisiert und das erste Release auf npm publiziert.

### Scope

- **Bestehende Pipeline**: `publish.yml` Workflow, `src/lib/index.ts` Entry-Point, `tsconfig.lib.json` Build-Konfiguration.
- **README**: Eigene Package-README (`src/lib/README.md`) mit Installations-Anleitung, API-Dokumentation, Beispielen.
- **Integration-Tests**: Sicherstellen, dass das gebaute Package korrekt importiert und genutzt werden kann.
- **NPM_TOKEN**: Repository Secret vom Admin anfordern.
- **Versionsstrategie**: Semantic Versioning, CHANGELOG-basiert, manuelles Publish via workflow_dispatch.

### Neue Dateien

| Datei | Beschreibung |
|-------|-------------|
| `src/lib/README.md` | npm Package README mit API-Docs und Beispielen |
| `tests/integration/package.test.ts` | Integration Tests fuer das gebaute Package |

### Modifizierte Dateien

| Datei | Aenderung |
|-------|-----------|
| `package.json` | Version, files, exports, repository Felder finalisieren |
| `.github/workflows/publish.yml` | NPM_TOKEN Integration, Build-Validierung, Dry-Run Step |
| `src/lib/index.ts` | Exports vervollstaendigen (XML-Adapter, Resolution Service) |

### Abhaengigkeiten

- **Phase 7 idealerweise vorher**: XML-Adapter sollte im Package enthalten sein.
- **NPM_TOKEN vom Admin**: Repository Secret muss konfiguriert werden (blockierend fuer Publish, nicht fuer Vorbereitung).

### Risiken

| Risiko | Wahrscheinlichkeit | Auswirkung | Massnahme |
|--------|-------------------|------------|-----------|
| NPM_TOKEN verzoegert (Admin-Abhaengigkeit) | Mittel | Hoch | Fruehzeitig anfordern, Dry-Run ohne Token moeglich |
| Unvollstaendige Exports (fehlende Typen/Funktionen) | Niedrig | Mittel | Integration Tests, manuelle Import-Pruefung |
| Breaking Changes nach erstem Publish | Mittel | Hoch | Semantic Versioning, CHANGELOG, pre-release Versionen (0.x) |

### Aufwand

1 Sprint (DevOps + Tech Lead)

### Aufgabenverteilung

| Rolle | Aufgabe |
|-------|---------|
| Tech Lead | API Surface Review, Versionsstrategie, Export-Vollstaendigkeit |
| DevOps | publish.yml finalisieren, NPM_TOKEN Setup, Dry-Run testen |
| Frontend Dev | lib/index.ts Exports aktualisieren, README Beispiele |
| QA | Integration Tests, Package installierbar + importierbar verifizieren |

---

## Phase 9: Performance / Lazy Loading (2 Sprints)

### Ziel

Bundle optimieren und Ladezeiten bei grossen Dokumenten verbessern. Der NIST SP 800-53 Katalog enthaelt ~1100 Controls — bei dieser Groesse werden Rendering-Engpaesse spuerbar.

### Scope

- **Vite dynamic import()**: DocumentViewer-Routen lazy laden (Code Splitting pro Dokumenttyp).
- **Virtual Scrolling**: VirtualList-Komponente fuer lange Listen (Catalog Controls, SSP Implementations).
- **Bundle Analysis**: Vite-Plugin fuer Visualisierung, Chunk-Optimierung, Tree Shaking Audit.

### Neue Dateien

| Datei | Beschreibung |
|-------|-------------|
| `src/components/shared/virtual-list.tsx` | Generische VirtualList-Komponente |
| `tests/components/shared/virtual-list.test.tsx` | Unit Tests fuer VirtualList |

### Modifizierte Dateien

| Datei | Aenderung |
|-------|-----------|
| `src/components/document-viewer.tsx` | Lazy Import der View-Komponenten |
| `src/components/catalog/catalog-view.tsx` | VirtualList fuer Control-Listen |
| `vite.config.ts` | Chunk-Splitting Konfiguration, Bundle Analyzer |

### Trigger

Bundle > 50 KB (aktuell 38.36 KB, noch Spielraum). Phase 7+8 werden den Bundle voraussichtlich vergroessern.

### Herausforderungen

1. **VirtualList + Accordion**: Verschachtelte Accordions mit variablen Hoehen erschweren Virtual Scrolling erheblich.
2. **Keyboard Navigation mit dynamischem DOM**: Roving Tabindex und Screen Reader muessen auch bei virtualisierten Listen korrekt funktionieren.
3. **PWA Precache**: Dynamische Chunks muessen im Service Worker Precache beruecksichtigt werden.

### Abhaengigkeiten

- **Nach Phase 7+8**: Groesserer Bundle erwartet, Performance-Optimierung dann dringlicher.
- **ADR-005 Update**: Bestehende Performance-Strategie muss um Lazy Loading und Virtual Scrolling ergaenzt werden.

### Risiken

| Risiko | Wahrscheinlichkeit | Auswirkung | Massnahme |
|--------|-------------------|------------|-----------|
| a11y Bruch durch Virtual Scrolling | Hoch | Hoch | aria-setsize/aria-posinset, fruehes Screen Reader Testing |
| Initial Load Erhoehung durch Chunk-Overhead | Mittel | Mittel | Preloading kritischer Chunks, Chunk-Groesse Monitoring |

### Aufwand

2 Sprints (Frontend Dev + UI/UX + QA)

### Aufgabenverteilung

| Rolle | Aufgabe |
|-------|---------|
| Frontend Dev | VirtualList, Lazy Imports, Chunk-Konfiguration |
| UI/UX | Scroll-UX, Ladeindikator-Design, a11y Review |
| QA | Performance Tests (Lighthouse), a11y Tests mit virtuellen Listen |
| Tech Lead | ADR-005 Update, Code Review, Chunk-Strategie |
| DevOps | Bundle Analyzer CI, Chunk-Size Gates |

---

## Phase 10: Accessibility Re-Audit BITV 2.0 (1-2 Sprints)

### Ziel

Vollstaendiger BITV 2.0 / WCAG 2.1 AA Audit nach Abschluss aller Feature-Phasen. Seit dem letzten umfassenden Audit (Phase 2, Stakeholder-Feedback S3) sind erhebliche Funktionalitaeten hinzugekommen.

### Scope

- **axe-core fuer Phase 4-9 Komponenten**: ImportPanel, ResourcePanel, LinkBadge, ProseView, VirtualList, AR/POA&M Views.
- **Keyboard Navigation**: Alle neuen interaktiven Elemente (Cross-Doc Links, Import Resolution, Virtual Scroll) muessen vollstaendig per Tastatur bedienbar sein.
- **Screen Reader**: Manuelle Tests mit NVDA (Windows) und VoiceOver (macOS) fuer kritische Workflows.
- **Kontrast-Audit**: Alle neuen Farben (LinkBadge 5 Farben, AR/POA&M Status-Farben) gegen WCAG AA Kontrast-Ratio pruefen.

### Neue Dateien

| Datei | Beschreibung |
|-------|-------------|
| `docs/accessibility/BITV_AUDIT_REPORT.md` | Vollstaendiger BITV 2.0 Audit-Bericht |

### Modifizierte Dateien

| Datei | Aenderung |
|-------|-----------|
| `tests/accessibility.test.tsx` | Erweiterte axe-core Tests fuer neue Komponenten |
| `src/components/shared/import-panel.tsx` | a11y Fixes (aria-labels, Roles) |
| `src/components/shared/resource-panel.tsx` | a11y Fixes |
| `src/components/shared/link-badge.tsx` | aria-label Fix (QA Finding F1 aus Phase 4a) |
| `src/styles/base.css` | Kontrast-Korrekturen |

### Abhaengigkeiten

- **Nach Phase 9**: Audit der finalen UI (inklusive Virtual Scrolling).
- Kann parallel zu Phase 9 vorbereitet werden (Test-Spezifikation, Checkliste).

### Risiken

| Risiko | Wahrscheinlichkeit | Auswirkung | Massnahme |
|--------|-------------------|------------|-----------|
| Virtual Scrolling a11y (aria-setsize, dynamischer DOM) | Hoch | Hoch | Bekannte Patterns (WAI-ARIA Listbox), fruehes Testing in Phase 9 |
| Screen Reader Inkompatibilitaeten (NVDA vs. VoiceOver) | Mittel | Hoch | Beide Plattformen testen, pragmatische Kompromisse dokumentieren |

### Aufwand

1-2 Sprints (QA + UI/UX + Frontend Dev Fixes)

### Aufgabenverteilung

| Rolle | Aufgabe |
|-------|---------|
| QA | axe-core Tests, NVDA/VoiceOver manuelle Tests, Audit-Bericht |
| UI/UX | Kontrast-Audit, Farbkorrekturen, Fokus-Indikatoren |
| Frontend Dev | a11y Fixes (aria-*, Roles, Keyboard Handling) |
| Tech Lead | CODING_STANDARDS a11y-Update, Review |

---

## Abhaengigkeitsgraph

```
Phase 6 (done) --> Phase 7 (XML) --+--> Phase 8 (npm)
                                    |
                                    +--> Phase 9 (Perf) --> Phase 10 (a11y)
```

Phase 7 ist Voraussetzung fuer Phase 8 (XML im Package) und Phase 9 (Bundle waechst).
Phase 9 muss vor Phase 10 abgeschlossen sein (Audit der finalen UI).
Phase 8 und Phase 9 koennen parallel laufen, falls der XML-Adapter fertig ist.

---

## Session-Struktur (Parallele Agenten)

Jede Rolle arbeitet in einer eigenen Claude-Session. Sessions lesen ihr BRIEFING.md als Kontext.

| Session | Rolle | Einstiegspunkt | Primaere Aufgaben |
|---------|-------|----------------|-------------------|
| A | Tech Lead | `docs/team/tech-lead/BRIEFING.md` | ADR-010 Review, CODING_STANDARDS Updates, Code Review |
| B | Frontend Dev | `docs/team/frontend-developer/BRIEFING.md` | XML-Adapter, Lazy Loading, VirtualList, a11y Fixes |
| C | UI/UX Designer | `docs/team/ui-ux-designer/BRIEFING.md` | Scroll-UX, Kontrast-Audit, Fokus-Indikatoren |
| D | QA Engineer | `docs/team/qa-engineer/BRIEFING.md` | XML Fixtures, Performance Tests, BITV 2.0 Audit |
| E | DevOps | `docs/team/devops-engineer/BRIEFING.md` | npm Publish Pipeline, Bundle Analyzer, Chunk Gates |

### Session-Start Anweisung

Jede Session erhaelt folgenden Kontext:
```
Du bist [Rolle] im OSCAL Viewer Projekt. Lies dein Briefing in
docs/team/[rolle]/BRIEFING.md und arbeite die dort beschriebenen
Aufgaben ab. Die Architektur findest du in
docs/architecture/ARCHITECTURE.md und die ADRs in
docs/architecture/decisions/.
Aktueller Orchestrierungsplan: docs/team/architect/ORCHESTRATION.md v3.0
```

---

## Kommunikationsstruktur

### Ordnerstruktur
```
docs/team/
+-- architect/          <- Orchestrierung, Gesamtueberblick
|   +-- BRIEFING.md
|   +-- ORCHESTRATION.md (diese Datei)
+-- tech-lead/          <- Architektur, Code Standards
|   +-- BRIEFING.md
+-- ui-ux-designer/     <- Design, Accessibility
|   +-- BRIEFING.md
+-- frontend-developer/ <- Implementation, Parser, Renderer
|   +-- BRIEFING.md
+-- qa-engineer/        <- Testing, Qualitaet
|   +-- BRIEFING.md
+-- devops-engineer/    <- CI/CD, Deployment
    +-- BRIEFING.md
```

### Kommunikationsregeln

1. **Aufgaben**: Jede Rolle liest ihr BRIEFING.md und antwortet dort
2. **Ergebnisse**: Deliverables werden im jeweiligen Rollenordner abgelegt
3. **Abhaengigkeiten**: Blockierende Abhaengigkeiten werden im Kommunikationslog dokumentiert
4. **Entscheidungen**: ADRs werden in `docs/architecture/decisions/` abgelegt
5. **Issues**: GitHub Issues bleiben die zentrale Aufgabenverwaltung
6. **Code-Konventionen**: CODING_STANDARDS.md ist die verbindliche Referenz (aktuell v5.1.0)
7. **Phasenplan**: ORCHESTRATION.md (diese Datei) ist die verbindliche Planungsreferenz

### Eskalationspfad
```
Team Member -> Tech Lead -> Architect -> Gesamtprojekt (opengov)
```

---

## Definition of Done (pro Issue)

- [ ] Implementation abgeschlossen
- [ ] Unit Tests geschrieben (>= 80% Coverage)
- [ ] Alle OSCAL-Versionen getestet
- [ ] Accessibility Tests bestanden (axe-core, Keyboard Navigation)
- [ ] Code Review durch Tech Lead
- [ ] Dokumentation aktualisiert (CHANGELOG, CODING_STANDARDS falls noetig)
- [ ] CI/CD Pipeline gruen
- [ ] Bundle Size < 100 KB gzipped
- [ ] Keine offenen QA Findings mit Prioritaet HIGH
