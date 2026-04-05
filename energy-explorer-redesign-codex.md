# Energy Explorer Redesign — Updated Spec & Codex Handoff

**Project:** Policy-Desk  
**Target file:** `energy-explorer.html` (replace in this branch)  
**Data source:** `Data/electricity-data.csv`  
**Current stack to preserve:** HTML + Tailwind CDN + Chart.js + PapaParse + existing shared site assets (`styles.css`, `script.js`, fonts, nav/footer)

---

## 1. Purpose

Redesign the current `energy-explorer.html` from a control-heavy multi-country dashboard into a **country-profile landing page** that combines curated prose with pre-configured charts.

This is a **replacement of the current page in this branch**, not a dual-page migration. Do **not** create `energy-explorer-advanced.html`, and do **not** preserve the existing explorer as a second page.

The current file should be treated as implementation source material: reuse its existing data loading logic, country handling, chart dependencies, visual language, and site structure where possible, but replace the current dashboard-style interaction model.

---

## 2. Product intent

The redesigned page should:

- Be legible on first visit without requiring the user to configure many controls.
- Present each country as a narrative profile, not just a data series.
- Keep the existing data pipeline and charting stack.
- Reuse current project dependencies rather than introducing a new framework or build system.
- Create a content structure that can later be filled from an Obsidian-style writing workflow.

The page should feel closer to an **editorial analytical brief** than a generic dashboard.

### Non-goals for v1

- No search, RAG, AI features, or chatbot functionality.
- No new data sources.
- No major mobile redesign beyond sensible stacking.
- No rewrite of the whole website.
- No preservation of the old explorer as a separate page.

---

## 3. Grounding in the current codebase

The current `energy-explorer.html` already uses:

- **Chart.js** for chart rendering
- **PapaParse** for CSV parsing
- **Tailwind via CDN** plus custom CSS
- shared site assets such as `styles.css`, `script.js`, navigation, and footer
- a large inline script with country filtering, metric selection, and chart update logic

This redesign should respect that structure.

### Implementation guidance

- Keep **Chart.js** and **PapaParse**.
- Keep the existing CSV path: `Data/electricity-data.csv`.
- Reuse existing country filtering and data extraction logic where possible.
- It is acceptable to **extract or reorganize** parts of the current inline JavaScript into a cleaner file such as `js/energy-explorer.js` if that makes the redesign easier to maintain.
- Do **not** introduce React, Vue, a build tool, or a second charting library.
- Do **not** reimplement the data pipeline from scratch unless necessary.

This is a restructuring grounded in the current codebase, not a greenfield rebuild.

---

## 4. Core UX change

### Current page

The current page is a flexible explorer with:
- many controls,
- multi-country comparison,
- view switching,
- ranking,
- year range filters,
- source toggles,
- carbon toggles,
- and several chart states.

### New page

The redesigned page should shift to a much simpler flow:

1. User chooses one country from a dropdown.
2. Left panel shows structured written sections for that country.
3. Right panel shows four pre-configured charts for that country.
4. Optional lightweight controls live only inside the relevant charts.

The default posture should be: **read first, then inspect the visuals**.

---

## 5. Layout

Use a two-column split layout.

- **Left panel:** country selector + accordion prose sections
- **Right panel:** four charts stacked vertically

Suggested base layout:

```css
main-layout {
  display: grid;
  grid-template-columns: minmax(380px, 1fr) 2fr;
  gap: 0;
}
```

Each panel should use sticky positioning for desktop so that each side can scroll independently within the viewport.

### Desktop behavior

- Both columns should feel like two adjacent surfaces.
- Each panel should have `position: sticky` and `max-height: calc(100vh - header height)` with internal scrolling.
- Avoid fixed-position hacks.

### Mobile behavior

At roughly `< 900px`:
- collapse to one column,
- left panel first,
- right panel second,
- disable sticky behavior.

---

## 6. Visual direction for the panel split

The split between left and right panels should be **very soft and understated**.

Do **not** make the page look like two bordered dashboard cards.

### Desired visual treatment

Use a split-pane aesthetic inspired by minimal UI dividers:

- a **very faint vertical seam** between panels
- separation created mainly by a **subtle background tone shift**
- very low-contrast edge treatment
- soft, calm, editorial feel

### Acceptable panel pairings

Examples:
- white + very light grey
- white + very light cream
- white + pale desaturated blue

### Divider guidance

- extremely subtle border or hairline
- optional soft inner shadow or gradient edge
- no heavy border
- no dark divider
- no pronounced gutter

The result should feel tactile and quiet rather than app-like or mechanical.

---

## 7. Country selector

At the top of the left panel, include a plain `<select>` element.

### Initial options

- Tunisia
- Morocco
- Algeria
- Egypt
- Jordan
- World

### Default

- Tunisia

### On change

Changing the country should trigger one update flow that:

1. loads the matching markdown content file,
2. updates all four right-side charts,
3. refreshes titles and labels tied to the selected country.

Accordion state can reset on change for simplicity.

---

## 8. Left panel content structure

Below the selector and divider, render four accordion sections.

Using native `<details>` / `<summary>` is acceptable.

### Section order and IDs

1. `mix` — **The energy mix and how it developed**
2. `solar-wind` — **Solar and wind**
3. `hydrogen` — **Hydrogen**
4. `security` — **Energy security and geopolitics**

### Content source

Create:

```text
content/countries/
```

Files:

- `tunisia.md`
- `morocco.md`
- `algeria.md`
- `egypt.md`
- `jordan.md`
- `world.md`

### Markdown file format

```md
---
country: Tunisia
iso_code: TUN
owid_name: Tunisia
---

## mix
TODO

## solar-wind
TODO

## hydrogen
TODO

## security
TODO
```

### Rendering

- Load the correct markdown file on country change.
- Parse frontmatter + section content.
- Render markdown into HTML inside the accordion bodies.
- A lightweight parser like `marked` via CDN is acceptable.
- v1 content should be placeholder text clearly marked `TODO`.

---

## 9. Right panel charts

All right-side charts must reuse the current data source and stay within the current charting stack.

Use **Chart.js**, consistent with the current page.

Do not add a second chart library.

### Chart 1 — Renewables share vs total generation

**Purpose:** show how renewables track against total electricity generation over time.

- X axis: year
- Y axis: TWh
- Solid line: total electricity generation
- Dashed accent line: total renewables
- Title: `[Country] — Renewables against total generation`
- No separate user controls

Renewables should be computed from the existing electricity source columns already available in the CSV logic.

### Chart 2 — Selected source growth against faint background

**Purpose:** make one source legible while keeping context from the rest of the mix.

- X axis: year
- Y axis: TWh or share %
- Foreground: selected source, bold line in accent color
- Background: other sources shown as faint lines
- Small local control above chart: source selector
- Optional small toggle for TWh vs share %
- Title: `[Country] — [Source] against other sources`

Source options:
- Solar
- Wind
- Hydro
- Nuclear
- Gas
- Coal
- Oil
- Bioenergy

### Chart 3 — Source × comparison country

**Purpose:** allow one focused comparison without turning the page back into a dashboard.

- X axis: year
- Y axis: TWh
- Two lines only
- Line 1: selected source for current country
- Line 2: selected source for comparison country
- Controls above chart:
  - source selector
  - comparison country selector
- Title: `[Source]: [Country] vs. [Comparison country]`

The comparison country selector can pull from the broader dataset, not just the six profiled entries.

### Chart 4 — Renewables breakdown

**Purpose:** show composition of renewables over time.

- X axis: year
- Y axis: TWh or share %
- stacked area chart
- components: solar, wind, hydro, bioenergy, other renewables
- optional toggle between TWh and share %
- Title: `[Country] — Breakdown of renewable generation`

---

## 10. World behavior

When the selected country is `World`:

- load `content/countries/world.md`
- use `World` as the chart entity where available in the dataset
- keep the same chart structure
- for comparison chart, default comparison can still be a selectable country or region if supported by the dataset

---

## 11. File structure after redesign

A clean target structure is:

```text
Policy-Desk/
├── energy-explorer.html
├── content/
│   └── countries/
│       ├── tunisia.md
│       ├── morocco.md
│       ├── algeria.md
│       ├── egypt.md
│       ├── jordan.md
│       └── world.md
├── css/
│   └── energy-explorer.css        [new or extended]
├── js/
│   └── energy-explorer.js         [new or extracted from inline logic]
└── Data/
    └── electricity-data.csv
```

If keeping some logic in the HTML file is easier, that is acceptable for v1, but the resulting code should be cleaner than the current monolithic page.

---

## 12. Navigation and site consistency

Keep the existing website structure and visual language consistent with the rest of the site.

- Keep the current site navigation model.
- `Energy Explorer` should still point to `energy-explorer.html`.
- Keep the footer and overall typography aligned with the current site.
- Preserve current font choices and shared site identity where practical.

---

## 13. Acceptance criteria

The redesign is successful if:

- the page loads with **Tunisia** selected by default,
- the left panel shows four accordion sections populated from `tunisia.md`,
- the right panel renders all four charts for Tunisia,
- changing the country updates both prose and all charts in one action,
- the desktop layout behaves as a soft split-pane with independent panel scrolling,
- the panel divider uses a subtle seam and tonal contrast rather than heavy borders,
- the mobile layout collapses to one column below the breakpoint,
- no new charting library is introduced,
- `Data/electricity-data.csv` remains the sole v1 data source,
- no console errors occur,
- all markdown files exist even if they contain only placeholder `TODO` content.

---

## 14. Out of scope

- Writing the final country prose
- Adding AI/search/RAG features
- Adding new datasets
- Reworking the whole site
- Creating a second advanced explorer page
- Full multilingual support in v1

---

## 15. High-level implementation note for Codex

When translating the current `energy-explorer.html` into the new structure:

- treat the existing page as a source of reusable logic and dependencies,
- simplify the interaction model aggressively,
- prioritize editorial readability over configurability,
- preserve the current technical stack,
- and make the new split layout feel soft, refined, and understated.
