# Blocked Work

## Overview
This widget displays blocked work items in your project with comprehensive details including:
- The blocked work product (User Story, Defect, etc.) with FormattedID and name
- Who blocked it (user avatar, name, and email)
- When it was blocked (formatted according to workspace date settings)
- The reason for blocking
- The project where the block was created
- Visual indicators for disabled users

## Key Features
- **Paginated Display**: Shows 200 items at a time with "Show More" functionality for loading additional results
- **View Filter Integration**: Respects Iteration, Release, and Milestone view filters by default
- **User-Friendly Links**: All work product links open in new tabs for easy navigation
- **Disabled User Handling**: Greyed out display with hover tooltip for disabled users
- **Fixed Paging Bar**: Always visible count display at the top showing current items and total
- **Configurable Filtering**: Optional setting to ignore view filters and show all blocked items

## App Equivalent
Blocked Work (App SDK version)

## Differences from App Equivalent
- **Pagination**: Shows 200 items per page instead of 10
- **Total Count Display**: Always shows total count of blocked items
- **Link Behavior**: All links open in new tabs
- **User Status**: Disabled users shown with visual indicators (greyed out with tooltip)
- **Fixed Header**: Paging bar remains visible at top while scrolling
- **View Filter Control**: Configurable option to ignore or respect view filters

## Custom View Filters Supported
The widget supports and respects the following view filter types by default:

- **Iteration**: Filters blocked items by iteration name
  - Matches when the work product's iteration name equals the view filter iteration name
- **Release**: Filters blocked items by release name
  - Matches when the work product's release name equals the view filter release name
- **Milestone**: Filters blocked items by milestone reference
  - Matches when the work product has a milestone that matches the view filter milestone reference

**Note**: View filtering is applied client-side after fetching results due to API limitations with the blocker endpoint.

## Settings
### Ignore View Filter
- **Type**: Checkbox
- **Default**: Unchecked (view filter is respected)
- **Description**: Controls whether the widget respects the current view filter

**When Unchecked (Default)**:
- Only blocked items matching the current view filter are displayed
- For Iterations: Matches on iteration name
- For Releases: Matches on release name
- For Milestones: Matches on the milestone reference object
- Item count reflects filtered results

**When Checked**:
- All blocked items within the selected project scope are displayed
- View filter is ignored completely
- Item count reflects all blocked items in scope

**Note**: If no view filter is present, this setting has no effect.

## Technical Details

### Data Fetching
- **Endpoint**: `/slm/webservice/v2.x/blocker`
- **Page Size**: 200 items per request
- **Sorting**: By `CreationDate DESC` (newest blocks first)
- **Scoping**: Respects workspace, project, and project scope (up/down) settings
- **Fields Fetched**: WorkProduct, Project, Name, Description, FormattedID, CreationDate, BlockedBy, BlockedReason, Disabled, ObjectID, EmailAddress, Iteration, Release, Milestones

### Filtering Logic
Due to API limitations, view filtering is performed client-side:
1. Fetch blocked items from the API
2. Apply post-filter based on WorkProduct's timebox attributes
3. Display filtered results with accurate count

### Date Formatting
Dates are formatted according to the workspace's configured date format (e.g., MM/dd/yyyy).

## Assumptions to Work as Expected
- User has appropriate permissions to view blocked items in the selected project scope
- Blocker API endpoint is accessible and functioning
- WorkProduct objects include timebox information (Iteration, Release, Milestones) when applicable

## Performance Implications
- **Client-Side Filtering**: When view filters are active, filtering is performed client-side which may impact performance with large datasets
- **Pagination**: Loading 200 items at a time provides good balance between performance and usability
- **Image Loading**: User avatars are loaded on-demand which may cause slight delays on initial render
- **Recommendation**: For projects with thousands of blocked items, consider using view filters to reduce the dataset size

## Known Limitations
- View filtering cannot be performed server-side due to blocker API endpoint limitations
- Milestone filtering requires the `_tagsNameArray` property to be populated
- Maximum of 200 items loaded per "Show More" click

## Future Enhancements
- Export blocked items to CSV
- Additional sorting options (by user, project, date)
- Search/filter within displayed results
- Bulk unblock functionality
- Custom column configuration
