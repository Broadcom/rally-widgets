# PI Cycle Time Chart

## Overview 
This app plots the cycle time of portfolio items. This metric is calculated as the difference between the ActualEndDate and ActualStartDate rollup fields for each included portfolio item. The median cycle times are plotted as columns with whiskers included for the 25th and 75th percentiles.

The app can be configured for any level of the portfolio item hierarchy and the x-axis granularity is configurable as well. This app includes the standard filtering component to enable further slicing and dicing of data.

![alt text](screenshot.jpg)

## Usage

## Scoping
Navigation Scope *This widget will follow the navigation scope in Rally, including the selected Project and scoping to include Children or Parent projects.*  
View Filter Compatible: No *This widget does not respect timebox View Filters in a Custom View, primarily because the settings dictate the scope of the data.*  

## Caveats and Assumptions 
The portfolio items that are fetched to build this chart are limited to 2000 items.  If more than 2000 items need to be fetched to build the chart, then you will see a message indicating that you should refine your criteria or scope.  

## Settings 
The settings for the app should be in the following format (defaults shown): 
``` 
{
  "type":"PortfolioItem/Feature",
  "bucketBy":"month",
  "numBuckets":10,
  "query":""
}
```

### Settings Explained: 
#### type (default *lowest level PI*)
The Portfolio Item type you'd like to chart. Defaults to the lowest level PI.

#### bucketBy (default *Month*)
The timeframe for which to generate values along the x-axis. Available options include month, quarter and year. Release is also available if the lowest level PI type is selected above.
Options include: 
* Month
* Quarter
* Year
* Release (for lowest level portfolio item types only)

#### numBuckets (*default 10*)
* How many buckets to display.  Note that the more buckets displayed and the granularity of the bucket will affect the amount of data that needs to be fetched in addition to navigation scope. 

For example, if ```bucketBy = Month``` and ```numBuckets = 10```, the chart will show cycletime data for the last 10 months.  

#### query (optional)
* To further refine the dataset for more complex criteria, add a valid WSAPI query for Portfolio Items to this setting.  The default is empty.  Note that the query must have the proper syntax and balanced parenthesis.  Please see the [Build Queries topic in the Rally documentation](https://techdocs.broadcom.com/us/en/ca-enterprise-software/valueops/rally/rally-help/reference/build-queries.html) for how to write WSAPI queries.  

## Support

## Developer notes

### Widget Specific notes
Requires use of node v22.0.0 or higher for native support of Object.groupBy method

### Running in Development mode
* Add the widget.html file to a Custom HTML widget in custom views 
* Run the following command: 
    ```npm start``` 

  * Notes:
    * A local server will start to serve up the js and css files
    * Update the js and css files as needed 
    * Refresh the custom view to see changes
        * Note: If you make any changes to the widget.html file, that will need to be updated in the custom view

### Build Configuration 
To Build, run the following command:
      ```npm run build```

To include more javascript or css files, add the relative path and filename to the build.config.json file for the appropriate file type (CSS: input.css, JS: input.js)
If using a different base html file, update the input.html configuration.  
To change the output names for the build file(widget.built.html) or location(deploy), update the build.js file.  

### Test Configuration
To run the automated tests in the test folder, run the following command: 
```npm test```

To run automated tests for a specific file, run the following command, where myFile is the name of the test file (myFile.test.js):
```npm test myFile```

Note: Tests currently don't fetch data, but to add tests to fetch data, update the test.config.json file with the appropriate paramters
 
