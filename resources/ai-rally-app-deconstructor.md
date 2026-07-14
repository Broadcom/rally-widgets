# App Deconstructor Skill

Analyze an old Rally SDK/ExtJS Custom HTML app and produce a structured **Blueprint** document that fully describes its behavior. The Blueprint is the source of truth for converting the app into a modern Rally HTML Widget.

**Standalone use:** This skill does not require any other workflow phase. Provide the old app code and this skill produces a `blueprint.md` output.

---

## Input

The user provides the old app in one of three ways:
- **File path** — a single `.html` or `.js` file: read it directly
- **Folder path** — a directory containing the app: list and read every `.html`, `.js`, and `.css` file before proceeding
- **Pasted code** — treat it as the primary source file

**If a folder is provided:** Do not skip any files. Rally SDK apps frequently split logic across multiple files (e.g., `App.js`, `config.js`, `util.js`, custom component files).

---

## Step 1: Read All App Files

Read every relevant file before performing any analysis. Confirm you have read all files before proceeding to Step 2.

---

## Step 2: Identify the App Framework

Determine which SDK entry point the app uses:

**Pattern A — Classic `App.extend`:**
```javascript
Ext.define('CustomApp.app.App', {
    extend: 'Rally.app.App',
    launch: function() { ... }
});
```

**Pattern B — Module-style (`Rally.onReady`):**
```javascript
Rally.onReady(function() { ... });
```

**Pattern C — Minimal SDK (direct WSAPI calls):**
```javascript
// Uses Rally.data.wsapi.Store or Rallydev.data.wsapi.DataStore directly
// May have minimal or no Ext.define wrapper
```

Note the SDK version if visible in a `<script>` tag (e.g., `sdk.js?v=2.1`).

**This step is for internal analysis only.** The framework/entry-point pattern and SDK version identified here inform the Migration Notes in Step 4 — they are not written into the Blueprint output itself (the Blueprint has no "SDK Entry Point" section).

---

## Step 3: Extract Each Behavioral Dimension

Work through each dimension below systematically. Use the source code only to locate and confirm behavior — every description you write into the Blueprint must be plain, implementation-neutral English that describes *what the app does*, not *how the old SDK does it*.

**Do not copy source-code snippets, class names, component names, `xtype`/`ptype` values, method names, or any other App SDK-specific identifier into the Blueprint output.** If you catch yourself writing `Ext.define`, `Rally.ui.*`, `xtype:`, `ptype:`, or similar into a Blueprint section other than Migration Notes / Suggested HTML Widget Analog (Step 5), rewrite it as a plain description instead. For example, write "shows a bar chart with one series per status" rather than "renders a `Rally.ui.chart.Chart` with `chartType: 'bar'`". The only places old-SDK terminology belongs are the **Migration Notes** and **Suggested HTML Widget Analog** sections of the Blueprint, where naming both the old pattern and its replacement is the point.

### 3.1 — WSAPI Data Loaded

Find all data-loading code. Look for:
- `Ext.create('Rally.data.wsapi.Store', {...})`
- `Ext.create('Rallydev.data.wsapi.DataStore', {...})`
- `Rally.data.PreferenceManager.load()`
- Direct `Ext.Ajax.request` calls to `/slm/webservice/`
- `{xtype:'rallygrid',...}` or `{xtype:'rallychart',...}` which imply inline data loading

For each store or query found, extract:
- **Type / endpoint** (e.g., `HierarchicalRequirement`, `Defect`, `artifact`, `PortfolioItem/Feature`)
- **Fetch fields** (the `fetch` array or string)
- **Static filters** (hardcoded in the store config)
- **Dynamic query** (built at runtime)
- **Page size** and whether recursive paging is used
- **Sort order** if specified
- **Scope** — does it reference `context: this.getContext()`? Does it scope to project, release, or iteration?

> **Note on User Story type:** In the HTML Widget platform, the TypeDefinition name for User Story is `HierarchicalRequirement`.

### 3.2 — ViewFilter / Timebox Dependency

Does the app respond to the Rally page-level timebox scope (Release, Iteration, or Milestone)?

Look for:
- `this.getContext().getTimeboxScope()`
- `timeboxScope.getQueryFilter()`
- `Rally.app.TimeboxScope`
- Event listeners for `timeboxscopechange`

If yes: note which timebox types are supported (Release / Iteration / Milestone) and how the query is modified when a timebox is selected.

### 3.3 — Project Scope

Does the app use project scoping beyond the default?
- `this.getContext().getProject()`
- `project: this.getContext().getProject()._ref`
- `projectScopeUp` / `projectScopeDown` settings

### 3.4 — Settings Fields

Find `getSettingsFields()`. For each field in the returned array:
- **Field name** (the `name` property)
- **Type** (dropdown, text, checkbox, toggle, etc.)
- **Label** shown to the user
- **Default value**
- **Allowed values** (for dropdowns, the `store` or `data` array)
- **Effect** — trace `this.getSetting('fieldName')` call sites to explain what the setting controls

### 3.5 — Rendering / UI

What does the app render? Look for:
- `Rally.ui.chart.Chart` → what chart type (line, bar, pie, column, etc.)? What are the axes?
- `Rally.ui.grid.Grid` → what columns are defined?
- `Ext.create('Ext.panel.Panel', ...)` → custom panel layouts
- Direct DOM manipulation (`Ext.get(...)`, `document.getElementById(...)`)
- Custom templates (`Ext.XTemplate`, `tpl` configs)

For each rendered component:
- What data feeds into it?
- What does the user see (chart, table, card list, etc.)?
- What are the column headers / axis labels / series names?

### 3.6 — User Interactions

Find all user-triggered actions:
- Button click handlers
- Dropdown `select` listeners
- Grid row click / `recordclick` handlers
- Chart point click handlers (`pointclick`, `click` events on series)
- `Rally.nav.Manager.showDetail()` calls (artifact navigation/drill-through)

For each interaction, capture:
- **Trigger** — what the user does
- **Effect** — what happens (filter the data, navigate to an artifact, show a modal, reload the widget, etc.)

### 3.7 — Error Handling & Loading States

- Does the app show a loading mask? (`mask`, `unmask`, `Rally.ui.notify.Notifier`)
- Does it handle load failures? (`load` failure callbacks, `exception` listeners)
- Are there empty-state messages shown when no data is returned?

---

## Step 4: Assess Migration Complexity

For each item in the behavioral spec, note its migration difficulty using this SDK → HTML Widget translation guide:

| Old SDK Pattern | New HTML Widget Pattern | Notes |
| :--- | :--- | :--- |
| `Rally.app.App` / `Ext.define` with `extend:'Rally.app.App'` | `window.addEventListener('message', ...)` for `RALLY_CONTEXT_LOADED` | Straightforward |
| `this.getContext().getProject()` | `$RallyContext.GlobalScope.Project` | Direct replacement |
| `this.getContext().getTimeboxScope()` | `$RallyContext.ViewFilter` | Direct replacement |
| `getSettingsFields()` return array | `createStyledDropdown()` / `createToggleSwitch()` in `isEditMode` block | Redesigned pattern |
| `this.getSetting('fieldName')` | `$RallyContext.Settings.fieldName` | Direct replacement |
| `Rally.data.wsapi.Store` | `loadWsapiData()` or `loadWsapiDataMultiplePages()` | Straightforward |
| `Rally.ui.chart.Chart` | `Highcharts.chart()` | Straightforward |
| `Rally.ui.grid.Grid` | Vanilla JS table or GridJS | Some manual column work |
| `Rally.nav.Manager.showDetail()` | `applyFormattedIDTemplate()` from `ui-utilities.js` | Direct replacement |
| `this.getContext().getWorkspace()` | `$RallyContext.GlobalScope.Workspace` | Direct replacement |
| `Rally.environment.getContext()` | `$RallyContext` | Direct replacement |
| `Rally.data.PreferenceManager` | `$RallyContext.Settings` (widget-level only) | **Limitation** — user-scoped preferences not supported |
| Complex Ext JS layouts (accordion, tabs, nested panels) | Single-view HTML layout | **Limitation** — simplify to one view |
| `Rally.ui.picker.MultiObjectPicker` | Custom multi-select dropdown | **Moderate effort** — build custom UI |
| SDK-managed infinite scroll / paging | `loadWsapiDataMultiplePages()` fetches all pages | Straightforward |

Flag any item that is a **Limitation** (cannot be fully replicated) or **Moderate/High effort** in the Migration Notes section of the Blueprint.

---

## Step 5: Compile the Blueprint

Produce the complete Blueprint in exactly the format below. Write it as if it is the only document the widget builder will have — include all relevant details.

---

```markdown
# Blueprint: [App Name]

## Summary

[1–3 sentence plain-English description of what the app does and its primary value to the user. Do not mention the old SDK, framework, or implementation here.]

---

## Data Loaded

| # | Endpoint / Type | Fetch Fields | Static Filters | Dynamic Filters | Timebox-Scoped? | Project-Scoped? | Page Size |
|---|---|---|---|---|---|---|---|
| 1 | `HierarchicalRequirement` | FormattedID, Name, Owner, ScheduleState, PlanEstimate | ScheduleState != Accepted | None | Yes — Release | Yes (scopeDown) | 200 |
| 2 | … | … | … | … | … | … | … |

---

## Settings

| Field Name | Type | Label | Default | Allowed Values | Effect on Widget |
|---|---|---|---|---|---|
| `chartType` | dropdown | Chart Type | `bar` | bar, line, column | Switches chart type |
| … | … | … | … | … | … |

---

## ViewFilter Handling

[Describe how the app responds to the page-level Release / Iteration / Milestone filter, or state "Not used".
Include which timebox types are supported and how the query changes when a timebox is active.]

---

## Rendering

### [Component 1 — e.g., Bar Chart]

- **Type:** [Highcharts bar chart / vanilla table / card list / etc.]
- **Data source:** [Which data store feeds this component]
- **X-axis / Columns:** [Field names and labels]
- **Y-axis / Values:** [What is being measured]
- **Series / Grouping:** [How data is grouped, e.g., by ScheduleState]
- **What the user sees:** [Plain-English description]

### [Component 2 — if applicable]

[Repeat as needed]

---

## User Interactions

| Trigger | Effect |
|---|---|
| Click chart bar | Opens drill-down modal showing items in that bar |
| Select dropdown | Re-queries data with new filter, re-renders chart |
| Click FormattedID | Navigates to artifact detail page in Rally |
| … | … |

---

## Error / Loading States

- **Loading state:** [e.g., Shows a loading message while WSAPI data is fetched]
- **Empty state:** [e.g., Shows "No data found" message when result set is empty]
- **Error state:** [e.g., Shows error message if WSAPI call fails]

---

## Migration Notes

[List any features that are difficult or impossible to replicate, along with suggested workarounds.]

| Feature | Issue | Suggested Workaround |
|---|---|---|
| `Rally.data.PreferenceManager` | User-scoped preferences not available in HTML Widgets | Use `$RallyContext.Settings` (widget-level only) |
| … | … | … |

---

## Suggested HTML Widget Analog

[From the endorsed-widgets library, identify the closest analog for reference during conversion:]
- `timebox-dashboard` — if the spec involves iteration/release reporting
- `pi-cycle-time-chart` — if the spec involves a Highcharts chart
- `blocked-work` — if the spec involves a list/table with status indicators
- `recent-activity` — if the spec involves pagination or feed-style rendering
- `test-set-results-by-iteration` — if the spec involves test data or iteration grouping
- `context-text-field-editor` — if the spec involves editing artifact fields
```

---

## Step 6: Save and Confirm

1. **Save** the Blueprint as `blueprint.md` in the same directory as the input app (or a location specified by the user).

2. **Present** the Blueprint to the user and ask:

> "Does this accurately describe what your old app does? Please confirm or correct anything before I proceed — this Blueprint will be used as the input for the Widget Builder."

**Do not proceed to widget conversion until the user confirms the Blueprint.**
