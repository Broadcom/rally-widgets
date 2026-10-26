# Blueprint: Team Capacity Grid

## Summary

Shows, for one iteration, how much capacity each user has and how loaded they are. Each row lists a user, their planned capacity (editable in place), the total of their task estimates, and a colored bar showing load against capacity.

---

## Data Loaded

| # | Endpoint / Type | Fetch Fields | Static Filters | Dynamic Filters | Timebox-Scoped? | Project-Scoped? | Page Size |
|---|---|---|---|---|---|---|---|
| 1 | `UserIterationCapacity` | User, Capacity, TaskEstimates, Load | None | Iteration equals the selected iteration | Yes — Iteration | Yes (page project scope) | 25 |

Sorted by user, ascending. Load and task estimates are calculated by Rally, not by the app.

---

## Settings

None.

---

## ViewFilter Handling

Supports Iteration only. The grid shows the iteration chosen in the page-level filter. When the filter is not an iteration, or the iteration is "Unscheduled", the app tells the user a valid iteration must be selected and shows no grid. Changing the filter reloads the grid.

---

## Rendering

### Capacity grid

- **Type:** table, 25 rows per page with paging controls
- **Data source:** data set 1
- **Columns:** User, Capacity, Task Estimates, Load
- **Capacity:** a number the user can edit in place; saving writes the new capacity back to Rally
- **Load:** a bar showing load against capacity. Green below 80%, yellow from 80% up to 100%, red at 100% or more
- **What the user sees:** one row per user with a capacity record in the iteration

A short instruction line above the grid tells users to create and assign a task with an estimate, or to enter initial capacities on the Team Status page.

---

## User Interactions

| Trigger | Effect |
|---|---|
| Edit a capacity value and confirm | Saves the capacity, then refreshes that row so task estimates and load reflect the change |
| Click Refresh | Reloads the current page of the grid, picking up task changes made elsewhere |
| Use paging controls | Loads the previous or next 25 users |
| Change the page iteration filter | Reloads the grid for the new iteration |

---

## Error / Loading States

- **Loading state:** shown while data loads and while a capacity edit saves
- **Empty state:** a message when the iteration has no capacity records
- **Error state:** a message when loading fails. A failed save restores the previous value and shows the error
- **No iteration selected:** a message asking for a valid iteration; Unscheduled is not supported

---

## Migration Notes

| Feature | Issue | Suggested Workaround |
|---|---|---|
| Iteration combobox shown by the old app | Not available in HTML Widgets | Use the page-level iteration view filter (`$RallyContext.ViewFilter`) |
| Editable grid cells | No grid component in HTML Widgets | Number input per row; save with `updateWsapiObject` and `getSecurityToken` |
| Load bar | No progress bar component | HTML progress bar with the same thresholds, plus a percent label so color is not the only signal |
| Paging toolbar | No grid paging | Previous/Next buttons using WSAPI `start` and `pagesize` 25 |
| Refresh button wired to a global | Not needed in a widget | Native button that reloads the current page |
| `Load` / `TaskEstimates` | Load cannot be used in queries | Read the calculated values from the record; re-fetch the row after a save |

---

## Suggested HTML Widget Analog

- `blocked-work` — list/table layout, view filter handling, paging
- `context-text-field-editor` — writing a field back to Rally
