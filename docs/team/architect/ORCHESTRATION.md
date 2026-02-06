# Orchestrierungsplan - OSCAL Viewer

**Erstellt von**: Architect
**Datum**: 2026-02-06
**Version**: 2.0 (Phase 2 Aktivierung)

---

## Projektstatus

| Aspekt | Status |
|--------|--------|
| Repository | https://github.com/open-gov-group/oscal-viewer |
| Deployment | https://open-gov-group.github.io/oscal-viewer/ |
| Tech Stack | Preact + TypeScript + Vite |
| Phase | **Phase 2 - Erweiterung** |
| Phase 1 | ABGESCHLOSSEN |
| Bundle Size | 12.54 KB gzipped (Budget: < 100KB) |
| Tests | 43 bestanden, 94.78% Statement Coverage |
| Offene Issues | 7 (#4 - #10) |

---

## Phase 1 - Zusammenfassung (ABGESCHLOSSEN)

| Issue | Titel | Status | Ergebnis |
|-------|-------|--------|----------|
| #1 | Architecture Design (ADR) | ERLEDIGT | ADR-001 bis ADR-004 finalisiert, ARCHITECTURE.md v1.1.0 |
| #2 | OSCAL Parser | ERLEDIGT | 4 Parser (Catalog, Profile, CompDef, SSP), 43 Tests, 94.78% Coverage |
| #3 | Catalog Renderer | ERLEDIGT | Hierarchische Navigation, Control-Detail, Metadata-Panel, Property-Badges |

### Phase 1 Deliverables
- Dreischichtige Architektur implementiert (Domain/Application/Presentation)
- Vollstaendige TypeScript-Typen fuer alle OSCAL-Dokumenttypen
- ParseResult<T> Pattern als einheitliches Fehlerbehandlungs-Muster
- Catalog-Viewer mit Sidebar-Navigation, Control-Detail-Ansicht
- Shared Components: MetadataPanel, PropertyBadge, DocumentViewer
- Responsive CSS mit Print-Styles
- Bundle: 12.54 KB gzipped (87% unter Budget)

---

## Phasenplan

### Phase 1: Foundation (KW 6-9) - ABGESCHLOSSEN

### Phase 2: Erweiterung (KW 10-12) - AKTIV

**Ziel**: Alle Dokumenttypen darstellbar, Suchfunktion

```
Woche 10: Profile + Component-Definition Renderer
  - Frontend Dev: Issue #4 (Profile Renderer)
  - Frontend Dev: Issue #5 (Component-Def Renderer)
  - UI/UX: Design-Spezifikation Profile + CompDef
  - QA: Test-Fixtures mit echten OSCAL-Dateien
  - Tech Lead: Code Review, Layer-Regeln durchsetzen
  - DevOps: Bundle Size CI-Gate, Dependabot

Woche 11: SSP Renderer
  - Frontend Dev: Issue #6 (SSP Renderer)
  - UI/UX: SSP-spezifisches Design (komplexeste Ansicht)
  - QA: Cross-Browser Testing starten
  - Tech Lead: Performance-Review grosse Dokumente

Woche 12: Suche & Filter
  - Frontend Dev: Issue #7 (Suchfunktion)
  - UI/UX: Such-UI Design, Filter-Panel
  - QA: E2E Tests einrichten, Accessibility-Audit
  - DevOps: Preview Deployments fuer PRs
```

**Abhaengigkeiten Phase 2:**
```
Parser (fertig) ──> #4 Profile Renderer
                ──> #5 Component-Def Renderer
                ──> #6 SSP Renderer
#3 + #4 + #5 + #6 ──> #7 Suchfunktion

Shared Components (fertig) ──> alle Renderer koennen MetadataPanel,
                               PropertyBadge, DocumentViewer nutzen
```

### Phase 3: Deploy & Polish (KW 13-14)

**Ziel**: Produktionsreif, dokumentiert, offline-faehig

```
Woche 13-14:
  - DevOps: Issue #8 (PWA)
  - Alle: Issue #9 (Dokumentation)
  - Tech Lead: Issue #10 (npm Package)
  - QA: Full Accessibility Audit + Performance Tests
```

---

## Aufgabenverteilung Phase 2 (KW 10-12)

| Rolle | Aufgabe | Issue | Prioritaet |
|-------|---------|-------|------------|
| **Tech Lead** | Code Reviews, ESLint Layer-Regeln, TypeScript Patterns | - | HIGH |
| **Frontend Developer** | Profile, CompDef, SSP Renderer + Suchfunktion | #4, #5, #6, #7 | CRITICAL |
| **UI/UX Designer** | Design-Spezifikation alle Renderer, Design System ausbau | #4-#7 Unterstuetzung | HIGH |
| **QA Engineer** | Echte OSCAL-Fixtures, Integration Tests, axe-core, Cross-Browser | - | HIGH |
| **DevOps Engineer** | Bundle Size CI-Gate, Dependabot, Preview Deployments | - | MEDIUM |
| **Architect** | Orchestrierung, Phase-Tracking, Schnittstellendefinition | - | HIGH |

---

## Session-Struktur (Parallele Agenten)

Jede Rolle arbeitet in einer eigenen Claude-Session. Sessions lesen ihr BRIEFING.md als Kontext.

| Session | Rolle | Einstiegspunkt | Primaere Aufgaben |
|---------|-------|----------------|-------------------|
| A | Tech Lead | `docs/team/tech-lead/BRIEFING.md` | ADR Review, ESLint Regeln, PR-Prozess, Code Review |
| B | Frontend Dev | `docs/team/frontend-developer/BRIEFING.md` | Issues #4-#7: Renderer + Suche |
| C | UI/UX Designer | `docs/team/ui-ux-designer/BRIEFING.md` | Design System, Komponentenspezifikation |
| D | QA Engineer | `docs/team/qa-engineer/BRIEFING.md` | Test-Fixtures, axe-core, E2E Setup |
| E | DevOps | `docs/team/devops-engineer/BRIEFING.md` | CI Gates, Dependabot, Caching |

### Session-Start Anweisung
Jede Session erhaelt folgenden Kontext:
```
Du bist [Rolle] im OSCAL Viewer Projekt. Lies dein Briefing in
docs/team/[rolle]/BRIEFING.md und arbeite die dort beschriebenen
Phase 2 Aufgaben ab. Die Architektur findest du in
docs/architecture/ARCHITECTURE.md und die ADRs in
docs/architecture/decisions/.
```

---

## Kommunikationsstruktur

### Ordnerstruktur
```
docs/team/
├── architect/          <- Orchestrierung, Gesamtueberblick
│   ├── BRIEFING.md
│   └── ORCHESTRATION.md (diese Datei)
├── tech-lead/          <- Architektur, Code Standards
│   └── BRIEFING.md
├── ui-ux-designer/     <- Design, Accessibility
│   └── BRIEFING.md
├── frontend-developer/ <- Implementation, Parser, Renderer
│   └── BRIEFING.md
├── qa-engineer/        <- Testing, Qualitaet
│   └── BRIEFING.md
└── devops-engineer/    <- CI/CD, Deployment
    └── BRIEFING.md
```

### Kommunikationsregeln

1. **Aufgaben**: Jede Rolle liest ihr BRIEFING.md und antwortet dort
2. **Ergebnisse**: Deliverables werden im jeweiligen Rollenordner abgelegt
3. **Abhaengigkeiten**: Blockierende Abhaengigkeiten werden im Kommunikationslog dokumentiert
4. **Entscheidungen**: ADRs werden in `docs/architecture/decisions/` abgelegt
5. **Issues**: GitHub Issues bleiben die zentrale Aufgabenverwaltung
6. **Code-Konventionen**: Bestehende Patterns aus Phase 1 fortfuehren (siehe ADR-003)

### Eskalationspfad
```
Team Member -> Tech Lead -> Architect -> Gesamtprojekt (opengov)
```

---

## Risiken Phase 2

| Risiko | Wahrscheinlichkeit | Auswirkung | Massnahme |
|--------|-------------------|------------|-----------|
| SSP-Renderer sehr komplex (viele Sektionen) | Hoch | Mittel | Schrittweise, wichtigste Sektionen zuerst |
| Performance bei grossen Dokumenten | Mittel | Hoch | Virtual Scrolling evaluieren, Lazy Loading |
| Suchfunktion ueber alle Dokumenttypen | Mittel | Mittel | Generisches Interface, pro-Typ Indexierung |
| Accessibility-Compliance neue Renderer | Mittel | Hoch | axe-core in CI, fruehes Testing |
| Bundle Size waechst mit Renderern | Niedrig | Mittel | Code Splitting evaluieren, Tree Shaking pruefen |

---

## Definition of Done (pro Issue)

- [ ] Implementation abgeschlossen
- [ ] Unit Tests geschrieben (>= 80% Coverage)
- [ ] Alle OSCAL-Versionen getestet
- [ ] Accessibility Tests bestanden
- [ ] Code Review durch Tech Lead
- [ ] Dokumentation aktualisiert
- [ ] CI/CD Pipeline gruen
- [ ] Bundle Size < 100KB gzipped
