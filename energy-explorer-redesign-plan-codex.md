# Energy Explorer Redesign — Codex Implementation Plan

## 1. Objective

Replace the current `energy-explorer.html` dashboard with a two-panel country profile page that keeps the existing site shell, existing data source, and existing chart stack.

Do not preserve or move the old explorer to another page. This branch only needs the new `energy-explorer.html`.

## 2. Ground rules from the current codebase

Work with the current page structure instead of inventing a new app architecture.

- Keep `energy-explorer.html` as the target file.
- Keep the current site shell already used in the file: nav, page container, header block, footer, fonts, `styles.css`, Tailwind CDN, Chart.js CDN, PapaParse CDN, and `script.js`.
- Reuse the current CSV path: `Data/electricity-data.csv`.
- Reuse the existing charting helper pattern already referenced in the current file. The current page uses `window.charting.preloadCSV(...)`, `window.charting.createChartFromCSV(...)`, `window.charting.getChart(...)`, and `window.charting.updateChart(...)`. Do not introduce a second chart library. Do not reimplement CSV fetching with a separate parser flow if the current helper already handles caching. fileciteturn0file1
- Keep implementation grounded in the current single-file pattern. Do not create new JS or CSS files unless necessary. Prefer replacing the current explorer markup and inline page script inside `energy-explorer.html`.

## 3. Remove these items from the old plan

The previous plan is outdated on these points and Codex should ignore them:

- No `energy-explorer-advanced.html`
- No “Advanced comparison tool” link
- No nav changes across the rest of the site
- No requirement to preserve the old explorer in parallel
- No requirement to add new routes or duplicate pages

The previous plan also makes some implementation assumptions that are too speculative relative to the current file:

- It refers to `window.charting.loadCSV(...)`, but the current file explicitly uses `window.charting.preloadCSV(...)` instead. fileciteturn2file1turn0file1
- It assumes a destroy/create chart API with `window.charting.destroyChart(...)` and `window.charting.chartInstances[...]`, but the current file only shows `getChart()` and `updateChart()` usage directly. Reuse the visible pattern from the existing page unless Codex confirms other helpers exist in `script.js`. fileciteturn2file1turn0file1
- It uses markdown heading anchors like `{#mix}`. The redesign spec does not require that. Simpler parsing is better here: use plain `## mix`, `## solar-wind`, `## hydrogen`, `## security`. fileciteturn2file1turn2file8
- It hardcodes an “exact copy” migration path for the old explorer. That no longer applies.

## 4. Files to modify

### Modify
- `energy-explorer.html`

### Create
- `content/countries/tunisia.md`
- `content/countries/morocco.md`
- `content/countries/algeria.md`
- `content/countries/egypt.md`
- `content/countries/jordan.md`
- `content/countries/world.md`

Do not create any extra page for the old explorer.

## 5. Page structure to build inside `energy-explorer.html`

Keep the existing nav and footer from the current file. Replace the current control-heavy explorer section with a simpler two-panel layout inside the main page container.

### Main content layout

```html
<main class="page-wrap">
  <div class="container energy-profile-page">
    <header class="energy-profile-header">
      <h1>Energy Explorer</h1>
      <p>Short intro sentence.</p>
    </header>

    <section class="energy-profile-grid">
      <aside class="energy-profile-left">
        <div class="country-select-wrap">
          <label for="countrySelect">Country</label>
          <select id="countrySelect"></select>
        </div>

        <div class="left-divider"></div>

        <details class="profile-section" id="section-mix" open>
          <summary>The energy mix and how it developed</summary>
          <div id="content-mix" class="profile-body"></div>
        </details>

        <details class="profile-section" id="section-solar-wind">
          <summary>Solar and wind</summary>
          <div id="content-solar-wind" class="profile-body"></div>
        </details>

        <details class="profile-section" id="section-hydrogen">
          <summary>Hydrogen</summary>
          <div id="content-hydrogen" class="profile-body"></div>
        </details>

        <details class="profile-section" id="section-security">
          <summary>Energy security and geopolitics</summary>
          <div id="content-security" class="profile-body"></div>
        </details>
      </aside>

      <section class="energy-profile-right">
        <article class="chart-block">
          <h3 id="chart1Title"></h3>
          <div class="chart-canvas-wrap"><canvas id="chartRenewablesVsTotal"></canvas></div>
        </article>

        <article class="chart-block">
          <div class="chart-block-head">
            <h3 id="chart2Title"></h3>
            <select id="chart2SourceSelect"></select>
          </div>
          <div class="chart-canvas-wrap"><canvas id="chartSourceContext"></canvas></div>
        </article>

        <article class="chart-block">
          <div class="chart-block-head chart-block-head--split">
            <h3 id="chart3Title"></h3>
            <div class="chart-inline-controls">
              <select id="chart3SourceSelect"></select>
              <select id="chart3CompareCountrySelect"></select>
            </div>
          </div>
          <div class="chart-canvas-wrap"><canvas id="chartCountryComparison"></canvas></div>
        </article>

        <article class="chart-block">
          <div class="chart-block-head chart-block-head--split">
            <h3 id="chart4Title"></h3>
            <div class="chart-inline-controls">
              <button type="button" data-breakdown-unit="twh" class="breakdown-toggle active">TWh</button>
              <button type="button" data-breakdown-unit="share" class="breakdown-toggle">Share %</button>
            </div>
          </div>
          <div class="chart-canvas-wrap"><canvas id="chartRenewablesBreakdown"></canvas></div>
        </article>
      </section>
    </section>
  </div>
</main>
```

## 6. Visual direction

The split between left and right panels should not look like two boxed dashboard cards. Match the softer split-pane reference described by the user.

### Required visual treatment

- Use a two-column grid.
- Make the left panel slightly tinted and the right panel near-white.
- Use a very faint vertical seam between the panels.
- Keep contrast low.
- Avoid thick borders and heavy card framing between the two main sides.
- Let the distinction come mostly from tone, not outlines.

### Suggested palette

Use one of these combinations:

- left: `#f7f7f5`, right: `#ffffff`
- left: `#f8f7f2`, right: `#ffffff`
- left: `#f5f7fa`, right: `#ffffff`

### CSS implementation target

```css
.energy-profile-grid {
  display: grid;
  grid-template-columns: minmax(360px, 0.95fr) minmax(0, 1.45fr);
  gap: 0;
  border-radius: 18px;
  overflow: hidden;
  background: linear-gradient(to right, rgba(15, 23, 42, 0.06), rgba(15, 23, 42, 0.02) 1px, transparent 1px);
}

.energy-profile-left,
.energy-profile-right {
  align-self: start;
  position: sticky;
  top: 72px;
  max-height: calc(100vh - 88px);
  overflow-y: auto;
}

.energy-profile-left {
  background: #f7f7f5;
  padding: 24px 24px 28px;
  border-right: 1px solid rgba(15, 23, 42, 0.05);
}

.energy-profile-right {
  background: #ffffff;
  padding: 24px 28px 28px;
}

.left-divider {
  height: 1px;
  background: rgba(15, 23, 42, 0.06);
  margin: 18px 0 10px;
}

.chart-block {
  background: transparent;
  border: 0;
  border-radius: 0;
  padding: 0 0 22px;
  margin-bottom: 22px;
  border-bottom: 1px solid rgba(15, 23, 42, 0.06);
}

.chart-block:last-child {
  margin-bottom: 0;
  border-bottom: 0;
  padding-bottom: 0;
}

.chart-canvas-wrap {
  position: relative;
  height: 280px;
}

@media (max-width: 900px) {
  .energy-profile-grid {
    grid-template-columns: 1fr;
  }

  .energy-profile-left,
  .energy-profile-right {
    position: static;
    max-height: none;
    overflow-y: visible;
  }

  .energy-profile-left {
    border-right: 0;
    border-bottom: 1px solid rgba(15, 23, 42, 0.05);
  }
}
```

Codex can refine the CSS, but it must preserve this soft split-pane feel.

## 7. Markdown content format

Use simple markdown files with frontmatter and plain section headings.

Example:

```md
---
country: Tunisia
iso_code: TUN
owid_name: Tunisia
---

## mix

TODO: Placeholder text.

## solar-wind

TODO: Placeholder text.

## hydrogen

TODO: Placeholder text.

## security

TODO: Placeholder text.
```

Do not use anchor syntax in headings.

## 8. Markdown loading and parsing

Add `marked` via CDN in the page `<head>`.

```html
<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
```

Implement one prose loader:

- fetch `content/countries/${country.toLowerCase()}.md`
- strip frontmatter
- split on exact heading lines:
  - `## mix`
  - `## solar-wind`
  - `## hydrogen`
  - `## security`
- render each section into the matching accordion body with `marked.parse(...)`
- on fetch failure, write `Content not yet available.` into all four bodies

## 9. Data state

Use a compact state object.

```js
const CSV_PATH = 'Data/electricity-data.csv';
const CACHE_TTL = 1800000;

const state = {
  currentCountry: 'Tunisia',
  chart2Source: 'Solar',
  chart3Source: 'Solar',
  chart3CompareCountry: 'Morocco',
  chart4Unit: 'twh',
  rows: [],
  countryList: []
};
```

## 10. Source-to-column mapping

Use column names that match the current dataset vocabulary already visible in the current file.

```js
const SOURCE_MAP = {
  Solar: { twh: 'solar_electricity', share: 'solar_share_elec' },
  Wind: { twh: 'wind_electricity', share: 'wind_share_elec' },
  Hydro: { twh: 'hydro_electricity', share: 'hydro_share_elec' },
  Nuclear: { twh: 'nuclear_electricity', share: 'nuclear_share_elec' },
  Gas: { twh: 'gas_electricity', share: 'gas_share_elec' },
  Coal: { twh: 'coal_electricity', share: 'coal_share_elec' },
  Oil: { twh: 'oil_electricity', share: 'oil_share_elec' },
  Bioenergy: { twh: 'biofuel_electricity', share: 'biofuel_share_elec' }
};
```

For renewables breakdown, use:

- TWh mode: `solar_electricity`, `wind_electricity`, `hydro_electricity`, `biofuel_electricity`, `other_renewable_electricity`
- Share mode: `solar_share_elec`, `wind_share_elec`, `hydro_share_elec`, `biofuel_share_elec`, `other_renewables_share_elec`

This is more accurate than the old plan’s mapping of Bioenergy to `other_renewable_electricity`. The current file clearly references `biofuel_electricity` and `biofuel_share_elec`. fileciteturn2file1turn0file1

## 11. Data helpers

Implement small helpers only.

```js
function rowsForCountry(rows, country) {
  return rows
    .filter(row => row.country === country)
    .sort((a, b) => Number(a.year) - Number(b.year));
}

function yearsFor(rows) {
  return rows.map(row => Number(row.year));
}

function valuesFor(rows, column) {
  return rows.map(row => {
    const value = Number(row[column]);
    return Number.isFinite(value) ? value : null;
  });
}

function uniqueCountries(rows) {
  return [...new Set(rows.map(row => row.country).filter(Boolean))].sort();
}
```

## 12. Data load sequence

Use the existing preload pattern first. Do not invent a second caching flow.

```js
async function initPage() {
  state.rows = await window.charting.preloadCSV(CSV_PATH, { ttlMs: CACHE_TTL });
  state.countryList = uniqueCountries(state.rows);

  populateCountrySelect();
  populateChart3CompareCountrySelect();
  populateSourceSelects();

  await loadCountryContent(state.currentCountry);
  renderAllCharts();
  bindEvents();
}
```

If `preloadCSV` fails, show one visible error block in the page content area.

## 13. Chart rules

### Chart 1

`[Country] — Renewables against total generation`

- line 1: `electricity_generation`
- line 2: `renewables_electricity`
- country comes only from the main country selector
- no extra controls

### Chart 2

`[Country] — [Source] against other sources`

- one bold foreground line for selected source
- faint background lines for all other sources
- use TWh only for v1
- no share toggle for this chart in v1
- hide legend for background lines if it becomes noisy

Use these background series:

- `solar_electricity`
- `wind_electricity`
- `hydro_electricity`
- `nuclear_electricity`
- `gas_electricity`
- `coal_electricity`
- `oil_electricity`
- `biofuel_electricity`

### Chart 3

`[Source]: [Country] vs. [Comparison country]`

- source comes from chart-local selector
- comparison country comes from chart-local selector
- current country always comes from main left-panel selector
- use TWh only for v1
- use union of available years and allow null gaps

### Chart 4

`[Country] — Breakdown of renewable generation`

- stacked area chart
- unit toggle: `twh` / `share`
- TWh mode uses renewable generation columns
- share mode uses renewable share columns
- keep both modes in one chart component and rerender on toggle

## 14. Chart implementation approach

Stay close to the current page pattern.

Preferred order:

1. Create the four charts once after data load.
2. On state changes, call `window.charting.getChart(...)` and update existing chart instances.
3. Only destroy and recreate if the helper utilities make update impossible.

Do not assume undocumented chart helper internals unless they are verified in the repo.

## 15. Event flow

Implement one main update path for country changes.

```js
async function updateCountry(country) {
  state.currentCountry = country;

  document.querySelectorAll('.profile-section').forEach((el, index) => {
    if (index === 0) el.setAttribute('open', '');
    else el.removeAttribute('open');
  });

  if (state.chart3CompareCountry === country) {
    state.chart3CompareCountry = country === 'Morocco' ? 'Tunisia' : 'Morocco';
  }

  syncControlsFromState();
  await loadCountryContent(country);
  renderAllCharts();
}
```

Also bind:

- `#chart2SourceSelect` → update chart 2 only
- `#chart3SourceSelect` → update chart 3 only
- `#chart3CompareCountrySelect` → update chart 3 only
- `.breakdown-toggle` → update chart 4 only

## 16. Current-country options

Populate the main country selector with exactly:

- Tunisia
- Morocco
- Algeria
- Egypt
- Jordan
- World

Do not auto-populate this selector from the full dataset.

Populate the chart 3 comparison selector from the full dataset so any available CSV country can be compared.

## 17. Acceptance criteria

- `energy-explorer.html` opens with Tunisia selected.
- The left panel loads Tunisia placeholder prose from `content/countries/tunisia.md`.
- All four charts render for Tunisia using `Data/electricity-data.csv`.
- Switching the main country selector updates prose and all four charts together.
- The left and right sides have a soft split-pane look with a faint seam and subtle tonal difference.
- On screens under `900px`, layout becomes one column and sticky behavior is disabled.
- No reference remains to `energy-explorer-advanced.html` or an advanced tool link.
- No extra page is created for the old explorer.
- No console errors from missing markdown files or missing chart canvases.

## 18. Explicit non-goals

- Do not redesign other site pages.
- Do not add search, AI, or RAG features.
- Do not add new datasets.
- Do not preserve the full old explorer in this branch.
- Do not build a new multi-file front-end architecture unless required by a concrete limitation in the current page.
