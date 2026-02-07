# Contributing to OSCAL Viewer

Thank you for your interest in contributing to the OSCAL Viewer!

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
git clone https://github.com/open-gov-group/oscal-viewer.git
cd oscal-viewer
npm install
npm run dev
```

### Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | TypeScript check + production build |
| `npm test` | Run tests in watch mode |
| `npx vitest run` | Run tests once |
| `npx vitest run --coverage` | Run tests with coverage report |
| `npm run lint` | Run ESLint |
| `npm run build:lib` | Build npm package (parser/types only) |

## Architecture

The project follows a three-layer architecture (see [ADR-003](docs/architecture/decisions/ADR_003_component_architecture.md)):

```
Domain (types/, parser/)  ->  Application (hooks/)  ->  Presentation (components/)
```

**Import rules** (enforced by ESLint):
- `types/` — only external packages
- `parser/` — `types/` and external packages
- `hooks/` — `types/`, `parser/`, and external packages
- `components/` — all layers

Further reading:
- [ARCHITECTURE.md](docs/ARCHITECTURE.md) — System architecture overview
- [Architecture Decision Records](docs/architecture/decisions/README.md) — ADR-001 to ADR-007
- [Coding Standards](docs/CODING_STANDARDS.md) — Patterns and conventions (v4.0.0)

## How to Add a New OSCAL Renderer

Detailed patterns are documented in [CODING_STANDARDS.md](docs/CODING_STANDARDS.md), Section 2. Here is the short version:

### 1. Define types in `src/types/oscal.ts`

Add TypeScript interfaces for the new OSCAL document type following the OSCAL JSON Schema specification.

### 2. Create a parser in `src/parser/`

```ts
// src/parser/my-type.ts
import type { ParseResult, MyType } from '@/types/oscal'

export function parseMyType(raw: unknown): ParseResult<MyType> {
  // Validate and transform the raw JSON
}
```

Re-export in `src/parser/index.ts`.

### 3. Create the view component

```
src/components/my-type/
├── my-type-view.tsx       # Main component
└── sub-component.tsx      # Specialized child components
```

Each view component receives the parsed, typed document as a prop:

```tsx
import type { FunctionComponent } from 'preact'
import type { MyType } from '@/types/oscal'
import { MetadataPanel } from '@/components/shared/metadata-panel'

interface MyTypeViewProps {
  myType: MyType
}

export const MyTypeView: FunctionComponent<MyTypeViewProps> = ({ myType }) => {
  return (
    <div class="my-type-view">
      <MetadataPanel metadata={myType.metadata} />
      {/* Use shared components: Accordion, PropertyBadge, StatusBadge, FilterBar, etc. */}
    </div>
  )
}
```

### 4. Register in DocumentViewer

Add a `case` in `src/components/document-viewer.tsx` to route the new type to your view.

### 5. Integrate hooks

- `useDeepLink('my-type')` for URL hash navigation
- `useFilter()` + `FilterBar` for filtering (if applicable)
- `useMemo` for expensive computations (required by ADR-005)

### 6. Write tests

- Parser tests in `tests/parser.test.ts` or a dedicated file
- Component tests in `tests/components/my-type-view.test.tsx`
- Accessibility test in `tests/accessibility.test.tsx` using axe-core
- Target: >= 80% coverage for new files

### 7. Add styles

CSS in `src/styles/base.css` with component prefix (e.g. `.my-type-*`). Use CSS variables only — no hardcoded colors.

See [CODING_STANDARDS.md, Section 2.4](docs/CODING_STANDARDS.md) for the full renderer checklist.

## Code Conventions

- **Language**: Code in English, documentation in German (where applicable)
- **Types**: No `any` — use typed interfaces from `src/types/oscal.ts`
- **Components**: Preact `FunctionComponent` with explicit Props interface
- **Hooks**: Custom hooks in `src/hooks/` for application logic
- **CSS**: CSS custom properties (design tokens) in `src/styles/base.css` — no hardcoded colors
- **Tests**: Vitest with `globals: true` — no explicit vitest imports needed
- **Accessibility**: BITV 2.0 / WCAG 2.1 AA compliance required (see [CODING_STANDARDS.md, Section 8](docs/CODING_STANDARDS.md))

## Pull Request Process

1. Create a feature branch: `feature/<issue-nr>-<description>` (e.g. `feature/11-assessment-plan`)
2. Write commits: `<type>: <description>` (e.g. `feat: implement assessment plan renderer`)
   - Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`
3. Ensure all checks pass:
   - `npm run lint` — ESLint clean
   - `npx tsc --noEmit` — TypeScript clean
   - `npx vitest run` — All tests pass
   - Coverage >= 80% for new files
4. Submit a Pull Request using the [PR template](.github/pull_request_template.md)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
