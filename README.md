# Welcome to the public Rally Widgets repository!  

Tools to help you build your own Rally Custom HTML Widgets for use in Custom Views.  While this is a living repository, stay tuned for updates and expect changes.   

This repository contains the following: 
* Source code for Rally Endorsed Widgets 
* Code Examples for building Rally Widgets
* Resources for building Rally HTML Widgets, including a Rules file for use with Cursor or other AI Development and example prompts for using an LLM to build or tweak Rally Custom HTML Widgets 
* A widget-template for use to build and test vanilla javascript Rally Custom HTML Widgets 

## Source Code for Rally Endorsed Widgets 
Rally Endorsed widgets have been written internally and tested.  Many of them are direct replacements of the original apps in the app catalog.   They can be deployed to a Custom HTML Widget or added to your Subscription Catalog for use.  
Or, you can download the code and make your own changes to them.   

## Code examples for building Rally Widgets 
Peruse some code examples for retrieving data from Rally or styling a dropdown.  These are not intended to be a library, but instead a set of examples that you can use or tweak to build your own patterns and Custom HTML Widgets.  

## Resources 
This folder contains some helpful resources for building widgets:
* Markdown files that contain helpful guidance
* A RULE.md file that can be used with Cursor (or other AI Tool) to build HTML Widgets and example-prompts to use with those rules.  To use the RULE.md file with Cursor as a Specific Project Rule, copy the RULE.md file into the .cursor/rules/html-widget directory.  
 

## Widget Template for use to build and test vanilla javascript Rally Custom HTML Widgets.  
In order to build and test a Rally Custom HTML Widget, we've created a template structure that works well for us.  Since Rally Custom HTML Widgets need to run within Rally to access the Context information and View/Edit modes, we have built a template to help you quickly develop and troubleshoot Csutom HTML widgets, as well as scripts for building the widget once you are happy with the results.   Please see the Widget Template [README](widget-template/README.md) for more detailed information.  