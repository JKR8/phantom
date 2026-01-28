# Phantom's competitive landscape reveals a clear market gap

**Phantom occupies a unique position in the BI tooling market: no competitor generates a working Power BI project from a browser-based prototype with fake relational data and cross-filtering.** This research analyzed 9 direct competitors, 3 indirect competitor categories, and the broader BI consulting market to validate this differentiation. The closest alternatives—Figma mockups, PowerPoint wireframes, or AI-generated dashboards—all fail at the critical handoff point: they produce static images or code that must be rebuilt entirely in Power BI. Phantom's PBIP export capability is genuinely unprecedented.

The BI consulting market context amplifies this opportunity. Consultants charge **$100-250/hour** and spend roughly **20% of project time** on wireframing, with rework consuming **30% of development effort**—most caused by requirements misalignment. A tool that lets stakeholders interact with realistic cross-filtering before development begins could eliminate thousands of dollars in rework per project.

---

## Direct competitors lack the prototype-to-production bridge

### Embedded analytics platforms: Luzmo, Preset.io, Sigma Computing

These three platforms target different use cases than Phantom but represent what companies currently use for dashboard creation.

**Luzmo** (formerly Cumul.io) is an embedded analytics platform for SaaS companies wanting to build customer-facing dashboards. Starting at **€995/month** (~$1,080), it offers drag-and-drop creation, robust cross-filtering, and claims "dashboards in hours, not months." However, Luzmo requires users to bring their own data—there's no fake data generation—and explicitly positions itself as a Power BI *replacement*, offering no export capability. The closest feature to prototyping is their AI tool "Instachart," which converts hand-drawn sketches into Luzmo dashboards, but these remain locked in Luzmo's ecosystem.

**Preset.io** (managed Apache Superset) offers a compelling free tier for up to 5 users with unlimited dashboards, making it accessible for small teams. Cross-filtering works natively across 40+ chart types. The platform targets SQL-savvy analysts comfortable with the modern data stack—Snowflake, BigQuery, Databricks. Key limitation: steep learning curve for non-technical users, and like Luzmo, no Power BI export and no automatic sample data generation. Market share remains tiny at approximately **0.3% mindshare** in the BI tools category.

**Sigma Computing** takes a spreadsheet-style approach, targeting Excel-familiar business users. Pricing is enterprise-oriented, typically **$15,000-$80,000/year** depending on company size. While it includes a sample database for learning, Sigma requires an actual cloud data warehouse (Snowflake, BigQuery, Redshift, or Databricks)—you cannot prototype without live infrastructure. Cross-filtering exists but requires manual configuration through "Actions and Sequences," unlike Power BI's automatic relationship-based filtering. No Power BI export exists; Sigma positions itself as a replacement.

| Tool | Starting Price | Fake Data | Power BI Export | Cross-Filtering |
|------|---------------|-----------|-----------------|-----------------|
| Luzmo | €995/mo | ❌ | ❌ | ✅ Native |
| Preset.io | Free (5 users) | ❌ | ❌ | ✅ Native |
| Sigma | ~$300/mo | Sample only | ❌ | ⚠️ Manual setup |

### Code-first and notebook tools: Evidence, Count, Deepnote, Hex

These tools target technical analysts who prefer code-driven workflows. None address the prototyping use case.

**Evidence.dev** is an open-source framework combining SQL and Markdown to build data products. Their new Evidence Studio cloud platform costs **$15-25/user/month**, featuring a browser-based DuckDB runtime for fast queries. Evidence supports filtering through input components (dropdowns, sliders) that modify SQL WHERE clauses, but this isn't true BI-style cross-filtering—clicking a bar chart doesn't automatically filter related visuals. Time-to-first-dashboard is approximately **10-30 minutes** for SQL-proficient users. No fake data generation or Power BI export.

**Count.co** offers a canvas-based hybrid of SQL IDE, Python notebook, and query builder at **$49/editor/month** (collaborators view free). The in-browser DuckDB compute makes queries feel instant. However, Count's canvas model treats each visualization independently—no traditional cross-filtering exists. The platform requires actual database connections even on paid plans; the free tier only supports CSV files.

**Deepnote** (now open-source, announced 2025) is a Jupyter-compatible collaborative notebook costing **$39/editor/month** for teams. It can publish "data apps" as interactive reports, but these lack BI-style cross-filtering. Users can technically use Python's Faker library to generate mock data, but there's no built-in capability. Export formats are Jupyter notebooks or embedded apps—no Power BI format.

**Hex** comes closest to interactive dashboard capability among notebook tools. At **$36-75/editor/month**, it offers "Visual Filtering" in published app mode where clicking chart elements filters data across the dashboard. This requires explicit configuration and only works after publishing. Notable customers include Anthropic, Notion, and Brex. Still, no fake data generation and no Power BI export.

**Key insight:** All four tools target data teams doing analytical work with real data. None address pre-development prototyping or stakeholder alignment.

### Design and Microsoft tools reveal the current workflow gap

**Figma/FigJam for BI prototyping** is common practice but fundamentally limited. The Figma Community offers numerous BI dashboard component libraries, including premium options like **PowerBIgraphs V2** ($199) with Power BI-specific templates. Figma's interactive prototyping supports variables, conditionals, and hover states—you can *simulate* dashboard behavior to some extent.

However, Figma cannot do real cross-filtering. A prototype can *look* like clicking a bar chart filters other visuals, but it's just triggering pre-defined states. There's no relational data model, no automatic visualization of relationships, and export to Power BI produces only background images. At **$16/user/month** for Professional, Figma is affordable but creates the exact "mockup ≠ reality" problem that causes stakeholder disappointment.

**Power BI's own prototyping capabilities** are effectively non-existent. Microsoft explicitly recommends external tools (Figma, PowerPoint, Balsamiq) for wireframing. Power BI Paginated Reports Builder is designed for production pixel-perfect reports requiring real data connections—not mockups. 

The "Enter Data" feature allows manually typing sample data, but it's limited to **512KB** and creates a significant manual effort for anything realistic. Microsoft's sample .pbix files are useful for learning but aren't customizable prototyping tools. Quick Create in the Power BI Service auto-generates reports from pasted data but is limited to 8 tables.

**Bottom line:** Microsoft assumes prototyping happens outside Power BI, then developers rebuild from scratch.

---

## Indirect competitors address adjacent problems, not prototyping

### AI dashboard generation is impressive but shallow

**Claude Artifacts** represents the most capable AI dashboard generation available today. Claude can produce self-contained React applications with charts (using Recharts), filtering controls, and even file upload capabilities—published directly as shareable links. The visual output is clean and modern.

**Critical limitation:** Claude cannot produce Power BI-style relational cross-filtering. It can implement dropdown filters that update charts via explicit code, but clicking one visualization to filter all related visuals based on data relationships isn't possible. Data is flat JSON/CSV—no star schema, no dimension tables, no automatic relationship inference. Same prompt produces different results each time, and output cannot export to any BI tool format.

**ChatGPT** generates code (Python/Dash, JavaScript) that users must deploy themselves. Unlike Claude Artifacts, there's no direct rendering of interactive dashboards—technical knowledge is required to run the generated code.

**Emerging specialized tools** like Mokkup.ai offer Power BI/Tableau export, but exports are *template structures*—layouts without data models, DAX measures, or working relationships. You still rebuild the functionality.

### Microsoft Copilot in Power BI requires massive investment

Copilot can generate report pages from natural language and create visuals automatically—but only with existing data and semantic models. It cannot prototype before data exists.

**The critical barrier:** Copilot requires **Fabric F64 or Power BI Premium P1 capacity**, costing approximately **$60,000+/year minimum**. Premium Per User at $24/month is insufficient. There's no trial without F64 licensing. For organizations without this investment, Copilot is inaccessible.

Even with access, Copilot helps *create* reports from data, not *prototype* reports before data is ready. It doesn't address the requirements gathering phase where stakeholder alignment happens.

### PowerPoint remains the default—with obvious pain points

**The current reality:** Most BI consultants prototype using PowerPoint or pen-and-paper sketches, then discuss requirements through static images. Tools like PowerMockup (a PowerPoint add-in) provide BI-specific shapes, but output remains non-interactive.

**Pain points practitioners describe:**

- "You can spend weeks gathering requirements, build out a dashboard, and still hear 'This isn't what we wanted'"
- Stakeholders can't experience cross-filtering, drill-downs, or filter propagation
- Each iteration requires manual recreation
- Mockups show "what it looks like" but not "how it works"
- Handoff to development means complete rebuild

The typical workflow—whiteboard sketches → PowerPoint wireframes → Figma high-fidelity mockups → manual Power BI development—introduces friction and information loss at every stage.

---

## Strategic positioning: the economics favor a prototyping tool

### BI consulting rates justify tool investment

Power BI consultants bill **$100-250/hour** (US market), with specialized skills commanding up to **$300/hour**. Project costs typically range from **$5,000-$50,000** for small to complex dashboards, with enterprise deployments exceeding **$100,000**.

**Time allocation** in well-run projects follows a 20% rule: spend approximately 20% of project timeline on wireframing and prototyping. On a 10-week project, that's 2 full weeks dedicated to alignment before building.

**The rework problem** is substantial: **30% of development effort** typically goes to rework, with **70-85%** of that cost attributable to requirements defects. On a $50,000 project, that's potentially **$11,250 in preventable rework** from misaligned requirements.

### Prototype-to-production gap quantified

Current tools create this handoff problem:

| What Prototypes Show | What Production Requires |
|---------------------|-------------------------|
| Static visuals | Interactive cross-filtering |
| Placeholder screenshots | Relational data model |
| Design tool formats | .pbip/.pbix format |
| Layout only | DAX measures and calculations |
| No relationships | Star schema modeling |

**Phantom's unique value:** Generating a working Power BI PBIP project with fake relational data, cross-filtering behavior, and proper structure eliminates this gap entirely.

### Value justification math

If a consultant saves **5 hours per project** at $150/hour = **$750 value**. A tool priced at $50-150/month easily justifies itself from a single project's time savings.

The documented **30% reduction in QA/development time** that effective prototyping provides translates to:
- $15,000 project → $4,500 saved
- $50,000 project → $15,000 saved

---

## Feature comparison matrix

| Feature | Luzmo | Preset | Sigma | Evidence | Count | Hex | Figma | Power BI | Claude | Copilot | **Phantom** |
|---------|-------|--------|-------|----------|-------|-----|-------|----------|--------|---------|-------------|
| **Auto fake data** | ❌ | ❌ | Sample | ❌ | ❌ | ❌ | ❌ | Manual | ❌ | ❌ | ✅ |
| **Power BI export** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | Images | N/A | ❌ | N/A | ✅ PBIP |
| **Cross-filtering** | ✅ | ✅ | Manual | Partial | ❌ | Partial | Fake | ✅ | ❌ | ✅ | ✅ |
| **Time to first dashboard** | Hours | Hours | Hours-Days | 10-30 min | 15-30 min | 30-60 min | Hours | Hours+ | Minutes | Requires data | Minutes |
| **No-code** | ✅ | ⚠️ SQL | ✅ | ❌ SQL | ⚠️ | ⚠️ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Real-time collab** | ✅ | ❌ | ✅ | ❌ Git | ✅ | ✅ | ✅ | Limited | ❌ | ❌ | TBD |
| **Starting price** | €995/mo | Free | ~$300/mo | Free | $49/mo | $36/mo | Free | Free | Free | $60K+/yr | TBD |
| **Primary use** | Embedded SaaS | Internal BI | Enterprise BI | Code-first | Analysis | Analysis | Design | Production BI | Mockups | Enhancement | Prototyping |

---

## Market gaps and opportunities

### What's table stakes versus genuine differentiation

**Table stakes (expected in any BI tool):**
- Cloud deployment/SaaS model
- Multiple data source connectors
- Self-service report creation
- Mobile accessibility
- Basic visualization library
- Role-based access controls

**Genuine differentiators in 2024-2025:**
- AI-powered insights and natural language querying
- Agentic AI for multi-step analysis
- Real-time streaming analytics
- Composable/headless architecture
- **Seamless prototype-to-production workflows** (current gap)

### Where the market is heading

The BI market is projected to grow from **$30 billion (2024) to $116 billion by 2033** (14.98% CAGR). Key trends:

**AI integration is accelerating.** 72% of organizations reported AI adoption in analytics in 2024, up from 50% in prior years. Natural language querying and generation are becoming standard. However, AI tools cannot yet replicate relational data model behavior—they produce flat datasets with explicit filters, not automatic cross-filtering.

**Embedded analytics is mainstreaming.** 81% of analytics users now use embedded analytics. This favors tools with flexible APIs and embedding capabilities—but embedded dashboards still require production development, not prototyping.

**Self-service continues maturing.** Business users increasingly expect to create their own visualizations. But self-service in production tools (Power BI, Tableau) still requires data connections and technical setup—the prototyping gap persists.

### Phantom's positioning opportunity

**The competitive landscape reveals three positioning truths:**

1. **No competitor bridges prototype to production.** Every researched tool either creates production dashboards requiring real data (Luzmo, Preset, Sigma, Hex) or creates static mockups that must be rebuilt (Figma, PowerPoint, Claude). Phantom's PBIP export is unique.

2. **No competitor auto-generates relational fake data.** All tools require users to bring data, upload CSVs, or manually create samples. Automatic fake data with proper relationships (fact/dimension tables, foreign keys) doesn't exist elsewhere.

3. **No competitor demonstrates true cross-filtering in prototypes.** Figma fakes it with states. Claude can't do it. PowerPoint is static. Only Phantom can show stakeholders actual cross-filtering behavior before development.

**Recommended positioning:** "The only tool that bridges prototype to production for Power BI"—emphasizing the working project export, fake relational data, and interactive cross-filtering as the unique combination no competitor offers.

**Target segments with highest willingness to pay:**
- BI consulting agencies (multiple projects, high rework costs, client-facing deliverables)
- Freelance Power BI consultants (need to impress clients quickly, justify hourly rates)
- Enterprise BI teams (stakeholder alignment before development investment)

**Pricing benchmark:** Given Mokkup.ai charges $20-50/user/month for template-only exports, Phantom could justify **$50-150/month for consultants** and **$200-500/month enterprise tiers** based on the unique working project export capability and time savings documented in this research.

## Conclusion

Phantom enters a market where the prototyping problem is acknowledged but unsolved. Consultants spend weeks on requirements gathering, build dashboards, and still hear "This isn't what we wanted"—because static mockups cannot demonstrate how BI dashboards actually behave. The **$11,000+ in preventable rework** per complex project creates clear economic justification for a tool that shows stakeholders real cross-filtering before development begins.

The competitive analysis confirms Phantom's three-part differentiator is genuinely unique: automatic fake relational data generation + working cross-filtering + Power BI PBIP export. No direct competitor (Luzmo, Preset, Sigma, Evidence, Count, Deepnote, Hex) and no indirect competitor (Claude artifacts, Copilot, Figma, PowerPoint) delivers this combination. The closest alternative—Mokkup.ai—exports templates without data models or functionality.

Phantom's opportunity lies in capturing the pre-development phase that Microsoft assumes happens elsewhere and that current tools handle poorly. The market size may be modest compared to production BI tools, but the value proposition is clear and defensible.