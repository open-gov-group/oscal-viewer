# Technology Stack - OSCAL Viewer

**Version**: 1.0.0

---

## 1. Core Technologies

### 1.1 Preact (10.x)

**Warum Preact?**
- 3KB (gzip) statt React's 40KB+
- 100% React-kompatible API
- Ideal für Client-Only Apps
- Schnellere Runtime

```typescript
import { h } from 'preact'
import { useState } from 'preact/hooks'

function ControlViewer({ control }: Props) {
  const [expanded, setExpanded] = useState(false)
  return (
    <article class="control">
      <h2>{control.title}</h2>
      {/* ... */}
    </article>
  )
}
```

### 1.2 TypeScript (5.x)

**Warum TypeScript?**
- OSCAL hat komplexe Strukturen - Typsicherheit kritisch
- Bessere IDE-Unterstützung
- Self-documenting Code

```typescript
interface Control {
  id: string
  title: string
  params?: Parameter[]
  parts?: Part[]
  props?: Property[]
}
```

### 1.3 Vite (5.x)

**Warum Vite?**
- Extrem schnelle Dev-Server-Starts
- Hot Module Replacement
- Optimierte Production Builds
- Native TypeScript-Unterstützung

---

## 2. Styling

### 2.1 CSS Custom Properties

Keine zusätzlichen Dependencies, native Browser-Features:

```css
:root {
  /* Colors */
  --color-primary: #0066cc;
  --color-background: #ffffff;
  --color-text: #333333;

  /* OSCAL-specific */
  --color-control: #e3f2fd;
  --color-group: #f5f5f5;
  --color-parameter: #fff3e0;
}

[data-theme="dark"] {
  --color-background: #1a1a1a;
  --color-text: #f0f0f0;
}
```

---

## 3. Testing

### 3.1 Vitest

```typescript
import { describe, it, expect } from 'vitest'

describe('OSCAL Parser', () => {
  it('should detect catalog document type', () => {
    const json = { catalog: { uuid: '123' } }
    expect(detectDocumentType(json)).toBe('catalog')
  })

  it('should parse OSCAL 1.0.x catalogs', () => {
    const catalog = parseCatalog(oscal10xSample)
    expect(catalog.controls).toHaveLength(5)
  })

  it('should parse OSCAL 1.1.2 catalogs', () => {
    const catalog = parseCatalog(oscal112Sample)
    expect(catalog.controls).toHaveLength(5)
  })
})
```

### 3.2 Test Coverage Goals

| Area | Target |
|------|--------|
| Parsers | 90%+ |
| Utils | 80%+ |
| Components | 70%+ |

---

## 4. Build & Deploy

### 4.1 GitHub Actions

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm test -- --run
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/deploy-pages@v4
```

### 4.2 Build Output

```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js     # ~50KB gzip
│   └── index-[hash].css    # ~5KB gzip
└── favicon.ico
```

---

## 5. Browser Support

| Browser | Version |
|---------|---------|
| Chrome | Last 2 versions |
| Firefox | Last 2 versions |
| Safari | Last 2 versions |
| Edge | Last 2 versions |

**Erforderliche Features:**
- ES Modules
- File API
- Drag & Drop API
- CSS Custom Properties
- CSS Grid

---

## 6. Dependencies

### 6.1 Production

| Package | Version | Purpose |
|---------|---------|---------|
| preact | 10.x | UI Framework |

### 6.2 Development

| Package | Version | Purpose |
|---------|---------|---------|
| typescript | 5.x | Type Safety |
| vite | 5.x | Build Tool |
| vitest | 1.x | Testing |
| @preact/preset-vite | - | Vite Integration |

### 6.3 Nicht verwendet (bewusst)

| Package | Reason |
|---------|--------|
| axios | fetch reicht |
| lodash | Native Methods |
| moment | Date-fns oder native |
| styled-components | CSS reicht |

---

## 7. Performance Budget

| Metric | Target |
|--------|--------|
| Bundle Size (gzip) | < 100KB |
| First Contentful Paint | < 1.5s |
| Time to Interactive | < 2s |
| Lighthouse Score | > 90 |

---

## 8. Future Considerations

### 8.1 Potential Additions

| Feature | Technology | When |
|---------|------------|------|
| Offline Support | Service Worker | Phase 3 |
| State Management | Preact Signals | If needed |
| XML Support | Native DOMParser | Phase 2 |
| PWA | Workbox | Phase 3 |

---

**Letzte Aktualisierung**: 2024
