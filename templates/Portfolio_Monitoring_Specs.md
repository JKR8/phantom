# Portfolio Monitoring Template - Detailed Specifications

## Overview
A financial/ESG portfolio monitoring dashboard focused on controversy scores and entity tracking.

---

## 1. HEADER SECTION
- **Title**: "Portfolio Monitoring"
- **Icon**: Gold/amber diamond icon (left of title)
- **Background**: Dark navy (#1a1a2e or similar)
- **Title Color**: White text

---

## 2. FILTER ROW (Top Bar)
Located below the header, contains 5 filter controls:

| Filter | Type | Position |
|--------|------|----------|
| Sector and Investment | Dropdown | Left |
| Score | Dropdown | Center-left |
| Change Of Direction | Dropdown | Center |
| Multiple selections | Dropdown | Center-right |
| Event Date | Date Range Picker | Right (1/1/2023 - 12/31/2023 format) |

- **Background**: Light gray (#F3F2F1)
- **Dropdown style**: Standard Fluent UI dropdowns

---

## 3. KPI CARDS ROW (Top Right)
Three KPI cards positioned in the top-right area:

| Card | Value | Label | Notes |
|------|-------|-------|-------|
| Card 1 | 2379 | Entity count or total | Large bold number |
| Card 2 | 59 | Score average | Medium emphasis |
| Card 3 | 1715 | MV (USD) | Market Value in millions/billions |

- **Card Style**: White background, minimal borders
- **Value Font**: Large bold (24-32px), dark gray (#323130)
- **Label Font**: Small (11px), muted gray (#605E5C)

---

## 4. LEFT PANEL - "Controversy Score Change" (Horizontal Bar Chart)
- **Title**: "Controversy Score Change"
- **Chart Type**: Horizontal bar chart (stacked/grouped)
- **Position**: Left side, below filters

### Legend (Top of chart):
Score range indicators with colored dots:
- Q Score 10 (lightest)
- Q Score 20
- Q Score 30
- Q Score 40
- Q Score 50 (darkest)

### Bar Categories (Y-axis labels):
- USA
- EMEA
- APAC
- CEMAR
- Gulf+
- Basic Materials
- Alfa Capital
- (additional entries...)

### Colors:
- Bars: Gradient from light amber (#F5D79E) to dark orange (#D4A548)
- Background: White
- Grid: Light gray horizontal lines

---

## 5. RIGHT PANEL - "Entity Name" Table (Source Region Table)
- **Title**: "Entity Name"
- **Position**: Right side, adjacent to bar chart

### Columns:
| Column | Width | Content |
|--------|-------|---------|
| Entity Name | Wide | Company names |
| Source Region | Medium | Geographic region |
| Source | Medium | Data source info |

### Sample Data Rows:
- Northern Trust Corp
- Asseco South Eastern Europe S.A.
- China Feihe Limited
- China Mobile Ltd
- Cimpress plc
- (etc.)

### Footer:
- Total row at bottom showing aggregate value (e.g., "$939,979,774")

### Styling:
- Header: Gray background (#F3F2F1)
- Rows: Alternating white/light gray
- Font size: 11px
- Cell padding: 4-8px

---

## 6. BOTTOM PANEL - "Controversy" Table (Main Detail Table)
- **Title**: "Controversy"
- **Position**: Full width at bottom, largest component
- **Height**: ~40-50% of dashboard

### Columns:
| Column | Width | Type | Description |
|--------|-------|------|-------------|
| Entity Name | 150px | Text | Company name |
| Category Name | 150px | Text | Controversy category |
| Score Change | 80px | Number | Numerical change value |
| Valid From | 100px | Date | Effective date |
| MV (USD) | 100px | Currency | Market value |
| Justification | Flexible/Wide | Long Text | Detailed explanation text |

### Sample Data:
- Entity: "Bayer US Finance LLC"
- Category: "Social Impact of Products"
- Score Change: 3 to 4
- MV: $2,044
- Justification: Long paragraph explaining the controversy score change...

### Styling:
- Header: Bold, gray background
- Cell text: 11px, dark gray
- Justification column: May wrap text, scrollable
- Row height: Variable based on content

---

## 7. COLOR PALETTE

| Element | Color Code | Usage |
|---------|------------|-------|
| Primary Accent | #D4A548 | Icon, highlights, chart bars |
| Header Background | #1A1A2E | Top header bar |
| Header Text | #FFFFFF | Title text |
| Body Background | #FFFFFF | Main canvas |
| Secondary Background | #F3F2F1 | Table headers, filter row |
| Primary Text | #323130 | Main content text |
| Secondary Text | #605E5C | Labels, subtitles |
| Bar Chart Color 1 | #F5D79E | Lightest bar segment |
| Bar Chart Color 2 | #EDBE6A | |
| Bar Chart Color 3 | #E5A645 | |
| Bar Chart Color 4 | #D4A548 | |
| Bar Chart Color 5 | #C08930 | Darkest bar segment |

---

## 8. LAYOUT GRID (12-column system)

```
Row 0-1: [Slicer1(w:2)] [Slicer2(w:2)] [Slicer3(w:2)] [Slicer4(w:2)] [DateRange(w:2)] [KPI1(w:1)] [KPI2(w:1)]
Row 2-7: [Bar Chart "Controversy Score Change" (w:5, h:6)] [Entity Table (w:4, h:6)] [KPI3(w:3, h:2)]
Row 8-15: [Controversy Detail Table (w:12, h:8)]
```

### Approximate Layout Coordinates:
| Item | x | y | w | h |
|------|---|---|---|---|
| Slicer: Sector | 0 | 0 | 2 | 2 |
| Slicer: Score | 2 | 0 | 2 | 2 |
| Slicer: Change Dir | 4 | 0 | 2 | 2 |
| Slicer: Multiple | 6 | 0 | 2 | 2 |
| Date Range | 8 | 0 | 2 | 2 |
| KPI Card 1 | 10 | 0 | 1 | 2 |
| KPI Card 2 | 11 | 0 | 1 | 2 |
| Bar Chart | 0 | 2 | 5 | 6 |
| Entity Table | 5 | 2 | 4 | 6 |
| KPI Card 3 (MV) | 9 | 2 | 3 | 2 |
| Detail Table | 0 | 8 | 12 | 8 |

---

## 9. TYPOGRAPHY

| Element | Font Size | Weight | Color |
|---------|-----------|--------|-------|
| Dashboard Title | 16px | 600 | #FFFFFF |
| Card Value | 28-32px | 700 | #323130 |
| Card Label | 11px | 500 | #605E5C |
| Table Header | 11px | 600 | #323130 |
| Table Cell | 11px | 400 | #323130 |
| Chart Axis | 10px | 400 | #605E5C |

---

## 10. DATA REQUIREMENTS

### New Scenario: "Portfolio"

### Entities Required:
- **PortfolioEntity**: id, name, sector, region, marketValue
- **ControversyScore**: entityId, category, score, previousScore, validFrom, justification, source

### Dimensions for Filtering:
- Sector
- Region
- Score Range
- Change Direction (Increase/Decrease/No Change)
- Date Range

### Metrics:
- Total Entities (count)
- Average Score
- Total Market Value (MV USD)
- Score Change

---

## 11. INTERACTIVE BEHAVIORS

1. **Slicers**: Filter all visuals when selection changes
2. **Bar Chart Click**: Cross-filter to show only that category
3. **Table Row Click**: Could highlight/select for drill-through
4. **Date Range**: Filter by event date period

---

## 12. SPECIAL COMPONENTS NEEDED

1. **ControversyBarChart**: Horizontal grouped bar chart with score segments
2. **EntitySourceTable**: Compact table with Entity Name, Source Region, Source columns
3. **ControversyDetailTable**: Wide table with Justification text column (long text support)
4. **DateRangeSlicer**: Date range picker component (start/end dates)
