# Phantom Architecture

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                    PHANTOM - Micro-BI Prototyping Tool                       ║
║              "Looks like Power BI, works like magic"                         ║
╚══════════════════════════════════════════════════════════════════════════════╝

┌─────────────────────────────────────────────────────────────────────────────┐
│                              BROWSER APPLICATION                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         APP SHELL                                    │   │
│  ├──────────────┬──────────────────────────────────────┬───────────────┤   │
│  │              │                                      │               │   │
│  │   TOP BAR    │  [Home] [Template▼] [Export PBIP]   │  [User Menu]  │   │
│  │              │                                      │               │   │
│  ├──────────────┼──────────────────────────────────────┼───────────────┤   │
│  │              │                                      │               │   │
│  │  LEFT NAV    │         CANVAS (48-col grid)        │  PROPERTIES   │   │
│  │  ┌────────┐  │  ┌────────┐ ┌────────┐ ┌────────┐  │    PANEL      │   │
│  │  │ Fields │  │  │  KPI   │ │  KPI   │ │  KPI   │  │  ┌─────────┐  │   │
│  │  │ ────── │  │  │  Card  │ │  Card  │ │  Card  │  │  │ Title   │  │   │
│  │  │ □ Store│  │  └────────┘ └────────┘ └────────┘  │  │ Fields  │  │   │
│  │  │ □ Sales│  │  ┌─────────────┐ ┌─────────────┐   │  │ Colors  │  │   │
│  │  │ □ Date │  │  │  ▓▓▓       │ │    ──●      │   │  │ Sort    │  │   │
│  │  └────────┘  │  │  ▓▓▓ ▓▓▓   │ │   ●──       │   │  │ Top N   │  │   │
│  │  ┌────────┐  │  │  ▓▓▓ ▓▓▓   │ │  ●────      │   │  └─────────┘  │   │
│  │  │ Visuals│  │  │  Bar Chart │ │  Line Chart │   │               │   │
│  │  │ ────── │  │  └─────────────┘ └─────────────┘   │  ┌─────────┐  │   │
│  │  │ ▓ Bar  │  │  ┌──────────┐ ┌────────────────┐   │  │ Quick   │  │   │
│  │  │ ● Line │  │  │   ╭─╮    │ │  Slicer ▼      │   │  │ Shape   │  │   │
│  │  │ ◕ Pie  │  │  │  ╱   ╲   │ │  ○ Option 1    │   │  │ Strip   │  │   │
│  │  │ ▤ Table│  │  │ ╱─────╲  │ │  ● Option 2    │   │  └─────────┘  │   │
│  │  └────────┘  │  │ Pie Chart│ │  ○ Option 3    │   │               │   │
│  │              │  └──────────┘ └────────────────┘   │               │   │
│  └──────────────┴──────────────────────────────────────┴───────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                            STATE MANAGEMENT                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    ZUSTAND STORE (useStore.ts)                      │   │
│   ├─────────────────────────┬───────────────────────────────────────────┤   │
│   │      DATA               │              UI STATE                     │   │
│   │   ┌────────────────┐    │   ┌────────────────────────────────────┐  │   │
│   │   │ stores[]       │    │   │ items: DashboardItem[]             │  │   │
│   │   │ products[]     │    │   │ selectedItemId: string | null      │  │   │
│   │   │ sales[]        │    │   │ filters: { column: value }         │  │   │
│   │   │ customers[]    │    │   │ highlight: { dim, values: Set }    │  │   │
│   │   │ employees[]    │    │   │ scenario: 'Retail'|'SaaS'|'HR'|... │  │   │
│   │   │ shipments[]    │    │   │ themePalette: 'default'|'ocean'... │  │   │
│   │   │ portfolioData[]│    │   │ isDirty: boolean                   │  │   │
│   │   └────────────────┘    │   └────────────────────────────────────┘  │   │
│   └─────────────────────────┴───────────────────────────────────────────┘   │
│                                      │                                      │
│           ┌──────────────────────────┼──────────────────────────────┐       │
│           ▼                          ▼                              ▼       │
│   ┌───────────────┐         ┌───────────────┐          ┌───────────────┐   │
│   │setFilter()    │         │setHighlight() │          │addItem()      │   │
│   │Applies filter │         │Dims non-match │          │deleteItem()   │   │
│   │to all visuals │         │items (40%)    │          │updateItem()   │   │
│   └───────────────┘         └───────────────┘          └───────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                         CROSS-FILTERING FLOW                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   User clicks                                                               │
│   bar segment        ┌──────────────┐                                       │
│        │             │              │   All other                           │
│        ▼             │   ZUSTAND    │   components                          │
│   ┌─────────┐        │    STORE     │   re-render                           │
│   │BarChart │──────▶ │              │ ─────────▶  ┌─────────┐               │
│   │onClick()│  set   │ highlight:   │  useHigh-   │LineChart│  Dims         │
│   └─────────┘  High- │ {            │  light()    │         │  non-match    │
│                light │   dim:"Store"│  hook       │ ●───●   │  points       │
│                      │   values:Set │             │ ●       │  (40% opacity)│
│                      │ }            │             └─────────┘               │
│                      └──────────────┘                                       │
│                                                                             │
│   Ctrl+Click = Multi-select (adds to Set instead of replacing)              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                          DATA GENERATION ENGINE                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    dataGenerator.ts                                 │   │
│   │   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐           │   │
│   │   │ Retail   │  │  SaaS    │  │   HR     │  │Logistics │    ...    │   │
│   │   │ ──────── │  │ ──────── │  │ ──────── │  │ ──────── │           │   │
│   │   │ Stores   │  │ Customers│  │ Employees│  │ Shipments│           │   │
│   │   │ Products │  │ Subscrip │  │ Perf Rev │  │ Routes   │           │   │
│   │   │ Sales    │  │ Churn    │  │ Attrition│  │ Carriers │           │   │
│   │   └──────────┘  └──────────┘  └──────────┘  └──────────┘           │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                      │
│                                      ▼                                      │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                   distributions.ts                                  │   │
│   │   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                │   │
│   │   │ paretoSamp  │  │ logNormal   │  │ boxMuller   │                │   │
│   │   │ (80/20)     │  │ (skewed $)  │  │ (normal)    │                │   │
│   │   └─────────────┘  └─────────────┘  └─────────────┘                │   │
│   │   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                │   │
│   │   │ expDecay    │  │ ar1Process  │  │seededRandom │                │   │
│   │   │ (falloff)   │  │ (time-srs)  │  │(reproducible│                │   │
│   │   └─────────────┘  └─────────────┘  └─────────────┘                │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                        EXPORT PIPELINE (to Power BI)                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌───────────┐    ┌───────────┐    ┌───────────┐    ┌───────────────────┐ │
│   │  ZUSTAND  │    │  Schema   │    │   DAX     │    │    Layout         │ │
│   │   STATE   │───▶│ Generator │───▶│ Generator │───▶│   Converter       │ │
│   │           │    │           │    │           │    │                   │ │
│   │ items[]   │    │ Star      │    │ Measures: │    │ 48-col grid       │ │
│   │ data[]    │    │ Schema    │    │ SUM, AVG  │    │      ▼            │ │
│   │ filters   │    │ Fact/Dim  │    │ Variance  │    │ Pixel coords      │ │
│   └───────────┘    └───────────┘    └───────────┘    └───────────────────┘ │
│                                                              │              │
│                                                              ▼              │
│                                           ┌─────────────────────────────┐  │
│                                           │      pbipWriter.ts          │  │
│                                           │  ┌───────────────────────┐  │  │
│                                           │  │    MyDashboard.pbip   │  │  │
│                                           │  │  ├── Report/          │  │  │
│                                           │  │  │   ├── report.json  │  │  │
│                                           │  │  │   └── visuals/     │  │  │
│                                           │  │  │       ├── v1.json  │  │  │
│                                           │  │  │       └── v2.json  │  │  │
│                                           │  │  └── SemanticModel/   │  │  │
│                                           │  │      ├── model.bim    │  │  │
│                                           │  │      └── data.json    │  │  │
│                                           │  └───────────────────────┘  │  │
│                                           └─────────────────────────────┘  │
│                                                              │              │
│                                                              ▼              │
│                                           ┌─────────────────────────────┐  │
│                                           │   Download .pbip file       │  │
│                                           │   Open in Power BI Desktop  │  │
│                                           └─────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                              TECH STACK                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   FRONTEND                    STATE              BACKEND                    │
│   ┌──────────────────┐       ┌──────────┐       ┌──────────────────┐       │
│   │ React 18 + TS    │       │ Zustand  │       │ Supabase         │       │
│   │ Vite 5           │◀─────▶│ (store)  │◀─────▶│ - Auth           │       │
│   │ Fluent UI v9     │       └──────────┘       │ - Postgres       │       │
│   │ Recharts         │                          │ - Share links    │       │
│   │ react-grid-layout│                          └──────────────────┘       │
│   └──────────────────┘                                                      │
│                                                                             │
│   DATA                        EXPORT             TESTING                    │
│   ┌──────────────────┐       ┌──────────┐       ┌──────────────────┐       │
│   │ Faker.js         │       │ JSZip    │       │ Playwright (E2E) │       │
│   │ Custom PRNG      │──────▶│ PBIP fmt │       │ Vitest (unit)    │       │
│   │ Statistical dist │       │ DAX gen  │       └──────────────────┘       │
│   └──────────────────┘       └──────────┘                                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                           7 INDUSTRY SCENARIOS                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐          │
│   │ RETAIL  │  │  SaaS   │  │   HR    │  │LOGISTICS│  │ FINANCE │          │
│   │         │  │         │  │         │  │         │  │         │          │
│   │ Stores  │  │ MRR     │  │ Headcnt │  │ Shipmnts│  │ GL Accts│          │
│   │ Sales   │  │ Churn   │  │ Attritn │  │ Routes  │  │ Budget  │          │
│   └─────────┘  └─────────┘  └─────────┘  └─────────┘  └─────────┘          │
│                                                                             │
│   ┌─────────┐  ┌─────────┐                                                  │
│   │ SOCIAL  │  │PORTFOLIO│  + 20+ Visual Types                              │
│   │         │  │         │  + 12 Color Palettes                             │
│   │ Posts   │  │ ESG     │  + 9 Templates                                   │
│   │ Engagmt │  │ Holdings│                                                  │
│   └─────────┘  └─────────┘                                                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                           DIRECTORY STRUCTURE                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   /src                                                                      │
│   ├── /auth           Auth context, login, callbacks                        │
│   ├── /components     54 UI components (charts, panels, dialogs)            │
│   │   ├── /portfolio  Portfolio-specific components                         │
│   │   └── /statistical Boxplot, histogram, violin, regression               │
│   ├── /engine         Data generation (distributions, seasonality)          │
│   ├── /export         PBIP writer, schema gen, DAX gen, layout converter    │
│   ├── /lib            Supabase client, DB queries                           │
│   ├── /pages          Route pages (Editor, MyDashboards, Shared)            │
│   ├── /store          Zustand stores, templates, semantic layer             │
│   ├── /types          TypeScript interfaces                                 │
│   └── /utils          Chart utilities, formatters                           │
│                                                                             │
│   /e2e                Playwright E2E tests                                  │
│   /docs               Documentation and specs                               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Summary

**Phantom** is a Power BI prototyping tool that lets users rapidly create interactive
dashboards with realistic synthetic data across 7 industry scenarios. The React/Zustand
frontend handles cross-filtering interactions, while a sophisticated export pipeline
converts canvas layouts to native Power BI `.pbip` files with embedded data and DAX measures.
