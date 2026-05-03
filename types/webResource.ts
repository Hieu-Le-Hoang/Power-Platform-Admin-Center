// Types for Web Resources
export interface WebResource {
    webresourceid: string;
    name: string;
    displayname: string | null;
    description: string | null;
    webresourcetype: number;
    content: string; // Base64 encoded string
    createdon: string;
    modifiedon: string;
    '_createdby_value@OData.Community.Display.V1.FormattedValue'?: string;

    // Derived fields
    typeName?: string;
}

export interface WebResourceDataverseResponse {
    '@odata.count'?: number;
    '@odata.nextLink'?: string;
    value: WebResource[];
}

export interface FetchWebResourcesResult {
    resources: WebResource[];
    nextLink: string | null;
    totalCount: number;
}
