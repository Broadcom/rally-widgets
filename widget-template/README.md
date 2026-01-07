# Building Custom HTML Widgets
Find a suggested approach for building and testing HTML Widgets below.  

### Writing your own widgets: 

1. Clone the RallyWidgets repository
    ```git clone https://github.com/Broadcom/RallyWidgets```

2.  In the RallyWidgets directory, run the command ```cp -rf widget-template my-new-widget``` where my-new-widget is the name of your new widget.  Alternatively you can manually make a copy of the widget-template folder and rename it.  

3.  cd into your my-new-widget directory.  ```cd my-new-widget```.  The basic files include:
        * widget.html
        * widget.js
        * widget.css
        * README.md - should be updated with information about the custom widget 
        * package.json
        * build.js - script to build your widget 
        * build.config.json - determines which files are incorporated into the deploy file when npm run build is executed. 	

    * Note that if you add any additional files to your project, you will need to update the widget.html file and also the build.config.json file.  
    * Use import statements in the js files to use common methods from the utility.js and ui-utility.js files in the utilities folder at the root directory.  

4. Run ```npm install```.  Note- this was done with the following node/npm versions:

    * v18.15.0/v9.5.0      
    * v22.17.0/11.5.2

5.  To start building your widget, create a custom view and add a Custom HTML Widget to a tall stretch section.  If you are developing a widget for a specific View Filter, add a View filter to the custom page.   

5. Add the contents of the Widget.html file to the Custom HTML Widget *HTML Source* field in the configuration modal. 

6. If you have any user defined settings for the widget, add those to the *Current Settings* field in the configuration modal. 

7. In your my-new-widget directory, run the command ```npm run build``` to start the server that will serve up the javascript file(s). 

8. Refresh the page to see changes made to the javascript and css files referenced in the Widget.html file, as well as any imported functions from the utilities directory.  
    * Note that if changes are made to files in the utilities directory, they may affect other widgets.  

9. When you are done with developing the HTML Widget, run the command ```npm run build ``` from your my-new-widget directory.  The build command will bundle the files referenced in the build.config.json plus any imported methods from the utilities directory into one html file that can be used in the *HTML Source* configuration field of the Custom HTML Widget.   

Notes: 
Ensure that the disable-cache is checked.  

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
      ```npm run build```

The build.config.json determines which file content is included in the final file. 
To add more files, change the build.config.json.  

To include more javascript or css files, add the relative path and filename to the build.config.json file in the *my-widget* directorfor the appropriate file type (CSS: input.css, JS: input.js)
If using a different base html file, update the input.html configuration.  
To change the output names for the build file(folder-name-deploy.html) or location(deploy), update the build.js file.  
