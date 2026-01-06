# Test Set Results Per Iteration

**Status:** Accepted, Verified

## Overview  
- This widget shows the status of Test Sets for a selected iteration in 3 sections: 
  - Test Execution Summary
  - Test Results
  - Tests Remaining to Run
- Test Sets are requested for just the current project (does not use parent or child scoping)

![Test Set Results Per Iteration Screenshot](screenshot.png)

## App Equivalent 
- Test Set Results Per Iteration

## Differences between App Equivalent
- No Print Summary button
- All Test Sets are shown within scope of Project and Iteration regardless of Test Case Results
- No Paging Toolbars
- Last Verdict display that is more consistent with Last Verdict display on Test Case Test Run pages

## Custom View Filters Supported
- Iteration  

## Settings Needed
- None

## Assumptions to Work as Expected 
- Must be on an iteration filtered custom view
- Test Sets must be scheduled to selected iteration to show

## Performance Implications
- Quanity of Test Sets and Test Case Results can impact load time

## [Community Support README.md](<COMING SOON>)
