# PBIP Export Specification

This document defines the complete specification for Power BI Project (PBIP) export to match the mokkup template quality.

## Status Legend
- [ ] Not started
- [x] Complete

---

## 1. FUNNEL CHART (`funnel`)

### Query Structure
- [x] `Category`: Column projection with `active: true`
- [x] `Y`: Aggregation with `Function: 0` (SUM)
- [x] Sort Definition with `direction: "Descending"` and `isDefaultSort: true`

### Objects
- [x] `percentBarLabel.show`: false
- [x] `labels.show`: false
- [x] `labels.labelPosition`: 'InsideCenter'
- [x] `labels.labelDisplayUnits`: '0D'
- [x] `dataPoint.showAllDataPoints`: true
- [x] `dataPoint.fill`: #342BC2 (primary purple)

### Visual Container Objects
- [x] `title.show`: false
- [x] `background.show`: false

---

## 2. SCATTER CHART (`scatterChart`)

### Query Structure
- [x] `Category`: Column for bubble identity (with `active: true`)
- [x] `Series`: Column for color grouping
- [x] `Size`: Aggregation for bubble size
- [x] `X`: Aggregation for X-axis (with `active: true`)
- [x] `Y`: Aggregation for Y-axis

### Objects
- [x] `trend.show`: false
- [x] `categoryAxis.show`: true
- [x] `categoryAxis.showAxisTitle`: true (with custom `titleText`)
- [x] `categoryAxis.gridlineShow`: false
- [x] `valueAxis.showAxisTitle`: true (with custom `titleText`)
- [x] `valueAxis.gridlineShow`: false
- [x] `legend.show`: true
- [x] `legend.position`: 'Top'
- [x] `legend.showTitle`: false
- [x] `dataPoint.fill`: #342BC2 (default)
- [x] `bubbles.bubbleSize`: '6.5L'
- [x] `bubbles.markerShape`: 'circle'
- [x] `markers.borderShow`: true
- [x] `markers.transparency`: '0D'

### Visual Container Objects
- [x] `title.show`: false
- [x] `background.show`: false

---

## 3. COMBO CHART (`lineClusteredColumnComboChart`)

### Query Structure
- [x] `Category`: Column for X-axis labels (with `active: true`)
- [x] `Y`: Aggregation for bar/column values (with `displayName`)
- [x] `Y2`: Aggregation for line values (with `displayName`)
- [x] Sort Definition: `isDefaultSort: true`

### Objects
- [x] `categoryAxis.show`: true
- [x] `categoryAxis.showAxisTitle`: false
- [x] `categoryAxis.innerPadding`: '62.5L'
- [x] `valueAxis.show`: true
- [x] `valueAxis.showAxisTitle`: false
- [x] `valueAxis.gridlineShow`: false
- [x] `valueAxis.secShow`: true (secondary axis)
- [x] `valueAxis.secShowAxisTitle`: false
- [x] `legend.show`: true
- [x] `legend.position`: 'Top'
- [x] `labels.show`: false
- [x] `labels.labelPosition`: 'Under'
- [x] `labels.fontSize`: '8D'
- [x] `lineStyles.lineStyle`: 'solid'
- [x] `lineStyles.lineChartType`: 'smooth'
- [x] `lineStyles.strokeWidth`: '1L'
- [x] `lineStyles.showMarker`: true
- [x] `lineStyles.markerSize`: '4D'
- [x] `dataPoint.fill`: #44B0AB for line, #342BC2 for bars

### Visual Container Objects
- [x] `visualHeader.show`: false
- [x] `visualTooltip.show`: true
- [x] `border.show`: false
- [x] `subTitle.show`: false
- [x] `title.show`: false
- [x] `background.show`: false

---

## 4. MATRIX / PIVOT TABLE (`pivotTable`)

### Query Structure
- [x] `Columns`: Column for column headers (with `active: true`)
- [x] `Rows`: Column for row headers (with `active: true`)
- [x] `Values`: Aggregation for cell values

### Objects
- [x] `subTotals.columnSubtotals`: false
- [x] `subTotals.rowSubtotals`: false
- [x] `grid.textSize`: '10D'
- [x] `grid.rowPadding`: '1D'
- [x] `grid.gridVertical`: false
- [x] `grid.gridHorizontal`: false
- [x] `grid.outlineColor`: '#ffffff'
- [x] `values.backColor`: FillRule linearGradient2 (min: #FFFFFF, max: #342BC2)
- [x] `values.fontColor`: FillRule linearGradient2 (same gradient)
- [x] `values.backColorSecondary`: '#FFFFFF'
- [x] `columnHeaders.wordWrap`: false
- [x] `columnHeaders.alignment`: 'Center'
- [x] `rowHeaders.wordWrap`: false
- [x] `columnFormatting.alignment`: 'Center'

### Visual Container Objects
- [x] `title.show`: false
- [x] `background.show`: false

---

## 5. BAR CHART (`clusteredBarChart`)

### Query Structure
- [x] `Category`: Column for category labels (with `active: true`)
- [x] `Y`: Aggregation for bar values (with `displayName`)
- [x] Sort Definition: `isDefaultSort: true`

### Objects
- [x] `categoryAxis.show`: true
- [x] `categoryAxis.showAxisTitle`: false
- [x] `categoryAxis.innerPadding`: '62.5L'
- [x] `categoryAxis.preferredCategoryWidth`: '20D'
- [x] `valueAxis.show`: false
- [x] `valueAxis.showAxisTitle`: false
- [x] `valueAxis.gridlineShow`: true
- [x] `legend.show`: false
- [x] `legend.position`: 'Top'
- [x] `labels.show`: true
- [x] `labels.labelPosition`: 'InsideEnd'
- [x] `labels.enableTitleDataLabel`: false
- [x] `labels.fontSize`: '8D'
- [x] `dataPoint.fill`: #342BC2
- [x] `dataPoint.fillTransparency`: '0D'

### Visual Container Objects
- [x] `visualHeader.show`: false
- [x] `visualTooltip.show`: true
- [x] `border.show`: false
- [x] `subTitle.show`: false
- [x] `title.show`: false
- [x] `background.show`: false

---

## 6. COLUMN CHART (`clusteredColumnChart`)

### Query Structure
- [x] `Category`: Column for category labels (with `active: true`)
- [x] `Y`: Aggregation for column values (with `displayName`)
- [x] Sort Definition: `isDefaultSort: true`

### Objects
- [x] Same as Bar Chart (categoryAxis, valueAxis, legend, labels, dataPoint)

### Visual Container Objects
- [x] Same as Bar Chart

---

## 7. LINE CHART (`lineChart`)

### Query Structure
- [x] `Category`: Column for X-axis (with `active: true`)
- [x] `Y`: Aggregation for line values

### Objects
- [x] `categoryAxis.show`: true
- [x] `categoryAxis.showAxisTitle`: false
- [x] `valueAxis.show`: true
- [x] `valueAxis.showAxisTitle`: false
- [x] `valueAxis.gridlineShow`: false
- [x] `legend.show`: false
- [x] `lineStyles.lineStyle`: 'solid'
- [x] `lineStyles.strokeWidth`: '1L'
- [x] `lineStyles.showMarker`: true
- [x] `dataPoint.fill`: uses theme color

### Visual Container Objects
- [x] `visualHeader.show`: false
- [x] `visualTooltip.show`: true
- [x] `border.show`: false
- [x] `background.show`: false

---

## 8. KPI VISUAL (`kpi`)

### Query Structure
- [x] `Indicator`: Measure for main value
- [x] `Goal`: Measure for comparison value (PY measure)
- [x] `TrendLine`: Column (DateTable.Month)

### Objects
- [x] `goals.goalText`: 'vs prev'
- [x] `goals.fontSize`: '10D'
- [x] `goals.goalFontFamily`: Segoe UI
- [x] `goals.goalFontColor`: #808080
- [x] `goals.showGoal`: true
- [x] `goals.direction`: 'High is good'
- [x] `goals.distanceLabel`: 'Percent'
- [x] `goals.distanceFontColor`: #93BF35
- [x] `goals.distanceFontFamily`: Segoe UI Semibold
- [x] `goals.showDistance`: conditional on goalText
- [x] `indicator.horizontalAlignment`: 'left'
- [x] `indicator.verticalAlignment`: 'middle'
- [x] `indicator.fontFamily`: Segoe UI Bold
- [x] `indicator.fontSize`: '18D'
- [x] `indicator.indicatorDisplayUnits`: '1D'
- [x] `indicator.showIcon`: false
- [x] `trendline.show`: false
- [x] `trendline.transparency`: '20D'
- [x] `status.direction`: 'Negative'
- [x] `status.goodColor`: #252423
- [x] `status.neutralColor`: #252423
- [x] `status.badColor`: #252423
- [x] `lastDate.show`: false

### Visual Container Objects
- [x] `title.show`: true
- [x] `title.text`: visual title
- [x] `title.fontFamily`: Segoe UI Semibold
- [x] `title.fontSize`: '12D'
- [x] `title.fontColor`: #342BC2
- [x] `title.alignment`: 'left'
- [x] `title.background`: 'None'
- [x] `padding.top`: '5D'
- [x] `padding.bottom`: '5D'
- [x] `padding.left`: '5D'
- [x] `background.show`: false

---

## 9. SLICER (`slicer`)

### Query Structure
- [x] `Values`: Column projection (with `active: true`)

### Objects
- [x] `data.mode`: 'Dropdown'
- [x] `header.show`: false
- [x] `selection.strictSingleSelect`: true
- [x] `items.background`: #FFFFFF

### Visual Container Objects
- [x] `padding`: 0D all around
- [x] `background.color`: #FFFFFF

---

## 10. BRAND COLORS (Mokkup Theme)

| Color | Hex | Usage | Status |
|-------|-----|-------|--------|
| Primary | #342BC2 | Bars, funnel, data points, heatmap max | [x] |
| Secondary | #6F67F1 | Second data series | [x] |
| Tertiary | #9993FF | Third data series | [x] |
| Quaternary | #417ED9 | Fourth data series | [x] |
| Quinary | #2565C3 | Fifth data series | [x] |
| Line Accent | #44B0AB | Combo chart line | [x] |
| Success | #93BF35 | KPI distance positive | [x] |
| Text Primary | #252423 | KPI indicator, status colors | [x] |
| Text Secondary | #808080 | Goal text, secondary labels | [x] |
| Title | #342BC2 | Visual titles | [x] |
| Background | #FFFFFF | White backgrounds | [x] |

---

## 11. GLOBAL REQUIREMENTS

### Query Projections
- [x] Add `active: true` to primary projections
- [x] Add `displayName` for better visual labels
- [x] Use `Function: 0` for SUM aggregations (implicit via buildQueryProjection)

### Sort Definitions
- [x] Add sort definitions to funnel, bar, column charts
- [x] Set `isDefaultSort: true`

### Visual Container Defaults
- [x] `drillFilterOtherVisuals`: true on all visuals

---

## Implementation Progress

| Visual Type | Query | Objects | Container | Complete |
|-------------|-------|---------|-----------|----------|
| Funnel | [x] | [x] | [x] | [x] |
| Scatter | [x] | [x] | [x] | [x] |
| Combo | [x] | [x] | [x] | [x] |
| Matrix | [x] | [x] | [x] | [x] |
| Bar | [x] | [x] | [x] | [x] |
| Column | [x] | [x] | [x] | [x] |
| Line | [x] | [x] | [x] | [x] |
| KPI | [x] | [x] | [x] | [x] |
| Slicer | [x] | [x] | [x] | [x] |

Legend: [x] = Complete, [~] = Partial, [ ] = Not started

---

## Notes

- All colors should use the Mokkup theme palette
- Titles are generally hidden on charts (shown via shape containers in mokkup)
- Backgrounds are transparent to allow page background to show through
- Grid lines are typically hidden for cleaner appearance
- Data labels use 8D font size for compact display

## Remaining Items

All items complete! ✓

1. ~~**Matrix heatmap gradient**~~ - Implemented FillRule with linearGradient2 for conditional formatting
2. ~~**Multi-series color support**~~ - Implemented secondary/tertiary colors (MOKKUP_SERIES_COLORS) for multi-series charts
