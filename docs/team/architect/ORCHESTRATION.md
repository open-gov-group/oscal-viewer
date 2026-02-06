# Orchestrierungsplan - OSCAL Viewer

**Erstellt von**: Architect
**Datum**: 2026-02-06
**Version**: 1.0

---

## Projektstatus

| Aspekt | Status |
|--------|--------|
| Repository | https://github.com/open-gov-group/oscal-viewer |
| Deployment | https://open-gov-group.github.io/oscal-viewer/ |
| Tech Stack | Preact + TypeScript + Vite |
| Phase | Phase 1 - Foundation |
| Offene Issues | 10 (#1 - #10) |

---

## Phasenplan

### Phase 1: Foundation (KW 6-9) - AKTIV

**Ziel**: Parser und erster Renderer funktionsfaehig

```
Woche 6-7: Architektur + Parser
  - Tech Lead: Issue #1 (ADR finalisieren)
  - Frontend Dev: Issue #2 (OSCAL Parser)
  - QA Engineer: Test-Fixtures + Testdaten vorbereiten
  - UI/UX: Design-Konzept Catalog Viewer
  - DevOps: CI/CD haerten, Caching optimieren

Woche 8-9: Catalog Renderer
  - Frontend Dev: Issue #3 (Catalog Renderer)
  - UI/UX: Komponentenspezifikation liefern
  - QA: Parser-Tests reviewen, Accessibility Setup
  - Tech Lead: Code Reviews
  - DevOps: Bundle Size Monitoring
```

**Abhaengigkeiten Phase 1:**
```
#1 ADR ──────────┐
                  ├──> #2 Parser ──> #3 Catalog Renderer
UI/UX Konzept ───┘
```

### Phase 2: Erweiterung (KW 10-12)

**Ziel**: Alle Dokumenttypen darstellbar, Suchfunktion

```
Woche 10: Profile + Component-Def
  - Frontend Dev: Issue #4 (Profile Renderer)
  - Frontend Dev: Issue #5 (Component-Def Renderer)
  - QA: Integration Tests

Woche 11: SSP Renderer
  - Frontend Dev: Issue #6 (SSP Renderer)
  - UI/UX: SSP-spezifisches Design
  - QA: Cross-Browser Testing

Woche 12: Suche & Filter
  - Frontend Dev: Issue #7 (Suchfunktion)
  - QA: E2E Tests einrichten
```

**Abhaengigkeiten Phase 2:**
```
#2 Parser ──> #4 Profile Renderer
          ──> #5 Component-Def Renderer
          ──> #6 SSP Renderer
#3 + #4 + #5 + #6 ──> #7 Suchfunktion
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

## Aufgabenverteilung aktuell (KW 6)

| Rolle | Aufgabe | Issue | Prioritaet |
|-------|---------|-------|------------|
| **Tech Lead** | ADR finalisieren, Komponentendiagramm | #1 | CRITICAL |
| **Frontend Developer** | OSCAL Parser implementieren | #2 | CRITICAL |
| **UI/UX Designer** | Design-Konzept Catalog, Design System Basics | #3 (Vorbereitung) | HIGH |
| **QA Engineer** | Test-Fixtures, Testdaten, axe-core Setup | - | HIGH |
| **DevOps Engineer** | CI/CD Review, Caching, Bundle Monitoring | - | MEDIUM |
| **Architect** | Orchestrierung, Schnittstellendefinition | #1 (Unterstuetzung) | CRITICAL |

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

### Eskalationspfad
```
Team Member -> Tech Lead -> Architect -> Gesamtprojekt (opengov)
```

---

## Risiken

| Risiko | Wahrscheinlichkeit | Auswirkung | Massnahme |
|--------|-------------------|------------|-----------|
| OSCAL-Spezifikation komplex | Hoch | Mittel | Schrittweise Implementierung, Catalog zuerst |
| Performance bei grossen Dokumenten | Mittel | Hoch | Fruehes Performance-Testing, Virtual Scrolling |
| Accessibility-Compliance | Mittel | Hoch | Von Anfang an mitdenken, axe-core in CI |
| Bundle Size > 100KB | Niedrig | Mittel | Preact + Tree Shaking, Monitoring in CI |

---

## Definition of Done (pro Issue)

- [ ] Implementation abgeschlossen
- [ ] Unit Tests geschrieben (>= 80% Coverage)
- [ ] Alle OSCAL-Versionen getestet
- [ ] Accessibility Tests bestanden
- [ ] Code Review durch Tech Lead
- [ ] Dokumentation aktualisiert
- [ ] CI/CD Pipeline gruen

