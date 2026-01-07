   import { getRelativeRef } from './utility.js';

   /**
    * Creates a dropdown with custom styling using pure JavaScript.
    *
    * @param {object} config - The configuration object.
    * @param {string} config.renderTo - The ID of the HTML element to render the dropdown in.
    * @param {string} [config.id] - A unique ID for the dropdown container, used for identification and removal.
    * @param {Array<object>} config.data - The data for the dropdown. Each object must have 'name' for display text and 'value' for the value object.
    * @param {string} [config.fieldLabel] - The label to display next to the dropdown.
    * @param {*} [config.value] - The initial value to select in the dropdown (will be compared against item.value).
    * @param {Function} [config.onSelect] - A callback function to execute when an item is selected. It receives an object with the selected name and value.
    * @param {boolean} [config.fireSelectOnLoad=false] - If true, the onSelect handler will be triggered for the default selected item upon creation.
    */

   export function getColorMap(){
        return {
            "Teal": "#188F85",
            "Orange":"#CC8304",
            "Purple":"#AD77D4",
            "Green":"#3F9E20",
            "Red":"#E65D4E",
            "Blue":"#6D7CC9",
            "Yellow":"#9E9600",
            "Pink":"#E65C81",
            "Steel":"#4288A6",
            "Taupe":"#968C7B"
        }
   }
   export function createStyledDropdown(config) {
            const renderTarget = document.getElementById(config.renderTo);
            if (!renderTarget) {
                console.error(`Render target with ID "${config.renderTo}" not found.`);
                return;
            }

            // If an ID is provided, check for and remove an existing element with that ID.
            // This allows for easy replacement/rebuilding of the dropdown.
            if (config.id) {
                const existingElement = document.getElementById(config.id);
                if (existingElement) {
                    existingElement.remove();
                }
            }

            // --- Create DOM Elements ---

            // 1. Create the main container
            const container = document.createElement('div');
            container.className = 'rally-like-field-container';
            if (config.id) { container.id = config.id; }

            // 2. Create the label
            const label = document.createElement('label');
            label.className = 'rally-like-label';
            label.textContent = config.fieldLabel || 'Select an Option:';
            
            // 3. Create a wrapper for the select element to help with custom styling
            const selectWrapper = document.createElement('div');
            selectWrapper.className = 'rally-like-select-wrapper';

            // 4. Create the <select> element
            const select = document.createElement('select');
            select.className = 'rally-like-select';
            label.htmlFor = select.id = `styled-dropdown-${Date.now()}`; // Link label to select for accessibility

            // --- Populate Dropdown with Data ---

            // Store a map of option values to the original data objects
            const valueMap = new Map();

            config.data.forEach((item, index) => {
                const option = document.createElement('option');
                option.textContent = item.name;

                // The <option> value attribute can only be a string.
                // We use JSON.stringify to store the object as a string.
                const stringValue = JSON.stringify(item.value);
                option.value = stringValue;

                // We can also use a map to easily retrieve the original object later.
                valueMap.set(stringValue, item);

                select.appendChild(option);
            });

            // --- Add Event Listener ---

            select.addEventListener('change', (event) => {
                const selectedStringValue = event.target.value;
                
                // Retrieve the original object from our map or by parsing the value
                const selectedItem = valueMap.get(selectedStringValue);
                const selectedValueObject = JSON.parse(selectedStringValue);

                // If a callback function is provided, call it with the selected data.
                if (config.onSelect && typeof config.onSelect === 'function') {
                    config.onSelect({
                        name: selectedItem.name,
                        value: selectedValueObject
                    });
                }
            });

            // --- Append to DOM ---
            selectWrapper.appendChild(select);
            container.appendChild(label);
            container.appendChild(selectWrapper);
            renderTarget.appendChild(container);
            
            // Set initial value.
            let initialValueToSet = null;

            // Prioritize setting the value from config.value if provided
            if (config.value !== undefined && config.value !== null) {
                const foundItem = config.data.find(item => item.value === config.value);
                if (foundItem) {
                    initialValueToSet = JSON.stringify(foundItem.value);
                }
            }

            // If no specific value was found or provided, default to the first item in the data
            if (initialValueToSet === null && config.data.length > 0) {
                initialValueToSet = JSON.stringify(config.data[0].value);
            }

            if (initialValueToSet !== null) {
                select.value = initialValueToSet;
                // Optionally trigger the onSelect handler for the initial value.
                if (config.fireSelectOnLoad) {
                    select.dispatchEvent(new Event('change'));
                }
            }
        }

        export function addHorizontalControlsContainer(containerId,parentContainerId){
            addContainerWithClass(containerId,parentContainerId,'rally-like-controls-container');
        }

        export function addVerticalControlsContainer(containerId,parentContainerId){
            addContainerWithClass(containerId,parentContainerId,'rally-like-controls-container-vertical');
        }

        export function addVisualizationContainer(containerId,parentContainerId){
            addContainerWithClass(containerId,parentContainerId,'rally-main-container');
        }

        export function addContainerWithClass(containerId,parentContainerId,className){
               const parentContainer = document.getElementById(parentContainerId);
            if (!parentContainer) {
                console.error(`Parent container with ID "${parentContainerId}" not found.`);
                return;
            }

            let controlsContainer = document.getElementById(containerId);
            if (!controlsContainer) {
                controlsContainer = document.createElement('div');
                controlsContainer.id = containerId;
                controlsContainer.className = className;
                parentContainer.append(controlsContainer); // Prepend to keep it at the top
            }         
        }

         /**
    * Displays a modal dialog with a simple HTML table of items.
    * @param {string} title - The title for the modal dialog.
    * @param {Array<object>} items - The array of artifact objects to display.
    */
   export function showDetailsModal(title, items, columns) {
       const overlay = document.createElement('div');
       overlay.className = 'modal-overlay';
       overlay.id = 'details-modal-overlay';

       const modalContent = document.createElement('div');
       modalContent.className = 'modal-content';

       const modalHeader = document.createElement('div');
       modalHeader.className = 'modal-header';

       const modalTitle = document.createElement('h2');
       modalTitle.className = 'modal-title';
       modalTitle.textContent = title;

       const closeButton = document.createElement('button');
       closeButton.className = 'modal-close-button';
       closeButton.innerHTML = '&times;'; // '×' character

       const modalBody = document.createElement('div');
       modalBody.className = 'modal-body';

       const table = createItemTable(items, 'modal-table', columns);
       modalBody.appendChild(table)
       modalHeader.appendChild(modalTitle);
       modalHeader.appendChild(closeButton);
       modalBody.appendChild(table);
       modalContent.appendChild(modalHeader);
       modalContent.appendChild(modalBody);
       overlay.appendChild(modalContent);
       document.body.appendChild(overlay);

       // --- Add Event Listeners ---
       const closeModal = () => {
           const modalToClose = document.getElementById('details-modal-overlay');
           if (modalToClose) {
               modalToClose.remove();
           }
       };

       closeButton.addEventListener('click', closeModal);
       overlay.addEventListener('click', (event) => {
           if (event.target === overlay) {
               closeModal();
           }
       });
   }

   export function createItemTable(items, tableId, columns, headers = null){
      const table = document.createElement('table');
      table.id = tableId;
      table.className = 'modal-table';

       const thead = table.createTHead();
       const headerRow = thead.insertRow();
       if (!headers){ headers = columns}
       headers.forEach(headerText => {
           const th = document.createElement('th');
           th.textContent = headerText;
           headerRow.appendChild(th);
       });

       const tbody = table.createTBody();
       items.forEach(item => {
           const row = tbody.insertRow();
           columns.forEach(column => {
               const cell = row.insertCell();
               cell.textContent = item[column];
               if (column === 'FormattedID'){
                cell.innerHTML =  applyFormattedIDTemplate(item);
               } else {
                cell.textContent =item[column];
               }
           });
       });
       return table;
   }

   export function applyFormattedIDTemplate (record) {
    const relativeRef = getRelativeRef(record._ref);
    if (!relativeRef) {
        return record.FormattedID; // Fallback for safety
    }
    // Construct the full, direct URL to the artifact's detail page.
    // Using the artifact's own project ObjectID is more robust than the global scope.
    const detailUrl = `${$RallyContext.Url.href}?detail=${relativeRef}`;
    return `<a href="${detailUrl}" target="_top">${record.FormattedID}</a>`;
}

export function getTemplateText () {
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


/**
 * Creates a styled button that acts as a toggle.
 * @param {object} config - The configuration object.
 * @param {string} config.renderTo - The ID of the element to render the toggle in.
 * @param {string} [config.id] - A unique ID for the button.
 * @param {string} config.textOn - Text to display when the toggle is ON (e.g., 'View').
 * @param {string} config.textOff - Text to display when the toggle is OFF (e.g., 'Edit').
 * @param {string} [config.iconOn] - HTML string for the icon when the toggle is ON.
 * @param {string} [config.iconOff] - HTML string for the icon when the toggle is OFF.
 * @param {Function} [config.onToggle] - Callback function executed on state change. Receives a boolean (isToggledOn).
 */
export function createToggleStyledButton({ renderTo, id, textOn, textOff, iconOn, iconOff, onToggle }) {
    const renderTarget = document.getElementById(renderTo);
    if (!renderTarget) {
        console.error(`Render target with ID "${renderTo}" not found.`);
        return;
    }

    const button = document.createElement('button');
    if (id) { button.id = id; }
    // Use a secondary style for this button
    button.className = 'rally-button rally-button-secondary rally-button-small';
    button.dataset.toggled = 'false'; // Use a data attribute to track state

    const iconSpan = document.createElement('span');
    iconSpan.className = 'btn-icon';

    const textSpan = document.createElement('span');
    textSpan.className = 'btn-text';

    button.appendChild(iconSpan);
    button.appendChild(textSpan);

    const updateButtonContent = (isToggledOn) => {
        const icon = isToggledOn ? iconOn : iconOff;
        const text = isToggledOn ? textOn : textOff;

        if (icon) {
            iconSpan.innerHTML = icon;
            iconSpan.style.display = 'inline-block';
        } else {
            iconSpan.innerHTML = '';
            iconSpan.style.display = 'none';
        }
        textSpan.textContent = text;
    };

    // Set initial state
    updateButtonContent(false);

    button.addEventListener('click', () => {
        const isToggledOn = button.dataset.toggled === 'true';
        const newState = !isToggledOn;
        button.dataset.toggled = String(newState);
        updateButtonContent(newState);
        
        // Add a class to indicate the toggled state for styling
        button.classList.toggle('toggled-on', newState);

        onToggle?.(newState);
    });

    renderTarget.appendChild(button);
}

/**
 * Creates a styled toggle switch (slider).
 * @param {object} config - The configuration object.
 * @param {string} config.renderTo - The ID of the element to render the toggle in.
 * @param {string} [config.id] - A unique ID for the toggle switch.
 * @param {string} [config.labelText] - The text label for the toggle.
 * @param {boolean} [config.checked=false] - The initial state of the toggle.
 * @param {Function} [config.onToggle] - Callback function executed on state change. Receives a boolean (isChecked).
 */
export function createToggleSwitch({ renderTo, id, labelText, checked = false, onToggle }) {
    const renderTarget = document.getElementById(renderTo);
    if (!renderTarget) {
        console.error(`Render target with ID "${renderTo}" not found.`);
        return;
    }

    const container = document.createElement('div');
    container.className = 'toggle-switch-container';

    if (labelText) {
        const label = document.createElement('span');
        label.className = 'rally-like-label';
        label.textContent = labelText;
        container.appendChild(label);
    }

    const switchLabel = document.createElement('label');
    switchLabel.className = 'toggle-switch';
    if (id) { switchLabel.id = id; }

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = checked;

    const slider = document.createElement('span');
    slider.className = 'slider';

    checkbox.addEventListener('change', (event) => onToggle?.(event.target.checked));

    switchLabel.appendChild(checkbox);
    switchLabel.appendChild(slider);
    container.appendChild(switchLabel);
    renderTarget.appendChild(container);

}

/**
 * Creates a custom multi-select dropdown component.
 *
 * @param {object} config - The configuration object.
 * @param {string} config.renderTo - The ID of the HTML element to render the dropdown in.
 * @param {string} [config.id] - A unique ID for the dropdown container.
 * @param {Array<object>} config.data - The data for the dropdown. Each object must have 'name' and 'value'.
 * @param {string} [config.fieldLabel] - The label to display next to the dropdown.
 * @param {string} [config.placeholder='Select...'] - Placeholder text when no items are selected.
 * @param {Array<*>} [config.initialValues=[]] - An array of initial values to pre-select.
 * @param {Function} [config.onSelect] - A callback function executed when the selection changes. It receives an array of the selected value objects.
 */
export function createMultiSelectDropdown(config) {
    const {
        renderTo,
        id,
        data,
        fieldLabel,
        placeholder = 'Select...',
        initialValues = [],
        onSelect
    } = config;

    const renderTarget = document.getElementById(renderTo);
    if (!renderTarget) {
        console.error(`Render target with ID "${renderTo}" not found.`);
        return;
    }

    // --- Create DOM Elements ---
    const container = document.createElement('div');
    container.className = 'multi-select-container rally-like-field-container';
    if (id) container.id = id;

    if (fieldLabel) {
        const label = document.createElement('label');
        label.className = 'rally-like-label';
        label.textContent = fieldLabel;
        container.appendChild(label);
    }

    const wrapper = document.createElement('div');
    wrapper.className = 'multi-select-wrapper';

    const displayBox = document.createElement('div');
    displayBox.className = 'multi-select-display rally-like-select';

    const placeholderSpan = document.createElement('span');
    placeholderSpan.className = 'multi-select-placeholder';
    placeholderSpan.textContent = placeholder;
    displayBox.appendChild(placeholderSpan);

    const dropdown = document.createElement('div');
    dropdown.className = 'multi-select-dropdown';

    const list = document.createElement('ul');
    dropdown.appendChild(list);

    wrapper.appendChild(displayBox);
    wrapper.appendChild(dropdown);
    container.appendChild(wrapper);
    renderTarget.appendChild(container);

    // --- State and Logic ---
    let selectedValues = new Set(initialValues.map(JSON.stringify));

    const updateDisplay = () => {
        displayBox.querySelectorAll('.multi-select-tag').forEach(tag => tag.remove());
        const selectedItems = data.filter(item => selectedValues.has(JSON.stringify(item.value)));

        if (selectedItems.length > 0) {
            placeholderSpan.style.display = 'none';
            selectedItems.forEach(item => {
                const tag = document.createElement('span');
                tag.className = 'multi-select-tag';
                tag.textContent = item.name;

                const removeBtn = document.createElement('span');
                removeBtn.className = 'multi-select-tag-remove';
                removeBtn.innerHTML = '&times;';
                removeBtn.onclick = (e) => {
                    e.stopPropagation();
                    const itemValueStr = JSON.stringify(item.value);
                    selectedValues.delete(itemValueStr);
                    list.querySelector(`input[value='${itemValueStr}']`).checked = false;
                    updateAndNotify();
                };

                tag.appendChild(removeBtn);
                displayBox.appendChild(tag);
            });
        } else {
            placeholderSpan.style.display = 'inline';
        }
    };

    const updateAndNotify = () => {
        updateDisplay();
        if (onSelect) {
            const selectedItems = data.filter(item => selectedValues.has(JSON.stringify(item.value)));
            onSelect(selectedItems.map(item => item.value));
        }
    };

    data.forEach(item => {
        const li = document.createElement('li');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        const itemValueStr = JSON.stringify(item.value);
        checkbox.value = itemValueStr;
        checkbox.checked = selectedValues.has(itemValueStr);

        checkbox.onchange = () => {
            if (checkbox.checked) {
                selectedValues.add(itemValueStr);
            } else {
                selectedValues.delete(itemValueStr);
            }
            updateAndNotify();
        };

        const text = document.createTextNode(item.name);
        li.appendChild(checkbox);
        li.appendChild(text);
        list.appendChild(li);
    });

    displayBox.addEventListener('click', () => dropdown.classList.toggle('show'));

    document.addEventListener('click', (e) => {
        if (!container.contains(e.target)) {
            dropdown.classList.remove('show');
        }
    });

    // Initial render
    updateDisplay();
}
