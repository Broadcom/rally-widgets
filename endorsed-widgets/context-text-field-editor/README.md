# context-text-field-editor

## Overview 
The Context Text Field Editor displays a rich text field from the selected context (View Filter or Project) and allows editing and saving that field within the custom view (if the user has permissions);

![alt text](images/screenshot.jpg)

## Usage
Add the code to the HTML Source configuration in the Custom HTML Widget.  When the configuration is saved, the widget will render with options to select either Project or View Filter context.   

In the Custom View Edit Mode, select the Type (Project or View Filter) and the field that you would like displayed in the widget. If you would like to enable editing of the content in the field in View Mode, select the "Allow Edit in View Mode" toggle.   
Save the Custom View to persist the settings.  

Note:  Do not change the settings in the settings dialog, as they will override the selected settings in Edit Mode.   

## Caveats and Assumptions 
There is a defect with the Milestone View filter where the Type is not populated in some scenarios.  If you add this widget for a milestone field, select a valid milestone from the dropdown list in edit view for the widget to recognize the Milestone type.   

## Settings 
### Type
Allows selection of either Project or View Filter as the context for the field

### Field to Display
Allows selection of any Rich Text field on the currently selected Type (Project or View Filter) 

### Allow Edit in View Mode 
Boolean - if true, then the user can edit the contents of the field in View Mode by clicking the edit button.  If false, no edit button will be displayed in Edit mode and the contents of the field will be read only.

## Support

## Developer notes

### Template Example
The default `widget.js` file includes a simple example that displays the widget's settings, the current project scope, and any active view filters. This is intended to provide a starting point for accessing the `$RallyContext` object and can be removed or replaced as you build your widget.

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
      ```npm run build my-widget```

Where *my-widget* is the name of the folder that contains the code for your new widget.  

The build.config.json at the root level can be used if no additional files have been added.  The build.js file will default to that if it doesn't find a build.config.json in the *my-widget* directory. 
To add more files or change the build.config.json, use one in the *my-widget* directory.  

To include more javascript or css files, add the relative path and filename to the build.config.json file in the *my-widget* directorfor the appropriate file type (CSS: input.css, JS: input.js)
If using a different base html file, update the input.html configuration.  
To change the output names for the build file(folder-name-deploy.html) or location(deploy), update the build.js file.  

### Test Configuration
To run the automated tests in the test folder, run the following command: 
```npm test```

Note: Tests currently don't fetch data, but to add tests to fetch data, update the test.config.json file with the appropriate paramters
 