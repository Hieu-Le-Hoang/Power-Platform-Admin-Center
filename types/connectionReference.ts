// Types for Connection References
export interface ConnectionReference {
    connectionreferenceid: string;
    connectionreferencelogicalname: string;
    connectorid: string;
    description: string | null;
    createdon: string;
    modifiedon: string;
    '_ownerid_value@OData.Community.Display.V1.FormattedValue'?: string;
}
export interface ConnectionReferenceDataverseResponse {
    '@odata.count'?: number;
    '@odata.nextLink'?: string;
    value: ConnectionReference[];
}
export interface FetchConnectionReferencesResult {
    connections: ConnectionReference[];
    nextLink: string | null;
    totalCount: number;
}
