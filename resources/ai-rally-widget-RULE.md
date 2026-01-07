---
description:  This rule provides guidance for building a Rally HTML Widget from scratch, or for converting an old Rally SDK-based HTML app to a new HTML Widget.  
alwaysApply: false
---
# Rally HTML Widget Development Rules

## Project Context
You are developing Rally HTML Widgets - self-contained web components that run inside the Rally platform. These widgets do NOT support Rally SDK or Ext JS. Use vanilla JavaScript with ES6+ modules.

## 1. Requirement Check (CRITICAL)
When the user asks to build a new widget, you must first determine the **Output Format**. Do not make assumptions about what the user wants unless they specify explicitly.  

If the user has not specified a format, **STOP and ask**:
> "Would you like to set up a full **Development Environment** (separate JS/CSS/HTML files) or generate a **Single-File Deployment** (everything in one HTML file)?"

## 2. Output Modes

### Mode A: Development Environment (Preferred)
* **Goal:** Create a clean, maintainable project structure.
* **Action:** Copy the folder structure from `widget-template/` and all of the files in it.
* **Structure:**
    * `widget.html` (Links to external JS/CSS)
    * `widget.css` 
    * `widget.js` (Contains logic)
    * `README.md`
    * `build.js` (Contains a build script to create one single deploy file)
    * `build.config.json` (Used to indicate what files to include in the build)
    * `package.json` (needed to install dependencies using npm install)

### Mode B: Single-File Deployment
* **Goal:** Create a file ready to paste directly into a Rally Custom HTML Page.
* **Action:** Use `widget-template/widget.html` as the base, replacing the `<link>` tag referencing `http://localhost:8000/widget.css` with `<style>` tags that include the css and replacing the `<script>` tag referencing `http://localhost:8000/widget.js` file with `<script>` tags that include the javascript.
* **Constraint:** All CSS must be in `<style>` tags and all JS in `<script>` tags within the file. Do not create external links.
* **Dependencies:** Note how `widget.html` references the local `.js` and `.css` files in that folder.

## Critical Constraints
- **NO Rally SDK or Ext JS** - These are not available in HTML Widgets
- Use `loadWsapiData` or `loadWsapiDataMultiplePages` from `utilities/utility.js` instead of Rally WSAPI Store objects
- Charts: Use **Highcharts** unless otherwise specified
- Tables: Use vanilla JavaScript tables, GridJS, or similar open-source libraries
- Authentication is handled via Rally session (no additional auth code needed)
- The `$RallyContext` object is injected by Rally and provides all context

## Reference Architecture
Before generating code, you must review the contents of the `widget-template/` folder and all of the deploy files in the `endorsed-widgets/` folder.

---

**CRITICAL**: The `// $RallyContext:Begin` and `// $RallyContext:End` comments are REQUIRED for the $RallyContext object to be injected.
**CRITICAL**: The TypeDefinition for a User Story is called `HierarchicalRequirement`

## $RallyContext Object Reference
The $RallyContext object provides key information about the context that the HTML Widget is running in.  This is helpful for responding to View Filter selections and navigation scope changes.   

```javascript
const $RallyContext = {
    GlobalScope: {
        Project: { Name, _ref, ObjectID },      // Current project
        ProjectScopeDown: boolean,               // Include child projects
        ProjectScopeUp: boolean,                 // Include parent projects
        Workspace: { Name, _ref, ObjectID }     // Current workspace
    },
    ViewFilter: {
        Type: 'Milestone' | 'Release' | 'Iteration' | null,
        Value: { Name, _ref, FormattedID, ... } // Selected filter object
    },
    Schema: [],          // Workspace schema (types, attributes, allowed values)
    Settings: {},        // User-defined settings from widget configuration
    isEditMode: boolean, // true = Edit Mode, false = View Mode
    User: {
        UserName, DisplayName, _ref, ObjectID
    },
    Url: {
        origin, href, hashQueryString, ...
    },
    WidgetName: string,
    WidgetUUID: string,
    Subscription: {}     // Subscription metadata
};
```

**Key Points:**
- `Settings` are user-configured values; always merge with `defaultSettings`
- `isEditMode` determines if settings UI should be shown
- `window.RallyContext.updateSettings()` ONLY works in Edit Mode
- Use `ViewFilter` to scope data to current Release/Iteration/Milestone
- Use `Schema` to programmatically access available Type Definitions, Attribute Definitions for the current scope 

---

## Data Loading Patterns
Reference the `loadWsapiData` and `loadWsapiDataMultiplePages` examples in the utility.js file for loading WSAPI data

### Using the Artifact Endpoint with Types
```javascript
const params = {
    types: 'HierarchicalRequirement,Defect',  // Query multiple types at once
    fetch: 'FormattedID,Name,_type',
    // ... other params
};
const results = await loadWsapiDataMultiplePages('artifact', params);
```

### Query Construction
```javascript
const queryClauses = [];
queryClauses.push('(ScheduleState = "Accepted")');
queryClauses.push('(AcceptedDate >= "2024-01-01T00:00:00.000Z")');

// Add ViewFilter context
if ($RallyContext.ViewFilter.Type === 'Release') {
    queryClauses.push(`(Release.Name = "${$RallyContext.ViewFilter.Value.Name}")`);
}

// Add user-defined query if present
if ($RallyContext.Settings.query) {
    queryClauses.push(`(${$RallyContext.Settings.query})`);
}

const query = constructQuery(queryClauses, 'AND'); // Default operator is 'AND'
```

### ViewFilter Handling
```javascript
if ($RallyContext.ViewFilter.Type === 'Release') {
    // Use Name for Release filters, NOT ObjectID or _ref
    queryClauses.push(`(Release.Name = "${$RallyContext.ViewFilter.Value.Name}")`);
}

if ($RallyContext.ViewFilter.Type === 'Iteration') {
    // Use Name for Iteration filters
    queryClauses.push(`(Iteration.Name = "${$RallyContext.ViewFilter.Value.Name}")`);
}

if ($RallyContext.ViewFilter.Type === 'Milestone') {
    // For Milestones, use FormattedID and REMOVE project scoping
    queryClauses.push(`(Milestones.FormattedID = "${$RallyContext.ViewFilter.Value.FormattedID}")`);
    delete params.project;
    delete params.projectScopeUp;
    delete params.projectScopeDown;
}
```

### Collection Hydration
When fetching objects with collections (e.g., Predecessors, Successors, Tags):
```javascript
const params = {
    fetch: 'FormattedID,Name,Predecessors,Successors',
    collectionsize: MAX_PAGE_SIZE,  // Hydrate collections up to 2000 items
    pagesize: MAX_PAGE_SIZE
};
```

---

## Utility Functions Reference

### utilities/utility.js

| Function | Description |
|----------|-------------|
| `loadWsapiData(type, params, returnRaw)` | Load single page of WSAPI data |
| `loadWsapiDataMultiplePages(type, params)` | Load all pages automatically (recursive) |
| `fetchWsapiObject(ref, fetchFields)` | Fetch single object by _ref |
| `updateWsapiObject(ref, fieldsToUpdate, securityToken)` | Update an object (requires security token) |
| `constructQuery(queryClauses, operator)` | Build complex WSAPI queries |
| `getRelativeRef(ref)` | Extract relative ref from full URL |
| `getObjectIDFromRef(ref)` | Extract ObjectID from _ref |
| `getAllowedValues(typeDef, fieldName, fieldAttribute)` | Get allowed values for a field from Schema |
| `getPortfolioItemTypeDefinitions()` | Get portfolio item hierarchy |
| `getLowestLevelPortfolioItemType()` | Get Feature type path |
| `getMostRecentTimeboxes(timeboxType, numTimeboxes)` | Get recent iterations/releases |
| `getTimeboxProgress(timebox)` | Calculate timebox completion percentage |
| `getSecurityToken()` | Get security token for updates/deletes |
| `MAX_PAGE_SIZE` | Constant: 2000 |

### utilities/ui-utilities.js

| Function | Description |
|----------|-------------|
| `createStyledDropdown(config)` | Rally-styled dropdown with label |
| `createMultiSelectDropdown(config)` | Multi-select dropdown with tags |
| `createToggleSwitch(config)` | Toggle switch component |
| `createToggleStyledButton(config)` | Toggle button |
| `addVisualizationContainer(containerId, parentId)` | Main content container |
| `addHorizontalControlsContainer(containerId, parentId)` | Horizontal controls row |
| `addVerticalControlsContainer(containerId, parentId)` | Vertical controls column |
| `showDetailsModal(title, items, columns)` | Modal dialog with table |
| `createItemTable(items, tableId, columns, headers)` | HTML table from data |
| `applyFormattedIDTemplate(record)` | Clickable FormattedID link |
| `getColorMap()` | Rally color palette object |
| `getTemplateText()` | Default template context info |

### Dropdown Configuration Example
```javascript
createStyledDropdown({
    renderTo: 'controls-container',
    id: 'bucket-type-dropdown',
    data: [
        { name: 'Month', value: 'month' },
        { name: 'Week', value: 'week' },
        { name: 'Day', value: 'day' }
    ],
    fieldLabel: 'Bucket Type:',
    value: $RallyContext.Settings.bucketType || 'month',
    fireSelectOnLoad: false,
    onSelect: (selected) => {
        const updatedSettings = { ...$RallyContext.Settings, bucketType: selected.value };
        window.RallyContext.updateSettings(updatedSettings);
        buildWidget(); // Rebuild with new settings
    }
});
```

---

## Styling Guidelines

### Rally Color Palette
```javascript
const colors = getColorMap();
// Returns:
{
    Teal: "#188F85",    Orange: "#CC8304",  Purple: "#AD77D4",
    Green: "#3F9E20",   Red: "#E65D4E",     Blue: "#6D7CC9",
    Yellow: "#9E9600",  Pink: "#E65C81",    Steel: "#4288A6",
    Taupe: "#968C7B"
}
```

### Alert Message Classes
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
- H4: 18px bold, H3: 22px bold, H2: 28px bold
- Labels: 12px, color `#58606e`

### Button Classes
```html
<button class="rally-button rally-button-primary">Primary</button>
<button class="rally-button rally-button-secondary">Secondary</button>
<button class="rally-button rally-button-small">Small</button>
```

### Form Field Styling
- Height: 32px
- Padding: 6px 8px
- Border: 1px solid rgba(0, 0, 0, 0.453)
- Border radius: 4px

---

## Highcharts Configuration Pattern

```javascript
import { getColorMap } from '../utilities/ui-utilities.js';

const colors = getColorMap();

Highcharts.chart('chart-container', {
    chart: {
        type: 'line',
        height: 400,
        style: {
            fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'
        }
    },
    title: {
        text: 'Chart Title',
        style: { fontSize: '18px', fontWeight: 'bold', color: '#434A54' }
    },
    subtitle: {
        text: 'Subtitle text',
        style: { fontSize: '14px', color: '#434A54' }
    },
    xAxis: {
        categories: ['Jan', 'Feb', 'Mar'],
        title: { text: 'X Axis', style: { fontSize: '14px', color: '#434A54' } },
        labels: { style: { fontSize: '11px', color: '#434A54' } }
    },
    yAxis: {
        min: 0,
        title: { text: 'Y Axis', style: { fontSize: '14px', color: '#434A54' } },
        labels: { style: { fontSize: '11px', color: '#434A54' } }
    },
    tooltip: {
        shared: true,
        crosshairs: true
    },
    legend: {
        enabled: true,
        align: 'center',
        verticalAlign: 'bottom',
        itemStyle: { fontSize: '14px', color: '#434A54', fontWeight: 'normal' }
    },
    series: [
        { name: 'User Stories', data: [10, 20, 30], color: colors.Green },
        { name: 'Defects', data: [5, 10, 15], color: colors.Red }
    ],
    credits: { enabled: false }  // Disable Highcharts branding
});
```

---

## Common Patterns

### Settings UI in Edit Mode
```javascript
function addSettingsControls() {
    if (!$RallyContext.isEditMode) return;
    
    const wrapper = document.getElementById('wrapper');
    wrapper.innerHTML = `
        <div id="controls-container" class="rally-like-controls-container"></div>
        <div id="chart-container"></div>
    `;
    
    createStyledDropdown({
        renderTo: 'controls-container',
        id: 'my-dropdown',
        data: options,
        fieldLabel: 'Select Option:',
        value: $RallyContext.Settings.myOption,
        onSelect: (selected) => {
            window.RallyContext.updateSettings({ 
                ...$RallyContext.Settings, 
                myOption: selected.value 
            });
            buildWidget();
        }
    });
}
```

### Clickable FormattedID Links
```javascript
import { applyFormattedIDTemplate } from '../utilities/ui-utilities.js';

// In rendering function
const formattedIDLink = applyFormattedIDTemplate(artifact);
cell.innerHTML = formattedIDLink; // Creates clickable link to artifact
```

### Profile Images with Fallback
```javascript
function getProfileImageUrl(size, userRef) {
    const oid = getObjectIDFromRef(userRef);
    return `${$RallyContext.Url.origin}/slm/profile/image/${oid}/${size}.sp`;
}

const userInitial = userName.charAt(0).toUpperCase();
const fallbackSvg = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23ccc'/%3E%3Ctext x='50' y='50' text-anchor='middle' dy='.3em' font-size='40' fill='%23fff'%3E${userInitial}%3C/text%3E%3C/svg%3E`;

// In HTML
`<img src="${profileUrl}" onerror="this.src='${fallbackSvg}'" alt="${userName}" />`;
```

### Pagination (Load More)
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
        const paginationQuery = `((CreationDate < "${oldestItem.CreationDate}") OR ` +
            `((CreationDate = "${oldestItem.CreationDate}") AND (ObjectID < ${oldestItem.ObjectID})))`;
        
        const results = await loadWsapiData('ConversationPost', { ...params, query: paginationQuery });
        
        currentStore = [...currentStore, ...results];
        hasMoreData = results.length >= pageSize;
    } catch (error) {
        console.error("Failed to load more:", error);
        hasMoreData = false;
    } finally {
        isLoadingMore = false;
        renderList();
    }
}
```

### HTML Escaping (XSS Prevention)
```javascript
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Usage
container.innerHTML = `<div>${escapeHtml(userInput)}</div>`;
```
---

## Example Widgets Reference

| Widget | Demonstrates |
|--------|--------------|
| `widget-template/` | Basic widget structure, boilerplate |
| `recent-activity/` | Pagination, profile images, delete operations, relative dates |
| `pi-cycle-time-chart/` | Cycle time calculator utility, PI-level reporting |
| `timebox-dashboard/` | Iteration/Release dashboards |

---
## Things to consider when converting old Rally SDK / ExtJS based apps to HTML Widgets
- The $RallyContext object should support all of the properties that are typically referenced on the Rally.app.Context object.
- There is no getSettingsFields equivalent.  Instead add Settings comopnents for Edit Mode.  These settings should be validated and saved using the Update If loading WSAPI data, load the data using the `window.RallyContext.updateSettings` method in Edit Mode.   
- Collection hydration can be done using a collectionsize=2000 query paramter when fetching objects with collections.  
- Use the $RallyContext.Schema object to dynamically access attributes for field dropdowns.   

---

## Best Practices Checklist

### Code Organization
- [ ] Imports at top, grouped logically
- [ ] Constants after imports
- [ ] Default settings defined
- [ ] Message event listener for `RALLY_CONTEXT_LOADED`
- [ ] `cleanseSettings()` validates all settings
- [ ] `buildWidget()` is the main orchestration function
- [ ] Modular functions for data loading, processing, rendering

### Error Handling
- [ ] Try/catch around async operations
- [ ] User-friendly error messages displayed
- [ ] Console.error for debugging
- [ ] Empty state handling ("No data found")
- [ ] Loading states shown during async operations

### Performance
- [ ] Use `MAX_PAGE_SIZE` (2000) for efficiency
- [ ] Only fetch fields actually used
- [ ] Cache DOM element references
- [ ] Use `loadWsapiDataMultiplePages` for large datasets
- [ ] Batch DOM updates

### Security
- [ ] Escape user-generated content
- [ ] Never use `eval()`
- [ ] Use `getSecurityToken()` for update/delete operations

### Accessibility
- [ ] Semantic HTML elements
- [ ] ARIA labels on buttons/controls
- [ ] Keyboard navigation support
- [ ] Color contrast compliance

---

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| `$RallyContext is undefined` | Missing RallyContext comments | Add `// $RallyContext:Begin` and `// $RallyContext:End` |
| CORS errors | Hardcoded domain in URLs | Use relative URLs for WSAPI calls |
| Settings not persisting | Called outside Edit Mode | Only call `updateSettings()` when `isEditMode` is true |
| Module import errors | Missing `type="module"` | Add `type="module"` to script tag |
| Collections not hydrated | Missing collectionsize param | Add `collectionsize: MAX_PAGE_SIZE` to params |
| Data not loading | Incorrect query syntax | Check query format, use `constructQuery()` |
| ViewFilter not working | Using ObjectID instead of Name | Use Name for Iteration/Release filters |

