# Team Capacity Grid

## Overview
Shows each user's capacity and load for an iteration, with capacity editable in place:
- User
- Capacity (editable)
- Task Estimates (calculated by Rally)
- Load, as a bar and a percentage

## Key Features
- **Inline Capacity Editing**: Change a value and press Enter or leave the field to save. The row refreshes so Task Estimates and Load reflect the change. If the save fails, the previous value is restored and an error is shown.
- **Load Bar**: Green below 80%, yellow from 80% up to 100%, red at 100% or more. The percentage is shown next to the bar so color is not the only signal.
- **Paging**: 25 users per page with Previous and Next buttons and a "26-30 of 30" count.
- **Refresh**: Reloads the current page to pick up task changes made elsewhere.
- **Project Scoping**: Respects the page's project scope, including scope down.

## App Equivalent
Team Capacity Grid (App SDK version)

## Differences from App Equivalent
- **Iteration Selection**: The iteration comes from the page's Iteration view filter. The old app had its own iteration selector.
- **Paging Controls**: Previous and Next buttons replace the grid paging toolbar.
- **Styling**: Updated to the Rally widget look. The Load bar uses the same colors and thresholds as the old app.
- **Empty Capacity**: A user with no capacity shows an empty field and no Load bar. Clearing a field saves an empty capacity.
- **Invalid Input**: Negative or non-numeric capacity is rejected with a message and the old value is restored.

## Custom View Filters Supported
- **Iteration**: Shows capacity records for the selected iteration.
- **Release / Milestone / none**: The widget shows a message asking for a valid iteration. Unscheduled is not supported.

## Settings
None.

## Reviewer Notes
- Saving and clearing Capacity were verified against a testn instance: `{"useriterationcapacity": {"Capacity": <value or null>}}` posted with a security token succeeds.
- Load is a fraction (0.8 = 80%), matching the thresholds in the old app.
- The iteration is matched by ObjectID from the view filter, falling back to its name if no ObjectID is present.
