# Architect - Briefing & Kommunikation

**Rolle**: Architect (Orchestrierung)
**Projekt**: OSCAL Viewer
**Stand**: 2026-02-06

---

## Projektueberblick

Der OSCAL Viewer ist ein clientseitiger Viewer fuer OSCAL-Dokumente (Open Security Controls Assessment Language). Das Projekt nutzt Preact + TypeScript + Vite und wird auf GitHub Pages deployed.

## Aktuelle Prioritaeten

### Phase 1: Foundation (KW 6-9) - AKTIV
| Issue | Titel | Status | Zustaendig |
|-------|-------|--------|------------|
| #1 | Architektur-Design (ADR) | Offen - CRITICAL | Tech Lead + Architect |
| #2 | OSCAL Parser implementieren | Offen - CRITICAL | Frontend Developer |
| #3 | Catalog Renderer implementieren | Offen - CRITICAL | Frontend Developer + UI/UX |

### Phase 2: Erweiterung (KW 10-12)
| Issue | Titel | Prioritaet |
|-------|-------|------------|
| #4 | Profile Renderer | High |
| #5 | Component-Definition Renderer | High |
| #6 | SSP Renderer | High |
| #7 | Suchfunktion & Filter | Medium |

### Phase 3: Deploy (KW 13-14)
| Issue | Titel | Prioritaet |
|-------|-------|------------|
| #8 | PWA-Unterstuetzung (Offline) | Medium |
| #9 | Dokumentation vervollstaendigen | High |
| #10 | Shared Components als npm Package | Medium |

## Architektur-Entscheidungen

- **Zero-Backend**: Alles laeuft clientseitig, keine Daten verlassen den Browser
- **Preact statt React**: 3KB vs 40KB+ Bundle Size
- **Vite**: Schnelles HMR, optimierte Builds
- **TypeScript strict**: Typsicherheit fuer OSCAL-Strukturen

## Naechste Schritte (Architect)

1. Issue #1 abschliessen - ADR finalisieren mit Tech Lead
2. Komponentenarchitektur fuer Parser definieren
3. Schnittstellen zwischen Parser und Renderer spezifizieren
4. Aufgabenverteilung an Teammitglieder koordinieren

---

## Kommunikationslog

| Datum | Von | An | Thema | Status |
|-------|-----|-----|-------|--------|
| 2026-02-06 | Architect | Alle | Projektstart & Briefing | Erstellt |
| 2026-02-07 | QA Engineer | Architect | Code-Kommentierungs-Audit abgeschlossen: Note C- (2.6% Quote). Parser A, Types B, Hooks D, Components D. 4 Empfehlungen: E1 CODING_STANDARDS Sektion 11 (Tech Lead), E2 Code nachkommentieren (Frontend Dev), E3 PR-Template Checkbox (Tech Lead), E4 ESLint-Plugin evaluieren (Tech Lead). Geschaetzter Gesamtaufwand ~11h. Details: `docs/team/qa-engineer/BRIEFING.md` Abschnitt "Code-Kommentierungs-Audit" | Abgeschlossen |
| 2026-02-08 | QA Engineer | Architect | Re-Audit: Note C+ (5.9%, vorher C- 2.6%). E1+E3 (Tech Lead) ERLEDIGT, E2 Prio 1+3 (Frontend Dev) ERLEDIGT. **Verbleibend**: profile-view.tsx + component-def-view.tsx (je 0%, 599 LOC) — letzter Blocker fuer >= 8% Ziel | Abgeschlossen |

