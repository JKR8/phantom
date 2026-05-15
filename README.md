# Phantom

## Current Direction

Phantom is an analytics-native design toolkit for consultants, report builders, and product teams.

It turns client reporting workshops into build-ready analytical specs. Teams can start in Figma for visual design, import or link that design into Phantom, then use Phantom for the analytics workflow: metrics, dimensions, filters, drill-throughs, data contracts, readiness checks, and React or Power BI handoff.

Phantom also works without Figma. Use its sensible analytical defaults, templates, visual kit, and mock data to move quickly from workshop to implementation spec.

Current product direction:

- **React Product Mode** for polished custom analytical React apps.
- **Power BI Mode** for constrained Power BI-safe mockups and implementation guidance.
- **Figma-led workflow** when design starts in Figma and Phantom adds analytical behavior and handoff.
- **Phantom-led workflow** when speed and sensible analytical defaults matter more than bespoke visual design.
- **Agent-ready exports** through Phantom Spec JSON, readiness reports, data contracts, handoff summaries, and CLI commands.

## Legacy Snapshot

**Micro-BI prototyping tool — "Looks like Power BI, works like magic."**

Phantom generates interactive Power BI-style dashboards with realistic fake data, cross-highlighting, and one-click export to real PBIP projects. Pick one of 7 industry scenarios, drag 20+ visual types onto a 24-column grid, shape with 12 color palettes and 9 templates, then export a working Power BI project with star schema, DAX measures, and positioned visuals — all from the browser.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│  SCENARIOS             DATA ENGINE              ZUSTAND STORE           │
│                                                                         │
│  Retail ──┐       ┌─────────────────────┐    ┌───────────────────────┐  │
│  SaaS ────┤       │  dataGenerator.ts    │    │  useStore.ts          │  │
│  HR ──────┤       │  distributions.ts    │    │                       │  │
│  Logistics┼──────►│  seasonality.ts      ├───►│  data[] + filters     │  │
│  Finance ─┤       │                      │    │  highlight state      │  │
│  Social ──┤       │  Star schema with    │    │  dashboard items[]    │  │
│  Portfolio┘       │  Pareto, log-normal, │    │  theme palette        │  │
│                   │  seasonal patterns   │    └───────────┬───────────┘  │
│                   └─────────────────────┘                │              │
│                                                          │              │
│                  ┌───────────────────────────────────────┘              │
│                  │                                                      │
│                  ▼                                                      │
│  ┌───────────────────────────┐      ┌────────────────────────────────┐  │
│  │  INTERACTIVE UI            │      │  EXPORT PIPELINE               │  │
│  │                           │      │                                │  │
│  │  AppShell + Canvas        │      │  schemaGenerator.ts            │  │
│  │  24-col grid, drag/resize │      │  daxGenerator.ts               │  │
│  │  20+ visual types         │      │  layoutConverter.ts            │  │
│  │  12 palettes, 9 templates │      │  pbipWriter.ts                 │  │
│  │                           │      │                                │  │
│  │  Click chart segment:     │      │  ┌──────────────────────────┐  │  │
│  │    setHighlight(dim, val) │      │  │  Output: .pbip project   │  │  │
│  │    → 40% opacity dimming  │      │  │  ├─ Report/visuals/*.json│  │  │
│  │    Ctrl+Click = multi     │      │  │  └─ SemanticModel/*.tmdl │  │  │
│  │                           │      │  └──────────────────────────┘  │  │
│  │  Slicer:                  │      │                                │  │
│  │    setFilter(col, val)    │      │  Opens in Power BI Desktop     │  │
│  │    → removes non-matching │      │  with data loaded              │  │
│  └───────────────────────────┘      └────────────────────────────────┘  │
│                                                                         │
│  STACK: React 18 + TypeScript + Vite │ Fluent UI v9 │ Recharts         │
│         Zustand │ react-grid-layout │ Faker.js │ Supabase │ PBIP       │
│                                                                         │
│  12 PALETTES        7 SCENARIOS        20+ VISUALS        9 TEMPLATES  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Features

- **7 scenarios** — Retail, SaaS, HR, Logistics, Finance, Social, Portfolio
- **20+ visual types** with cross-highlighting (40% opacity dimming, Ctrl+Click multi-select)
- **Realistic data** — Pareto, log-normal, exponential decay, seasonal patterns via seeded PRNG
- **12 color palettes** — PBI Default (`#118DFF`), Ocean, Forest, Sunset, Monochrome, Corporate, Zebra, Social, Portfolio, Warm Neutral, Industrial, Boardroom
- **PBIP export** with star schema, DAX measures, and positioned visuals
- **Supabase auth/persistence**, auto-save, public sharing
- **9 pre-built templates** for rapid prototyping

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React 18 + Vite |
| Language | TypeScript |
| UI System | Fluent UI v9 |
| Charts | Recharts |
| State | Zustand |
| Layout | react-grid-layout |
| Data | Faker.js v10 + statistical distributions |
| Auth/Persistence | Supabase |
| Testing | Playwright |

## Getting Started

```bash
npm install
cp .env.example .env.local   # add Supabase keys
npm run dev
```

See [SETUP.md](SETUP.md) for Supabase + Vercel deployment instructions.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview production build |
| `npm test` | Run unit tests |
| `npm run test:e2e` | Run Playwright E2E tests |

## Project Structure

```
src/
├── auth/                       # Supabase auth components
├── components/
│   ├── AppShell.tsx             # Main layout shell
│   ├── Canvas.tsx               # Grid-based visual canvas
│   ├── VisualContainer.tsx      # Visual wrapper (drag, resize, select)
│   ├── PropertiesPanel.tsx      # Right pane: edit selected visual
│   ├── FieldsPane.tsx           # Right pane: data fields
│   ├── VisualizationsPane.tsx   # Bottom pane: visual picker
│   ├── ExportButton.tsx         # PBIP / JSON export
│   ├── ColorPicker.tsx          # Theme/palette selector
│   ├── AutoSave.tsx             # Auto-save to Supabase
│   ├── SaveDashboardDialog.tsx  # Save dialog
│   ├── ShareDialog.tsx          # Public share link dialog
│   ├── UserMenu.tsx             # Auth user menu
│   ├── QuickShapeStrip.tsx      # Inline visual shaping controls
│   ├── DashboardCard.tsx        # Dashboard listing card
│   ├── [20+ chart components]  # Bar, Line, Pie, Scatter, etc.
│   └── portfolio/               # ESG portfolio monitoring visuals
├── engine/
│   ├── dataGenerator.ts         # Star schema data generation
│   ├── distributions.ts         # Pareto, log-normal, exponential decay
│   └── seasonality.ts           # Seasonal + AR(1) time-series patterns
├── export/
│   ├── schemaGenerator.ts       # Star schema definitions per scenario
│   ├── daxGenerator.ts          # DAX measure generation
│   ├── layoutConverter.ts       # Grid coords → PBI pixel positions
│   └── pbipWriter.ts            # PBIP ZIP assembly
├── lib/                         # Supabase client + utilities
├── pages/                       # Route pages (editor, dashboard list)
├── store/
│   ├── useStore.ts              # Main Zustand store
│   ├── useThemeStore.ts         # Palette/theme state
│   ├── templates.ts             # 9 pre-built dashboard templates
│   ├── semanticLayer.ts         # Field role definitions
│   ├── bindingRecipes.ts        # Visual type → default field bindings
│   └── slotLayouts.ts           # Layout archetype slot definitions
├── types/
│   └── index.ts                 # TypeScript interfaces
└── utils/
    └── chartUtils.ts            # Shared chart helpers
```

## Documentation

- [VISION.md](VISION.md) - Product goal and positioning
- [docs/PRODUCT_ROADMAP.md](docs/PRODUCT_ROADMAP.md) - Roadmap for React Product Mode, Power BI Mode, Figma-led workflow, and exports
- [docs/CONSULTANT_WORKFLOW.md](docs/CONSULTANT_WORKFLOW.md) - Consultant workflow from Figma or Phantom defaults to engineering handoff
- [docs/AI_CONTROL_SURFACE.md](docs/AI_CONTROL_SURFACE.md) - CLI/API/agent control surface

- [PRD.md](PRD.md) — Product requirements & architecture
- [TODO.md](TODO.md) — Roadmap & task tracking
- [SETUP.md](SETUP.md) — Supabase + Vercel deployment guide
- [RESEARCH_BRIEF.md](RESEARCH_BRIEF.md) — Research areas & priorities
