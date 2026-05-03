import { ACCESS_TOKEN_URL, BASE_DATAVERSE_URL_FLOW_SESSIONS, FLOW_SESSION_FIELDS } from '../constants';
import type { 
    Workflow, DataverseResponse, FetchWorkflowsResult, 
    Dataflow, FetchDataflowsResult, DataflowDataverseResponse, 
    Solution, FetchSolutionsResult, SolutionDataverseResponse, 
    EnvironmentVariableValueDataverseResponse, FetchEnvironmentVariablesResult, EnvironmentVariable, 
    CanvasAppDataverseResponse, FetchCanvasAppsResult, 
    ModelDrivenAppDataverseResponse, FetchModelDrivenAppsResult, ModelDrivenApp, 
    FetchCustomControlsResult, CustomControlDataverseResponse, 
    FetchWebResourcesResult, WebResource, WebResourceDataverseResponse, 
    FetchSiteMapsResult, SiteMapDataverseResponse, 
    FetchSecurityRolesResult, SecurityRoleDataverseResponse, 
    FieldSecurityProfileDataverseResponse, FetchFieldSecurityProfilesResult, 
    ConnectionReferenceDataverseResponse, FetchConnectionReferencesResult,
    Form, FormDataverseResponse, FetchFormsResult,
    View, ViewDataverseResponse, FetchViewsResult,
    FlowRun, FlowRunDataverseResponse,
} from '../types';

/**
 * Fetches a plain text JWT access token from a Power Automate flow.
 * @returns A promise that resolves to the access token string.
 */
export const fetchAccessToken = async (): Promise<string> => {
  const response = await fetch(ACCESS_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({}), // Power Automate manual triggers expect a body, even if empty.
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch access token: ${response.status} ${response.statusText}. Details: ${errorText}`);
  }

  // As per instructions, the token is plain text, not JSON.
  const token = await response.text();
  if (!token) {
    throw new Error('Received an empty access token.');
  }
  return token;
};

const getStatusText = (statecode: number): string => {
    return statecode === 1 ? 'On' : 'Off';
};

const getCategoryText = (category: number): string => {
    switch (category) {
        case 0: return 'Workflow';
        case 1: return 'Dialog';
        case 2: return 'Business Rule';
        case 3: return 'Action';
        case 4: return 'Business Process Flow';
        case 5: return 'Modern Flow';
        case 6: return 'Desktop Flow';
        case 7: return 'AI Flow';
        default: return 'Unknown';
    }
};

const getManagedText = (ismanaged: boolean): string => {
    return ismanaged ? 'Managed' : 'Unmanaged';
};


/**
 * Fetches a page of workflows from the Dataverse API.
 * @param token The JWT access token for authorization.
 * @param url The specific Dataverse API URL to fetch (for pagination).
 * @returns A promise that resolves to an object containing workflows, the next page link, and the total count.
 */
export const fetchWorkflows = async (token: string, url: string): Promise<FetchWorkflowsResult> => {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'OData-MaxVersion': '4.0',
      'OData-Version': '4.0',
      'Accept': 'application/json',
      'Prefer': 'odata.include-annotations="*"', // To get formatted values
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch workflows: ${response.status} ${response.statusText}. Details: ${errorText}`);
  }

  const data: DataverseResponse = await response.json();
  
  const processedWorkflows = data.value.map(flow => ({
    ...flow,
    statusText: getStatusText(flow.statecode),
    categoryText: getCategoryText(flow.category),
    isManagedText: getManagedText(flow.ismanaged),
  }));

  return {
    workflows: processedWorkflows,
    nextLink: data['@odata.nextLink'] || null,
    totalCount: data['@odata.count'] ?? -1, // Use -1 to indicate count is not in this response
  };
};

/**
 * Fetches the run history for a specific workflow.
 * @param token The JWT access token for authorization.
 * @param workflowId The ID of the workflow to fetch runs for.
 * @param top The number of recent runs to fetch.
 * @returns A promise that resolves to an array of FlowRun objects.
 */
export const fetchWorkflowRuns = async (token: string, workflowId: string, top: number = 15): Promise<FlowRun[]> => {
    const queryParams = [
        `$select=${FLOW_SESSION_FIELDS}`,
        `$filter=_regardingobjectid_value eq ${workflowId}`,
        `$orderby=startedon desc`,
        `$top=${top}`,
    ];
    const url = `${BASE_DATAVERSE_URL_FLOW_SESSIONS}?${queryParams.join('&')}`;

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'OData-MaxVersion': '4.0',
            'OData-Version': '4.0',
            'Accept': 'application/json',
            'Prefer': 'odata.include-annotations="*"',
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch workflow runs: ${response.status} ${response.statusText}. Details: ${errorText}`);
    }

    const data: FlowRunDataverseResponse = await response.json();

    const processedRuns = data.value.map(run => ({
        ...run,
        statusText: run['statuscode@OData.Community.Display.V1.FormattedValue'] || 'Unknown',
    }));

    return processedRuns;
};

const getDataflowStatusText = (statecode: number): string => {
    return statecode === 0 ? 'Active' : 'Inactive';
};

/**
 * Fetches a page of dataflows from the Dataverse API.
 * @param token The JWT access token for authorization.
 * @param url The specific Dataverse API URL to fetch (for pagination).
 * @returns A promise that resolves to an object containing dataflows, the next page link, and the total count.
 */
export const fetchDataflows = async (token: string, url: string): Promise<FetchDataflowsResult> => {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'OData-MaxVersion': '4.0',
      'OData-Version': '4.0',
      'Accept': 'application/json',
      'Prefer': 'odata.include-annotations="*"',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch dataflows: ${response.status} ${response.statusText}. Details: ${errorText}`);
  }

  const data: DataflowDataverseResponse = await response.json();
  
  const processedDataflows = data.value.map(df => {
    let refreshStatus = 'Unknown';
    if (df.msdyn_refreshhistory) {
        try {
            const history = JSON.parse(df.msdyn_refreshhistory);
            if (Array.isArray(history) && history.length > 0) {
                // FIX: The property name in the parsed JSON is 'status', not 'refreshStatus'.
                refreshStatus = history[0].status || 'Unknown';
            } else {
                refreshStatus = 'No History';
            }
        } catch (e) {
            console.warn('Could not parse dataflow refresh history for dataflow:', df.msdyn_dataflowid);
            refreshStatus = 'Parse Error';
        }
    }

    return {
      ...df,
      statusText: getDataflowStatusText(df.statecode),
      refreshStatus: refreshStatus,
    };
  });

  return {
    dataflows: processedDataflows,
    nextLink: data['@odata.nextLink'] || null,
    totalCount: data['@odata.count'] ?? -1,
  };
};

/**
 * Fetches a page of solutions from the Dataverse API.
 * @param token The JWT access token for authorization.
 * @param url The specific Dataverse API URL to fetch (for pagination).
 * @returns A promise that resolves to an object containing solutions, the next page link, and the total count.
 */
export const fetchSolutions = async (token: string, url: string): Promise<FetchSolutionsResult> => {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'OData-MaxVersion': '4.0',
      'OData-Version': '4.0',
      'Accept': 'application/json',
      'Prefer': 'odata.include-annotations="*"',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch solutions: ${response.status} ${response.statusText}. Details: ${errorText}`);
  }

  const data: SolutionDataverseResponse = await response.json();
  
  const processedSolutions = data.value.map(s => ({
    ...s,
    isManagedText: getManagedText(s.ismanaged),
    publisherName: s['_publisherid_value@OData.Community.Display.V1.FormattedValue'],
  }));

  return {
    solutions: processedSolutions,
    nextLink: data['@odata.nextLink'] || null,
    totalCount: data['@odata.count'] ?? -1,
  };
};

const getEnvVarTypeText = (typeCode: number): string => {
    switch (typeCode) {
        case 100000000: return 'String';
        case 100000001: return 'Number';
        case 100000002: return 'Boolean';
        case 100000003: return 'JSON';
        case 100000004: return 'Data Source';
        default: return 'Unknown';
    }
};

/**
 * Fetches a page of Environment Variables from the Dataverse API by querying the VALUES and expanding the definitions.
 * This is a more reliable way to get the current value.
 */
export const fetchEnvironmentVariables = async (token: string, url: string): Promise<FetchEnvironmentVariablesResult> => {
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'OData-MaxVersion': '4.0',
            'OData-Version': '4.0',
            'Accept': 'application/json',
            'Prefer': 'odata.include-annotations="*"',
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch environment variables: ${response.status} ${response.statusText}. Details: ${errorText}`);
    }

    const data: EnvironmentVariableValueDataverseResponse = await response.json();
    
    // Map the nested structure from the API to our flat EnvironmentVariable type
    const processedVariables = data.value.map(v => {
        const definition = v.environmentvariabledefinitionid;
        return {
            environmentvariablevalueid: v.environmentvariablevalueid,
            currentvalue: v.value,
            // Flatten definition properties
            displayname: definition.displayname,
            schemaname: definition.schemaname,
            type: definition.type,
            'type@OData.Community.Display.V1.FormattedValue': definition['type@OData.Community.Display.V1.FormattedValue'],
            defaultvalue: definition.defaultvalue,
            description: definition.description,
            createdon: definition.createdon,
            modifiedon: definition.modifiedon,
            owner: definition['_ownerid_value@OData.Community.Display.V1.FormattedValue'],
            typeName: getEnvVarTypeText(definition.type),
        };
    });

    return {
        variables: processedVariables,
        nextLink: data['@odata.nextLink'] || null,
        totalCount: data['@odata.count'] ?? -1,
    };
};

/**
 * Fetches a page of Canvas Apps from the Dataverse API.
 */
export const fetchCanvasApps = async (token: string, url: string): Promise<FetchCanvasAppsResult> => {
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'OData-MaxVersion': '4.0',
            'OData-Version': '4.0',
            'Accept': 'application/json',
            'Prefer': 'odata.include-annotations="*"',
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch canvas apps: ${response.status} ${response.statusText}. Details: ${errorText}`);
    }

    const data: CanvasAppDataverseResponse = await response.json();
    
    return {
        apps: data.value,
        nextLink: data['@odata.nextLink'] || null,
        totalCount: data['@odata.count'] ?? -1,
    };
};

const getModelDrivenAppTypeText = (clienttype: number): string => {
    return clienttype === 4 ? 'Unified Interface' : 'Legacy Web Client';
};

/**
 * Fetches a page of Model-driven Apps from the Dataverse API.
 */
export const fetchModelDrivenApps = async (token: string, url: string): Promise<FetchModelDrivenAppsResult> => {
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'OData-MaxVersion': '4.0',
            'OData-Version': '4.0',
            'Accept': 'application/json',
            'Prefer': 'odata.include-annotations="*"',
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch model-driven apps: ${response.status} ${response.statusText}. Details: ${errorText}`);
    }

    const data: ModelDrivenAppDataverseResponse = await response.json();

    const processedApps = data.value.map((app: ModelDrivenApp) => ({
        ...app,
        clientTypeText: getModelDrivenAppTypeText(app.clienttype),
        isManagedText: getManagedText(app.ismanaged),
    }));
    
    return {
        apps: processedApps,
        nextLink: data['@odata.nextLink'] || null,
        totalCount: data['@odata.count'] ?? -1,
    };
};

/**
 * Fetches a page of Custom Controls (PCF) from the Dataverse API.
 */
export const fetchCustomControls = async (token: string, url: string): Promise<FetchCustomControlsResult> => {
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'OData-MaxVersion': '4.0',
            'OData-Version': '4.0',
            'Accept': 'application/json',
            'Prefer': 'odata.include-annotations="*"',
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch custom controls: ${response.status} ${response.statusText}. Details: ${errorText}`);
    }

    const data: CustomControlDataverseResponse = await response.json();
    
    return {
        controls: data.value,
        nextLink: data['@odata.nextLink'] || null,
        totalCount: data['@odata.count'] ?? -1,
    };
};

const getWebResourceTypeText = (typeCode: number): string => {
    switch (typeCode) {
        case 1: return 'HTML';
        case 2: return 'CSS';
        case 3: return 'Script (JScript)';
        case 4: return 'XML';
        case 5: return 'PNG';
        case 6: return 'JPG';
        case 7: return 'GIF';
        case 8: return 'Silverlight (XAP)';
        case 9: return 'ICO';
        case 10: return 'Vector (SVG)';
        default: return 'Unknown';
    }
};

/**
 * Fetches a page of Web Resources from the Dataverse API.
 */
export const fetchWebResources = async (token: string, url: string): Promise<FetchWebResourcesResult> => {
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'OData-MaxVersion': '4.0',
            'OData-Version': '4.0',
            'Accept': 'application/json',
            'Prefer': 'odata.include-annotations="*"',
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch web resources: ${response.status} ${response.statusText}. Details: ${errorText}`);
    }

    const data: WebResourceDataverseResponse = await response.json();
    
    const processedResources = data.value.map((res: WebResource) => ({
        ...res,
        typeName: getWebResourceTypeText(res.webresourcetype),
    }));

    return {
        resources: processedResources,
        nextLink: data['@odata.nextLink'] || null,
        totalCount: data['@odata.count'] ?? -1,
    };
};

/**
 * Fetches a page of Site Maps from the Dataverse API.
 */
export const fetchSiteMaps = async (token: string, url: string): Promise<FetchSiteMapsResult> => {
    const response = await fetch(url, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Prefer': 'odata.include-annotations="*"', },
    });
    if (!response.ok) throw new Error(`Failed to fetch sitemaps: ${await response.text()}`);
    const data: SiteMapDataverseResponse = await response.json();
    const processed = data.value.map(s => ({ ...s, isManagedText: getManagedText(s.ismanaged) }));
    return { sitemaps: processed, nextLink: data['@odata.nextLink'] || null, totalCount: data['@odata.count'] ?? -1 };
};

/**
 * Fetches a page of Security Roles from the Dataverse API.
 */
export const fetchSecurityRoles = async (token: string, url: string): Promise<FetchSecurityRolesResult> => {
    const response = await fetch(url, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Prefer': 'odata.include-annotations="*"', },
    });
    if (!response.ok) throw new Error(`Failed to fetch security roles: ${await response.text()}`);
    const data: SecurityRoleDataverseResponse = await response.json();
    const processed = data.value.map(r => ({ ...r, isManagedText: getManagedText(r.ismanaged) }));
    return { roles: processed, nextLink: data['@odata.nextLink'] || null, totalCount: data['@odata.count'] ?? -1 };
};

/**
 * Fetches a page of Field Security Profiles from the Dataverse API.
 */
export const fetchFieldSecurityProfiles = async (token: string, url: string): Promise<FetchFieldSecurityProfilesResult> => {
    const response = await fetch(url, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Prefer': 'odata.include-annotations="*"', },
    });
    if (!response.ok) throw new Error(`Failed to fetch field security profiles: ${await response.text()}`);
    const data: FieldSecurityProfileDataverseResponse = await response.json();
    return { profiles: data.value, nextLink: data['@odata.nextLink'] || null, totalCount: data['@odata.count'] ?? -1 };
};

/**
 * Fetches a page of Connection References from the Dataverse API.
 */
export const fetchConnectionReferences = async (token: string, url: string): Promise<FetchConnectionReferencesResult> => {
    const response = await fetch(url, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Prefer': 'odata.include-annotations="*"', },
    });
    if (!response.ok) throw new Error(`Failed to fetch connection references: ${await response.text()}`);
    const data: ConnectionReferenceDataverseResponse = await response.json();
    return { connections: data.value, nextLink: data['@odata.nextLink'] || null, totalCount: data['@odata.count'] ?? -1 };
};

const getFormTypeText = (typeCode: number): string => {
    const types: { [key: number]: string } = {
        0: 'Dashboard', 2: 'Main', 6: 'Quick View', 7: 'Quick Create', 8: 'Dialog', 11: 'Card',
    };
    return types[typeCode] || 'Other';
};

const getViewQueryTypeText = (typeCode: number): string => {
    const types: { [key: number]: string } = {
        0: 'Main Application',
        1: 'Advanced Find',
        2: 'Saved Search',
        4: 'Quick Find',
        64: 'Lookup',
    };
    return types[typeCode] || 'Specialized';
};

/**
 * Fetches a page of Forms (systemforms) from the Dataverse API.
 */
export const fetchForms = async (token: string, url: string): Promise<FetchFormsResult> => {
    const response = await fetch(url, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Prefer': 'odata.include-annotations="*"', },
    });
    if (!response.ok) throw new Error(`Failed to fetch forms: ${await response.text()}`);
    const data: FormDataverseResponse = await response.json();
    const processed = data.value.map(f => ({ 
        ...f, 
        isManagedText: getManagedText(f.ismanaged),
        typeName: getFormTypeText(f.type) 
    }));
    return { forms: processed, nextLink: data['@odata.nextLink'] || null, totalCount: data['@odata.count'] ?? -1 };
};

/**
 * Fetches a page of Views (savedqueries) from the Dataverse API.
 */
export const fetchViews = async (token: string, url: string): Promise<FetchViewsResult> => {
    const response = await fetch(url, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'Prefer': 'odata.include-annotations="*"', },
    });
    if (!response.ok) throw new Error(`Failed to fetch views: ${await response.text()}`);
    const data: ViewDataverseResponse = await response.json();
    const processed = data.value.map(v => ({ 
        ...v, 
        isManagedText: getManagedText(v.ismanaged),
        queryTypeName: getViewQueryTypeText(v.querytype)
    }));
    return { views: processed, nextLink: data['@odata.nextLink'] || null, totalCount: data['@odata.count'] ?? -1 };
};
