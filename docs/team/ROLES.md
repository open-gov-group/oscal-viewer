# Rollen und Verantwortlichkeiten - OSCAL Viewer Team

**Version**: 1.0.0

---

## 1. Tech Lead

### Verantwortlichkeiten

- Technische Architektur-Entscheidungen treffen und dokumentieren
- Code-Qualität sicherstellen durch Reviews und Standards
- Team technisch mentoren und weiterentwickeln
- OSCAL-Spezifikation verstehen und korrekte Implementierung sicherstellen
- Schnittstelle zur Gesamtprojekt-Architektur

### Erwartete Skills

| Skill | Level | Beschreibung |
|-------|-------|--------------|
| System Design | Expert | Client-Side Architekturen entwerfen |
| TypeScript | Expert | Tiefes Verständnis der Sprache |
| OSCAL | Fortgeschritten | Alle Dokumenttypen verstehen |
| Code Review | Expert | Konstruktives, lehrreiches Feedback |

### Zeitaufteilung

```
Code Review & Mentoring:  40%
Architektur & Design:     30%
Entwicklung:              20%
Meetings & Koordination:  10%
```

---

## 2. UI/UX Designer

### Verantwortlichkeiten

- Intuitive Darstellung komplexer OSCAL-Strukturen
- Navigation in hierarchischen Dokumenten (Controls, Groups)
- Design System aufbauen und pflegen
- Accessibility (WCAG 2.1 AA) sicherstellen
- Responsive Design für alle Bildschirmgrößen

### Erwartete Skills

| Skill | Level | Beschreibung |
|-------|-------|--------------|
| Figma | Expert | Komponenten, Prototyping |
| Information Architecture | Fortgeschritten | Komplexe Daten visualisieren |
| WCAG/Accessibility | Fortgeschritten | Barrierefreies Design |
| HTML/CSS | Mittel | Design-Implementierung verstehen |

### Deliverables

- Figma Design Files (Komponenten, Screens)
- Design System Dokumentation
- Accessibility Audit Reports
- User Flow Diagramme für OSCAL-Navigation

---

## 3. Frontend Developer

### Verantwortlichkeiten

- OSCAL-Parser für alle Dokumenttypen implementieren
- UI-Komponenten nach Design umsetzen
- Performance optimieren (große OSCAL-Dokumente)
- Unit und Integration Tests schreiben
- Accessibility in Code umsetzen

### Erwartete Skills

| Skill | Level | Beschreibung |
|-------|-------|--------------|
| TypeScript | Fortgeschritten | Typsicherer Code |
| Preact | Fortgeschritten | Komponenten, Hooks, State |
| OSCAL | Mittel | JSON/XML Strukturen verstehen |
| Testing | Fortgeschritten | Vitest, Testing Library |
| Performance | Mittel | Große Datenmengen effizient rendern |

### Code-Qualität

- Alle OSCAL-Typen mit TypeScript modelliert
- Unit Tests für Parser (min. 80% Coverage)
- Accessibility Tests (axe-core)
- Keine ESLint Errors

---

## 4. QA Engineer

### Verantwortlichkeiten

- Test-Strategie für OSCAL-Validierung definieren
- Automatisierte Tests für alle OSCAL-Versionen
- Cross-Browser Testing
- Accessibility-Compliance prüfen
- Performance-Benchmarks definieren

### Erwartete Skills

| Skill | Level | Beschreibung |
|-------|-------|--------------|
| Test Automation | Fortgeschritten | Vitest, Playwright |
| OSCAL | Mittel | Testdaten in verschiedenen Formaten |
| Accessibility Testing | Fortgeschritten | axe-core, Screen Reader |
| Performance Testing | Mittel | Lighthouse, Bundle Analysis |

### Test-Fokus

```
Unit Tests:           Parser, Validators, Utils
Integration Tests:    Komponenten-Zusammenspiel
E2E Tests:            Kritische User Journeys
Accessibility Tests:  WCAG 2.1 AA Compliance
Performance Tests:    Große OSCAL-Dokumente (1000+ Controls)
```

---

## 5. DevOps Engineer

### Verantwortlichkeiten

- GitHub Actions CI/CD Pipelines
- GitHub Pages Deployment
- Build-Optimierung (Bundle Size)
- Security Headers konfigurieren

### Erwartete Skills

| Skill | Level | Beschreibung |
|-------|-------|--------------|
| GitHub Actions | Fortgeschritten | Workflows, Caching |
| Vite | Mittel | Build-Konfiguration |
| Security | Mittel | CSP, HTTPS, Headers |
| Performance | Mittel | Caching, CDN |

### Verantwortliche Systeme

- GitHub Actions Workflows
- GitHub Pages Deployment
- Bundle Size Monitoring
- Dependency Updates (Dependabot)

---

## 6. RACI-Matrix

| Aufgabe | Tech Lead | UI/UX | Frontend | QA | DevOps |
|---------|-----------|-------|----------|-----|--------|
| OSCAL-Parser | A | - | R | C | - |
| UI-Komponenten | C | A | R | C | - |
| Testing | C | - | R | A | C |
| Accessibility | C | A | R | R | - |
| CI/CD | C | - | C | C | A/R |
| Deployment | A | - | - | C | R |

**R** = Responsible (führt aus), **A** = Accountable (verantwortlich), **C** = Consulted, **I** = Informed

---

## 7. Skill-Matrix Template

| Skill | [Name 1] | [Name 2] | [Name 3] |
|-------|----------|----------|----------|
| TypeScript | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| Preact | ⭐⭐⭐ | ⭐ | ⭐⭐ |
| OSCAL | ⭐⭐ | ⭐ | ⭐⭐⭐ |
| Testing | ⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| Accessibility | ⭐ | ⭐⭐⭐ | ⭐⭐ |

**Legende**: ⭐ = Grundlagen, ⭐⭐ = Fortgeschritten, ⭐⭐⭐ = Expert

---

**Letzte Aktualisierung**: 2024
