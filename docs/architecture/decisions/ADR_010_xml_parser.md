# ADR-010: XML Parser Support

**Status**: Accepted
**Datum**: 2026-02-10
**Phase**: Phase 7 — XML Parser

---

## Kontext

OSCAL unterstuetzt offiziell drei Formate: JSON, XML und YAML. Der Viewer verarbeitet bisher ausschliesslich JSON (Phase 1-6). Viele Organisationen — darunter NIST (SP 800-53 rev5) und BSI — veroeffentlichen OSCAL-Inhalte primaer im XML-Format. Um diese direkt laden zu koennen, wird nativer XML-Support benoetigt.

Randbedingungen:
- Zero-Backend-Prinzip (ADR-002): Verarbeitung muss vollstaendig clientseitig erfolgen
- Bundle-Budget: < 100 KB gzipped (aktuell 38.68 KB)
- Dreischicht-Architektur (ADR-003): Parser gehoert zum Domain Layer

## Entscheidung

**Wir fuehren einen XML-Adapter im Domain Layer ein (`src/parser/xml-adapter.ts`), der XML mittels Browser-nativer DOMParser API in ein JSON-aequivalentes Objekt konvertiert und bestehende Parser wiederverwendet.**

### 1. Adapter-Architektur

```
XML Text → DOMParser → DOM-Baum → elementToJson() → JSON-Objekt → parseOscalDocument()
```

Der Adapter erzeugt ein Plain-JavaScript-Objekt, das strukturell identisch mit dem JSON-Format ist. Alle 6 bestehenden Parser (Catalog, Profile, CompDef, SSP, AR, POA&M) werden automatisch unterstuetzt.

### 2. Array Detection: Hybrid-Ansatz

**Problem**: In JSON sind Arrays explizit (`[]`). In XML muessen gleichnamige Geschwister-Elemente als Arrays erkannt werden — aber auch ein einzelnes `<control>` muss ein Array `[Control]` ergeben.

**Loesung**: Kombination aus Whitelist und Heuristik:

1. **Whitelist** (~50 bekannte Felder): controls, groups, params, parts, props, links, imports, etc. → immer Array, auch bei einzelnem Kind-Element
2. **Heuristik**: Mehrere Geschwister mit gleichem localName → Array
3. **Default**: Einzelnes Kind, nicht in Whitelist → Objekt

### 3. Prose/XHTML-Handling

**Problem**: OSCAL-Prosa-Felder enthalten XHTML-Markup (`<p>`, `<ul>`, `<strong>`, `<a>`, `<insert>`).

**Loesung**: Feld-Whitelist (`prose`, `description`, `remarks`) + `innerHTML`-Serialisierung:
- Whitelisted Felder: Inner HTML als String extrahieren
- `<insert>` Elemente: `<insert type="param" id-ref="id"/>` → `{{ insert: param, id }}`
- XML-Namespace-Deklarationen entfernen

### 4. Neuer Entry-Point

```typescript
parseOscalText(text: string): ParseResult<OscalDocument>
```

Erkennt automatisch JSON vs. XML (erstes non-whitespace Zeichen: `<` = XML, `{`/`[` = JSON) und routet entsprechend. Bestehende `parseOscalDocument(json)` bleibt unveraendert (Abwaertskompatibilitaet).

## Begruendung

### Warum DOMParser statt externer Library?

Browser-native API, zero Bundle-Impact fuer die Engine, ES5-kompatibel, in allen modernen Browsern verfuegbar. Externe Libraries (xml2js, fast-xml-parser) wuerden 20-50 KB zum Bundle hinzufuegen.

### Warum Whitelist statt reiner Heuristik?

Reine Heuristik versagt bei einzelnen Elementen in Array-Feldern. Ein Catalog mit nur einem Control (`<control>`) muss `controls: [Control]` ergeben, nicht `controls: Control`. Die OSCAL-Spezifikation definiert klar, welche Felder Arrays sind.

### Warum XML → JSON → bestehende Parser?

Maximale Wiederverwendung: 414 LOC bestehender Parser-Code, 6 Dokumenttypen, alle Validierungen. Separate XML-Parser pro Typ wuerden ~1200 LOC Duplikation bedeuten.

## Alternativen

### Alternative 1: Externe XML-Parser-Library (xml2js, fast-xml-parser)
- **Pro**: Battle-tested, umfangreiche Features
- **Contra**: 20-50 KB Bundle-Impact, neue Dependency
- **Abgelehnt weil**: Verletzt Bundle-Budget-Philosophie, DOMParser ist ausreichend

### Alternative 2: Separate XML-Parser pro Dokumenttyp
- **Pro**: Exakte Kontrolle ueber XML-Struktur
- **Contra**: 6x Duplikation (~1200 LOC), hoher Wartungsaufwand
- **Abgelehnt weil**: Unverhaltensmaessiger Aufwand gegenueber Adapter-Ansatz

### Alternative 3: Server-seitige XML→JSON Konversion
- **Pro**: Zuverlaessigste Loesung
- **Contra**: Verletzt Zero-Backend-Prinzip (ADR-002)
- **Abgelehnt weil**: Architekturbruch

## Konsequenzen

- Neue Datei: `src/parser/xml-adapter.ts` (~200 LOC)
- Modifizierte Dateien: `detect.ts` (+15 LOC), `index.ts` (+25 LOC), `app.tsx` (~10 LOC), `lib/index.ts` (+1 LOC)
- Bundle-Impact: ~1.7 KB gzipped (38.68 → ~40.4 KB)
- Neue Tests: ~46 (xml-adapter, detectFormat, parseOscalText, XML-Fixtures)
- Wartung: Array-Whitelist muss bei neuen OSCAL-Versionen geprueft werden
- OSCAL XML-Namespace `xmlns="http://csrc.nist.gov/ns/oscal/1.0"` wird via `localName` ignoriert
