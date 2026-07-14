# Widget Builder Skill

Convert a behavioral Blueprint into a complete, working Rally HTML Widget using vanilla JavaScript and the HTML Widget platform.

**Standalone use:** This skill accepts a `blueprint.md` file (or any equivalent behavioral specification) and produces a deployable widget project. It does not require any other workflow phase to have run first.

---

## Input

The user provides a `blueprint.md` file path (or pastes the Blueprint content directly). This is typically output from the **App Deconstructor** skill, but any structured behavioral spec in the same format works.

---

## Output Format

**Default: a single self-contained HTML file.** Produce one `.html` file containing everything inline — a `<style>` block for CSS and a single `<script>` block for JS (no ES module imports, no build step). This matches the format of the deploy files in `rally-widgets/endorsed-widgets/*/`: it gets pasted directly into the Custom HTML Widget's *HTML Source* configuration field.

- Copy the exact bodies of any needed functions from `rally-widgets/examples/utility.js` and `rally-widgets/examples/ui-utilities.js` directly into the `<script>` block (drop the `export` keyword; change nothing else about the function). Only inline the functions actually used — don't paste the whole file.
- Save the output as `[widget-name].html` in the location the user specifies, or alongside the Blueprint if unspecified.
- Skip the multi-file Steps 4–7 below entirely — go straight from Step 3 to writing the one file, then do Steps 8–9 against that file.

**Multi-file dev-project format — only when the user explicitly asks for it.** If the user explicitly requests the widget-template project layout (separate `widget.html` / `widget.js` / `widget.css` with ES module imports, plus `build.js` / `build.config.json` / `package.json` for local dev serving and `npm run build`), follow Steps 4–7 as written below instead of the single-file approach.

---

## Critical Platform Constraints

These rules are non-negotiable. The HTML Widget platform does not load the Rally SDK or Ext JS:

- **NO Rally SDK, NO Ext JS** — do not reference `Ext`, `Rally.*`, or any SDK class
- Use `loadWsapiData` / `loadWsapiDataMultiplePages` from `utilities/utility.js` for all WSAPI calls
- Authentication is handled via Rally session — no auth code needed in the widget
- The `$RallyContext` object is injected by Rally; always include the `// $RallyContext:Begin` and `// $RallyContext:End` comments in `widget.html`
- Charts: use **Highcharts** (loaded via CDN) — not Rally chart components
- **Lookback API (LBAPI) has no platform helper.** If the Blueprint's Migration Notes call for it, you must hand-write a raw `fetch()` call — see "Lookback API (LBAPI) Pattern" under Data Loading Patterns below for the exact request/response shape. Its field-selection parameter is called **`fields`**, NOT `fetch` — that's WSAPI's parameter name. Using the wrong one doesn't error; the response just silently omits the fields you asked for (e.g. `_ItemHierarchy` comes back `undefined`), which then surfaces later as a confusing crash deep in your own rollup code instead of an obvious API error.
- Tables: use vanilla JS or GridJS — not `Rally.ui.grid.Grid`
- Settings UI: use `isEditMode` + `window.RallyContext.updateSettings()` — no `getSettingsFields()`
- ViewFilter: use `$RallyContext.ViewFilter.Type` and `.Value.Name` for Release/Iteration; `.Value.FormattedID` for Milestone
- TypeDefinition name for User Story: `HierarchicalRequirement`

---

## Step 1: Read the Blueprint

Read the provided `blueprint.md` file in full. Extract the following before writing any code:
- Data types and fetch fields
- Filters (static and dynamic)
- ViewFilter handling requirements
- Settings and their effects
- Rendered components (charts, tables, cards)
- User interactions
- Migration notes / limitations

---

## Step 2: Read Reference Material

Before writing any code, read the following files from the workspace:

1. **Widget template files** — `rally-widgets/widget-template/widget.html`, `rally-widgets/widget-template/widget.js`, `rally-widgets/widget-template/widget.css`. Copy their structure exactly as your starting point.

2. **Endorsed widget closest to your Blueprint** — read the deploy file from `rally-widgets/endorsed-widgets/` for the analog identified in the Blueprint's "Suggested HTML Widget Analog" section:
   - `timebox-dashboard` → iteration/release dashboards
   - `pi-cycle-time-chart` → Highcharts charts
   - `blocked-work` → list/table with status indicators
   - `recent-activity` → pagination or feed-style rendering
   - `test-set-results-by-iteration` → test data or iteration grouping
   - `context-text-field-editor` → editing artifact fields

3. **Utility function examples** — read `rally-widgets/examples/utility.js` and `rally-widgets/examples/ui-utilities.js` to understand the exact function signatures before using them. Never guess at function signatures.

---

## Step 3: Plan the Conversion

Before writing code, produce a mapping table that connects each Blueprint item to its HTML Widget implementation:

| Blueprint Item | Old SDK Pattern | New HTML Widget Pattern | Notes |
|---|---|---|---|
| Data: User Stories | `Rally.data.wsapi.Store` | `loadWsapiDataMultiplePages('hierarchicalrequirement', params)` | Use `MAX_PAGE_SIZE` |
| ViewFilter: Release | `timeboxScope.getQueryFilter()` | `$RallyContext.ViewFilter.Value.Name` | Use Name, not ref |
| Setting: chartType | `getSettingsFields()` dropdown | `createStyledDropdown()` in `isEditMode` block | |
| Render: Bar chart | `Rally.ui.chart.Chart` | `Highcharts.chart()` | Follow Highcharts config pattern |
| Interaction: Row click | `recordclick` listener | Click event on `<tr>` element | |

Present this plan to the user and confirm before generating files.

---

## Step 4: Generate `widget.js` (multi-file format only)

**Skip this step for the default single-file output** (see Output Format above) — instead, write the equivalent logic directly into the single HTML file's `<script>` block: same section order and function structure below, but with the needed utility functions copied in as plain (non-exported) function declarations instead of `import`ed, and no `import`/`export` statements anywhere.

If the multi-file format was explicitly requested, follow this exact structure. Do not deviate from the section order or patterns.

```javascript
import { loadWsapiData, loadWsapiDataMultiplePages, constructQuery, MAX_PAGE_SIZE } from '../utilities/utility.js';
import {
  addVisualizationContainer,
  addHorizontalControlsContainer,
  createStyledDropdown,
  createToggleSwitch,
  getColorMap,
  applyFormattedIDTemplate,
  showDetailsModal
} from '../utilities/ui-utilities.js';

// ─── Default Settings ─────────────────────────────────────────────────────────
const defaultSettings = {
  // One entry per setting field from the Blueprint, with its default value
};

// ─── Cleanse Settings ─────────────────────────────────────────────────────────
function cleanseSettings() {
  const settings = { ...defaultSettings, ...$RallyContext.Settings };
  // Validate each setting; fall back to default if invalid
  return settings;
}

// ─── Main Entry ───────────────────────────────────────────────────────────────
window.addEventListener('message', (event) => {
  if (event.data?.type === 'RALLY_CONTEXT_LOADED') {
    buildWidget();
  }
});

// ─── Build Widget ─────────────────────────────────────────────────────────────
async function buildWidget() {
  const settings = cleanseSettings();

  if ($RallyContext.isEditMode) {
    renderSettingsUI(settings);
    return;
  }

  renderLoadingState();

  try {
    const data = await loadData(settings);
    renderWidget(data, settings);
  } catch (error) {
    console.error('[WidgetName] Error loading data:', error);
    renderError('Failed to load data. Please try again.');
  }
}

// ─── Data Loading ─────────────────────────────────────────────────────────────
async function loadData(settings) {
  const queryClauses = [];

  // Add static filters from the Blueprint
  // queryClauses.push('(ScheduleState != "Accepted")');

  // Add ViewFilter scoping from the Blueprint
  if ($RallyContext.ViewFilter.Type === 'Release') {
    queryClauses.push(`(Release.Name = "${$RallyContext.ViewFilter.Value.Name}")`);
  } else if ($RallyContext.ViewFilter.Type === 'Iteration') {
    queryClauses.push(`(Iteration.Name = "${$RallyContext.ViewFilter.Value.Name}")`);
  }

  const params = {
    project: $RallyContext.GlobalScope.Project._ref,
    projectScopeUp: $RallyContext.GlobalScope.ProjectScopeUp,
    projectScopeDown: $RallyContext.GlobalScope.ProjectScopeDown,
    fetch: '[fields from Blueprint fetch list]',
    query: constructQuery(queryClauses, 'AND'),
    pagesize: MAX_PAGE_SIZE,
    order: '[order field from Blueprint]'
  };

  // For Milestone ViewFilter, remove project scoping
  if ($RallyContext.ViewFilter.Type === 'Milestone') {
    queryClauses.push(`(Milestones.FormattedID = "${$RallyContext.ViewFilter.Value.FormattedID}")`);
    delete params.project;
    delete params.projectScopeUp;
    delete params.projectScopeDown;
    params.query = constructQuery(queryClauses, 'AND');
  }

  return await loadWsapiDataMultiplePages('[type from Blueprint]', params);
}

// ─── Rendering ────────────────────────────────────────────────────────────────
function renderWidget(data, settings) {
  const wrapper = document.getElementById('wrapper');
  wrapper.innerHTML = `
    <div id="controls-container" class="rally-like-controls-container"></div>
    <div id="visualization-container"></div>
  `;
  // renderControls(settings);
  // renderChart(data, settings);   OR   renderTable(data, settings);
}

function renderLoadingState() {
  document.getElementById('wrapper').innerHTML =
    '<div class="rally-alert rally-alert-info">Loading...</div>';
}

function renderError(message) {
  document.getElementById('wrapper').innerHTML =
    `<div class="rally-alert rally-alert-error">${escapeHtml(message)}</div>`;
}

function renderEmptyState() {
  document.getElementById('wrapper').innerHTML =
    '<div class="rally-alert rally-alert-info">No data found for the current filter.</div>';
}

// ─── Settings UI (Edit Mode) ───────────────────────────────────────────────────
function renderSettingsUI(settings) {
  document.getElementById('wrapper').innerHTML = `
    <div id="settings-container" class="rally-like-controls-container"></div>
  `;
  // One createStyledDropdown / createToggleSwitch per setting from the Blueprint
}

// ─── Utilities ─────────────────────────────────────────────────────────────────
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
```

### Data Loading Patterns

**Multiple pages (large datasets):**
```javascript
return await loadWsapiDataMultiplePages('hierarchicalrequirement', params);
```

**Single page (bounded datasets):**
```javascript
return await loadWsapiData('iteration', params);
```

**Multiple artifact types via the artifact endpoint:**
```javascript
const params = {
  types: 'HierarchicalRequirement,Defect',
  fetch: 'FormattedID,Name,_type',
  // ...
};
return await loadWsapiDataMultiplePages('artifact', params);
```

**Collection hydration** (when fetching objects with sub-collections like Tags, Predecessors):
```javascript
const params = {
  fetch: 'FormattedID,Name,Tags',
  collectionsize: MAX_PAGE_SIZE,
  pagesize: MAX_PAGE_SIZE
};
```

### Lookback API (LBAPI) Pattern — no platform helper exists

Unlike WSAPI, there is no example file covering LBAPI, so there is nothing to check a call's signature against before using it — treat any LBAPI code as unverified until it has actually been run against a real workspace. Two consequences follow:

1. **Use the correct LBAPI parameter names** — they differ from WSAPI's, despite the services looking similar:

| Parameter | Purpose | Note |
|---|---|---|
| `find` | Query object (same `{ _TypeHierarchy, _ItemHierarchy: {$in: [...]}, __At: 'current', ... }` shape as the old app used) | |
| `fields` | Which fields to return | **Not** `fetch` — that's WSAPI's name for this |
| `start` | Pagination offset | |
| `pagesize` | Page size | |
| `removeUnauthorizedSnapshots` | Drop snapshots the user can't see instead of erroring | |

The response envelope is `{ Results, TotalResultCount, StartIndex, PageSize, Errors, Warnings }` at the top level — not nested under `QueryResult` like WSAPI.

2. **Guard every field read from an LBAPI response record.** Because there's no verified reference to confirm the response shape against, wrap any array/field access (e.g. `record._ItemHierarchy`) in a check before using it, so a wrong assumption produces a skipped record or a clean error instead of a crash:

```javascript
async function loadLookbackSnapshots(find, fields) {
  const workspaceOID = getObjectIDFromRef($RallyContext.GlobalScope.Workspace._ref);
  const url = `${$RallyContext.Url.origin}/analytics/v2.0/service/rally/workspace/${workspaceOID}/artifact/snapshot/query.js`;

  let allResults = [];
  let start = 0;
  let totalResultCount = Infinity;

  while (start < totalResultCount) {
    const response = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ find, fields, start, pagesize: MAX_PAGE_SIZE, removeUnauthorizedSnapshots: true })
    });

    if (!response.ok) throw new Error(`Lookback API request failed with status ${response.status}`);
    const data = await response.json();
    if (data.Errors?.length) throw new Error(`Lookback API error: ${data.Errors.join(', ')}`);

    const results = data.Results || [];
    allResults = allResults.concat(results);
    totalResultCount = data.TotalResultCount || 0;
    start += data.PageSize || results.length || MAX_PAGE_SIZE;
    if (results.length === 0) break;
  }

  return allResults;
}

// Later, wherever a field from these records is read:
const featureId = Array.isArray(record._ItemHierarchy)
  ? record._ItemHierarchy.find(id => featureIdSet.has(id))
  : null;
```

Because this can't be verified the way a WSAPI call can, always flag any LBAPI code in the widget's README (Step 8) as untested against live data and call out the exact request/response shape assumed, so it's the first thing a reviewer checks if the widget misbehaves.

### Chart Rendering (Highcharts)

```javascript
function renderChart(data, settings) {
  const colors = getColorMap();
  const processedData = processDataForChart(data);

  Highcharts.chart('visualization-container', {
    chart: {
      type: settings.chartType || 'bar',
      style: { fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }
    },
    title: {
      text: '[title from Blueprint]',
      style: { fontSize: '18px', fontWeight: 'bold', color: '#434A54' }
    },
    xAxis: {
      categories: processedData.categories,
      title: { text: '[x-axis label]', style: { color: '#434A54' } },
      labels: { style: { fontSize: '11px', color: '#434A54' } }
    },
    yAxis: {
      min: 0,
      title: { text: '[y-axis label]', style: { fontSize: '14px', color: '#434A54' } },
      labels: { style: { fontSize: '11px', color: '#434A54' } }
    },
    tooltip: { shared: true, crosshairs: true },
    legend: {
      enabled: true,
      align: 'center',
      verticalAlign: 'bottom',
      itemStyle: { fontSize: '14px', color: '#434A54', fontWeight: 'normal' }
    },
    series: processedData.series,
    credits: { enabled: false }
  });
}
```

### Table Rendering (vanilla JS)

```javascript
function renderTable(data, settings) {
  if (!data.length) { renderEmptyState(); return; }

  const container = document.getElementById('visualization-container');
  const rows = data.map(record => `
    <tr>
      <td>${applyFormattedIDTemplate(record)}</td>
      <td>${escapeHtml(record.Name)}</td>
      <td>${escapeHtml(record.ScheduleState || '')}</td>
    </tr>
  `).join('');

  container.innerHTML = `
    <table class="widget-table">
      <thead>
        <tr><th>ID</th><th>Name</th><th>State</th></tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}
```

### Settings Controls (Edit Mode)

```javascript
createStyledDropdown({
  renderTo: 'settings-container',
  id: '[setting-name]-dropdown',
  data: [
    { name: 'Option A', value: 'a' },
    { name: 'Option B', value: 'b' }
  ],
  fieldLabel: '[Label from Blueprint]:',
  value: settings.[settingName],
  fireSelectOnLoad: false,
  onSelect: (selected) => {
    const updatedSettings = { ...$RallyContext.Settings, [settingName]: selected.value };
    window.RallyContext.updateSettings(updatedSettings);
    buildWidget();
  }
});

createToggleSwitch({
  renderTo: 'settings-container',
  id: '[setting-name]-toggle',
  fieldLabel: '[Label from Blueprint]:',
  value: settings.[settingName],
  onToggle: (value) => {
    window.RallyContext.updateSettings({ ...$RallyContext.Settings, [settingName]: value });
    buildWidget();
  }
});
```

### Clickable Artifact Links

```javascript
// In any rendering function — creates a hyperlink to the artifact in Rally
const link = applyFormattedIDTemplate(record);
cell.innerHTML = link;
```

### Drilldown Modals

```javascript
// Show a modal table when the user clicks a chart point or table row
showDetailsModal('Items in this bucket', items, [
  { key: 'FormattedID', header: 'ID', template: applyFormattedIDTemplate },
  { key: 'Name', header: 'Name' },
  { key: 'Owner', header: 'Owner', template: (r) => r.Owner?.DisplayName || '—' }
]);
```

### Profile Images with Fallback

```javascript
function getProfileImageUrl(size, userRef) {
  const oid = getObjectIDFromRef(userRef);
  return `${$RallyContext.Url.origin}/slm/profile/image/${oid}/${size}.sp`;
}

const userInitial = userName.charAt(0).toUpperCase();
const fallbackSvg = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23ccc'/%3E%3Ctext x='50' y='50' text-anchor='middle' dy='.3em' font-size='40' fill='%23fff'%3E${userInitial}%3C/text%3E%3C/svg%3E`;

// In HTML — falls back to an initial-letter avatar if the profile image 404s
`<img src="${profileUrl}" onerror="this.src='${fallbackSvg}'" alt="${userName}" />`;
```

### Pagination (Load More)

An alternative to `loadWsapiDataMultiplePages` for widgets that should load incrementally rather than fetch everything up front (e.g. an activity feed). Uses a compound cursor (timestamp + ObjectID tiebreaker) instead of `start`/`pagesize` paging, so new items created during the session don't shift already-loaded pages:

```javascript
let currentStore = [];
let hasMoreData = true;
let isLoadingMore = false;

async function loadMore() {
  if (isLoadingMore || !hasMoreData) return;

  isLoadingMore = true;
  renderList(); // Show loading indicator

  try {
    const oldestItem = currentStore[currentStore.length - 1];
    const paginationQuery = oldestItem
      ? `((CreationDate < "${oldestItem.CreationDate}") OR ` +
        `((CreationDate = "${oldestItem.CreationDate}") AND (ObjectID < ${oldestItem.ObjectID})))`
      : null;

    const results = await loadWsapiData(type, { ...params, query: constructQuery([params.query, paginationQuery].filter(Boolean), 'AND') });

    currentStore = [...currentStore, ...results];
    hasMoreData = results.length >= params.pagesize;
  } catch (error) {
    console.error('Failed to load more:', error);
    hasMoreData = false;
  } finally {
    isLoadingMore = false;
    renderList();
  }
}
```

---

## Step 5: Generate `widget.html` (multi-file format only)

**Skip this step for the default single-file output.** For the single file, use this same overall shape (one `<style>` block with all CSS, the `$RallyContext:Begin/End` comment in its own `<script>` block, then one more `<script>` block with all the JS from Step 4 inlined) but with everything in the one file — no `<link>` tags, no `type="module"` script `src`.

If the multi-file format was explicitly requested: match the structure from `rally-widgets/widget-template/widget.html` exactly. The `$RallyContext:Begin/End` comments **must** appear in a separate `<script>` block — this is what triggers Rally to inject the context object.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>[Widget Name from Blueprint]</title>
  <link href="http://localhost:8000/widget.css" rel="stylesheet" />
</head>
<body>
  <div id="wrapper"></div>

  <!-- Add this line only if the Blueprint requires a chart -->
  <script src="https://code.highcharts.com/highcharts.js"></script>

  <script>
    // $RallyContext:Begin
    // $RallyContext:End
  </script>
  <script type="module" src="http://localhost:8000/widget.js"></script>
</body>
</html>
```

**Critical notes:**
- The `// $RallyContext:Begin` and `// $RallyContext:End` comments are required exactly as shown — missing them means `$RallyContext` will be undefined
- The `localhost:8000` references are for local development; the build script replaces them with inline `<style>` and `<script>` for Rally deployment
- `type="module"` on the widget script tag is required for ES6 imports to work

---

## Step 6: Generate `widget.css` (multi-file format only)

**Skip this step for the default single-file output** — put these same styles directly in the single file's `<style>` block instead of a separate `.css` file.

If the multi-file format was explicitly requested: start from Rally styling conventions. Translate any styles from the old app's CSS to vanilla CSS — never reference Ext JS class names (`.x-panel`, `.x-grid-cell`, etc.).

```css
:root {
  --rally-primary-text: #434A54;
  --rally-label: #58606e;
  --rally-border: rgba(0, 0, 0, 0.453);
}

#wrapper {
  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
  color: var(--rally-primary-text);
  padding: 8px;
}

/* Tables */
.widget-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.widget-table th {
  text-align: left;
  padding: 8px 12px;
  background: #f5f6f7;
  border-bottom: 2px solid var(--rally-border);
  font-size: 12px;
  color: var(--rally-label);
  font-weight: 600;
}

.widget-table td {
  padding: 8px 12px;
  border-bottom: 1px solid #e8e9eb;
  vertical-align: middle;
}

.widget-table tr:hover td {
  background: #f9fafb;
}
```

### Rally Color Palette

```javascript
// Available via getColorMap() from ui-utilities.js
{
  Teal: "#188F85", Orange: "#CC8304", Purple: "#AD77D4",
  Green: "#3F9E20", Red: "#E65D4E", Blue: "#6D7CC9",
  Yellow: "#9E9600", Pink: "#E65C81", Steel: "#4288A6",
  Taupe: "#968C7B"
}
```

### Alert Message Classes (built in to widget.css via template)

```html
<div class="rally-alert rally-alert-error">Error message</div>
<div class="rally-alert rally-alert-warning">Warning message</div>
<div class="rally-alert rally-alert-info">Info message</div>
<div class="rally-alert rally-alert-success">Success message</div>
```

### Typography

- Font family: `"Helvetica Neue", Helvetica, Arial, sans-serif`
- Primary text color: `#434A54`
- Body text: 14px regular
- Headings: H2 28px bold, H3 22px bold, H4 18px bold
- Labels: 12px, color `#58606e`

### Button Classes

`ui-utilities.js`'s `createToggleStyledButton()` renders elements with classes `rally-button`, `rally-button-secondary`, and `rally-button-small` — but **none of these classes are defined anywhere** (not in `ui-utilities.css`, not in the widget template). Any widget using buttons must define them itself in `widget.css` (or the single file's `<style>` block):

```css
.rally-button {
  height: 32px;
  padding: 6px 16px;
  border: 1px solid #1d5bbf;
  border-radius: 3px;
  background-color: #1d5bbf;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}
.rally-button:hover { background-color: #164a99; }
.rally-button-secondary { background-color: #fff; color: #1d5bbf; border-color: #1d5bbf; }
.rally-button-secondary:hover { background-color: #f0f5fc; }
.rally-button-small { height: 24px; padding: 3px 10px; font-size: 11px; }
```

---

## Step 7: Copy Build Scaffolding (multi-file format only)

**Skip this step entirely for the default single-file output** — there is no build step; the single `.html` file is already deploy-ready as-is.

If the multi-file format was explicitly requested: after generating the three widget files, copy the build scaffolding from the template so the project is immediately runnable and deployable:

Copy these files verbatim from `rally-widgets/widget-template/` into the output folder:
- **`build.js`** — esbuild-based bundler that produces a single-file deploy HTML
- **`build.config.json`** — tells the build script which files to bundle (update `js_entry` if the output filename differs from `widget.js`)
- **`package.json`** — contains `npm run start` (http-server on port 8000) and `npm run build`

To run the widget locally after setup:
```bash
cd [output_path]
npm install
npm run start    # serves on http://localhost:8000
```

To build the single-file deploy HTML:
```bash
npm run build    # produces deploy/[widget-name]-deploy.html
```

---

## Step 8: Document Migration Limitations

Create a `[widget-name].README.md` file alongside the widget (in the same location — for the single-file output, next to the `.html` file; for the multi-file output, in the project folder). In it, document:
- Any item from the Blueprint's "Migration Notes" table that could not be fully replicated: what it was, why it couldn't be replicated, and what was done instead
- Any deliberate simplifications or deviations made during conversion (e.g., a schema assumption, a dropped setting, a flattened hierarchy) and why
- Anything a reviewer should double-check against the real workspace before deploying (e.g., a field assumed to exist on a type)
- If the widget includes any Lookback API (LBAPI) code, explicitly flag it as untested against live data, and state the exact request/response shape it assumes (see the LBAPI Pattern under Data Loading Patterns) — this is the first thing to check if the widget misbehaves

Do not put this information in a code comment inside the widget file itself — it belongs only in the README.

---

## Step 9: Summarize the Output

After generating all files, present the user with:

1. **Files generated** — list of all created files with their paths
2. **How to deploy:**
   - Single-file output (default): paste the `.html` file's contents into the Custom HTML Widget's *HTML Source* configuration field
   - Multi-file output (only if explicitly requested): `npm install && npm run start` for local dev, `npm run build` and where to paste the resulting deploy HTML
3. **Behavioral differences** — anything that works differently from the original app
4. **Features not migrated** — anything from the Blueprint that was not implemented and why
5. Point the user to the `[widget-name].README.md` from Step 8 for full migration-limitation details

---

## $RallyContext Reference

The `$RallyContext` object is injected by Rally when the widget loads. Use it for all context access:

```javascript
const $RallyContext = {
  GlobalScope: {
    Project: { Name, _ref, ObjectID },        // Current project
    ProjectScopeDown: boolean,                 // Include child projects
    ProjectScopeUp: boolean,                   // Include parent projects
    Workspace: { Name, _ref, ObjectID }        // Current workspace
  },
  ViewFilter: {
    Type: 'Milestone' | 'Release' | 'Iteration' | null,
    Value: { Name, _ref, FormattedID, ... }    // Selected filter object
  },
  Schema: [],                                  // Workspace schema
  Settings: {},                                // User-defined widget settings
  isEditMode: boolean,                         // true = Edit Mode
  User: { UserName, DisplayName, _ref, ObjectID },
  Url: { origin, href, hashQueryString, ... },
  WidgetName: string,
  WidgetUUID: string,
  Subscription: {}
};
```

**Key rules:**
- Always merge user settings with `defaultSettings`: `{ ...defaultSettings, ...$RallyContext.Settings }`
- Only call `window.RallyContext.updateSettings()` when `$RallyContext.isEditMode === true`
- Use `$RallyContext.ViewFilter.Value.Name` for Release and Iteration (not ObjectID or `_ref`)
- Use `$RallyContext.ViewFilter.Value.FormattedID` for Milestone, and remove project scoping params

---

## Available Utility Functions

### utilities/utility.js

| Function | Description |
|---|---|
| `loadWsapiData(type, params, returnRaw)` | Load single page of WSAPI data |
| `loadWsapiDataMultiplePages(type, params)` | Load all pages automatically (recursive) |
| `fetchWsapiObject(ref, fetchFields)` | Fetch single object by `_ref` |
| `updateWsapiObject(ref, fieldsToUpdate, securityToken)` | Update an object (requires security token) |
| `constructQuery(queryClauses, operator)` | Build complex WSAPI queries from clause array |
| `getRelativeRef(ref)` | Extract relative ref from full URL |
| `getObjectIDFromRef(ref)` | Extract ObjectID from `_ref` |
| `getAllowedValues(typeDef, fieldName, fieldAttribute)` | Get allowed values for a field from Schema |
| `getPortfolioItemTypeDefinitions()` | Get portfolio item hierarchy |
| `getLowestLevelPortfolioItemType()` | Get Feature type path |
| `getMostRecentTimeboxes(timeboxType, numTimeboxes)` | Get recent iterations/releases |
| `getTimeboxProgress(timebox)` | Calculate timebox completion percentage |
| `getSecurityToken()` | Get security token for update/delete operations |
| `MAX_PAGE_SIZE` | Constant: 2000 |

### utilities/ui-utilities.js

| Function | Description |
|---|---|
| `createStyledDropdown(config)` | Rally-styled dropdown with label |
| `createMultiSelectDropdown(config)` | Multi-select dropdown with tags |
| `createToggleSwitch(config)` | Toggle switch component |
| `createToggleStyledButton(config)` | Toggle button |
| `addVisualizationContainer(containerId, parentId)` | Main content container |
| `addHorizontalControlsContainer(containerId, parentId)` | Horizontal controls row |
| `addVerticalControlsContainer(containerId, parentId)` | Vertical controls column |
| `showDetailsModal(title, items, columns)` | Modal dialog with table |
| `createItemTable(items, tableId, columns, headers)` | HTML table from data |
| `applyFormattedIDTemplate(record)` | Clickable FormattedID link to artifact |
| `getColorMap()` | Rally color palette object |
| `getTemplateText()` | Default template context info |

---

## Best Practices Checklist

### Performance
- Fetch only the fields actually used in `fetch`/`fields` params — don't pull whole objects
- Cache DOM element references instead of re-querying `document.getElementById()` on every render
- Batch DOM updates (build an HTML string / DOM fragment, then set `innerHTML`/append once) rather than mutating the DOM in a loop
- Use `MAX_PAGE_SIZE` with `loadWsapiDataMultiplePages` for large datasets

### Security
- Never use `eval()`
- Escape all user-generated content before inserting into the DOM (see `escapeHtml()` in Step 4)
- Use `getSecurityToken()` for any update/delete operation — never write to WSAPI without it

### Accessibility
- Use semantic HTML elements (`<button>`, `<table>`, `<label>`) rather than styled `<div>`s where a native element fits
- Add ARIA labels to icon-only buttons and custom controls (dropdowns, toggles) that don't have visible text
- Ensure custom controls (multi-select dropdown, toggle switch) are keyboard-operable, not just click-operable
- Check color contrast on custom status colors/badges against their background

### Networking
- Build URLs from `$RallyContext.Url.origin` (as `loadWsapiData`/`loadLookbackSnapshots` do) rather than a hardcoded domain — a hardcoded domain is a common source of CORS errors when the widget runs in a different Rally environment (e.g. a different data center) than the one it was built against
