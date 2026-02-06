# Onboarding Guide - OSCAL Viewer

**Version**: 1.0.0

---

## Willkommen im Viewer Team!

Dieser Guide hilft Dir, schnell produktiv zu werden.

---

## 1. Erster Tag

### 1.1 Zugänge einrichten

- [ ] GitHub Account mit Organisations-Zugang (open-gov-group)
- [ ] Repository Zugriff auf oscal-viewer
- [ ] Team-Mitgliedschaft in viewer-team

### 1.2 Entwicklungsumgebung

```bash
# Repository klonen
git clone https://github.com/open-gov-group/oscal-viewer.git
cd oscal-viewer

# Dependencies installieren
npm install

# Dev Server starten
npm run dev
```

### 1.3 IDE Setup

**Empfohlen**: VS Code mit Extensions:
- ESLint
- Prettier
- TypeScript

---

## 2. OSCAL verstehen

### 2.1 Was ist OSCAL?

OSCAL (Open Security Controls Assessment Language) ist ein standardisiertes Format zur Dokumentation von Sicherheitskontrollen.

### 2.2 Dokumenttypen

| Typ | Beschreibung | Beispiel |
|-----|--------------|----------|
| **Catalog** | Sammlung von Controls | NIST 800-53 |
| **Profile** | Auswahl von Controls aus Catalogs | FedRAMP Baseline |
| **Component Definition** | Implementierung von Controls | Cloud Service |
| **System Security Plan** | Vollständiges Sicherheitskonzept | System-Dokumentation |

### 2.3 Ressourcen

- [OSCAL Official Documentation](https://pages.nist.gov/OSCAL/)
- [OSCAL Schemas](https://github.com/usnistgov/OSCAL/tree/main/json/schema)
- Beispiel-Dateien: `/tests/fixtures/`

---

## 3. Codebase kennenlernen

### 3.1 Projekt-Struktur

```
oscal-viewer/
├── src/
│   ├── app.tsx          # Hauptanwendung
│   ├── main.tsx         # Entry Point
│   ├── components/      # UI-Komponenten
│   ├── services/        # Parser, Validators
│   ├── types/           # TypeScript-Typen
│   └── styles/          # CSS
├── tests/               # Tests
├── docs/                # Dokumentation
└── .github/workflows/   # CI/CD
```

### 3.2 Tech Stack

| Technology | Zweck |
|------------|-------|
| Preact | UI Framework (3KB) |
| TypeScript | Typsicherheit |
| Vite | Build Tool |
| Vitest | Testing |
| GitHub Pages | Hosting |

---

## 4. Erste Schritte

### 4.1 Issues finden

Suche Issues mit Label `good-first-issue`:
- [Good First Issues](https://github.com/open-gov-group/oscal-viewer/issues?q=label%3A%22good+first+issue%22)

### 4.2 Branch erstellen

```bash
git checkout -b feature/123-meine-aenderung
```

### 4.3 PR erstellen

1. Änderungen committen
2. Push zu GitHub
3. PR erstellen mit Beschreibung
4. Review abwarten

---

## 5. Testen

```bash
# Unit Tests
npm test

# Mit Coverage
npm test -- --coverage

# Watch Mode
npm test -- --watch
```

---

## 6. Deployment

Automatisch bei Push zu `main`:
- GitHub Actions baut die App
- Deployment zu GitHub Pages
- Live unter: https://open-gov-group.github.io/oscal-viewer/

---

## 7. Checkliste

### Tag 1
- [ ] Repository geklont
- [ ] Dev Server läuft
- [ ] OSCAL Grundlagen verstanden

### Woche 1
- [ ] Codebase erkundet
- [ ] Erstes Issue bearbeitet
- [ ] Tests geschrieben

### Woche 2
- [ ] PR gemerged
- [ ] Code Review gegeben
- [ ] Dokumentation gelesen

---

**Fragen?** Erstelle ein Issue mit Label `question` oder kontaktiere das Team!
