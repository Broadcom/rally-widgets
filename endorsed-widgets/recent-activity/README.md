# Recent Activity Widget

## Purpose

The Recent Activity Widget displays a stream of recent discussion posts (ConversationPost objects) from Rally in a modern, interface for viewing and managing conversation posts across your Rally workspace.

This widget replicates the functionality of the legacy Recent Activity app without requiring the Rally SDK or ExtJS framework.

## Features

- **Activity Stream Display**: Shows recent conversation posts with user profile images, timestamps, and rich text content
- **Artifact Details**: Displays the associated artifact (User Story, Defect, Task, etc.) with clickable links that open the artifact in a new tab
- **User Profiles**: Shows user profile images with fallback to initials if image is unavailable
- **Relative Timestamps**: Displays human-readable timestamps (e.g., "5 minutes ago", "2 hours ago")
- **Project Context**: Shows which project the activity belongs to (in multi-project workspaces)
- **Reply Links**: Provides quick links to reply to discussions on the artifact detail page
- **Delete Functionality**: Allows users to delete their own comments or admins to delete any comment
- **Show More**: Pagination support to load additional activity items
- **Responsive Design**: Adapts to different screen sizes

## How to Use

### Installation

1. Copy the contents of the deployed HTML file (`deploy/recent-activity-deploy.html`) after building
2. In Rally, create or edit a Custom View
3. Add a Custom HTML Widget to the page
4. Paste the deployed HTML into the HTML Source field
5. Save the widget

### Settings Configuration (Edit Mode)

When in Edit Mode, you can configure the following settings through the widget's settings panel:

#### Available Settings

```javascript
{
    "showMoreCount": 10,           // Number of items to show when "Show More" is clicked
    "showArtifactDetail": true,    // Show artifact FormattedID and Name at top of each item
    "allowReply": true,            // Show "Reply" link to navigate to discussion tab
    "allowDelete": false,          // Enable delete functionality for comments
    "profileImageSize": 50         // Size of user profile images in pixels
}
```

#### Setting Descriptions

- **showMoreCount**: Controls how many additional items are displayed when the user clicks "Show More". Default is 10.

- **showArtifactDetail**: When true, displays the artifact's FormattedID (as a clickable link) and Name at the top of each activity item. Default is true.

- **allowReply**: When true, displays a "Reply" link at the bottom of each item that navigates to the artifact's detail page discussion tab. Default is true.

- **allowDelete**: When true, shows a delete button (garbage can icon) for comments that the user has permission to delete. Users can delete their own comments, and workspace/subscription admins can delete any comment. Default is false for safety.

- **profileImageSize**: The width and height of user profile images in pixels. Default is 50.

### Example Settings Configuration

To configure settings in Edit Mode, you would update the settings object in the Custom HTML Widget configuration panel:

```json
{
    "showMoreCount": 10,
    "showArtifactDetail": true,
    "allowReply": true,
    "allowDelete": true,
    "profileImageSize": 60
}
```

## User Interface

### Activity Item Structure

Each activity item displays:

1. **Artifact Header** (if enabled): FormattedID link + Artifact Name
2. **User Profile Image**: Circular profile image or initial fallback
3. **Status Line**: User name (linked) + relative timestamp + project context
4. **Comment Text**: Rich text content with HTML formatting preserved
5. **Reply Link** (if enabled): Link to discussion tab on artifact detail page
6. **Delete Button** (if enabled and user has permission): Garbage can icon in top-right corner

### Pagination

The widget initially loads a 10 items. If more items are available, a "Load 10 More" button appears at the bottom.

## Permissions and Security

### Delete Permissions

Users can only delete a comment if they are the creator of the comment

The delete functionality includes:
- Confirmation dialog before deletion
- Preview of comment text being deleted
- Warning that deletion cannot be undone
- Secure deletion using Rally security tokens

### Data Access

The widget respects:
- Project scoping (up/down) configured in the widget context
- Workspace boundaries
- User permissions for viewing and replying to conversation posts

## Caveats and Assumptions

1. **Profile Images**: Profile images are loaded from Rally's profile image service. If an image fails to load, a fallback SVG with the user's initial is displayed.

2. **Real-time Updates**: The widget does not automatically refresh when new comments are posted. Users must manually refresh the page or widget to see new activity.

3. **HTML Content**: Comment text is displayed as HTML and may contain rich formatting, lists, links, etc. The widget handles orphaned `<li>` tags by wrapping them in `<ul>` tags.

4. **Timestamp Format**: Timestamps are displayed in relative format (e.g., "5 minutes ago") for recent activity, and as a date string for older items (> 7 days).

## Developer Notes

### Architecture

The widget follows the standard HTML Widget architecture:
- **widget.js**: Main JavaScript logic, data loading, and rendering
- **widget.css**: Styling specific to the activity stream
- **widget.html**: HTML structure and script loading
- **build.config.json**: Build configuration for deployment

### Key Functions

- `buildWidget()`: Initializes the widget, creates containers, and loads initial data
- `loadAndDisplayActivity()`: Fetches ConversationPost data from WSAPI
- `renderActivityStream()`: Renders the activity items with pagination
- `renderActivityItem()`: Generates HTML for a single activity item
- `handleDeleteComment()`: Handles comment deletion with confirmation
- `formatCreatedAt()`: Converts timestamps to human-readable format

### Data Loading

The widget uses `loadWsapiDataMultiplePages()` from the utilities to fetch ConversationPost objects with the following fields:
- Artifact (with Name, FormattedID, Project)
- User (with _refObjectName, Disabled)
- Text (rich text content)
- CreationDate
- ObjectID

### Styling

The widget uses:
- Rally color palette for links and buttons
- Responsive design with media queries for mobile devices
- Consistent typography matching Rally's design system
- Hover states and transitions for interactive elements

### Dependencies

- `../utilities/utility.js`: WSAPI data loading, ref parsing, security tokens
- `../utilities/ui-utilities.js`: Dropdown components, container management

### Testing Considerations

When testing the widget:
1. Test with different artifact types to ensure filtering works
2. Test delete functionality as both comment creator and admin
3. Test with disabled users to ensure styling is applied
4. Test with various HTML content in comments (lists, links, formatting)
5. Test pagination with more than the initial load count
6. Test on mobile devices for responsive behavior

### Future Enhancements

Potential improvements:
- Auto-refresh capability with configurable interval
- Date range filtering
- User filtering (show activity from specific users)
- Search/filter within comment text
- Export activity to CSV
- Inline reply functionality (without navigating away)
- Real-time notifications for new comments

## Building for Deployment

To build the widget for deployment:

```bash
cd /Users/kc683795/Documents/widgets/internal/endorsed-widgets
node _scripts/build.js recent-activity
```

This will generate `deploy/recent-activity-deploy.html` which contains all the HTML, CSS, and JavaScript bundled into a single file ready for deployment to a Custom HTML Widget.

## Support and Troubleshooting

### Common Issues

**Issue**: Widget shows "There is no data"
- **Solution**: Check project scoping settings and ensure there are conversation posts in the selected scope

**Issue**: Profile images not loading
- **Solution**: This is expected behavior if the user has no profile image. The widget will show an initial fallback.

**Issue**: Delete button not appearing
- **Solution**: Ensure `allowDelete` is set to `true` in settings and the user has permission to delete

**Issue**: "Show More" not working
- **Solution**: Check browser console for errors. Ensure the widget has loaded completely before clicking.

### Debug Mode

To enable debug logging, open the browser console. The widget logs:
- $RallyContext object on initialization
- Loaded conversation posts
- Delete operations
- Errors during data loading or rendering

## Version History

- **v1.0.0** (Initial Release): Full implementation of DiscussionRichTextStreamView functionality
  - Activity stream display
  - User profiles and timestamps
  - Artifact filtering
  - Delete functionality
  - Pagination support
  - Responsive design
