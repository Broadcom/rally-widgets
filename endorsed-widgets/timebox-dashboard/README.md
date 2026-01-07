# Timebox Dashboard

**Status:** Accepted, Verified

## Overview  
- This widget provides a complete overview of your selected Iteration or Release
  - Health Status: Determines if the project is 'Good', 'At Risk', or 'Critical' by comparing the percentage of work accepted to the percentage of time elapsed
  - Accepted Progress Bar: Shows the percentage of accepted work, with a marker indicating how far along you are in the timebox
  - Schedule State Chart: A breakdown of work items (Stories, Defects, Defect Suites) by their current Schedule State
  - Defect State Chart: Displays a breakdown of defects scheduled in the timebox by State 
  - Test Case Last Verdict Chart:  Summarizes the results (Pass, Fail, etc.) for all test cases associated with user stories in the timebox
  - Burndown Chart: Tracks remaining plan estimates day-by-day against an ideal trend line
- Data is rolled up to the parent project row if child projects is enabled in your project scope
- The Schedule State and Defect State charts include defects that are linked to scheduled user stories, even if the defects themselves are not scheduled in this timebox

![Timebox Dashboard Screenshot](screenshot.png)

## App Equivalent 
- Iteration Dashboard
- Release Dashboard

## Differences between App Equivalent
- New Acceptance Progress Bar: A visual line indicates the percentage of time completed, making it easy to compare against your acceptance progress
- Cleaner Project View: The dashboard now hides projects that have no scheduled work, providing a more focused display
- Enhanced Burndown Chart: Now includes an ideal trend line to help you visualize if you're on track
- Hoverable Chart Details: Chart legends are now tooltips that appear on hover to create a cleaner, less cluttered interface
- Sticky Header Data: header label row and parent project row stays put as you scroll to understand the data and the rollup better
- Loading Mask: Depending on your project scoping, this view may take a moment to load so now there is a loading mask to show it is processing the data before it renders

## Custom View Filters Supported
- Iteration
- Release

## Settings Needed
- Optional Settings:
  - disableDefectsCharts (boolean): true to not show the defect pie charts column
  - disableTestCasesCharts (boolean): true to not show the test cases pie charts column

  ```json 
    { "disableDefectsCharts": false, "disableTestCasesCharts": false }
  ```

## Assumptions to Work as Expected 
- This widget requires an Iteration or Release filter for the Custom View

## Performance Implications
- Enabling child projects in your project scope can increase amount of response time

## [Community Support README.md](<COMING SOON>)
