// Types for Custom Controls (PCF)
export interface CustomControl {
    customcontrolid: string;
    name: string;
    version: string;
    compatibledatatypes: string | null;
    manifest: string | null;
    createdon: string;
    modifiedon: string;
    '_createdby_value@OData.Community.Display.V1.FormattedValue'?: string;
}

export interface CustomControlDataverseResponse {
    '@odata.count'?: number;
    '@odata.nextLink'?: string;
    value: CustomControl[];
}

export interface FetchCustomControlsResult {
    controls: CustomControl[];
    nextLink: string | null;
    totalCount: number;
}
