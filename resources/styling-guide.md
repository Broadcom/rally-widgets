# Styling Guide for HTML Widgets

## Typography

### Font Family
- Text styles should be similar to Open Sans (Latin, Cyrillic, Greek)
- Default font family: `"Helvetica Neue", Helvetica, Arial, sans-serif`

### Text Color
- Primary Text Color: `#434A54`

### Text Recommendations

**Body Text:**
- Body 1: 16px / Regular(400) / 1.5em line-height / 0px letter-spacing
- Body 2: 14px / Regular(400) / 1.5em line-height / 0px letter-spacing
- Caption: 11px / Regular(400) / 1.5em line-height / 0px letter-spacing

**Headings:**
- H4: 18px / Bold(700) / 1.25em line-height / -0.1px letter-spacing
- H3: 22px / Bold(700) / 1.25em line-height / -0.1px letter-spacing - All nested sub-section headlines
- H2: 28px / Bold(700) / 1.25em line-height / -0.2px letter-spacing - All major section headlines

**CSS Example:**
```css
body {
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
    color: #434A54;
    font-size: 14px;
}

h2 {
    font-size: 28px;
    font-weight: 700;
    line-height: 1.25em;
    letter-spacing: -0.2px;
}

h3 {
    font-size: 22px;
    font-weight: 700;
    line-height: 1.25em;
    letter-spacing: -0.1px;
}

h4 {
    font-size: 18px;
    font-weight: 700;
    line-height: 1.25em;
    letter-spacing: -0.1px;
}
```

## Form Components

### Text Input and Dropdown Fields

**Dimensions:**
- Height: 32px
- Padding: 6px (top/bottom), 8px (left/right)
- Border: 1px solid rgba(0, 0, 0, 0.453) (ColdBlack 45.3%)
- Border Radius: 4px

**Labels:**
- Position: Aligned on top of component
- Font Size: 14px
- Font Weight: Semibold (600)
- Color: #434A54 (Secondary Text color)
- Margin Bottom: 4px

**Secondary Text:**
- Font Size: 11px
- Font Weight: Regular (400)

**CSS Example:**
```css
.rally-like-field-container {
    display: inline-block;
    margin-right: 20px;
    vertical-align: top;
}

.rally-like-label {
    display: block;
    font-size: 14px;
    font-weight: 600;
    color: #434A54;
    margin-bottom: 4px;
}

.rally-like-select,
input[type="text"],
input[type="number"] {
    height: 32px;
    padding: 6px 8px;
    border: 1px solid rgba(0, 0, 0, 0.453);
    border-radius: 4px;
    font-size: 14px;
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
}
```

**Using Pre-built Components:**
```javascript
import { createStyledDropdown } from '../utilities/ui-utilities.js';

createStyledDropdown({
    renderTo: 'controls-container',
    id: 'my-dropdown',
    data: [
        { name: 'Option 1', value: 'opt1' },
        { name: 'Option 2', value: 'opt2' }
    ],
    fieldLabel: 'Select Option:',
    value: 'opt1',
    onSelect: (selected) => {
        console.log('Selected:', selected.value);
    }
});
```

## Buttons

### Button Types

**Primary Buttons:**
- Background Color: `#3272D9`
- Text Color: `#FFFFFF`
- Border Color: `#3272D9`
- Border: 1px solid

**Secondary Buttons:**
- Background Color: `#FFFFFF`
- Border Color: `#3272D9`
- Text Color: `#3272D9`
- Border: 1px solid

**Button Sizes:**
- Font Size: 14px (all sizes)
- Minimum Width: 64px
- Border Radius: 4px
- Padding: 6px 16px

**Small Buttons:**
- Height: 24px
- Icon Size: 16px

**Medium Buttons:**
- Height: 32px
- Icon Size: 20px

**Large Buttons:**
- Height: 40px
- Icon Size: 32px

**CSS Example:**
```css
.rally-button {
    font-size: 14px;
    min-width: 64px;
    border-radius: 4px;
    padding: 6px 16px;
    cursor: pointer;
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
    border: 1px solid;
    transition: all 0.2s ease;
}

.rally-button-primary {
    background-color: #3272D9;
    color: #FFFFFF;
    border-color: #3272D9;
}

.rally-button-primary:hover {
    background-color: #2862C9;
}

.rally-button-secondary {
    background-color: #FFFFFF;
    color: #3272D9;
    border-color: #3272D9;
}

.rally-button-secondary:hover {
    background-color: #F5F5F5;
}

.rally-button-small {
    height: 24px;
    padding: 2px 12px;
}

.rally-button-medium {
    height: 32px;
    padding: 6px 16px;
}

.rally-button-large {
    height: 40px;
    padding: 10px 20px;
}
```

## Tables

### Table Styling

**Header:**
- Text: 14px, Bold (700)
- Border: 2px solid `#C8D1E0`
- Padding: 9px (top/bottom), 16px (left/right)
- Height: 44px
- Background: `#F5F7FA` (optional)

**Cells:**
- Text: 14px, Medium weight (500)
- Padding: 9px (top/bottom), 16px (left/right)
- Height: 44px
- Divider line: 1px solid `#C8D1E0`

**CSS Example:**
```css
table {
    width: 100%;
    border-collapse: collapse;
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
}

thead th {
    font-size: 14px;
    font-weight: 700;
    color: #434A54;
    padding: 9px 16px;
    height: 44px;
    border-bottom: 2px solid #C8D1E0;
    text-align: left;
    background-color: #F5F7FA;
}

tbody td {
    font-size: 14px;
    font-weight: 500;
    color: #434A54;
    padding: 9px 16px;
    height: 44px;
    border-bottom: 1px solid #C8D1E0;
}

tbody tr:hover {
    background-color: #F9FAFB;
}
```

**Using Table Utilities:**
```javascript
import { createItemTable } from '../utilities/ui-utilities.js';

const table = createItemTable(
    artifacts,
    'my-table-id',
    ['FormattedID', 'Name', 'ScheduleState', 'PlanEstimate'],
    ['ID', 'Name', 'State', 'Points'] // Optional custom headers
);
container.appendChild(table);
```

## Rally Color Palette

The following colors are the top 10 Rally colors at the 500 value:

| Color  | Hex Code | Usage |
|--------|----------|-------|
| Orange | `#CC8304` | Warnings, highlights |
| Purple | `#AD77D4` | Secondary actions |
| Green  | `#3F9E20` | Success, positive metrics |
| Red    | `#E65D4E` | Errors, defects, critical |
| Blue   | `#6D7CC9` | Information, primary |
| Yellow | `#9E9600` | Caution, pending |
| Pink   | `#E65C81` | Accent |
| Steel  | `#4288A6` | Neutral accent |
| Taupe  | `#968C7B` | Neutral |
| Teal   | `#188F85` | Alternative primary |

**Accessing Colors in JavaScript:**
```javascript
import { getColorMap } from '../utilities/ui-utilities.js';

const colors = getColorMap();
// colors.Green = "#3F9E20"
// colors.Red = "#E65D4E"
// etc.
```

**Usage in Charts:**
```javascript
const series = [
    { name: 'User Stories', data: [...], color: colors.Green },
    { name: 'Defects', data: [...], color: colors.Red },
    { name: 'Tasks', data: [...], color: colors.Blue }
];
```

## Highcharts Configuration

### Chart Styling Best Practices

Use Rally colors and typography in Highcharts:

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
        style: {
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#434A54'
        }
    },
    subtitle: {
        text: 'Chart subtitle or description',
        style: {
            fontSize: '14px',
            color: '#434A54'
        }
    },
    xAxis: {
        categories: ['Jan', 'Feb', 'Mar'],
        title: {
            text: 'X Axis Label',
            style: {
                fontSize: '14px',
                color: '#434A54'
            }
        },
        labels: {
            style: {
                fontSize: '11px',
                color: '#434A54'
            }
        }
    },
    yAxis: {
        min: 0,
        title: {
            text: 'Y Axis Label',
            style: {
                fontSize: '14px',
                color: '#434A54'
            }
        },
        labels: {
            style: {
                fontSize: '11px',
                color: '#434A54'
            }
        }
    },
    tooltip: {
        shared: true,
        crosshairs: true,
        style: {
            fontSize: '12px'
        }
    },
    plotOptions: {
        series: {
            dataLabels: {
                enabled: true,
                style: {
                    fontSize: '10px',
                    fontWeight: 'normal'
                }
            }
        }
    },
    legend: {
        enabled: true,
        align: 'center',
        verticalAlign: 'bottom',
        itemStyle: {
            fontSize: '14px',
            color: '#434A54',
            fontWeight: 'normal'
        }
    },
    series: [
        {
            name: 'User Stories',
            data: [10, 20, 30],
            color: colors.Green
        },
        {
            name: 'Defects',
            data: [5, 10, 15],
            color: colors.Red
        }
    ],
    credits: {
        enabled: false // Disable Highcharts branding
    }
});
```

### Chart Types and Colors

**Line Charts:**
- Use Rally colors for different series
- Enable markers for data points
- Use crosshairs in tooltips

**Bar/Column Charts:**
- Use Rally colors consistently
- Consider color meaning (Green for positive, Red for negative)

**Pie Charts:**
- Use varied colors from Rally palette
- Ensure sufficient contrast between slices

## Alert Messages

Use pre-styled alert classes from `ui-utilities.css`:

```html
<!-- Error Alert -->
<div class="rally-alert rally-alert-error">
    Error: Something went wrong
</div>

<!-- Warning Alert -->
<div class="rally-alert rally-alert-warning">
    Warning: Please review your settings
</div>

<!-- Info Alert -->
<div class="rally-alert rally-alert-info">
    Info: Data loaded successfully
</div>

<!-- Success Alert -->
<div class="rally-alert rally-alert-success">
    Success: Widget updated
</div>
```

**CSS Structure:**
```css
.rally-alert {
    padding: 12px 16px;
    border-radius: 4px;
    margin: 10px 0;
    font-size: 14px;
    border-left: 4px solid;
}

.rally-alert-error {
    background-color: #FEF2F2;
    border-color: #E65D4E;
    color: #991B1B;
}

.rally-alert-warning {
    background-color: #FFFBEB;
    border-color: #CC8304;
    color: #92400E;
}

.rally-alert-info {
    background-color: #EFF6FF;
    border-color: #3272D9;
    color: #1E3A8A;
}

.rally-alert-success {
    background-color: #F0FDF4;
    border-color: #3F9E20;
    color: #14532D;
}
```

## Icons

**Recommended Icon Library:**
[Mineral UI Icons](https://www.npmjs.com/package/mineral-ui-icons)

**Usage:**
- Use consistent icon sizes (16px, 20px, 24px)
- Ensure icons have proper color contrast
- Add `aria-label` attributes for accessibility

## Layout and Spacing

### Container Styles

**Main Visualization Container:**
```javascript
import { addVisualizationContainer } from '../utilities/ui-utilities.js';

addVisualizationContainer('chart-container', 'wrapper');
```

**Controls Container (Horizontal):**
```javascript
import { addHorizontalControlsContainer } from '../utilities/ui-utilities.js';

addHorizontalControlsContainer('controls-container', 'wrapper');
```

**CSS for Containers:**
```css
.rally-main-container {
    padding: 20px;
    background: #FFFFFF;
    border-radius: 4px;
}

.rally-like-controls-container {
    display: flex;
    gap: 20px;
    padding: 10px;
    background: #F5F5F5;
    border-radius: 4px;
    margin-bottom: 20px;
}
```

### Spacing Guidelines
- Small gap: 8px
- Medium gap: 16px
- Large gap: 24px
- Section spacing: 32px

## Responsive Design

### Media Queries
Implement responsive behavior for different screen sizes:

```css
/* Tablet and below */
@media (max-width: 768px) {
    .rally-like-controls-container {
        flex-direction: column;
    }
    
    h2 {
        font-size: 24px;
    }
    
    h3 {
        font-size: 20px;
    }
}

/* Mobile */
@media (max-width: 480px) {
    body {
        font-size: 12px;
    }
    
    .rally-button {
        width: 100%;
    }
}
```

## Accessibility

### Color Contrast
- Maintain WCAG AA compliance (4.5:1 for normal text, 3:1 for large text)
- Test color combinations with contrast checker tools

### Focus Styles
```css
button:focus,
select:focus,
input:focus {
    outline: 2px solid #3272D9;
    outline-offset: 2px;
}
```

### ARIA Attributes
```html
<button aria-label="Delete comment" class="delete-button">
    ×
</button>

<div role="alert" class="rally-alert rally-alert-error">
    Error message
</div>
```

## CSS Best Practices

- **Modular CSS**: Write reusable CSS using classes
- **BEM Naming**: Use Block-Element-Modifier convention for clarity
- **Minimize `!important`**: Avoid specificity issues
- **CSS Variables**: Use custom properties for theming
- **Vendor Prefixes**: Use autoprefixer for compatibility

**CSS Variables Example:**
```css
:root {
    --rally-primary-color: #3272D9;
    --rally-text-color: #434A54;
    --rally-success-color: #3F9E20;
    --rally-error-color: #E65D4E;
    --rally-border-color: #C8D1E0;
}

.my-component {
    color: var(--rally-text-color);
    border: 1px solid var(--rally-border-color);
}
```

