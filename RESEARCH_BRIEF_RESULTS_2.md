# Phantom Data Realism & Power BI Visual Fidelity Specifications

Generating convincing BI dashboard prototypes requires two critical elements: fake data that follows authentic business distributions, and visual styling that matches Power BI Service pixel-for-pixel. This specification provides implementable parameters for both, enabling Phantom users to create prototypes indistinguishable from production dashboards during client workshops.

---

## Part 1: Data realism specifications

### Statistical distributions make or break believability

Real business data never follows uniform distributions—the telltale sign of fake data. Every business scenario has characteristic patterns that experienced analysts recognize instantly.

**Retail/E-commerce distributions:**

| Data Element | Distribution Type | Key Parameters |
|--------------|------------------|----------------|
| Product revenue | Pareto/Power-law | α = 1.1; top **20% of products = 80% of revenue** |
| Store performance | Log-normal | Top 10% of stores = **40-45%** of revenue |
| Average Order Value | Log-normal | μ ≈ 4.5, σ ≈ 0.8; median **$85-145** by category |
| Category mix | Fixed ratios | Grocery 50-60%, merchandise 25-30%, apparel 10-15% |

For marketplace-style data, skew even steeper: top 1% of sellers often generate **40-60%** of GMV (eBay pattern).

**SaaS/Subscription distributions:**

| Data Element | Distribution Type | Key Parameters |
|--------------|------------------|----------------|
| MRR by customer | Log-normal | Top 10% customers = **40-60%** of MRR |
| Pricing tiers | Fixed ratios | Free 65%, Starter 18%, Pro 12%, Enterprise 5% |
| Monthly churn | Exponential decay | 5-8% months 1-3, then **1.5-2%** steady-state |
| Net Revenue Retention | Target range | Median **101-110%**; best-in-class 115-125% |

**HR/Workforce distributions:**

| Level | Base Salary Range | Typical Spread |
|-------|------------------|----------------|
| Entry/Analyst | $50K-$120K | σ = 0.15 within band |
| Senior/Manager | $130K-$230K | σ = 0.20 within band |
| Director | $180K-$350K | σ = 0.22 within band |
| VP/C-Suite | $200K-$700K+ | σ = 0.25 within band |

Employee tenure follows exponential decay: **38%** of all quits occur in Year 1 (10x higher than Year 5). Department ratios for SaaS: Engineering 30-31%, Sales & Marketing 39%, G&A 16-28%.

**Finance/FP&A variance bands:**

| Variance Level | Range | Interpretation |
|----------------|-------|----------------|
| Excellent | ±0-2% | Highly accurate forecasting |
| Acceptable | ±2-5% | Normal operating range |
| Investigate | ±5-10% | Material variance |
| Critical | >±15% | Forecasting breakdown |

Revenue tolerances run tighter (±3-5% is "good"); costs can be looser (±5-8% acceptable). Variable costs like Marketing show ±15-30% variance; fixed costs like Rent stay within ±0-5%.

---

### Time-series patterns that pass the visual test

Line and area charts reveal fake data instantly when patterns look random. Realistic time-series require layered seasonality with appropriate autocorrelation.

**Monthly seasonality multipliers (baseline = 1.0):**

| Month | Retail | E-commerce | SaaS B2B |
|-------|--------|------------|----------|
| January | 0.82 | 0.88 | 0.92 |
| February | 0.87 | 0.92 | 0.87 |
| March | 0.97 | 0.97 | 1.02 |
| April | 0.97 | 0.97 | 1.07 |
| May | 1.02 | 0.97 | 0.97 |
| June | 1.02 | 0.92 | 0.92 |
| July | 0.97 | 0.87 | 0.88 |
| August | 1.02 | 0.92 | 0.91 |
| September | 1.02 | 0.97 | 1.04 |
| October | 1.02 | 1.02 | 1.02 |
| November | **1.15** | **1.13** | 1.07 |
| December | **1.30** | **1.12** | 1.11 |

Q4 holiday spike is critical: November runs **+11-16%** above baseline, December **+8-27%** depending on category. January post-holiday dip: **-15-22%** from December (department stores crash 40-50%).

**Weekday patterns differ dramatically by channel:**

Physical retail peaks Friday-Saturday (multiplier **1.2-1.4x** vs Tuesday baseline). E-commerce peaks Monday-Tuesday (multiplier **1.12-1.16x**), with weekend dip to **0.85-0.90x**. B2B SaaS shows strong weekday bias: Saturday/Sunday drop to **0.50-0.70x**.

**Day-of-month clustering:**

B2B transactions cluster heavily at month-end (last 5 days run **20-30%** above average) and quarter-end (last week **30-40%** above). Consumer patterns spike on 1st and 15th (payroll dates).

**Autocorrelation for natural-looking variance:**

Real business data shows moderate day-to-day correlation. Use AR(1) process with φ = **0.4-0.5** and noise σ = **0.05-0.10** of mean value. This creates smooth-but-not-too-smooth trends that look authentic.

**Implementation formula:**
```
daily_value = base × month_multiplier × weekday_multiplier 
            × (1 + φ × yesterday_residual) 
            × (1 + random_normal(0, 0.08))
```

---

### Dimension cardinality sweet spots

Cross-filtering and Top-N visualizations feel hollow with too few dimension members. Too many overwhelms prototypes.

| Dimension | Prototype Minimum | Recommended | Rationale |
|-----------|------------------|-------------|-----------|
| Products/SKUs | 30 | **50-100** | Top-10 feels meaningful; Pareto pattern visible |
| Stores/Locations | 15 | **25-50** | Regional maps populate well; filtering produces subsets |
| Customers (B2B) | 50 | **100-300** | Segment analysis works; cohort charts meaningful |
| Customers (B2C) | 500 | **1,000-5,000** | Conversion funnels need volume |
| Employees | 75 | **200-500** | Department breakdowns work; tenure analysis valid |
| Cost Centers | 15 | **30-50** | P&L drill-down functional |
| GL Account Lines | 40 | **75-150** | Financial statement structure realistic |
| Time Periods | 12 months | **24-36 months** | YoY comparisons possible; trend lines valid |
| Product Categories | 6 | **10-15** | Category slicing meaningful |
| Regions/Territories | 4 | **8-15** | Geographic analysis works |

**Critical insight:** 20 products is too few—Top-5 visualizations feel arbitrary when the pool is so shallow. **100 products** with Pareto distribution makes filtering and ranking feel substantive.

---

### IBCS variance visualization standards

For Finance templates using Actual/Plan/Prior Year comparisons, follow IBCS semantic notation:

| Scenario | Visual Encoding |
|----------|-----------------|
| **Actual (AC)** | Solid dark/black fill |
| **Prior Year (PY)** | Solid light gray fill |
| **Budget/Plan (BU)** | Outline only (hollow) |
| **Forecast (FC)** | Hatched pattern + frame |

Column order always: **PY → AC → BU** (left to right). Variance bars use green (favorable) and red (unfavorable). Absolute variance shown as bars; relative variance (%) as pin/lollipop charts.

---

## Part 2: Power BI Service visual fidelity specifications

### Typography must match exactly

Power BI uses a specific type system. Mismatched fonts immediately signal "not real."

**Font families:**
- **Primary UI font:** Segoe UI (fallback: `"Segoe UI", wf_segoe-ui_normal, helvetica, arial, sans-serif`)
- **Numeric callouts/titles:** DIN

**Font specifications by element:**

| Element | Font | Size | Weight | Color |
|---------|------|------|--------|-------|
| Card callout values | DIN | **45pt** | 400 | #252423 |
| Visual titles | DIN | **12-14pt** | 400 | #252423 |
| Axis labels | Segoe UI | **9-10pt** | 400 | #605E5C |
| Data labels | Segoe UI | **9-10pt** | 400 | #252423 |
| Table headers | Segoe UI | **12pt** | 600 | #252423 |
| Table values | Segoe UI | **10pt** | 400 | #252423 |
| Slicer headers | Segoe UI | **10-14pt** | 600 | #252423 |
| Slicer items | Segoe UI | **11-12pt** | 400 | #252423 |
| Tooltip text | Segoe UI | **12pt** | 400 | varies |
| Legend labels | Segoe UI | - | 400 | #605E5C |

**Line heights (Fluent Design System):**
- 10px text → 14px line-height
- 12px text → 16px line-height  
- 14px text → 20px line-height

---

### Default color palette is non-negotiable

The default Power BI data colors are instantly recognizable. Use these exact hex values:

**Extended Default Theme (10 colors):**
```
#118DFF  (Blue - primary)
#12239E  (Dark blue)
#E66C37  (Orange)
#6B007B  (Purple)
#E044A7  (Magenta)
#744EC2  (Violet)
#D9B300  (Gold)
#D64550  (Red)
#197278  (Teal)
#1AAB40  (Green)
```

**Alternative Classic Theme (8 colors):**
```
#01B8AA  (Teal - primary)
#374649  (Dark gray)
#FD625E  (Coral red)
#F2C80F  (Yellow)
#5F6B6D  (Gray)
#8AD4EB  (Light blue)
#FE9666  (Orange)
#A66999  (Purple)
```

**Semantic colors:**
- Good/Positive: **#1AAB40**
- Neutral: **#D9B300**
- Bad/Negative: **#D64554**
- Null values: **#FF7F48**

**Structural colors:**
- Primary text: **#252423**
- Secondary text (labels): **#605E5C**
- Tertiary (dimmed): **#B3B0AD**
- Gridlines: **#F3F2F1**
- Visual background: **#FFFFFF**
- Canvas background: **#FFFFFF** or **#F2F2F2**
- Table accent: **#118DFF**

---

### Visual container chrome specifications

| Property | Default Value |
|----------|---------------|
| Background color | #FFFFFF |
| Border | Off by default |
| Border width (when enabled) | 1-2px |
| Corner radius | 0px (default); 4-8px when styled |
| Shadow | Off by default |
| Shadow (when enabled) | `box-shadow: 0px 2px 6px rgba(0,0,0,0.1)` |
| Internal padding | 0px (default); 8-16px common |
| Visual header height | ~24-28px |
| Header padding | ~8px horizontal |

**Canvas defaults:**
- Canvas background: #FFFFFF or #F2F2F2
- Default page size: **1280 × 720px** (16:9)
- Alternative: 1280 × 960px (4:3)

---

### Cross-filtering interaction behavior is precise

The way Power BI handles data selection is distinctive and must be replicated exactly.

**Default behavior:** Cross-highlighting (not filtering). Clicking a bar dims non-matching data rather than removing it.

**Critical opacity value:** Unselected data points render at **40% opacity (0.4)**—this is a fixed value in Power BI core visuals and cannot be changed. Selected elements maintain **100% opacity** with original colors.

**Dimming treatment:** Reduced opacity of original colors, NOT grayscale. The original hue/saturation is preserved.

| Interaction Type | Non-matching Data |
|------------------|-------------------|
| Cross-highlight (default) | Dimmed to 40% opacity |
| Cross-filter | Completely removed |

**Visual-specific behaviors:**
- Bar/Column/Pie charts: Cross-highlight capable
- Line charts: Filter only (cannot highlight)
- Maps: Filter only (cannot highlight)
- Scatter charts: Filter only (cannot highlight)

**Multi-select:** Ctrl+Click for multiple points; Shift+Click for ranges. All selected elements maintain 100% opacity; unselected dim to 40%.

---

### Tooltip behavior specifications

| Property | Specification |
|----------|---------------|
| Hover delay | Immediate (~0ms) |
| Background color | Theme "Background elements" (default: light gray ~#F0F0F0) |
| Text color | Theme "First-level elements" (#252423) |
| Default canvas size (custom tooltips) | **240px × 320px** |
| Positioning | Offset from cursor; dynamically repositions within viewport |
| Transparency | Adjustable 0-100 |

**Content layout:** Field name (lighter weight) appears first, value (bolder) below. Multiple fields stack vertically. Modern tooltips include actions footer with drill options.

---

### Selection and filter state indicators

**Visual selection state:**
- Selected visual: Blue border **#118DFF**, approximately 2px
- Hover on header: Header icons appear (more options, filter, focus)

**Filter indicators:**
- Filter icon: Funnel shape, upper-right corner of visual
- Clear filter: Eraser icon
- Visibility: Appears on hover (reading view)

**Edit Interactions icons (when configuring):**
- Filter mode: Funnel icon
- Highlight mode: Pie/chart slice icon
- No interaction: Circle with line through

---

### Slicer styling specifications

| State | Background | Text Color |
|-------|------------|------------|
| Unselected | Transparent | #252423 |
| Selected | Theme primary color | #FFFFFF |
| Hover | Light gray | #252423 |

**Slicer header:** Segoe UI Semibold, 10-14pt, #252423. **Slicer items:** Segoe UI Regular, 11-12pt, #252423.

---

## Implementation quick reference

### Data generation checklist

```
DISTRIBUTIONS:
□ Product revenue: Pareto α=1.1 (20/80 rule)
□ Store performance: Log-normal, top 10%=40% revenue  
□ AOV: Log-normal μ=4.5, σ=0.8
□ MRR by customer: Log-normal, top 10%=50% MRR
□ Churn: Exponential decay, 5%→1.5% over 6 months
□ Salaries: Log-normal within bands, σ=0.15-0.25
□ Tenure: Exponential decay, 38% Year 1 attrition

SEASONALITY:
□ Q4 retail spike: Nov +15%, Dec +30%
□ January dip: -18% from December
□ Weekday/weekend ratios by channel
□ Month-end B2B clustering: +25%

CARDINALITY:
□ Products: 50-100
□ Stores: 25-50
□ Customers: 100-300 (B2B) / 1000+ (B2C)
□ Employees: 200-500
□ Time periods: 24-36 months
```

### Visual fidelity checklist

```
TYPOGRAPHY:
□ Primary font: Segoe UI
□ Callout font: DIN
□ Card values: DIN 45pt #252423
□ Titles: DIN 12-14pt #252423
□ Labels: Segoe UI 9-10pt #605E5C

COLORS:
□ Primary data color: #118DFF
□ Primary text: #252423
□ Secondary text: #605E5C
□ Gridlines: #F3F2F1
□ Canvas background: #FFFFFF or #F2F2F2
□ Good/Bad: #1AAB40 / #D64554

INTERACTIONS:
□ Cross-highlight opacity: 40%
□ Selected elements: 100% opacity
□ Selection border: #118DFF 2px
□ Tooltip delay: immediate
□ Multi-select: Ctrl+Click
```

These specifications provide the foundation for generating Phantom dashboards that BI consultants can confidently use in client workshops—data patterns that feel real at a glance, and visual styling indistinguishable from production Power BI Service.