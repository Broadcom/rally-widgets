//Define "defaultSettings" here if desired.  In the RALLY_CONTEXT_LOADED event below, these settings are merged with the user defined settings in the Custom HTML Widget configuraiton.   
//Note that this is an example of how to use settings in your Custom HTML Widget, but not required.   
const defaultSettings = {
    foo: "bar"
};

window.addEventListener('message', (event) => {

   if (event.origin !== $RallyContext.Url.origin) return; 

   if (event.data.type === 'RALLY_CONTEXT_LOADED') {  
         if ($RallyContext.isEditMode) {  
               //updateSettings method is only available in EditMode.  If called in ViewMode, a javascript error will be thrown.  
               let userSettings = cleanseSettings($RallyContext.Settings);
              
               /* Note: If settings are deeper than 1 level, note that the spread operator performs a shallow merge, which is only at the top level.  
               Nested objects will be overwritten with the entire nested object from the overwriting source. */

              let mergedSettings = {...defaultSettings, ...userSettings};
               window.RallyContext.updateSettings(mergedSettings);
               /* ...Other widget code/setup/etc... */ 
         }
        console.log('$RallyContext',$RallyContext);
        buildWidget()
    }
});

function cleanseSettings(settings){
     let cleansedSettings = settings || {};
  
   //... add code here to clean and validate settings ... 

   return cleansedSettings;
}

function buildWidget() {
    
    const wrapper = document.getElementById('wrapper'); //This is the div in the widget.html file.  If that div id is changed, this should be updated.
    try {
       // Example code to display context information.
       // Begin Example Code: This can be removed or replaced as you build your widget.
        wrapper.innerHTML = getTemplateText();
        
        const pre = document.createElement('pre');
        pre.style.whiteSpace = 'pre-wrap';
        pre.style.wordBreak = 'break-all';
        pre.textContent = JSON.stringify($RallyContext, null, 2);

        wrapper.appendChild(pre);
        //End Example Code

    } catch (error) {
        console.error("Failed to build widget:", error);
        if (wrapper) {
            wrapper.innerHTML = `<div class="rally-alert rally-alert-error">Error building widget: ${error.message || error}</div>`; //Note: the classes here are in the utilities/ui-utilities.css file which is referenced in the build.config.json.
        }
   }
}
 function getTemplateText () {
       let textContent = "<h2>Custom HTML Widget Context Information</h2>"
        textContent += "<p>The <b>$RallyContext</b> object provides important context about the following:</p>";
        textContent += "<li>GlobalScope: Workspace, Project, and ProjectScoping for the current widget configuration.  The current project is <b>" + $RallyContext.GlobalScope.Project.Name + "</b>";
        textContent += "<li>Schema: The schema for the current workspace, including object types, attributes and meta data";
        textContent += `<li>Settings: The user provided settings via the Settings configuration in the UI or the updateSettings method in Edit Mode. The current settings are <b>${JSON.stringify($RallyContext.Settings)}</b>`;
        textContent += "<li>Subscription: Metadata about the current subscription, subject to the users' permissions";
        textContent += "<li>Url: Metadata about the url of the current page, including the query parameters. The query string for the current page is:  <b>" + ($RallyContext.Url.hashQueryString ? $RallyContext.Url.hashQueryString : "null") + "</b>";
        textContent += `<li>User: Metadata about the current user.  The current UserName is <b>${$RallyContext.User.UserName}</b>`;
        textContent += `<li>ViewFilter: The type and value of the currently selected view filter.  If none, the Type = null and the Value = {}.  The current ViewFilter type is <b>${$RallyContext.ViewFilter.Type}</b>`;   
        textContent += `<li>WidgetName: <b>${$RallyContext.WidgetName}</b>`
        textContent += "<li>isEditMode: Whether or not the current widget is on a page in Edit Mode or View Mode.  Currently this widget is in " + ($RallyContext.isEditMode ? "<b>Edit Mode</b>" : "<b>View Mode</b>");
        textContent += "<br/><br/>Read more about the $RallyContext object and Custom HTML Widget <a href='https://techdocs.broadcom.com/us/en/ca-enterprise-software/valueops/rally/rally-help/reference/rally-widgets/custom-hmtl-widget.html' target='_blank'>here</a> or explore the contents of the current $RallyContext object by scrolling down below.<br/><br/>"
        return textContent;
}