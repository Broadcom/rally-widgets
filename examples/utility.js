
//This file assumes existance of a global $RallyContext object
export const TYPE_RELEASE = 'Release';
export const TYPE_ITERATION = 'Iteration';
export const TYPE_ARTIFACT = 'Artifact';
export const MAX_PAGE_SIZE = 2000;

export const getScheduleStates = () => {
    return getAllowedValues("SchedulableArtifact","ScheduleState","StringValue");
}

export const getLowestLevelPortfolioItemType = () =>{
    return getPortfolioItemTypeDefinitions()?.find((type)=> type.Ordinal === 0)?.TypePath;
}

export const getPortfolioItemTypeDefinitions = () => {
    if (!$RallyContext || !$RallyContext.Schema) {
        return null;
    }
    var portfolioItemTypes = $RallyContext && $RallyContext.Schema && $RallyContext.Schema.reduce((types,t) => {
            if (t.TypePath.includes('PortfolioItem/')){
                types.push(t);
            }            
            return types;
        },[]) || null;
    return portfolioItemTypes;
}

export const getAllowedValues = (typeDef, fieldName, fieldAttribute) => {
    // Use optional chaining (?.) to safely access nested properties.
    console.log('schema',$RallyContext.Schema)
    const allowedValuesList = $RallyContext.Schema?.find((type) => type.TypePath == typeDef)?.Attributes
        ?.find((attr) => attr.ElementName == fieldName)?.AllowedValues;

    // If the list was not found at any point, return null.
    if (!allowedValuesList) {
        return null;
    }

    // The reduce part is safe since we've confirmed allowedValuesList exists.
    return allowedValuesList.reduce((vals, v) => {
        if (fieldAttribute) {
            vals.push(v[fieldAttribute]);
        } else {
            vals.push(v);
        }
        return vals;
    }, []);
};

/**
 * 
 * Use this fetch pattern for all modern Widgets where only 1 page of data is needed to fetch.
 * Do NOT use Rally.data.wsapi.Store.
 * Parameters: 
 * @param {string} type - the TypeDefinition for the object to fetch 
 * @param {object} params - an object of parameters to pass to the query.  This can include query clauses, fetch fields, order by, etc. Example: 
 * const params = {
    fetch: 'FormattedID,Name,ScheduleState,PlanEstimate',
    workspace: $RallyContext.GlobalScope.Workspace._ref,
    project: $RallyContext.GlobalScope.Project._ref,
    projectScopeDown: $RallyContext.GlobalScope.ProjectScopeDown,
    projectScopeUp: $RallyContext.GlobalScope.ProjectScopeUp,
    query: '(ScheduleState = "Accepted")',
    order: 'AcceptedDate DESC',
    pagesize: 2000
};
 * @param {boolean} returnRawResults - if true, the raw results will be returned instead of the results array.  This is useful for debugging.
 * @returns {Promise<array>} A promise that resolves with the results array.
 * @throws {Error} Throws an error if the results are not found or there is an error.
 */
export const loadWsapiData = (type,params,returnRawResults = false) => {
    var url = `${$RallyContext.Url.origin}/slm/webservice/v2.0/${type}`;
    var paramDelimiter = "?";
    for (const p in params) {
        url = `${url}${paramDelimiter}${p}=${params[p]}`;
        paramDelimiter = "&";
    }
    return fetch(url)
        .then(response => response.json())
        .then(results => {
            console.log('results',results);
            if (returnRawResults){
                return Promise.resolve(results);
            } else if (!results || !results.QueryResult || !results.QueryResult.Results || (results.QueryResult.Errors && results.QueryResult.Errors.length > 0)){
                var errorMsg = results; //prob need to do something better here 
                if (results && results.QueryResult  && results.QueryResult.Errors){
                    errorMsg = results.QueryResult.Errors.join(", ");
                }
                Promise.reject(`Error loading WSAPI data from ${url}:  ${errorMsg}`)
            } else {
                return Promise.resolve(results.QueryResult.Results);
            }
        });
}
/**
 * 
 * Use this fetch pattern for all modern Widgets where more than one page of data may be needed
 * Do NOT use Rally.data.wsapi.Store.
 * Parameters: 
 * @param {string} type - the TypeDefinition for the object to fetch 
 * @param {object} params - an object of parameters to pass to the query.  This can include query clauses, fetch fields, order by, etc.
 * @param {array} allData - an array of all the data that has been fetched so far.  This is used to store the data as it is fetched.
 * @returns {Promise<array>} A promise that resolves with the results array.
 * @throws {Error} Throws an error if the results are not found or there is an error.
 */
export async function loadWsapiDataMultiplePages(type, params, allData = []) {
  try {
    const data = await loadWsapiData(type, params, true);                                               
    const { PageSize, StartIndex, TotalResultCount } = data.QueryResult;
    const nextStartIndex = StartIndex + PageSize;

    allData = allData.concat(data.QueryResult.Results); 

    if ((StartIndex + PageSize) < TotalResultCount) { 
        params.start=nextStartIndex;
        return loadWsapiDataMultiplePages(type,params,allData); 
    } else { 
      return allData; 
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}

export const getSecurityToken = () => {
    return window.parent.envConfig.securityToken;
}

/**
 * Fetches a single WSAPI object by its ref.
 * @param {string} ref - The _ref of the object to fetch.
 * @param {Array<string>} [fetchFields=['FormattedID', 'Name']] - The fields to fetch for the object.
 * @returns {Promise<object>} A promise that resolves with the fetched object data.
 */
export async function fetchWsapiObject(ref, fetchFields = ['FormattedID', 'Name']) {
    if (!ref) {
        throw new Error("A valid _ref is required to fetch a WSAPI object.");
    }

    const type = getWsapiTypeFromRef(ref);
    if (!type) {
        throw new Error(`Could not determine object type from ref: ${ref}`);
    }

    const objectID = getObjectIDFromRef(ref);
    if (!objectID) {
        throw new Error(`Could not determine object ID from ref: ${ref}`);
    }

    const url = `${$RallyContext.Url.origin}/slm/webservice/v2.0/${type}/${objectID}?fetch=${fetchFields.join(',')}`;

    const response = await fetch(url);
    const result = await response.json();
    const objectKey = Object.keys(result)[0]; // The key will be the type, e.g., "Defect"

    if (result[objectKey].Errors && result[objectKey].Errors.length > 0) {
        throw new Error(`Error fetching object: ${result[objectKey].Errors.join(', ')}`);
    }
    return result[objectKey];
}
/**
 * Updates a single WSAPI object by its ref.
 * @param {string} ref - The _ref of the object to update.
 * @param {object} fieldsToUpdate - key value pairs of the AttributeDefinitions and desired values
 * @param {string} securityToken
 * @returns {Promise<object>} A promise that resolves with the updated object data.
 */
export async function updateWsapiObject(ref,fieldsToUpdate,securityToken){
    
    const type = getWsapiTypeFromRef(ref);
    if (!type) {
        throw new Error(`Could not determine object type from ref: ${ref}`);
    }
    const objectID = getObjectIDFromRef(ref);
    if (!objectID) {
        throw new Error(`Could not determine object ID from ref: ${ref}`);
    }
    
    // The data needs to be wrapped in an object with the type as the key.
    const body = { [type]: fieldsToUpdate };
    
    const url = `/slm/webservice/v2.0/${type}/${objectID}?key=${securityToken}`;

    const response = await fetch(url, {
        method: 'POST',
        credentials: 'include', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });

    const result = await response.json();

    if (result.OperationResult.Errors && result.OperationResult.Errors.length > 0) {
        throw new Error(`Error updating object: ${result.OperationResult.Errors.join(', ')}`);
    }

    console.log('Update successful:', result.OperationResult.Object);
    return result.OperationResult.Object;
};

const getWsapiTypeFromRef = (ref) => {
    const relativeRef = getRelativeRef(ref); // Use existing helper
    if (!relativeRef) {
        return null;
    }
    // relativeRef is like '/defect/12345'
    const parts = relativeRef.split('/');
    if (parts.length > 1 && parts[1]) {
        return parts[1];
    }
    return null;
};


export const getMostRecentTimeboxes = (timeboxType,numTimeboxes) => {
    let timeboxParams = {};

    let timeboxAttributes = getTimeboxDateAttributes(timeboxType);

    timeboxParams.query = `(${timeboxAttributes.startDate} < today)`;
    timeboxParams.fetch = `Name,${timeboxAttributes.startDate},${timeboxAttributes.endDate}`;
    timeboxParams.order = `${timeboxAttributes.startDate} DESC`;
    timeboxParams.pagesize = numTimeboxes;
    timeboxParams.projectScopeUp = false;
    timeboxParams.projectScopeDown = false; 
    timeboxParams.project = $RallyContext.GlobalScope.Project._ref;
    timeboxParams.workspace = $RallyContext.GlobalScope.Workspace._ref;
    return loadWsapiData(timeboxType,timeboxParams);
}

export const getTimeboxDateAttributes = (timeboxType) => {  
    if (timeboxType === TYPE_RELEASE){
        return {
            type: timeboxType,
            startDate: 'ReleaseStartDate',
            endDate: 'ReleaseDate'
        }
    }
    if (timeboxType === TYPE_ITERATION){
        return {
            type: timeboxType,
            startDate: 'StartDate',
            endDate: 'EndDate'
        }
    }
    return {
        type: timeboxType,
        startDate: null,
        endDate: null
    }
}

export const loadCapacityByProjectFromCapacityPlan = (capacityPlanName) => {
    const capacityPlanQuery = `((CapacityPlan.Name = "${capacityPlanName}") AND (Assignments.CapacityPlanItem.PortfolioItem.InvestmentCategory = "Defects"))`;
    const capacityPlanFetch = "PlannedCapacityPoints,Project,Name,CapacityPlan"; //todo, do we also get count? 
    var cpUrl = `${$RallyContext.Url.origin}/slm/webservice/v2.0/capacityplanproject?workspace=${$RallyContext.GlobalScope.Workspace._ref}&project=${$RallyContext.GlobalScope.Project._ref}&query=${capacityPlanQuery}&fetch=${capacityPlanFetch}`

    return fetch(cpUrl)
        .then(response => response.json())
        .then(results => {
            console.log('results cp', results)
            var capacityPlanProjects = results.QueryResult.Results
            .reduce((cppBreakdown,cpp) => {
                if (cpp._objectVersion != 0){
                    cppBreakdown[cpp.Project.Name] = cpp.PlannedCapacityPoints;
                }
                return cppBreakdown;
            },{});
            return Promise.resolve(capacityPlanProjects);
        })
}

export const getTimeboxProgress = (timebox) =>{

    if (!timebox) { return 0; }

    const startDate = timebox.StartDate || timebox.ReleaseStartDate;
    const endDate = timebox.EndDate || timebox.ReleaseDate;
    const currentMs = Date.now();
    
    const startDateMs = new Date(startDate).getTime();
    const endDateMs = new Date(endDate).getTime();
    
    console.log('startDate',startDateMs,endDateMs)
    if (isNaN(startDateMs) || isNaN(endDateMs) || endDateMs === startDateMs) { return 0; }

    if (currentMs >= endDateMs) { return 1;} 
    if (currentMs <= startDateMs) { return 0; }
    console.log('current',currentMs -startDateMs, endDateMs - startDateMs)
  
    return (currentMs - startDateMs)/(endDateMs - startDateMs);
 }

 export const constructQuery = (queryClauses, operator = 'AND') => {
    queryClauses = queryClauses || [];

    return queryClauses.reduce((query, clause) => {
        if (!clause){
            return query;
        }
        if (query){
            query = `(${query} ${operator} ${clause})`;
        } else {
            query = clause;
        }
        return query;
    },'');
 }

 /**
 * Extracts the relative portion of a Rally _ref URL.
 * e.g., "https://rally1.rallydev.com/slm/webservice/v2.0/defect/12345" -> "/defect/12345"
 * @param {string} ref - The full or relative _ref URL string.
 * @returns {string|null} The relative ref, or null if the input is invalid.
 */
export function getRelativeRef(ref) {
    if (!ref || typeof ref !== 'string') {
        return null;
    }
    const apiPrefix = '/slm/webservice/v2.0';
    let pathname;

    if (ref.toLowerCase().startsWith('http')) {
        try {
            pathname = new URL(ref).pathname;
        } catch (e) {
            console.error("Could not parse full _ref URL:", ref, e);
            return null;
        }
    } else {
        pathname = ref.split('?')[0];
    }

    // If the path starts with the API prefix, strip it off to get the relative artifact path.
    return pathname.startsWith(apiPrefix) ? pathname.substring(apiPrefix.length) : pathname;
}

/**
 * Extracts the ObjectID from a Rally _ref URL.
 * e.g., "https://rally1.rallydev.com/slm/webservice/v2.0/defect/12345" -> "12345"
 * @param {string} ref - The _ref URL string.
 * @returns {string|null} The ObjectID, or null if the input is invalid.
 */
export function getObjectIDFromRef(ref) {
    if (!ref || typeof ref !== 'string') {
        return null;
    }
    const parts = ref.split('/');
    const lastPart = parts[parts.length - 1];
    const objectID = lastPart.split('?')[0];
    return /^\d+$/.test(objectID) ? objectID : null;
}
