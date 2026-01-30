# Power BI Reference Screenshots

This directory contains reference screenshots captured from Power BI Desktop.
These images are used for pixel-perfect comparison testing.

## Required Files

The following reference images need to be captured:

| Filename | Test Case | Description |
|----------|-----------|-------------|
| `T01_reference.png` | Default | 5 categories, basic bars/axes/grid |
| `T02_reference.png` | Legend | Multi-series with legend |
| `T03_reference.png` | Labels | Data labels enabled |
| `T04_reference.png` | Truncation | Long category names |
| `T05_reference.png` | Formatting | Large values (K/M) |

## Capture Protocol

1. **Power BI Desktop Settings:**
   - Windows display scaling: 100%
   - Power BI View → Page View → Actual Size (100%)
   - Default theme (no custom themes)

2. **Visual Setup:**
   - Create clustered bar chart (horizontal)
   - Set visual size to exactly 400×300 pixels
   - Use test data from specs.yaml

3. **Screenshot Capture:**
   - Use Windows Snipping Tool (rectangular)
   - Capture only the visual, not surrounding canvas
   - Save as PNG (lossless)

4. **Naming:**
   - Use format: `{test_id}_reference.png`
   - Example: `T01_reference.png`

## Test Data

### T01: Default
```
Category A: 120
Category B: 250
Category C: 180
Category D: 320
Category E: 210
```

### T02: Multi-series
```
         Series A  Series B
Q1:        100        80
Q2:        150       120
Q3:        180       160
Q4:        200       190
```

### T03: Data Labels
```
Product A: 450
Product B: 380
Product C: 290
Product D: 520
Product E: 410
```
Enable data labels in visual settings.

### T04: Long Names
```
Very Long Category Name That Should Truncate: 150
Another Extremely Long Category Label: 220
Short: 180
This Is Also A Very Long Name For Testing: 310
Medium Length Name: 260
```

### T05: Large Values
```
Region A: 125000
Region B: 2500000
Region C: 890000
Region D: 1750000
Region E: 3200000
```
Enable data labels to verify K/M formatting.

## Validation

After capturing, run the comparison tests:

```bash
pnpm playwright test e2e/pbi-renderer-poc.spec.ts
```

Or run the comparison tool directly:

```bash
npx tsx tools/compare-renders.ts
```
