// Types for Environment Variables
// Represents the flattened combination of a value and its definition
export interface EnvironmentVariable {
    environmentvariablevalueid: string;
    currentvalue: string | null;
    // from definition
    displayname: string;
    schemaname: string;
    type: number;
    'type@OData.Community.Display.V1.FormattedValue'?: string;
    defaultvalue: string | null;
    description: string | null;
    createdon: string;
    modifiedon: string;
    owner?: string;
    typeName?: string;
}

// Represents a single item from the API response from the 'environmentvariablevalues' entity
export interface EnvironmentVariableValueApiResponse {
    environmentvariablevalueid: string;
    value: string | null;
    environmentvariabledefinitionid: {
        environmentvariabledefinitionid: string;
        displayname: string;
        schemaname: string;
        type: number;
        'type@OData.Community.Display.V1.FormattedValue'?: string;
        defaultvalue: string | null;
        description: string | null;
        createdon: string;
        modifiedon: string;
        '_ownerid_value@OData.Community.Display.V1.FormattedValue'?: string;
    };
}

// The overall API response structure for a query to 'environmentvariablevalues'
export interface EnvironmentVariableValueDataverseResponse {
    '@odata.count'?: number;
    '@odata.nextLink'?: string;
    value: EnvironmentVariableValueApiResponse[];
}

export interface FetchEnvironmentVariablesResult {
  variables: EnvironmentVariable[];
  nextLink: string | null;
  totalCount: number;
}